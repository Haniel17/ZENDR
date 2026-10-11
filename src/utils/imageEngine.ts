/**
 * High-performance client-side image conversion engine.
 * Converts between HEIC, WEBP, JFIF, PNG, JPG/JPEG, SVG, BMP, and GIF 100% in-browser.
 */

import { convertSvgToPng } from './svgToPng';

/**
 * Dynamically import heic2any safely in browser
 */
async function getHeic2Any() {
  if (typeof window === 'undefined') {
    throw new Error('HEIC conversion is only available in browser environments.');
  }
  const mod = await import('heic2any');
  return mod.default || mod;
}

/**
 * Loads an image file into an HTMLImageElement
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to decode image file "${(file as File).name || 'image'}".`));
    };
    img.src = url;
  });
}

/**
 * Convert Apple iPhone HEIC/HEIF photo to JPG Blob
 */
export async function convertHeicToJpg(file: File, quality = 0.92): Promise<Blob> {
  const heic2any = await getHeic2Any();
  const conversionResult = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality
  });

  if (Array.isArray(conversionResult)) {
    return conversionResult[0];
  }
  return conversionResult;
}

/**
 * Convert Apple iPhone HEIC/HEIF photo to PNG Blob
 */
export async function convertHeicToPng(file: File): Promise<Blob> {
  const heic2any = await getHeic2Any();
  const conversionResult = await heic2any({
    blob: file,
    toType: 'image/png'
  });

  if (Array.isArray(conversionResult)) {
    return conversionResult[0];
  }
  return conversionResult;
}

/**
 * Convert WEBP or JFIF to PNG
 */
export async function convertWebpOrJfifToPng(file: File): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG blob from canvas.'));
    }, 'image/png');
  });
}

/**
 * Convert WEBP or PNG to JPG with custom background & quality
 */
export async function convertWebpOrPngToJpg(file: File, quality = 0.92, bgColor = '#ffffff'): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Fill solid background for non-alpha JPG
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate JPG blob from canvas.'));
    }, 'image/jpeg', quality);
  });
}

/**
 * Universal Image Converter
 * Converts any source format (PNG, JPG, WEBP, JFIF, HEIC, GIF, BMP, SVG) to target format
 */
export async function convertUniversalImage(
  file: File,
  targetFormat: 'png' | 'jpeg' | 'webp' | 'svg',
  options: {
    quality?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<Blob> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. If source is HEIC/HEIF, decode to intermediate blob first
  let sourceBlob: Blob = file;
  if (ext === 'heic' || ext === 'heif') {
    sourceBlob = await convertHeicToPng(file);
  }

  // 2. If source is SVG and target is raster
  if (ext === 'svg' && targetFormat !== 'svg') {
    const text = await file.text();
    const result = await convertSvgToPng(text, {
      width: options.width || 1200,
      height: options.height || 1200,
      backgroundColor: targetFormat === 'jpeg' ? '#ffffff' : 'transparent'
    });
    if (targetFormat === 'png') return result.blob;
    // If target is jpeg or webp, re-encode canvas blob
    const img = await loadImageFromFile(result.blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    if (targetFormat === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return new Promise((res, rej) => {
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), `image/${targetFormat}`, options.quality || 0.92);
    });
  }

  // 3. Standard raster to raster
  const img = await loadImageFromFile(sourceBlob);
  const canvas = document.createElement('canvas');
  canvas.width = options.width || img.naturalWidth || img.width;
  canvas.height = options.height || img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  if (targetFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to convert image to ${targetFormat}.`));
      },
      `image/${targetFormat}`,
      options.quality || 0.92
    );
  });
}
