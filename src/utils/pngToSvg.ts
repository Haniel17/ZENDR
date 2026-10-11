import ImageTracerModule from 'imagetracerjs';

// Handle CommonJS / ESM interop in bundlers
const ImageTracer = (ImageTracerModule as any).default || ImageTracerModule;

export type VectorPreset = 
  | 'default'
  | 'detailed'
  | 'smoothed'
  | 'sharp'
  | 'curvy'
  | 'posterized1'
  | 'grayscale';

export interface PngToSvgOptions {
  preset?: VectorPreset;
  numberOfColors: number;       // 2 to 64
  lineThreshold: number;        // ltres: 0.1 to 10 (detail for straight lines)
  splineThreshold: number;      // qtres: 0.1 to 10 (detail for curves)
  pathOmit: number;             // 0 to 32 (noise speckle suppression)
  blurRadius: number;           // 0 to 5 (smoothing pre-filter)
  strokeWidth: number;          // 0 to 2 (border thickness on paths)
  rightAngleEnhance: boolean;   // enhance 90-degree corners
  removeBackground: boolean;    // attempt to remove white/near-white outer background
}

export interface VectorizationResult {
  svgString: string;
  blob: Blob;
  sizeBytes: number;
  width: number;
  height: number;
  pathCount: number;
  colorsUsed: number;
  executionTimeMs: number;
}

/**
 * Loads an image from a File or Data URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + String(err)));
    img.src = src;
  });
}

/**
 * Extracts ImageData from an HTMLImageElement using an offscreen canvas
 */
export function getImageData(img: HTMLImageElement): {
  imageData: ImageData;
  width: number;
  height: number;
} {
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not create 2D canvas context for image rasterization.');
  }

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return { imageData, width, height };
}

/**
 * Enhances and cleans up the generated SVG string with proper viewBox, responsive attributes and styling
 */
function enhanceSvgString(rawSvg: string, width: number, height: number): {
  enhancedSvg: string;
  pathCount: number;
} {
  // Count path elements
  const pathMatches = rawSvg.match(/<path\b/gi);
  const pathCount = pathMatches ? pathMatches.length : 0;

  let cleaned = rawSvg;

  // Ensure standard SVG opening tag with viewBox for responsive scaling
  if (!cleaned.includes('viewBox')) {
    cleaned = cleaned.replace(
      /<svg\b([^>]*)>/i,
      `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" $1>`
    );
  } else {
    // Add XML namespace if missing
    if (!cleaned.includes('xmlns=')) {
      cleaned = cleaned.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
  }

  return { enhancedSvg: cleaned, pathCount };
}

/**
 * Vectorizes a raster PNG/JPEG image into scalable vector graphics (SVG paths).
 * Uses real path-tracing algorithms from ImageTracer.js.
 */
export async function vectorizePng(
  imageSource: File | string,
  options: PngToSvgOptions
): Promise<VectorizationResult> {
  const startTime = performance.now();

  // 1. Resolve image source to URL
  let objectUrl = '';
  let srcUrl = '';

  if (imageSource instanceof File) {
    objectUrl = URL.createObjectURL(imageSource);
    srcUrl = objectUrl;
  } else {
    srcUrl = imageSource;
  }

  try {
    // 2. Load image element and get raw ImageData
    const img = await loadImage(srcUrl);
    const { imageData, width, height } = getImageData(img);

    // 3. Prepare ImageTracer configuration options
    // Merge chosen preset if selected
    const presetName = options.preset || 'default';
    const basePreset = ImageTracer.optionpresets?.[presetName] || {};

    const tracerOptions: Record<string, any> = {
      ...basePreset,
      corsenabled: false,
      numberofcolors: Math.min(64, Math.max(2, options.numberOfColors)),
      ltres: Math.max(0.05, options.lineThreshold),
      qtres: Math.max(0.05, options.splineThreshold),
      pathomit: Math.max(0, options.pathOmit),
      blurradius: Math.max(0, options.blurRadius),
      blurdelta: 20,
      strokewidth: Math.max(0, options.strokeWidth),
      rightangleenhance: options.rightAngleEnhance,
      colorsampling: 2,
      colorquantcycles: 3,
      scale: 1,
      roundcoords: 1,
      viewbox: true,
      desc: false,
    };

    // 4. Run real vectorization algorithm
    const rawSvg: string = ImageTracer.imagedataToSVG(imageData, tracerOptions);

    if (!rawSvg || !rawSvg.includes('<svg')) {
      throw new Error('ImageTracer failed to vectorize image: Empty or invalid SVG output.');
    }

    // 5. Enhance and clean up SVG
    const { enhancedSvg, pathCount } = enhanceSvgString(rawSvg, width, height);

    // 6. Create downloadable Blob
    const blob = new Blob([enhancedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const endTime = performance.now();

    return {
      svgString: enhancedSvg,
      blob,
      sizeBytes: blob.size,
      width,
      height,
      pathCount,
      colorsUsed: options.numberOfColors,
      executionTimeMs: Math.round(endTime - startTime)
    };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
