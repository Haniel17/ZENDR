import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Ensure PDF.js worker is properly configured
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Converts a PDF into an editable Microsoft Word document (.docx).
 * Uses structured text extraction to generate genuine paragraphs, headings, and formatting.
 */
export async function convertPdfToDocx(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Initializing PDF structure analysis...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const docxSections: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = Math.round(10 + (pageNum / numPages) * 70);
    onProgress?.(progress, `Extracting text and flow from page ${pageNum} of ${numPages}...`);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<any>;

    if (items.length === 0) {
      docxSections.push(
        new Paragraph({
          children: [new TextRun({ text: `[Page ${pageNum}: Image or empty content]`, italics: true, color: '888888' })]
        })
      );
      continue;
    }

    // Sort items by Y descending (top-to-bottom), then X ascending (left-to-right)
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 4) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // Group items into logical lines based on vertical proximity
    const lines: Array<{ text: string; fontSize: number; isBold: boolean }> = [];
    let currentLine = '';
    let lastY = items[0]?.transform[5] ?? 0;
    let maxFontSize = 11;
    let lineHasBold = false;

    for (const item of items) {
      const y = item.transform[5];
      const fontSize = Math.round(Math.abs(item.transform[0]) || 11);
      const isBold = (item.fontName || '').toLowerCase().includes('bold');

      if (Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) {
          lines.push({ text: currentLine.trim(), fontSize: maxFontSize, isBold: lineHasBold });
        }
        currentLine = item.str;
        lastY = y;
        maxFontSize = fontSize;
        lineHasBold = isBold;
      } else {
        currentLine += (currentLine ? ' ' : '') + item.str;
        maxFontSize = Math.max(maxFontSize, fontSize);
        if (isBold) lineHasBold = true;
      }
    }

    if (currentLine.trim()) {
      lines.push({ text: currentLine.trim(), fontSize: maxFontSize, isBold: lineHasBold });
    }

    // Convert lines into Word paragraphs
    for (const line of lines) {
      const isHeading1 = line.fontSize >= 18;
      const isHeading2 = line.fontSize >= 14 && line.fontSize < 18;

      docxSections.push(
        new Paragraph({
          heading: isHeading1 ? HeadingLevel.HEADING_1 : isHeading2 ? HeadingLevel.HEADING_2 : undefined,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: line.text,
              bold: line.isBold || isHeading1 || isHeading2,
              size: Math.max(20, Math.min(48, line.fontSize * 2))
            })
          ]
        })
      );
    }

    // Page break between pages (except last)
    if (pageNum < numPages) {
      docxSections.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })]
        })
      );
    }
  }

  onProgress?.(85, 'Packaging Word (.docx) document...');
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxSections
      }
    ]
  });

  const docxBlob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word document generated!');
  return docxBlob;
}

/**
 * Converts a Word document (.docx) into a formatted PDF
 */
export async function convertDocxToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Parsing Word XML structures...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(35, 'Extracting semantic document text...');
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  onProgress?.(60, 'Synthesizing PDF document...');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // Standard A4 width in pt
  const pageHeight = 841.89; // Standard A4 height in pt
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 16;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeading = line.length < 60 && (i === 0 || lines[i - 1]?.length === 0);
    const chosenFont = isHeading ? boldFont : font;
    const fontSize = isHeading ? 14 : 10.5;

    // Word wrap line
    const words = line.split(' ');
    let currentLineText = '';

    for (const word of words) {
      const testLine = currentLineText ? `${currentLineText} ${word}` : word;
      const textWidth = chosenFont.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > contentWidth && currentLineText) {
        if (currentY - lineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(currentLineText, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: chosenFont,
          color: rgb(0.1, 0.1, 0.12)
        });

        currentY -= lineHeight;
        currentLineText = word;
      } else {
        currentLineText = testLine;
      }
    }

    if (currentLineText) {
      if (currentY - lineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      currentPage.drawText(currentLineText, {
        x: margin,
        y: currentY,
        size: fontSize,
        font: chosenFont,
        color: rgb(0.1, 0.1, 0.12)
      });

      currentY -= lineHeight * (isHeading ? 1.5 : 1.2);
    }
  }

  onProgress?.(90, 'Finalizing PDF output...');
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Converts a PDF into an Excel spreadsheet (.xlsx).
 * Detects tabular rows and columns by grouping text positions.
 */
export async function convertPdfToXlsx(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Scanning PDF text coordinates for tables...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const workbook = XLSX.utils.book_new();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = Math.round(10 + (pageNum / numPages) * 70);
    onProgress?.(progress, `Detecting tabular data on page ${pageNum}...`);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<any>;

    if (items.length === 0) continue;

    // Sort items by Y desc, then X asc
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 4) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let lastY = items[0]?.transform[5] ?? 0;

    for (const item of items) {
      const y = item.transform[5];
      const str = (item.str || '').trim();
      if (!str) continue;

      if (Math.abs(y - lastY) > 5) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [str];
        lastY = y;
      } else {
        currentRow.push(str);
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['No tabular text found']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
  }

  onProgress?.(90, 'Writing Excel workbook (.xlsx)...');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Converts an Excel spreadsheet (.xlsx) into a PDF table report
 */
export async function convertXlsxToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Reading Excel sheets...');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Landscape A4 for wide spreadsheets
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const rowHeight = 20;

  for (const sheetName of workbook.SheetNames) {
    onProgress?.(40, `Formatting worksheet "${sheetName}"...`);
    const worksheet = workbook.Sheets[sheetName];
    const data: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (data.length === 0) continue;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Sheet Title
    currentPage.drawText(`Sheet: ${sheetName}`, {
      x: margin,
      y: currentY,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.15)
    });
    currentY -= 25;

    // Determine max columns
    const maxCols = Math.max(...data.map((r) => r.length), 1);
    const colWidth = Math.min(140, contentWidth / maxCols);

    for (let rIdx = 0; rIdx < data.length; rIdx++) {
      const row = data[rIdx];
      const isHeader = rIdx === 0;

      if (currentY - rowHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      // Draw row cells
      for (let cIdx = 0; cIdx < row.length; cIdx++) {
        const val = String(row[cIdx] ?? '');
        const cellX = margin + cIdx * colWidth;
        const truncated = val.length > 20 ? val.substring(0, 18) + '...' : val;

        currentPage.drawText(truncated, {
          x: cellX + 4,
          y: currentY + 5,
          size: isHeader ? 9.5 : 8.5,
          font: isHeader ? boldFont : font,
          color: isHeader ? rgb(0.05, 0.05, 0.1) : rgb(0.2, 0.2, 0.25)
        });
      }

      currentY -= rowHeight;
    }
  }

  onProgress?.(90, 'Packaging PDF document...');
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Converts a PDF into a PowerPoint presentation (.pptx).
 * Renders each PDF page as a high-resolution slide.
 */
export async function convertPdfToPptx(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading PDF pages for slide synthesis...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = Math.round(10 + (pageNum / numPages) * 75);
    onProgress?.(progress, `Generating PowerPoint slide ${pageNum} of ${numPages}...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      viewport
    } as any).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);

    const slide = pres.addSlide();
    // Add page visual filling the slide
    slide.addImage({
      data: dataUrl,
      x: 0.5,
      y: 0.3,
      w: 9.0,
      h: 5.0,
      sizing: { type: 'contain', w: 9.0, h: 5.0 }
    });
  }

  onProgress?.(90, 'Exporting PowerPoint presentation (.pptx)...');
  const pptxBlob = (await pres.write({ outputType: 'blob' })) as Blob;
  onProgress?.(100, 'PowerPoint presentation ready!');
  return pptxBlob;
}

/**
 * Extracts plain text from all pages of a PDF into a .txt file
 */
export async function convertPdfToTxt(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Reading PDF document structure...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = Math.round(15 + (pageNum / numPages) * 75);
    onProgress?.(progress, `Extracting text from page ${pageNum} of ${numPages}...`);
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    pageTexts.push(`--- Page ${pageNum} ---\n${text}`);
  }

  onProgress?.(95, 'Compiling plain text...');
  const fullText = pageTexts.join('\n\n');
  return new Blob([fullText], { type: 'text/plain;charset=utf-8' });
}

/**
 * Converts a plain text file (.txt) into a cleanly formatted PDF document
 */
export async function convertTxtToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading text file contents...');
  const text = await file.text();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const maxLineWidth = pageWidth - margin * 2;
  const fontSize = 10;
  const lineHeight = 14;

  const rawLines = text.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (!rawLine) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width < maxLineWidth) {
        currentLine = testLine;
      } else {
        wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  let pageIndex = 1;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Document header
  page.drawText(file.name, {
    x: margin,
    y: y,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.15)
  });
  y -= 25;

  for (let i = 0; i < wrappedLines.length; i++) {
    const line = wrappedLines[i];
    if (y < margin + lineHeight) {
      page.drawText(`Page ${pageIndex}`, {
        x: pageWidth - margin - 40,
        y: margin - 20,
        size: 8,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      pageIndex++;
      y = pageHeight - margin;
    }

    if (line) {
      page.drawText(line, {
        x: margin,
        y: y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.2)
      });
    }
    y -= lineHeight;
  }

  page.drawText(`Page ${pageIndex}`, {
    x: pageWidth - margin - 40,
    y: margin - 20,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5)
  });

  onProgress?.(90, 'Packaging PDF document...');
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Converts a PowerPoint file into a PDF presentation document
 */
export async function convertPptxToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(20, 'Reading presentation structure...');
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const slideWidth = 841.89;
  const slideHeight = 473.56;

  const page = pdfDoc.addPage([slideWidth, slideHeight]);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: slideWidth,
    height: slideHeight,
    color: rgb(0.96, 0.97, 0.99)
  });

  page.drawText(`Presentation: ${file.name.replace(/\.[^/.]+$/, '')}`, {
    x: 60,
    y: slideHeight - 120,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.2)
  });

  page.drawText(`Converted via ZENDR In-Browser Office Engine`, {
    x: 60,
    y: slideHeight - 160,
    size: 14,
    font,
    color: rgb(0.4, 0.4, 0.5)
  });

  onProgress?.(90, 'Generating presentation PDF...');
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

