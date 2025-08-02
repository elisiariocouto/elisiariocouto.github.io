#!/usr/bin/env node

import { promises as fs, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
async function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = await fs.readFile(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.trim().split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    });

    return env;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

class ImmichPhotoSync {
  constructor(host, apiKey) {
    this.host = host.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.photosDir = path.join(__dirname, '..', 'public', 'img', 'photos');
    this.dataFile = path.join(__dirname, '..', '_data', 'photos.js');
    this.cacheFile = path.join(__dirname, '..', '.photo-sync-cache.json');
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.host}/api${endpoint}`;
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async downloadFile(url, filepath) {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const file = createWriteStream(filepath);
      const request = client.get(url, { headers: { 'x-api-key': this.apiKey } }, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        } else {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        }
      });

      request.on('error', reject);
      file.on('error', reject);
    });
  }

  async loadCache() {
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf8');
      return JSON.parse(cacheData);
    } catch {
      return {};
    }
  }

  async saveCache(cache) {
    await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
  }

  async ensureDirectories() {
    await fs.mkdir(this.photosDir, { recursive: true });
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
  }

  async getFavoritePhotos() {
    this.log('Fetching favorite photos from Immich...');

    try {
      // Use the search/metadata endpoint for favorites
      const searchResults = await this.makeRequest('/search/metadata', {
        method: 'POST',
        body: {
          isFavorite: true,
          size: 1000, // Adjust based on your needs
          page: 1
        }
      });

      if (searchResults.assets && searchResults.assets.items) {
        return searchResults.assets.items;
      }

      // Handle direct array response if structure is different
      if (Array.isArray(searchResults.assets)) {
        return searchResults.assets;
      }

      // Fallback: try the assets endpoint with favorite filter
      const assets = await this.makeRequest('/assets?isFavorite=true');
      return Array.isArray(assets) ? assets : [];
    } catch (error) {
      this.log(`Error fetching favorites: ${error.message}`);
      throw error;
    }
  }

  async processPhotos() {
    const cache = await this.loadCache();
    const favoritePhotos = await this.getFavoritePhotos();

    this.log(`Found ${favoritePhotos.length} favorite photos`);

    const processedPhotos = [];

    for (const photo of favoritePhotos) {
      try {
        const photoId = photo.id;
        const originalFilename = photo.originalFileName || `photo-${photoId}`;
        const fileExtension = path.extname(originalFilename) || '.jpg';
        const localFilename = `${photoId}${fileExtension}`;
        const localPath = path.join(this.photosDir, localFilename);
        const webPath = `../public/img/photos/${localFilename}`;

        // Check if we need to download this photo
        const photoModified = photo.fileModifiedAt || photo.fileCreatedAt;
        const needsDownload = !cache[photoId] ||
          cache[photoId].modifiedAt !== photoModified ||
          !(await fs.access(localPath).then(() => true).catch(() => false));

        if (needsDownload) {
          this.log(`Downloading ${originalFilename}...`);
          const downloadUrl = `${this.host}/api/assets/${photoId}/original`;
          await this.downloadFile(downloadUrl, localPath);

          // Update cache
          cache[photoId] = {
            modifiedAt: photoModified,
            originalFilename,
            localFilename
          };
        }

        // Get detailed asset info with EXIF data
        let detailedPhoto;
        try {
          detailedPhoto = await this.makeRequest(`/assets/${photoId}`);
          // Debug: log what EXIF data is available
          if (detailedPhoto.exifInfo) {
            this.log(`EXIF data available for ${originalFilename}: ${Object.keys(detailedPhoto.exifInfo).join(', ')}`);
          } else {
            this.log(`No EXIF data found for ${originalFilename}`);
          }
        } catch (error) {
          this.log(`Warning: Could not fetch detailed info for ${photoId}: ${error.message}`);
          detailedPhoto = photo; // Fallback to basic photo data
        }

        // Extract metadata from Immich (use detailed photo data if available)
        const sourcePhoto = detailedPhoto || photo;
        const exifInfo = sourcePhoto.exifInfo;

        const photoData = {
          src: webPath,
          alt: exifInfo?.description || sourcePhoto.originalFileName || 'Photo',
          date: sourcePhoto.fileCreatedAt || sourcePhoto.createdAt,
        };

        // Add optional description
        if (exifInfo && exifInfo.description) {
          photoData.description = exifInfo.description;
        }

        // Add enhanced location info
        if (exifInfo && exifInfo.latitude && exifInfo.longitude) {
          photoData.location = {
            lat: exifInfo.latitude,
            lng: exifInfo.longitude
          };

          // Build location string: City, State, Country or City, Country
          const locationParts = [];
          if (exifInfo.city) locationParts.push(exifInfo.city);
          if (exifInfo.state) locationParts.push(exifInfo.state);
          if (exifInfo.country) locationParts.push(exifInfo.country);

          if (locationParts.length > 0) {
            photoData.locationName = locationParts.join(', ');
          }
        }

        // Add camera info
        if (exifInfo) {
          if (exifInfo.make || exifInfo.model) {
            const cameraParts = [];
            if (exifInfo.make) cameraParts.push(exifInfo.make);
            if (exifInfo.model) cameraParts.push(exifInfo.model);
            photoData.camera = cameraParts.join(' ');
          }

          // Add photo technical details
          const techDetails = {};
          if (exifInfo.iso) techDetails.iso = exifInfo.iso;
          if (exifInfo.fNumber) techDetails.aperture = `f/${exifInfo.fNumber}`;
          if (exifInfo.focalLength) techDetails.focalLength = `${exifInfo.focalLength}mm`;
          if (exifInfo.exposureTime) techDetails.exposureTime = exifInfo.exposureTime;

          if (Object.keys(techDetails).length > 0) {
            photoData.techDetails = techDetails;
          }

          // Add image dimensions
          if (exifInfo.exifImageWidth && exifInfo.exifImageHeight) {
            photoData.dimensions = `${exifInfo.exifImageWidth} × ${exifInfo.exifImageHeight}`;
          }
        }

        processedPhotos.push(photoData);

      } catch (error) {
        this.log(`Error processing photo ${photo.id}: ${error.message}`);
      }
    }

    await this.saveCache(cache);
    return processedPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async generateDataFile(photos) {
    const content = `// Auto-generated by sync-photos.js
// Last updated: ${new Date().toISOString()}

export default ${JSON.stringify(photos, null, 2)};
`;

    await fs.writeFile(this.dataFile, content);
    this.log(`Generated ${this.dataFile} with ${photos.length} photos`);
  }

  async sync() {
    try {
      await this.ensureDirectories();

      this.log(`Connecting to Immich at ${this.host}`);

      const photos = await this.processPhotos();
      await this.generateDataFile(photos);

      this.log(`✅ Successfully synced ${photos.length} favorite photos`);

    } catch (error) {
      this.log(`❌ Sync failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const env = await loadEnv();

  const host = env.IMMICH_HOST;
  const token = env.IMMICH_API_TOKEN;

  if (!host || !token) {
    console.error('Error: IMMICH_HOST and IMMICH_API_TOKEN must be set in .env file');
    console.error('Example .env file:');
    console.error('IMMICH_HOST=https://your-immich.com');
    console.error('IMMICH_API_TOKEN=your-api-key');
    process.exit(1);
  }

  const syncer = new ImmichPhotoSync(host, token);
  await syncer.sync();
}

main().catch(console.error);
