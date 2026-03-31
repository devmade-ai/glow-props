# CanvaGrid

A browser-based visual design tool. Upload images, add text overlays, choose layouts, and export designs for social media, web, print, and presentations. Supports multi-page documents for books, stories, and slide decks.

**Live Demo:** [https://canva-grid.vercel.app](https://canva-grid.vercel.app)

## Features

### Presets
- **Layout** - Grid structure presets with aspect ratio filtering
- **Themes** - 19 color schemes plus custom color inputs
- **Looks** - One-click visual presets that apply fonts, filters, overlay, and text styles without changing layout or colors

### Media
- **Sample images** - Browse CDN-hosted sample images with category filtering
- **Image library** - Upload multiple images and assign them to individual cells
- **Object fit** - Cover (fill) or Contain (fit) modes per image
- **Position control** - Adjust image position within frame
- **Image overlay** - Per-image overlay controls (type, color, opacity)
- **Advanced filters** - Grayscale, sepia, blur, contrast, brightness per image
- **Logo upload** - Add your brand logo with position (corners/center) and size controls

### Content
Two modes: **Structured** and **Freeform**

**Structured mode** - Six text elements organized into groups:
- **Title & Tagline** - Main headline and supporting text (paired)
- **Body Heading & Body Text** - Section content (paired)
- **CTA** - Call to action button text
- **Footnote** - Fine print or disclaimers

Each text element supports: visibility toggle, cell placement, alignment, color, size, bold/italic, letter spacing.

**Freeform mode** - Per-cell text editors with independent content, automatic markdown rendering.

### Structure
- **Layout Type** - Choose Full Bleed, Rows, or Columns with adjustable sizes
- **Text Alignment** - Per-cell or global horizontal and vertical alignment

### Style
- **Typography** - 24 Google Fonts (sans-serif, serif, display categories) with separate title and body font selection
- **Overlay** - Per-cell overlay with 26 effects (solid, 8 gradient directions, radial variants, blend modes, textures) with adjustable opacity
- **Spacing** - Global padding plus per-cell custom padding, outer frame and cell frames

### Multi-Page
- Create multi-page documents (books, stories, presentations)
- Add, duplicate, delete, reorder pages
- Per-page: images, layout, text, overlays, padding, frames
- Shared across pages: theme, fonts, platform, logo
- **Reader mode** - Clean full-screen view with page navigation

### Export
- **40 formats** across 18 platform groups in 6 categories:
  - **Social** - Instagram (Feed Portrait/Square/Feed Landscape/Story), Facebook (Feed/Square/Story/Cover), TikTok, LinkedIn (Square/Portrait/Landscape), Twitter/X, Pinterest (Pin/Story), Snapchat (Ad/Story), WhatsApp (Status), Threads (Post/Story)
  - **Website** - Hero (Standard/Tall/Full HD), OG Image
  - **Banners** - LinkedIn Banner, YouTube (Banner/Thumbnail/End Screen)
  - **E-commerce** - Product Images (Square/Portrait), Store Banners (Hero/Category)
  - **Print** - A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - **Other** - Email Header, Zoom Background
- **Format selection** - PNG, JPG, or WebP with per-platform recommendations
- **Platform search filter** - Search platforms by name to quickly find the right format
- **Two-level platform selector** - Browse by category → platform → format, with tips and file size limits
- **Single download** - Export current platform in selected format
- **Multi-page ZIP** - Export all pages as a ZIP archive
- **Multi-platform ZIP** - Select multiple platforms and export as ZIP
- **PDF export** - Save as PDF via pdf-lib (for LinkedIn carousels, works on mobile)
- **Progress indicator** - Visual feedback during batch exports

## Quick Start

1. **Pick a preset** - Start with a Layout and Theme from the Presets tab
2. **Upload your image** - Go to Media tab, drag-drop or click to upload
3. **Add your text** - Fill in the Content tab with your headline, body, CTA
4. **Adjust structure** - Fine-tune grid structure in the Structure tab if needed
5. **Customize style** - Change fonts or overlay in the Style tab
6. **Export** - Select your platform and download

### Tips
- Start with **Looks** presets for the fastest workflow (applies fonts, filters, and overlay at once)
- Use **Layout** presets to change structure without losing your color choices
- **Per-cell overlay** helps text stand out over busy images
- Preview different platforms before exporting to ensure your design works everywhere
- On mobile, **long-press a cell** to quickly jump to Media, Content, or Style tabs for that cell
- Fonts load on demand — only the fonts you use are downloaded, keeping the app fast

## Getting Started (Development)

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- pdf-lib for PDF export
- marked for markdown parsing (freeform text mode)
- Vercel deployment
- PWA support (installable, offline capable)

## Deployment

Deployed via **Vercel**. Pushes to `main` trigger automatic deployments. Configuration is in `vercel.json`.
