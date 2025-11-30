# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog website built with Eleventy (11ty) v3, based on the eleventy-base-blog starter template. The site generates static HTML from Markdown content and Nunjucks templates, with zero JavaScript output for optimal performance.

## Common Commands

### Development
- `npm install` - Install dependencies
- `npm run start` - Start development server with live reload (`npx @11ty/eleventy --serve --quiet`)
- `npm run build` - Build for production (`npx @11ty/eleventy`)
- `npm run debug` - Run in debug mode to see Eleventy internals
- `npm run benchmark` - Run performance benchmarks

### Build Variations
- `npm run build-nocolor` - Build without colored output
- `npm run build-ghpages` - Build with GitHub Pages path prefix

## Architecture & Structure

### Content Organization
- **Input directory**: `content/` - All source content and templates
- **Output directory**: `_site/` - Generated static site
- **Layouts**: `_includes/layouts/` - Base templates (base.njk, home.njk, post.njk)
- **Data**: `_data/` - Global data files (metadata.js for site config)
- **Static assets**: `public/` - Copied directly to output (CSS, images, etc.)

### Key Configuration Files
- `eleventy.config.js` - Main Eleventy configuration with plugins and transforms
- `_config/filters.js` - Custom Eleventy filters (date formatting, array manipulation)
- `package.json` - Dependencies and npm scripts

### Content Types
- **Blog posts**: `content/blog/*.md` - Uses `layouts/post.njk` template
- **Pages**: `content/*.md` or `content/*.njk` - Regular pages
- **Collections**: Automatic collections for posts, tags, and navigation

### Custom Features
- **Image shortcode**: `{% image src, caption, width, layout %}` - Images with zoom functionality
- **Image grid**: `{% imagegrid %}...{% endimagegrid %}` - Side-by-side image layouts
- **Draft support**: Use `draft: true` in frontmatter (only shown in development)
- **Automatic image optimization**: AVIF/WebP formats with lazy loading
- **Tag pages**: Auto-generated pages for each tag
- **RSS/Atom feed**: Available at `/feed/feed.xml`

### Template Engines
- **Markdown files**: Processed with Nunjucks (`markdownTemplateEngine: "njk"`)
- **HTML files**: Processed with Nunjucks (`htmlTemplateEngine: "njk"`)
- **Template formats**: md, njk, html, liquid, 11ty.js

### Data Cascade
- Site metadata in `_data/metadata.js`
- Directory data files (e.g., `blog.11tydata.js` for blog-specific settings)
- Frontmatter in individual files

### Plugins in Use
- `@11ty/eleventy-plugin-rss` - RSS/Atom feeds
- `@11ty/eleventy-plugin-syntaxhighlight` - Code syntax highlighting
- `@11ty/eleventy-plugin-navigation` - Navigation menus
- `@11ty/eleventy-img` - Image optimization and transforms
- Various built-in plugins for HTML processing and URL transforms

### Development Notes
- Watch targets include images: `content/**/*.{svg,webp,png,jpg,jpeg,gif}`
- Per-page CSS/JS bundles supported via bundle plugin
- Images co-located with posts are automatically processed
- Site uses UTC timezone for consistent date handling