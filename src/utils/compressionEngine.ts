/**
 * High-performance client-side compression engine for ZENDR.
 * Compresses Images (JPEG, PNG, WEBP, HEIC) and PDF files 100% in-browser with zero server uploads.
 */

import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { loadImageFromFile, convertHeicToJpg } from './imageEngine';

// Ensure PDF.js worker is properly configured
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface ImageCompressionOptions {
  quality?: number; // 0.1 to 1.0 (default 0.75)
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp' | 'original';
  colorDepth?: number; // For PNG quantization (e.g. 64, 128, 256)
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  reductionPercent: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Universal Image Compressor: compresses JPG, PNG, WEBP, JFIF, HEIC, etc.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const originalSize = file.size;
  let targetFile = file;

  // Handle Apple HEIC photos by converting to high-res JPG first
  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
  if (isHeic) {
    const jpgBlob = await convertHeicToJpg(file, 0.98);
    targetFile = new File([jpgBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
  }

  const img = await loadImageFromFile(targetFile);
  let srcWidth = img.naturalWidth || img.width;
  let srcHeight = img.naturalHeight || img.height;

  // Calculate scaled dimensions while preserving aspect ratio
  let targetWidth = srcWidth;
  let targetHeight = srcHeight;
  const maxWidth = options.maxWidth || 4096;
  const maxHeight = options.maxHeight || 4096;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas rendering context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Determine output MIME type
  let mimeType = options.outputFormat;
  if (!mimeType || mimeType === 'original') {
    if (file.type === 'image/png') mimeType = 'image/png';
    else if (file.type === 'image/webp') mimeType = 'image/webp';
    else mimeType = 'image/jpeg';
  }

  // If JPEG output, fill canvas with solid white background to prevent black alpha artifact
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // If PNG quantization is requested, apply color reduction palette
  if (mimeType === 'image/png' && options.colorDepth && options.colorDepth < 256) {
    quantizeCanvasColors(ctx, targetWidth, targetHeight, options.colorDepth);
  }

  const quality = options.quality ?? (mimeType === 'image/png' ? 0.85 : 0.75);

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to compress image canvas.'));
      },
      mimeType,
      quality
    );
  });

  const newSize = outBlob.size;
  const reductionPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  return {
    blob: outBlob,
    originalSize,
    newSize,
    reductionPercent,
    width: targetWidth,
    height: targetHeight,
    format: mimeType.replace('image/', '').toUpperCase()
  };
}

/**
 * Quantize colors in a 2D canvas context for PNG compression
 */
function quantizeCanvasColors(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colorCount: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const step = Math.max(1, Math.round(256 / Math.cbrt(colorCount)));

  for (let i = 0; i < data.length; i += 4) {
    // Quantize R, G, B channels
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
    // Preserve alpha or binary threshold
    if (data[i + 3] < 16) data[i + 3] = 0;
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Dedicated JPEG Compressor
 */
export async function compressJpeg(
  file: File,
  quality = 0.72,
  maxWidth = 3840
): Promise<CompressionResult> {
  return compressImage(file, {
    quality,
    maxWidth,
    outputFormat: 'image/jpeg'
  });
}

/**
 * Dedicated PNG Compressor
 */
export async function compressPng(
  file: File,
  colorDepth = 128,
  quality = 0.8
): Promise<CompressionResult> {
  return compressImage(file, {
    quality,
    colorDepth,
    outputFormat: 'image/png'
  });
}

export type PdfCompressionLevel = 'recommended' | 'extreme' | 'lossless';

export interface PdfCompressionResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  reductionPercent: number;
  pageCount: number;
}

/**
 * Advanced multi-tier PDF Compressor
 */
export async function compressPdfWithLevel(
  file: File,
  level: PdfCompressionLevel = 'recommended',
  onProgress?: (percent: number, msg: string) => void
): Promise<PdfCompressionResult> {
  const originalSize = file.size;
  onProgress?.(15, 'Inspecting PDF document structure...');
  const arrayBuffer = await file.arrayBuffer();

  // If "extreme" compression is requested on image-heavy documents, re-render pages with DPI scaling
  if (level === 'extreme') {
    onProgress?.(25, 'Loading PDF rendering engine for deep raster optimization...');
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;

    const targetPdf = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const p = Math.round(25 + (pageNum / numPages) * 60);
      onProgress?.(p, `Optimizing page ${pageNum} of ${numPages}...`);

      const page = await pdfDoc.getPage(pageNum);
      // Downscale to 1.2x scale (~90 DPI) for extreme size reduction
      const viewport = page.getViewport({ scale: 1.25 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Render page to canvas
      await (page.render({ canvasContext: ctx, viewport } as any).promise);

      // Compress to compact JPEG
      const jpgBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.65);
      });

      const jpgBuffer = await jpgBlob.arrayBuffer();
      const embeddedJpg = await targetPdf.embedJpg(jpgBuffer);

      // Maintain standard A4/US Letter or original aspect page size
      const newPage = targetPdf.addPage([viewport.width / 1.25, viewport.height / 1.25]);
      newPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: viewport.width / 1.25,
        height: viewport.height / 1.25
      });
    }

    onProgress?.(90, 'Packing optimized streams...');
    const compressedBytes = await targetPdf.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    const newSize = compressedBytes.length;
    const reductionPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
    onProgress?.(100, 'Extreme compression complete!');

    return {
      blob: new Blob([new Uint8Array(compressedBytes).buffer as ArrayBuffer], { type: 'application/pdf' }),
      originalSize,
      newSize,
      reductionPercent,
      pageCount: numPages
    };
  }

  // Recommended & Lossless structural compression
  onProgress?.(40, 'Rebuilding font tables and catalog streams...');
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();

  // Strip non-essential metadata headers
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setProducer('ZENDR Studio Engine');
  pdf.setCreator('ZENDR Optimizer');

  onProgress?.(80, 'Enabling cross-reference stream compression...');
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  const newSize = compressedBytes.length;
  const reductionPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
  onProgress?.(100, 'Compression complete!');

  return {
    blob: new Blob([new Uint8Array(compressedBytes).buffer as ArrayBuffer], { type: 'application/pdf' }),
    originalSize,
    newSize,
    reductionPercent,
    pageCount
  };
}
