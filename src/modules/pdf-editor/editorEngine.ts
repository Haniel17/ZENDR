import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { EditorPageState, AnnotationItem } from './types';

// Ensure worker is configured
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Parses hex color to pdf-lib rgb
 */
function hexToRgb(hex: string, defaultColor = { r: 0.96, g: 0.62, b: 0.07 }) {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return rgb(defaultColor.r, defaultColor.g, defaultColor.b);
}

/**
 * Initial load of PDF into EditorPageState list
 */
export async function initializeEditorDocument(file: File): Promise<{
  pages: EditorPageState[];
  numPages: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const pages: EditorPageState[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.25 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    let thumbnailUrl = '';
    if (ctx) {
      await page.render({
        canvasContext: ctx,
        viewport
      } as any).promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
    }

    const unscaledViewport = page.getViewport({ scale: 1.0 });

    pages.push({
      pageNumber: i,
      customRotation: 0,
      thumbnailUrl,
      width: unscaledViewport.width,
      height: unscaledViewport.height
    });
  }

  return { pages, numPages };
}

/**
 * Commits all edits (page reordering, rotations, deletions, annotations, signatures, stamps)
 * and exports the final PDF
 */
export async function exportEditedPdf(
  originalFile: File,
  pagesState: EditorPageState[],
  annotationsMap: Record<number, AnnotationItem[]>
): Promise<Blob> {
  const bytes = await originalFile.arrayBuffer();
  const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const outputPdf = await PDFDocument.create();

  const font = await outputPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await outputPdf.embedFont(StandardFonts.HelveticaBold);

  // Active pages (not marked deleted)
  const activePages = pagesState.filter((p) => !p.isDeleted);

  if (activePages.length === 0) {
    throw new Error('Cannot export a document with all pages deleted.');
  }

  for (let newIdx = 0; newIdx < activePages.length; newIdx++) {
    const pageState = activePages[newIdx];
    const origIndex = pageState.pageNumber - 1;

    // Copy original page
    const [copiedPage] = await outputPdf.copyPages(sourcePdf, [origIndex]);

    // Apply rotation
    if (pageState.customRotation) {
      const currentRot = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRot + pageState.customRotation) % 360));
    }

    const pageHeight = copiedPage.getHeight();

    // Stamp annotations for this page
    const pageAnns = annotationsMap[pageState.pageNumber] || [];

    for (const ann of pageAnns) {
      const annColor = hexToRgb(ann.color);

      if (ann.type === 'text') {
        const textFont = ann.isBold ? boldFont : font;
        // In PDF coordinates: Y starts at bottom
        const pdfY = pageHeight - ann.y - ann.fontSize;
        copiedPage.drawText(ann.text, {
          x: ann.x,
          y: Math.max(0, pdfY),
          size: ann.fontSize,
          font: textFont,
          color: annColor
        });
      } else if (ann.type === 'shape') {
        const { shapeType, x, y, width, height, strokeWidth } = ann;

        if (shapeType === 'rectangle') {
          const pdfY = pageHeight - y - height;
          copiedPage.drawRectangle({
            x,
            y: Math.max(0, pdfY),
            width: Math.abs(width),
            height: Math.abs(height),
            borderColor: annColor,
            borderWidth: strokeWidth,
            opacity: 1
          });
        } else if (shapeType === 'circle') {
          const radius = Math.abs(width) / 2;
          const centerX = x + radius;
          const centerY = pageHeight - y - radius;
          copiedPage.drawCircle({
            x: centerX,
            y: centerY,
            size: radius,
            borderColor: annColor,
            borderWidth: strokeWidth
          });
        } else if (shapeType === 'line' || shapeType === 'arrow') {
          copiedPage.drawLine({
            start: { x, y: pageHeight - y },
            end: { x: x + width, y: pageHeight - (y + height) },
            thickness: strokeWidth,
            color: annColor
          });
        }
      } else if (ann.type === 'draw') {
        const { points, strokeWidth, isHighlight } = ann;
        if (points.length > 1) {
          const drawOpacity = isHighlight ? 0.35 : 1.0;
          for (let pIdx = 0; pIdx < points.length - 1; pIdx++) {
            const p1 = points[pIdx];
            const p2 = points[pIdx + 1];
            copiedPage.drawLine({
              start: { x: p1.x, y: pageHeight - p1.y },
              end: { x: p2.x, y: pageHeight - p2.y },
              thickness: isHighlight ? strokeWidth * 2.5 : strokeWidth,
              color: annColor,
              opacity: drawOpacity
            });
          }
        }
      } else if (ann.type === 'signature') {
        try {
          const base64Data = ann.dataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const imgBytes = new Uint8Array(binaryString.length);
          for (let b = 0; b < binaryString.length; b++) {
            imgBytes[b] = binaryString.charCodeAt(b);
          }

          let embeddedImage;
          if (ann.dataUrl.startsWith('data:image/jpeg') || ann.dataUrl.startsWith('data:image/jpg')) {
            embeddedImage = await outputPdf.embedJpg(imgBytes);
          } else {
            embeddedImage = await outputPdf.embedPng(imgBytes);
          }

          const pdfY = pageHeight - ann.y - ann.height;
          copiedPage.drawImage(embeddedImage, {
            x: ann.x,
            y: Math.max(0, pdfY),
            width: ann.width,
            height: ann.height,
            opacity: ann.opacity ?? 1
          });
        } catch (sigErr) {
          console.error('Failed to embed signature into PDF:', sigErr);
        }
      } else if (ann.type === 'stamp') {
        const pdfY = pageHeight - ann.y - ann.height;
        const stampColor = hexToRgb(ann.color);

        if (ann.stampType === 'date') {
          copiedPage.drawRectangle({
            x: ann.x,
            y: Math.max(0, pdfY),
            width: ann.width,
            height: ann.height,
            borderColor: stampColor,
            borderWidth: 1,
            color: rgb(0.08, 0.08, 0.1),
            opacity: 0.95
          });
          copiedPage.drawText(`Date: ${ann.text}`, {
            x: ann.x + 8,
            y: Math.max(0, pdfY + 8),
            size: 10,
            font: boldFont,
            color: rgb(0.96, 0.62, 0.07)
          });
        } else if (
          ann.stampType === 'approved' ||
          ann.stampType === 'confidential' ||
          ann.stampType === 'paid'
        ) {
          // Authentic rubber stamp outline
          copiedPage.drawRectangle({
            x: ann.x,
            y: Math.max(0, pdfY),
            width: ann.width,
            height: ann.height,
            borderColor: stampColor,
            borderWidth: 2,
            color: rgb(1, 1, 1),
            opacity: 0.85
          });
          copiedPage.drawRectangle({
            x: ann.x + 3,
            y: Math.max(0, pdfY + 3),
            width: ann.width - 6,
            height: ann.height - 6,
            borderColor: stampColor,
            borderWidth: 1,
            opacity: 0.9
          });
          copiedPage.drawText(ann.text, {
            x: ann.x + 10,
            y: Math.max(0, pdfY + 12),
            size: 14,
            font: boldFont,
            color: stampColor
          });
        } else if (ann.stampType === 'checkmark') {
          const cx = ann.x + ann.width / 2;
          const cy = pdfY + ann.height / 2;
          const r = ann.width / 2 - 2;

          copiedPage.drawCircle({
            x: cx,
            y: cy,
            size: r,
            borderColor: stampColor,
            borderWidth: 2,
            color: rgb(0.9, 0.98, 0.94),
            opacity: 0.85
          });

          copiedPage.drawLine({
            start: { x: cx - 6, y: cy },
            end: { x: cx - 2, y: cy - 5 },
            thickness: 2.5,
            color: stampColor
          });
          copiedPage.drawLine({
            start: { x: cx - 2, y: cy - 5 },
            end: { x: cx + 7, y: cy + 6 },
            thickness: 2.5,
            color: stampColor
          });
        } else if (ann.stampType === 'cross') {
          const cx = ann.x + ann.width / 2;
          const cy = pdfY + ann.height / 2;
          const r = ann.width / 2 - 2;

          copiedPage.drawCircle({
            x: cx,
            y: cy,
            size: r,
            borderColor: stampColor,
            borderWidth: 2,
            color: rgb(0.98, 0.9, 0.9),
            opacity: 0.85
          });

          copiedPage.drawLine({
            start: { x: cx - 5, y: cy - 5 },
            end: { x: cx + 5, y: cy + 5 },
            thickness: 2.5,
            color: stampColor
          });
          copiedPage.drawLine({
            start: { x: cx - 5, y: cy + 5 },
            end: { x: cx + 5, y: cy - 5 },
            thickness: 2.5,
            color: stampColor
          });
        }
      }
    }

    outputPdf.addPage(copiedPage);
  }

  const finalBytes = await outputPdf.save();
  return new Blob([finalBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}
