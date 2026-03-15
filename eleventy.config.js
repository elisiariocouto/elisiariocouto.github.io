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
		const style = width ? `style="max-width: ${width}px; margin: 0 auto;"` : '';
		const layoutClass = layout ? `image-layout-${layout}` : '';

		// Build caption with metadata
		let captionContent = '';
		if (layout === 'grid') {
			captionContent = filename || '';
			if (date) {
				const dateObj = new Date(date);
				const formattedDate = eleventyConfig.getFilter('readableDate')(dateObj, 'dd LLL yyyy');
				captionContent += `<span class="photo-date">${formattedDate}</span>`;
			}
		} else {
			captionContent = caption || '';
		}

		return `<figure class="image-figure ${layoutClass}" ${style}>
					<img src="${src}" alt="${caption || filename || 'Photo'}" loading="lazy">
					${captionContent ? `<figcaption>${captionContent}</figcaption>` : ''}
				</figure>`;
	});

	// Optimized images with eleventy-img for photo gallery
	eleventyConfig.addAsyncShortcode("photoImage", async function (src, alt, photo = {}) {
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

		// Generate responsive image HTML for grid view
		const gridImageHtml = Image.generateHTML(metadata, {
			alt,
			loading: "lazy",
			decoding: "async",
			sizes: "(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
		});

		// Get the largest JPEG for PhotoSwipe full-size view
		const fullImage = metadata.jpeg[metadata.jpeg.length - 1];

		// Build caption content
		let captionContent = '';
		if (photo.locationName || photo.date) {
			if (photo.locationName) {
				captionContent = `<span class="photo-location">${photo.locationName}</span>`;
			}
			if (photo.date) {
				const dateObj = new Date(photo.date);
				const formattedDate = eleventyConfig.getFilter('readableDate')(dateObj, 'dd LLL yyyy');
				captionContent += `<span class="photo-date">${formattedDate}</span>`;
			}
		}

		// Build data attributes for PhotoSwipe metadata panel
		const dataAttrs = [
			`data-pswp-src="${fullImage.url}"`,
			`data-pswp-width="${fullImage.width}"`,
			`data-pswp-height="${fullImage.height}"`,
			photo.alt ? `data-meta-filename="${photo.alt}"` : '',
			photo.date ? `data-meta-date="${eleventyConfig.getFilter('readableDate')(new Date(photo.date), 'dd LLLL yyyy')}"` : '',
			photo.camera ? `data-meta-camera="${photo.camera}"` : '',
			photo.locationName ? `data-meta-location="${photo.locationName}"` : '',
			photo.dimensions ? `data-meta-dimensions="${photo.dimensions}"` : '',
			photo.techDetails ? `data-meta-tech="${[
				photo.techDetails.iso ? `ISO ${photo.techDetails.iso}` : '',
				photo.techDetails.aperture || '',
				photo.techDetails.focalLength || '',
				photo.techDetails.exposureTime || ''
			].filter(Boolean).join(' · ')}"` : '',
			photo.description ? `data-meta-description="${photo.description}"` : '',
		].filter(Boolean).join(' ');

		return `<figure class="image-figure image-layout-grid">
			<a href="${fullImage.url}" ${dataAttrs} target="_blank">
				${gridImageHtml}
			</a>
			${captionContent ? `<figcaption>${captionContent}</figcaption>` : ''}
		</figure>`;
	});

	// Add a container shortcode for side-by-side images
	eleventyConfig.addPairedShortcode("imagegrid", function (content) {
		return `<div class="image-grid-breakout"><div class="image-grid">${content}</div></div>`;
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
