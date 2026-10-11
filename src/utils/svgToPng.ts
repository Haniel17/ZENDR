import { Canvg } from 'canvg';

export interface SvgToPngOptions {
  width: number;
  height: number;
  backgroundColor?: string; // 'transparent', '#09090B', '#FFFFFF', custom hex
  dpiScale?: number; // e.g. 1, 2, 4 for ultra-crisp retina exports
}

export interface SvgDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  viewBox?: string;
}

/**
 * Safely sanitizes an SVG string removing scripts, event handlers, and dangerous tags.
 */
export function sanitizeSvg(svgContent: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Check parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Invalid SVG XML: ${parserError.textContent}`);
    }

    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      throw new Error('No <svg> root element found.');
    }

    // Remove dangerous elements
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta'];
    dangerousTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    // Remove event listener attributes (onclick, onload, etc.) & javascript: hrefs
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      const attributes = Array.from(el.attributes);
      for (const attr of attributes) {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        if (
          (attr.name === 'href' || attr.name === 'xlink:href') &&
          attr.value.trim().toLowerCase().startsWith('javascript:')
        ) {
          el.removeAttribute(attr.name);
        }
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
  } catch (err: any) {
    console.warn('SVG sanitization fallback to basic regex clean:', err);
    // Fallback safe cleaning
    return svgContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }
}

/**
 * Extracts native SVG dimensions and viewBox to populate UI controls.
 */
export function parseSvgDimensions(svgContent: string): SvgDimensions {
  const defaultDim: SvgDimensions = { width: 800, height: 800, aspectRatio: 1 };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return defaultDim;

    let width = 0;
    let height = 0;
    const viewBoxAttr = svg.getAttribute('viewBox');

    if (viewBoxAttr) {
      const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3]) && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }

    const widthAttr = svg.getAttribute('width');
    const heightAttr = svg.getAttribute('height');

    if (widthAttr) {
      const parsedW = parseFloat(widthAttr);
      if (!isNaN(parsedW) && parsedW > 0) width = parsedW;
    }
    if (heightAttr) {
      const parsedH = parseFloat(heightAttr);
      if (!isNaN(parsedH) && parsedH > 0) height = parsedH;
    }

    if (width <= 0 || height <= 0) {
      width = 800;
      height = 800;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
      aspectRatio: width / height,
      viewBox: viewBoxAttr || undefined
    };
  } catch {
    return defaultDim;
  }
}

/**
 * Converts SVG to PNG data URL using Canvg and Canvas.
 */
export async function convertSvgToPng(
  svgString: string,
  options: SvgToPngOptions
): Promise<{ dataUrl: string; blob: Blob; sizeBytes: number }> {
  const sanitized = sanitizeSvg(svgString);
  const { width, height, backgroundColor = 'transparent' } = options;

  const targetWidth = Math.max(1, Math.round(width));
  const targetHeight = Math.max(1, Math.round(height));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context could not be created.');
  }

  // Handle background color
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  try {
    // Attempt Canvg rendering
    const v = await Canvg.fromString(ctx, sanitized, {
      ignoreMouse: true,
      ignoreAnimation: true,
      scaleWidth: targetWidth,
      scaleHeight: targetHeight,
      enableRedraw: false
    });
    await v.render();
  } catch (canvgErr) {
    console.warn('Canvg render encountered issue, trying native Image fallback:', canvgErr);
    
    // Native browser fallback using Image and Blob URL
    await new Promise<void>((resolve, reject) => {
      const blob = new Blob([sanitized], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (backgroundColor && backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else {
          ctx.clearRect(0, 0, targetWidth, targetHeight);
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG in Image element: ' + String(e)));
      };

      img.src = url;
    });
  }

  // Convert canvas to blob & data URL
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export canvas to PNG blob.'));
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      resolve({
        dataUrl,
        blob,
        sizeBytes: blob.size
      });
    }, 'image/png');
  });
}
