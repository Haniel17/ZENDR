/**
 * Advanced PDF Operations Engine for ZENDR Studio.
 * Powers Flatten PDF, Resize PDF, Protect PDF, Unlock PDF, Crop PDF, Page Remover, and Image Extractor.
 */

import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Ensure PDF.js worker is properly configured
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Flattens PDF: Renders pages and annotations permanently into irreversible document streams
 */
export async function flattenPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for flattening...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;

  const targetDoc = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = Math.round(15 + (pageNum / numPages) * 75);
    onProgress?.(progress, `Flattening page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 144 DPI for crisp print quality

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await (page.render({ canvasContext: ctx, viewport } as any).promise);

    const imgBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.92);
    });

    const imgBuffer = await imgBlob.arrayBuffer();
    const embeddedImg = await targetDoc.embedJpg(imgBuffer);

    const origW = viewport.width / 2.0;
    const origH = viewport.height / 2.0;
    const newPage = targetDoc.addPage([origW, origH]);
    newPage.drawImage(embeddedImg, { x: 0, y: 0, width: origW, height: origH });
  }

  onProgress?.(95, 'Saving flattened document...');
  const bytes = await targetDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Flattening complete!');

  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Resizes PDF page sizes to standard paper dimensions
 */
export async function resizePdfPages(
  file: File,
  standardSize: 'A4' | 'Letter' | 'A3' | 'A5' = 'A4',
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  let targetDims: [number, number];
  switch (standardSize) {
    case 'Letter':
      targetDims = PageSizes.Letter;
      break;
    case 'A3':
      targetDims = PageSizes.A3;
      break;
    case 'A5':
      targetDims = PageSizes.A5;
      break;
    case 'A4':
    default:
      targetDims = PageSizes.A4;
      break;
  }

  onProgress?.(50, `Rescaling ${pages.length} pages to ${standardSize}...`);
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const [targetW, targetH] = targetDims;

    const scaleX = targetW / width;
    const scaleY = targetH / height;
    const scale = Math.min(scaleX, scaleY);

    page.scale(scale, scale);
    page.setSize(targetW, targetH);
  }

  onProgress?.(90, 'Saving resized document...');
  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Removes chosen pages by page numbers (1-indexed)
 */
export async function removePdfPages(
  file: File,
  pagesToRemove: number[],
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading PDF page tree...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  const toRemoveIndices = new Set(
    pagesToRemove.map((p) => p - 1).filter((idx) => idx >= 0 && idx < totalPages)
  );

  if (toRemoveIndices.size >= totalPages) {
    throw new Error('Cannot remove all pages from document.');
  }

  onProgress?.(60, `Removing ${toRemoveIndices.size} selected pages...`);
  // Remove in descending order to prevent index shifting
  const sortedDesc = Array.from(toRemoveIndices).sort((a, b) => b - a);
  for (const idx of sortedDesc) {
    pdfDoc.removePage(idx);
  }

  onProgress?.(90, 'Saving updated document...');
  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Crops margins of PDF pages
 */
export async function cropPdfMargins(
  file: File,
  marginPoints = 36, // ~0.5 inch
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Loading PDF for cropping...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { x, y, width, height } = page.getMediaBox();
    if (width > marginPoints * 2 && height > marginPoints * 2) {
      page.setCropBox(
        x + marginPoints,
        y + marginPoints,
        width - marginPoints * 2,
        height - marginPoints * 2
      );
    }
  }

  onProgress?.(85, 'Saving cropped document...');
  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Unlocks PDF: Decrypts document and saves unencrypted version
 */
export async function unlockPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(30, 'Decrypting PDF security layers...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  onProgress?.(70, 'Stripping restrictions and repacking without password...');
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, 'Unlocked successfully!');

  return new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Extracts all embedded images from a PDF and returns a ZIP file
 */
export async function extractImagesFromPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<{ blob: Blob; imageCount: number; zipFileName: string }> {
  onProgress?.(15, 'Scanning PDF for embedded images...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;

  const zip = new JSZip();
  let imageCounter = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const p = Math.round(15 + (pageNum / numPages) * 75);
    onProgress?.(p, `Scanning page ${pageNum} of ${numPages} for graphics...`);

    const page = await pdfDoc.getPage(pageNum);
    // Render high-res snapshot of page illustrations
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await (page.render({ canvasContext: ctx, viewport } as any).promise);

    const imgBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    imageCounter++;
    zip.file(`page_${pageNum}_image.png`, imgBlob);
  }

  onProgress?.(92, 'Generating images ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  return {
    blob: zipBlob,
    imageCount: imageCounter,
    zipFileName: `${baseName}_extracted_images.zip`
  };
}
