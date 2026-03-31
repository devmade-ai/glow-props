# User Guide

A complete guide to creating designs with CanvaGrid.

---

## Overview

CanvaGrid helps you create visual designs — social posts, ads, presentations, stories, and more. The interface is organized into 5 tabs that follow a natural workflow:

1. **Presets** - Start here with layouts, themes, and looks
2. **Media** - Upload your images and logo
3. **Content** - Write your text, configure visibility, set alignment
4. **Structure** - Adjust the grid structure, reorder sections
5. **Style** - Customize fonts, overlays, and spacing

---

## Header Controls

The header bar contains:

| Control | Description |
|---------|-------------|
| **View** | Enter reader mode for a clean full-screen view |
| **Save** | Open the save/load modal to save or restore designs |
| **Help** (?) | Open the in-app tutorial |
| **Dark/Light Mode** | Toggle between dark and light interface themes |
| **Refresh** | Reload the app |
| **Install** | (When available) Install the app for offline use |
| **Update** | (When available) Apply the latest version of the app |

---

## Context Bar

A sticky bar below the tab navigation with three sections:

| Section | Description |
|---------|-------------|
| **Pages** | Page thumbnails with add, duplicate, move, and delete controls |
| **Cell Selector** | Miniature layout grid showing cells — click to select a cell for editing |
| **Undo/Redo** | Undo (`Ctrl+Z` / `Cmd+Z`) and Redo (`Ctrl+Y` / `Ctrl+Shift+Z`) buttons |

The selected cell in the Context Bar affects controls in Media, Content, and Style tabs.

---

## Installing the App (PWA)

CanvaGrid can be installed as a Progressive Web App (PWA) for offline use and a native app-like experience.

### Benefits of Installing
- **Works offline** - Create ads without an internet connection
- **Faster loading** - App resources are cached locally
- **Full-screen experience** - No browser address bar or tabs
- **Quick access** - Launch from your dock, taskbar, or home screen

### Browser Support

| Browser | Install Support | How to Install |
|---------|----------------|----------------|
| **Chrome** | ✅ Full | Click "Install" button in header, or click install icon in address bar |
| **Edge** | ✅ Full | Click "Install" button in header, or use menu → "Install CanvaGrid" |
| **Brave** | ✅ Full | Click "Install" button in header (ensure Shields isn't blocking) |
| **Safari (iOS)** | ⚠️ Manual | Tap Share → "Add to Home Screen" |
| **Safari (macOS)** | ⚠️ Manual | File → "Add to Dock..." |
| **Firefox (Mobile)** | ⚠️ Manual | Menu → "Add to Home screen" |
| **Firefox (Desktop)** | ❌ Not supported | Firefox removed PWA support in 2021. Use Chrome, Edge, or Brave for installation. |

### Installation Instructions by Browser

#### Chrome / Edge / Brave (Automatic)
1. Look for the **Install** button in the header (appears automatically)
2. Click "Install" and confirm in the popup
3. The app will be added to your applications

#### Safari (iOS)
1. Tap the **Share** button (square with arrow) at the bottom
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"** in the top right

#### Safari (macOS)
1. Click **File** in the menu bar
2. Select **"Add to Dock..."**
3. Click **"Add"** to confirm

#### Firefox Mobile
1. Tap the **menu button** (three dots)
2. Tap **"Add to Home screen"**
3. Tap **"Add"** to confirm

### Updates
When a new version is available, you'll see an **Update** button in the header. Click it to refresh and get the latest features.

---

## Tab-by-Tab Guide

### Presets Tab

The starting point for most designs. Contains three sections:

#### Layout
Grid templates that change your structure without affecting colors or fonts:
- Number of rows/columns
- Cell sizes
- Image and text cell assignments

**Aspect Ratio Filter:** Filter layouts by aspect ratio (All, Square, Portrait, Landscape) to find layouts that work best for your target platform.

**Category Filter:** Browse by category (All, Suggested, Classic, Split, Stacked, etc.) to find the right layout style.

**How to use:** Click a layout to change your grid structure. Your colors, fonts, and content are preserved.

#### Themes
Color schemes for your ad:
- **Presets:** 19 pre-built color themes you can apply with one click
- **Custom Colors:** Set your own primary, secondary, and accent colors

**How to use:** Click a theme preset to apply it, or edit the custom color inputs to create your own palette.

#### Looks
Visual effect presets that apply overlay, fonts, and filters without changing layout or colors:
- Overlay effects (gradients, vignettes, etc.)
- Font combinations
- Image filters

**How to use:** Click a look to apply its visual effects. Your layout and theme colors are preserved.

---

### Media Tab

Manage your images and logo.

#### AI Image Prompt (collapsed by default)
A helper tool for generating prompts to use with AI image generation tools (like DALL-E, Midjourney, or Stable Diffusion). Expand this section to build a prompt tailored to your ad.

**Controls:**
- **Subject / Context:** Describe what you want in the image (e.g., "coffee shop interior", "mountain landscape")
- **Style:** Choose a visual style (Photo, Cinematic, Editorial, Minimal, Abstract, Illustration, 3D)
- **Mood / Lighting:** Set the atmosphere (Dark, Light, Neutral, Dramatic, Soft, Warm, Cool)
- **Image Purpose:**
  - **Hero Image:** Clean focal point for featured images
  - **Background:** Subtle details, optimized for text overlays
- **Orientation:** Landscape, Portrait, or Square (choose based on your target platforms)
- **Colors:** Use your current theme colors or enter custom color descriptions

**Generated Prompt:** The helper builds a complete prompt including:
- Your style and mood preferences
- Color palette from your theme
- Selected orientation
- **Automatic constraints:** "no text, no overlays" - ensures clean images ready for your ad

Click **Copy** to copy the prompt to your clipboard for use in any AI image generator.

#### Images
Includes a collapsible **Sample Images** sub-section and your own uploads.

**Sample Images (collapsed by default):**
Browse sample images organized by category. Use the horizontally scrollable category chips (All, Nature, People, Abstract, etc.) to filter. Images are shown 15 at a time with Prev/Next pagination. Click any thumbnail to load the full image and add it to your library. Thumbnails load from a CDN; full images are fetched on click and cached for offline use.

**Upload:** Drag-drop images or click to browse (supports multiple images).

**Image Library:** Click any image to select it for editing.

**Selected Image Settings:**
- **Assign to Cells:** Click cells in the mini-grid to assign the selected image to layout cells
- **Fit:** Choose "Cover" (fills frame, may crop) or "Contain" (shows entire image)
- **Position:** 9-point grid to adjust where the image sits within the frame
- **Grayscale:** Quick toggle for black & white effect

**Multi-Image Layouts:** For layouts with multiple image cells, you can assign different images to different cells. The mini-grid shows which cells have images assigned (📷 icon).

#### Image Overlay (appears when an image is selected)
Controls the overlay applied directly to the selected image:

- **On/Off Toggle:** Quick enable/disable for the overlay effect
- **Type:** Choose from multiple overlay categories:
  - **Basic & Gradients:** Solid color, linear gradients (8 directions)
  - **Radial:** Vignette, Spotlight, Radial Soft, Radial Ring
  - **Effects:** Blur Edges, Frame, Duotone
  - **Blend Modes:** Multiply, Screen, Overlay, Color Burn
  - **Textures:** Noise, Film Grain
- **Color:** Choose from theme colors (Primary, Secondary, Accent) or neutrals
- **Opacity:** Adjust transparency (1-100%)

**Note:** This overlay is saved with the image itself. The Style tab has separate per-cell overlays that stack on top.

#### Advanced Filters (appears when an image is selected)
Fine-tune the selected image:
- **Grayscale** - Convert to black and white (0-100%)
- **Sepia** - Add warm vintage tone (0-100%)
- **Blur** - Soften the image (0-10px)
- **Contrast** - Adjust light/dark difference (50-150%)
- **Brightness** - Make lighter or darker (50-150%)

#### Logo
- **Upload:** Add your brand logo
- **Position:** Place in any corner or center (Top Left, Top Right, Bottom Left, Bottom Right, Center)
- **Size:** XS, S, M, L, or XL

---

### Content Tab

Write and configure your text. A top-level toggle switches between two modes:

#### Structured Mode (default)

Text elements organized into collapsible groups:

- **Title & Tagline** - Main headline and supporting text (paired)
- **Body** - Body heading and body text (paired)
- **Call to Action** - Action prompt like "Learn More" or "Shop Now"
- **Footnote** - Fine print, disclaimers, or legal text

Each cell has its own text elements. Select a cell using the Context Bar, then edit its text.

**Text Controls (for each element):**

| Control | What it does |
| ------- | ------------ |
| Eye icon | Toggle visibility on/off |
| Text input | Enter your content |
| Alignment | Left, Center, Right, or Auto (uses cell default) |
| Color | Pick from theme colors or neutrals |
| Size slider | Adjust relative size |
| B / I buttons | Bold and italic styling |
| Letter spacing | Tight, Normal, Wide, Wider |

**Cell Alignment** (below the text groups):
- **Horizontal:** Left, Center, Right — sets default for all text in the selected cell
- **Vertical:** Top, Middle, Bottom — controls vertical positioning within the cell

#### Freeform Mode

Per-cell text editors with independent content per cell. Each cell gets its own text block with:

- Text content area
- Alignment, color, and size controls
- Markdown support (content is always parsed as markdown via `marked`)

---

### Structure Tab

Fine-tune your grid structure.

#### Structure
- **Layout Type:** Full Bleed (single cell), Rows, or Columns
- **Interactive Grid:** Click and drag dividers to resize sections
- **Add/Remove:** Add sections, insert before/after, add subdivisions within sections
- **Reorder:** Move rows up/down or columns left/right to rearrange sections
- Click on a section or cell in the grid to select it

**Note:** Text alignment controls are in the Content tab, not here.

---

### Style Tab

Fine-tune typography, overlays, and spacing.

#### Typography
- **Title Font:** Choose from 24 Google Fonts for headlines
- **Body Font:** Choose a font for body text and smaller elements
- **Preview:** See how fonts look before selecting

#### Overlay
Controls per-cell overlays that help text stand out. Select a cell to configure:
- **Enable/Disable:** Toggle overlay for each cell (defaults to on for image cells)
- **Custom Settings:** Enable to override with your own type, color, and opacity
- **Type:** Choose from 26 overlay effects:
  - Basic & Gradients: Solid, 8 gradient directions
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring, 4 corner radials
  - Effects: Blur Edges, Frame, Duotone
  - Blend Modes: Multiply, Screen, Overlay, Color Burn
  - Textures: Noise, Film Grain
- **Color:** Theme colors (Primary, Secondary, Accent) or neutrals
- **Opacity:** Adjust transparency (0-100%)

#### Spacing
- **Global Padding:** Set consistent padding for all cells
- **Outer Frame:** Add a colored border around the entire canvas (% of padding)
- **Per-Cell Settings:** Select a cell to customize:
  - Custom padding override
  - Custom cell frame (colored border)

---

## Multi-Page Documents

Create multi-page documents like books, stories, or presentations.

### Managing Pages

All page controls are in the **Context Bar** (Pages section on the left):

| Action | How |
| ------ | --- |
| **Add page** | Click the + button |
| **Duplicate page** | Click the copy icon (visible when 2+ pages) |
| **Reorder** | Use the left/right arrow buttons |
| **Delete page** | Click the trash icon and confirm |
| **Switch page** | Click a page thumbnail |

Each page has its own images, layout, text, overlays, padding, and frames. Theme, fonts, platform, and logo are shared across all pages.

### Reader Mode

Click **View** in the header to enter a clean full-screen view of your pages.

**Navigation:**

- **Arrow keys:** Left/Up = previous page, Right/Down = next page
- **Buttons:** Prev / Next buttons below the canvas
- **Dots:** Click a dot to jump to a specific page
- **Escape:** Exit reader mode (or click "Back to Editor")

---

## Export

Located below the preview area.

### Platform Selection
A two-level selector organized by category → platform → format. Use the **search filter** to find platforms by name, or click categories to expand and browse. Platforms with a single format select directly; platforms with multiple formats expand to show options. Tips and file size limits are shown for each platform.

40 formats across 18 platform groups:

**Social Media:**
- Instagram: Feed Portrait (1080×1350), Square (1080×1080), Feed Landscape (1080×566), Story/Reels (1080×1920)
- Facebook: Feed Post (1200×630), Square (1080×1080), Story (1080×1920), Cover Photo (1640×624)
- TikTok: Video Cover (1080×1920)
- LinkedIn: Square (1080×1080), Portrait (1080×1350), Landscape (1920×1080)
- Twitter/X: Post (1600×900)
- Pinterest: Pin (1000×1500), Story (1080×1920)
- Snapchat: Ad (1080×1920), Story (1080×1920)
- WhatsApp: Status (1080×1920)
- Threads: Post (1080×1350), Story (1080×1920)

**Website:**
- Hero Banner: Standard (1920×600), Tall (1920×800), Full HD (1920×1080)
- Social Preview (OG): OG Image (1200×630)

**Banners:**
- LinkedIn Banner (1584×396)
- YouTube: Banner (2560×1440), Thumbnail (1280×720), End Screen (1920×1080)

**E-commerce:**
- Product Images: Square (1080×1080), Portrait (1080×1350)
- Store Banners: Hero (1920×600), Category (1200×400)

**Print (150 DPI):**
- A3 Portrait/Landscape, A4 Portrait/Landscape, A5 Portrait/Landscape

**Other:**
- Email Header (800×400)
- Zoom Background (1920×1080)
- Zoom Background (1920×1080)

### File Format
Choose PNG, JPG, or WebP before exporting. Each platform shows a recommended format — click "Use recommended" to switch. PNG for graphics/text, JPG for photos, WebP for smallest files.

### Download Options

- **Download Current** - Export the current platform in selected format
- **Download All Pages (ZIP)** - Export every page as a numbered image in a ZIP (appears when multiple pages exist)
- **Download as PDF** - Save as PDF (sharp, small files). Multi-page designs get one PDF page per document page. Great for LinkedIn carousels.
- **Download Multiple Platforms (ZIP)** - Select multiple platforms and export as a ZIP

---

## Workflow Tips

### Fastest Workflow
1. Pick a Layout and Theme from the Presets tab
2. Upload your image in Media
3. Type your text in Content
4. Export

### Custom Design Workflow
1. Upload your image first (Media tab)
2. Pick a Layout preset (Presets → Layout)
3. Choose your theme colors (Presets → Themes)
4. Pick fonts (Style → Typography)
5. Add overlays to improve text readability (Style → Overlay)
6. Write your content (Content tab)
7. Export

### Making Text Readable
- Use **overlays** on cells with text over busy images
- **Gradient overlays** work well for text at edges
- **Solid overlays** with low opacity create subtle darkening
- **Vignette** draws attention to the center
- Adjust **text color** to contrast with your overlay

### Using AI-Generated Images
1. Open **Media → AI Image Prompt** section
2. Describe your subject and choose style/mood
3. Select orientation (Landscape for banners, Portrait for stories, Square for posts)
4. Select "Background" purpose if you'll have text overlays
5. Optionally set a theme first (Presets → Themes) to include your colors
6. Click **Copy** and paste into your AI image generator
7. Upload the generated image back into the tool

### Mobile Tips
- **Long-press a cell** on the canvas to open a context menu that lets you quickly jump to Media, Content, or Style tabs for that cell.
- Swipe left/right on the canvas to navigate between pages in multi-page documents.

### Working with Layouts
- **Full Bleed:** Best for single-message ads with large text
- **Rows:** Good for separating image and text areas
- **Columns:** Creates side-by-side layouts
- Use **cell assignment** in Content tab to place text exactly where you want it
- Use **Structure tab** to fine-tune cell sizes and alignment

### Multi-Image Layouts
Some layouts support multiple images in different cells:
1. Upload all your images to the library (Media → Images)
2. Select an image by clicking it in the library
3. Use the "Assign to Cells" mini-grid to assign it to cells
4. Repeat for each image you want to place
5. Each image can have its own fit, position, overlay, and filter settings
