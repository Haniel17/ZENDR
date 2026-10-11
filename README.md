# ZENDR — Every File. One Workspace.

<p align="center">
  <img src="/public/favicon.svg" alt="ZENDR Logo" width="80" height="80" />
</p>

<p align="center">
  <a href="https://zendr-web.vercel.app" target="_blank"><strong>🚀 Live Web App: zendr-web.vercel.app</strong></a>
</p>

> **ZENDR** is a fast, 100% private in-browser file transformation workstation. Vectorize images, edit and manipulate PDFs, convert office documents, compress media, and transform data structures—all processed securely within your client browser.

---

## ✨ Features

- **Genuine PNG → SVG Vectorization**: Uses `ImageTracer.js` to trace real mathematical bezier curves and polygons (`<path>` elements), **not fake Base64-embedded images**.
- **High-DPI SVG → PNG Rasterization**: Powered by `Canvg` and HTML5 Canvas with custom dimension scaling (up to 4K / 8K), aspect-ratio locking, and background color options (transparent, dark, light, custom hex).
- **100% In-Browser & Private**: Zero uploads to remote servers. All computation runs locally inside client WebAssembly and Canvas threads.
- **Interactive Before/After Split Curtain Slider**: Slide between original raster pixels and converted vector paths with instant visual feedback.
- **Side-by-Side & SVG Code Inspector**: Inspect generated XML code, line counts, path counts, and copy the SVG markup directly to your clipboard.
- **Fine-Grained Vector Controls**:
  - **Presets**: Balanced, High Detail, Ultra-Smooth, Crisp Logo, Curvy, Posterize, Grayscale.
  - **Palette Quantization**: 2 to 64 color layers.
  - **Line & Curve Thresholds**: `ltres` and `qtres` for tuning corner sharpness vs. spline smoothing.
  - **Noise Filter**: Suppress unwanted speckles and tiny raster artifacts.
  - **Right-Angle Enhancement**: Crispen 90-degree corners for logos and typography.
- **Aesthetic Dark Mode UI**: Designed with a futuristic palette (`#09090B` background, `#131318` cards, `#00D1FF` neon cyan, `#8B5CF6` electric purple) plus a light-mode toggle.
- **Zero Friction Test Drive**: Built-in 1-click sample assets ("Try Demo PNG" / "Try Demo SVG") for instant testing without needing local files.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Vector Engine**: [ImageTracer.js](https://github.com/jankovicsandras/imagetracerjs)
- **Canvas Rendering Engine**: [Canvg](https://github.com/canvg/canvg)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd ZENDR
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the printed local URL (e.g. `http://localhost:5173` or `http://localhost:5174`).

---

## 📦 Building for Production

To create a type-checked, optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📐 How It Works

### 1. PNG → SVG Pipeline
1. Loads the source image into an offscreen HTML5 `Canvas` element.
2. Extracts raw 32-bit `ImageData` (RGBA pixel buffer).
3. Executes `ImageTracer.js` color quantization and contour-tracing algorithms.
4. Generates pure XML `<path>` nodes with coordinates and RGBA fills.
5. Injects standard `viewBox` coordinates and SVG namespaces for responsive vector scaling.

### 2. SVG → PNG Pipeline
1. Sanitizes incoming SVG markup to neutralize security vulnerabilities (scripts, iframes, malicious inline handlers).
2. Parses native SVG `viewBox`, `width`, and `height` to calculate aspect ratios.
3. Allocates target-resolution canvas (supporting up to 8192×8192 pixels).
4. Employs `Canvg` to parse SVG vector commands and rasterize them into the 2D canvas context with anti-aliasing.
5. Exports high-definition 32-bit PNG data URL and downloadable `Blob`.

---

## 📜 License

Free and open-source. Released under the MIT License.
