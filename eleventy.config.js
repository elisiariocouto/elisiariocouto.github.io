import { IdAttributePlugin, InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { EleventyRenderPlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import path from "path";

import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {

	// Original image shortcode for blog posts
	eleventyConfig.addShortcode("image", function (src, caption, width, layout, date, filename) {
		const id = `img-${Math.random().toString(36).slice(2, 11)}`;
		const style = width ? `style="max-width: ${width}px; margin: 0 auto;"` : '';
		const layoutClass = layout ? `image-layout-${layout}` : '';

		// Build caption with metadata
		let captionContent = '';
		if (layout === 'grid') {
			// Grid mode: show filename and date
			captionContent = filename || '';
			if (date) {
				const dateObj = new Date(date);
				const formattedDate = eleventyConfig.getFilter('readableDate')(dateObj, 'dd LLL yyyy');
				captionContent += `<span class="photo-date">${formattedDate}</span>`;
			}
		} else {
			// Regular mode: use provided caption
			captionContent = caption || '';
		}

		return `<figure class="image-figure ${layoutClass}" ${style}>
					<input type="checkbox" id="${id}" class="image-zoom-toggle">
					<label for="${id}" class="image-zoom-label">
						<img src="${src}" alt="${caption || filename || 'Photo'}" loading="lazy">
						<label for="${id}" class="image-close-btn" tabindex="0" aria-label="Close image overlay">✕</label>
					</label>
					${captionContent ? `<figcaption>${captionContent}</figcaption>` : ''}
				</figure>`;
	});

	// Optimized images with eleventy-img for photo gallery
	eleventyConfig.addAsyncShortcode("photoImage", async function (src, alt, photo = {}) {
		const id = `img-${Math.random().toString(36).slice(2, 11)}`;
		
		// Convert relative path to absolute path from project root
		const imagePath = src.startsWith('../') ? src.substring(3) : src;
		
		// Process image with eleventy-img
		let metadata = await Image(imagePath, {
			widths: [400, 800, 1200, 1920],
			formats: ["avif", "webp", "jpeg"],
			urlPath: "/img/",
			outputDir: "./_site/img/",
			filenameFormat: function (id, src, width, format, options) {
				const extension = path.extname(src);
				const name = path.basename(src, extension);
				return `${name}-${width}w.${format}`;
			}
		});

		// Get the image format data (prefer avif, fallback to webp, then jpeg)
		const imageAttributes = {
			alt,
			loading: "lazy",
			decoding: "async"
		};

		// Generate responsive image HTML for grid view (smaller sizes)
		const gridImageHtml = Image.generateHTML(metadata, {
			...imageAttributes,
			sizes: "(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 300px"
		});

		// Generate responsive image HTML for modal view (larger sizes)
		const modalImageHtml = Image.generateHTML(metadata, {
			...imageAttributes,
			sizes: "(max-width: 768px) 100vw, (max-width: 1200px) calc(100vw - 320px), 1200px"
		});

		// Build caption content
		let captionContent = '';
		if (photo.alt) {
			captionContent = photo.alt;
			if (photo.date) {
				const dateObj = new Date(photo.date);
				const formattedDate = eleventyConfig.getFilter('readableDate')(dateObj, 'dd LLL yyyy');
				captionContent += `<span class="photo-date">${formattedDate}</span>`;
			}
		}

		// Build metadata sidebar for overlay
		let metadataSidebar = '';
		if (photo) {
			metadataSidebar = `
				<div class="image-metadata" id="meta-${id}">
					<h3>Photo Details</h3>
					${photo.alt ? `
					<div class="meta-item">
						<img src="../public/icons/file.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Filename</label>
							<span>${photo.alt}</span>
						</div>
					</div>` : ''}
					${photo.date ? `
					<div class="meta-item">
						<img src="../public/icons/calendar.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Date</label>
							<span>${eleventyConfig.getFilter('readableDate')(new Date(photo.date), 'dd LLLL yyyy')}</span>
						</div>
					</div>` : ''}
					${photo.camera ? `
					<div class="meta-item">
						<img src="../public/icons/camera.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Camera</label>
							<span>${photo.camera}</span>
						</div>
					</div>` : ''}
					${photo.locationName ? `
					<div class="meta-item">
						<img src="../public/icons/location.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Location</label>
							<span>${photo.locationName}</span>
						</div>
					</div>` : ''}
					${photo.dimensions ? `
					<div class="meta-item">
						<img src="../public/icons/image.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Dimensions</label>
							<span>${photo.dimensions}</span>
						</div>
					</div>` : ''}
					${photo.techDetails ? `
					<div class="meta-item">
						<img src="../public/icons/settings.svg" class="meta-icon" alt="">
						<div class="meta-content">
							<label>Camera Settings</label>
							<span class="tech-details">
								${photo.techDetails.iso ? `ISO ${photo.techDetails.iso}` : ''}
								${photo.techDetails.aperture ? `${photo.techDetails.iso ? ' • ' : ''}${photo.techDetails.aperture}` : ''}
								${photo.techDetails.focalLength ? `${(photo.techDetails.iso || photo.techDetails.aperture) ? ' • ' : ''}${photo.techDetails.focalLength}` : ''}
								${photo.techDetails.exposureTime ? `${(photo.techDetails.iso || photo.techDetails.aperture || photo.techDetails.focalLength) ? ' • ' : ''}${photo.techDetails.exposureTime}` : ''}
							</span>
						</div>
					</div>` : ''}
					${photo.description ? `
					<div class="meta-item">
						<div class="meta-content">
							<label>Description</label>
							<span>${photo.description}</span>
						</div>
					</div>` : ''}
				</div>`;
		}

		return `<figure class="image-figure image-layout-grid">
			<input type="checkbox" id="${id}" class="image-zoom-toggle">
			<label for="${id}" class="image-zoom-label">
				<div class="grid-image">${gridImageHtml}</div>
				<div class="modal-image" style="display: none;">${modalImageHtml}</div>
				${metadataSidebar}
				<label for="${id}" class="image-close-btn" tabindex="0" aria-label="Close image overlay">✕</label>
			</label>
			${captionContent ? `<figcaption>${captionContent}</figcaption>` : ''}
		</figure>`;
	});

	// Add a container shortcode for side-by-side images
	eleventyConfig.addPairedShortcode("imagegrid", function (content) {
		return `<div class="image-grid">${content}</div>`;
	});

	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/"
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
	});

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "🔗 Feed",
				order: 4
			}
		},
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "An Engineer From Portugal",
			subtitle: "Thoughts on tech, pitfalls, and the occasional rant.",
			base: "https://couto.io/",
			author: {
				name: "Elisiário Couto"
			}
		}
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			}
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return (new Date()).toISOString();
	});

	eleventyConfig.addPlugin(EleventyRenderPlugin);

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},
};
