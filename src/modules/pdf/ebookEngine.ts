/**
 * Client-Side Ebook Engine
 * Supports PDF to EPUB, EPUB to PDF, and HEIC to PDF conversions in-browser using JSZip and pdf-lib.
 */

import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { convertHeicToJpg } from '../../utils/imageEngine';

// Ensure worker is configured for pdfjs
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Escapes XML/HTML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts a PDF document into an EPUB 3 ebook file
 */
export async function convertPdfToEpub(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ') || 'Converted Document';
  const bookId = `urn:uuid:zendr-${Date.now()}`;

  const zip = new JSZip();

  // 1. mimetype MUST be first, uncompressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  // 3. OEBPS/style.css
  zip.file(
    'OEBPS/style.css',
    `body {
  font-family: Georgia, "Times New Roman", serif;
  margin: 1.5em;
  line-height: 1.6;
  color: #1a1a1a;
}
h1, h2 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #111;
  margin-top: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}
p {
  margin-bottom: 1em;
  text-align: justify;
}
.page-marker {
  font-size: 0.8em;
  color: #888;
  text-align: right;
  margin-bottom: 1em;
}`
  );

  const manifestItems: string[] = [
    `<item id="css" href="style.css" media-type="text/css"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
  ];
  const spineItems: string[] = [];
  const navPoints: string[] = [];

  // 4. Extract each page text and create chapter files
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = 15 + Math.round((pageNum / numPages) * 70);
    onProgress?.(percent, `Extracting page ${pageNum} of ${numPages}...`);

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines
    const lines: string[] = [];
    let currentLine = '';

    for (const item of textContent.items as any[]) {
      if (item.str !== undefined) {
        if (item.hasEOL) {
          currentLine += item.str;
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
        } else {
          currentLine += item.str + ' ';
        }
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    // Format paragraphs
    const paragraphs = lines.length > 0 ? lines : ['[Blank Page or Vector Content]'];
    const paragraphsHtml = paragraphs
      .map((p) => `<p>${escapeXml(p)}</p>`)
      .join('\n      ');

    const chapterFilename = `chapter_${pageNum}.xhtml`;
    const chapterXml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>${escapeXml(docTitle)} - Page ${pageNum}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <div class="page-marker">Page ${pageNum}</div>
    <h2>Section ${pageNum}</h2>
    <div class="content">
      ${paragraphsHtml}
    </div>
  </body>
</html>`;

    zip.file(`OEBPS/${chapterFilename}`, chapterXml);

    manifestItems.push(
      `<item id="chap_${pageNum}" href="${chapterFilename}" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`<itemref idref="chap_${pageNum}"/>`);
    navPoints.push(`
    <navPoint id="np_${pageNum}" playOrder="${pageNum}">
      <navLabel><text>Page ${pageNum}</text></navLabel>
      <content src="${chapterFilename}"/>
    </navPoint>`);
  }

  // 5. OEBPS/toc.ncx
  zip.file(
    'OEBPS/toc.ncx',
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="${numPages}"/>
    <meta name="dtb:maxPageNumber" content="${numPages}"/>
  </head>
  <docTitle><text>${escapeXml(docTitle)}</text></docTitle>
  <navMap>
    ${navPoints.join('\n')}
  </navMap>
</ncx>`
  );

  // 6. OEBPS/content.opf
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(docTitle)}</dc:title>
    <dc:identifier id="BookID">${bookId}</dc:identifier>
    <dc:language>en</dc:language>
    <dc:creator>ZENDR Converter</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
</package>`
  );

  onProgress?.(90, 'Packing EPUB archive...');
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  onProgress?.(100, 'EPUB ebook ready!');
  return blob;
}

/**
 * Converts an EPUB ebook file into a formatted PDF document
 */
export async function convertEpubToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Unpacking EPUB archive...');
  const zip = await JSZip.loadAsync(file);

  // Find container.xml
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) {
    throw new Error('Invalid EPUB file: missing META-INF/container.xml');
  }

  // Parse rootfile path
  const rootfileMatch = containerXml.match(/full-path="([^"]+)"/);
  const opfPath = rootfileMatch ? rootfileMatch[1] : 'OEBPS/content.opf';
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  const opfContent = await zip.file(opfPath)?.async('text');
  if (!opfContent) {
    throw new Error(`Invalid EPUB file: cannot find OPF manifest at ${opfPath}`);
  }

  onProgress?.(30, 'Reading chapter manifests...');

  // Extract chapter hrefs from OPF
  const chapterHrefs: string[] = [];
  const itemRegex = /<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="application\/(?:xhtml\+xml|xml)"[^>]*\/?>/gi;
  const manifestMap: Record<string, string> = {};

  let match;
  while ((match = itemRegex.exec(opfContent)) !== null) {
    manifestMap[match[1]] = match[2];
  }

  // Check spine order
  const spineRegex = /<itemref\s+[^>]*idref="([^"]+)"[^>]*\/?>/gi;
  while ((match = spineRegex.exec(opfContent)) !== null) {
    const href = manifestMap[match[1]];
    if (href) chapterHrefs.push(href);
  }

  // Fallback: if spine parsing found nothing, find all xhtml files
  if (chapterHrefs.length === 0) {
    zip.forEach((path) => {
      if (path.endsWith('.xhtml') || path.endsWith('.html')) {
        chapterHrefs.push(path.replace(opfDir, ''));
      }
    });
  }

  onProgress?.(45, 'Creating publication PDF...');
  const outputPdf = await PDFDocument.create();
  const font = await outputPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await outputPdf.embedFont(StandardFonts.HelveticaBold);

  const docTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ') || 'Ebook Document';

  // Title Page
  const titlePage = outputPdf.addPage([595.28, 841.89]); // A4
  titlePage.drawText(docTitle, {
    x: 50,
    y: 500,
    size: 26,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.15)
  });
  titlePage.drawText('Converted by ZENDR Studio Ebook Engine', {
    x: 50,
    y: 460,
    size: 11,
    font,
    color: rgb(0.5, 0.5, 0.55)
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  const fontSize = 10;

  // Process each chapter
  let totalChapters = chapterHrefs.length;
  for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
    const href = chapterHrefs[cIdx];
    const fullPath = opfDir + href;
    const chapterHtml = await zip.file(fullPath)?.async('text');
    if (!chapterHtml) continue;

    const percent = 50 + Math.round((cIdx / totalChapters) * 45);
    onProgress?.(percent, `Rendering chapter ${cIdx + 1} of ${totalChapters}...`);

    // Extract text from HTML
    const cleanText = chapterHtml
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');

    const paragraphs = cleanText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    let currentPage = outputPdf.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin - 30;

    // Chapter Header
    currentPage.drawText(`Chapter ${cIdx + 1}`, {
      x: margin,
      y: currentY,
      size: 16,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.2)
    });
    currentY -= 30;

    for (const para of paragraphs) {
      // Word wrap paragraph into lines
      const words = para.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > contentWidth && currentLine) {
          // Check page break
          if (currentY < margin + 20) {
            currentPage = outputPdf.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0.15, 0.15, 0.15)
          });
          currentY -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (currentY < margin + 20) {
          currentPage = outputPdf.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(currentLine, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15)
        });
        currentY -= lineHeight + 6; // Extra paragraph gap
      }
    }
  }

  onProgress?.(98, 'Finalizing PDF output...');
  const pdfBytes = await outputPdf.save();
  onProgress?.(100, 'PDF ready!');
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

/**
 * Converts Apple iPhone HEIC/HEIF photo directly into a clean PDF document
 */
export async function convertHeicToPdf(
  file: File,
  onProgress?: (percent: number, msg: string) => void
): Promise<Blob> {
  onProgress?.(25, 'Decoding Apple HEIC photo...');
  const jpgBlob = await convertHeicToJpg(file, 0.95);

  onProgress?.(60, 'Creating PDF container...');
  const bytes = await jpgBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.create();

  const jpgImage = await pdfDoc.embedJpg(bytes);
  const imgWidth = jpgImage.width;
  const imgHeight = jpgImage.height;

  // Add page with exact image aspect ratio (or max A4 letter dimensions)
  const page = pdfDoc.addPage([imgWidth, imgHeight]);
  page.drawImage(jpgImage, {
    x: 0,
    y: 0,
    width: imgWidth,
    height: imgHeight
  });

  onProgress?.(95, 'Generating PDF...');
  const finalBytes = await pdfDoc.save();
  onProgress?.(100, 'HEIC converted to PDF!');
  return new Blob([finalBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}
