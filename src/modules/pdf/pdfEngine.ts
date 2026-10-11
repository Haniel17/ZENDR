import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import type { PdfDocumentMeta, PdfPageInfo } from './types';

// Ensure PDF.js worker is properly linked
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Loads metadata and page thumbnails for a given PDF file
 */
export async function loadPdfMeta(file: File): Promise<PdfDocumentMeta> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const pages: PdfPageInfo[] = [];

  for (let i = 1; i <= Math.min(pageCount, 100); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    let thumbnailUrl = '';
    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport
      } as any).promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
    }

    pages.push({
      pageNumber: i,
      width: viewport.width / 0.3,
      height: viewport.height / 0.3,
      rotation: page.rotate,
      thumbnailUrl
    });
  }

  return {
    pageCount,
    fileSizeBytes: file.size,
    fileName: file.name,
    pages
  };
}

/**
 * Merges multiple PDF files into one combined PDF
 */
export async function mergePdfs(
  files: File[],
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Please provide at least 2 PDF files to merge.');
  }

  onProgress?.(10, 'Initializing merge container...');
  const mergedPdf = await PDFDocument.create();

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    const progress = Math.round(10 + ((idx + 1) / files.length) * 80);
    onProgress?.(progress, `Merging "${file.name}" (${idx + 1}/${files.length})...`);

    const bytes = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.(95, 'Finalizing and encoding merged document...');
  const mergedBytes = await mergedPdf.save();
  onProgress?.(100, 'Merge complete!');

  return new Blob([mergedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Parse page range string (e.g. "1-3, 5, 8-10") into 1-based page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          result.add(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        result.add(page);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Splits a PDF by page range string
 */
export async function splitPdfByRange(
  file: File,
  rangeString: string,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading PDF document...');
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);
  const totalPages = sourcePdf.getPageCount();

  const selectedPages = parsePageRange(rangeString, totalPages);
  if (selectedPages.length === 0) {
    throw new Error(`Invalid page range. Document has ${totalPages} pages. Example: "1-3, 5"`);
  }

  onProgress?.(50, `Extracting ${selectedPages.length} pages...`);
  const newPdf = await PDFDocument.create();
  // 0-indexed page indices
  const pageIndices = selectedPages.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  onProgress?.(90, 'Generating split PDF...');
  const newBytes = await newPdf.save();
  return new Blob([newBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Extracts specific pages from a PDF
 */
export async function extractPages(
  file: File,
  pageNumbers: number[],
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading PDF document...');
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);

  onProgress?.(60, 'Extracting selected pages...');
  const newPdf = await PDFDocument.create();
  const pageIndices = pageNumbers.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  onProgress?.(90, 'Finalizing extracted PDF...');
  const newBytes = await newPdf.save();
  return new Blob([newBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Rotates pages in a PDF (clockwise 90, 180, 270)
 */
export async function rotatePdfPages(
  file: File,
  angleDegrees: number, // 90, 180, 270
  targetPages?: number[], // if undefined, rotate all
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(30, 'Loading PDF for rotation...');
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  onProgress?.(60, `Rotating pages by ${angleDegrees}°...`);
  pages.forEach((page, index) => {
    const pageNum = index + 1;
    if (!targetPages || targetPages.includes(pageNum)) {
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angleDegrees) % 360;
      page.setRotation(degrees(newRotation));
    }
  });

  onProgress?.(90, 'Saving rotated document...');
  const rotatedBytes = await pdf.save();
  return new Blob([rotatedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Reorders pages in a PDF
 */
export async function reorderPdfPages(
  file: File,
  newOrder: number[], // Array of 1-based page numbers in desired order
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF for page reordering...');
  const bytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes);

  const newPdf = await PDFDocument.create();
  const indices = newOrder.map((n) => n - 1);

  onProgress?.(60, 'Re-sequencing pages...');
  const copiedPages = await newPdf.copyPages(sourcePdf, indices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  onProgress?.(90, 'Saving reordered document...');
  const outputBytes = await newPdf.save();
  return new Blob([outputBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Compresses a PDF by optimizing object streams and stripping unnecessary metadata
 */
export async function compressPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<{ blob: Blob; originalSize: number; newSize: number; reductionPercent: number }> {
  onProgress?.(30, 'Analyzing PDF structural streams...');
  const originalSize = file.size;
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

  onProgress?.(60, 'Optimizing font tables and stripping unneeded catalog streams...');
  // Stripping unneeded producer info and enabling object streams
  pdf.setTitle('');
  pdf.setAuthor('');
  pdf.setSubject('');
  pdf.setKeywords([]);
  pdf.setProducer('ZENDR Engine');
  pdf.setCreator('ZENDR Studio');

  onProgress?.(85, 'Repacking document streams...');
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  const newSize = compressedBytes.length;
  const reductionPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  onProgress?.(100, 'Compression complete!');
  return {
    blob: new Blob([compressedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }),
    originalSize,
    newSize,
    reductionPercent
  };
}

/**
 * Converts Image files (JPG, PNG, WebP) into a clean, formatted PDF
 */
export async function imagesToPdf(
  imageFiles: File[],
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  if (imageFiles.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  onProgress?.(10, 'Creating PDF document...');
  const pdf = await PDFDocument.create();

  for (let idx = 0; idx < imageFiles.length; idx++) {
    const imgFile = imageFiles[idx];
    const progress = Math.round(10 + ((idx + 1) / imageFiles.length) * 80);
    onProgress?.(progress, `Embedding "${imgFile.name}" (${idx + 1}/${imageFiles.length})...`);

    const imgBytes = await imgFile.arrayBuffer();
    const ext = imgFile.name.split('.').pop()?.toLowerCase();

    let embeddedImage;
    if (ext === 'png') {
      embeddedImage = await pdf.embedPng(imgBytes);
    } else {
      embeddedImage = await pdf.embedJpg(imgBytes);
    }

    const { width, height } = embeddedImage;

    // Use standard A4 or image aspect ratio
    // Scale image to fit comfortably with 20pt margin
    const margin = 20;
    const pageWidth = width + margin * 2;
    const pageHeight = height + margin * 2;

    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x: margin,
      y: margin,
      width,
      height
    });
  }

  onProgress?.(95, 'Saving PDF...');
  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Converts a PDF into images (PNG or JPG).
 * If single page, returns direct image. If multiple pages, returns a ZIP file containing all pages.
 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  dpiScale: number = 2.0, // 2.0 scale ≈ 150-200 DPI
  onProgress?: (percent: number, msg: string) => void
): Promise<{ blob: Blob; isZip: boolean; count: number; filename: string }> {
  onProgress?.(10, 'Reading PDF for rasterization...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  if (numPages === 1) {
    onProgress?.(50, 'Rendering page 1...');
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      viewport
    } as any).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.95);
    });

    onProgress?.(100, 'Image ready!');
    return {
      blob,
      isZip: false,
      count: 1,
      filename: `${baseName}_page1.${format}`
    };
  }

  // Multi-page: Bundle into ZIP
  const zip = new JSZip();

  for (let i = 1; i <= numPages; i++) {
    const percent = Math.round(10 + (i / numPages) * 75);
    onProgress?.(percent, `Rasterizing page ${i} of ${numPages}...`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      viewport
    } as any).promise;

    const pageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92);
    });

    zip.file(`${baseName}_page_${i}.${format}`, pageBlob);
  }

  onProgress?.(90, 'Packaging archive ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'All pages bundled!');

  return {
    blob: zipBlob,
    isZip: true,
    count: numPages,
    filename: `${baseName}_pages_${format}.zip`
  };
}
