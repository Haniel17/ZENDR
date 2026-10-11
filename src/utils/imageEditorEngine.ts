/**
 * Client-Side Image Editor Engine for ZENDR Studio.
 * Powers Resize, Crop, Rotate, Flip, Color Picker, Image Enlarger, and GIF Maker 100% in-browser.
 */

import { loadImageFromFile } from './imageEngine';

export interface ImageCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  isLight: boolean;
  count: number;
}

/**
 * Resizes an image to specified dimensions or scaling factor
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality = 0.92,
  outputType?: string
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const mime = outputType || file.type || 'image/png';
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate resized image blob.'));
      },
      mime,
      quality
    );
  });

  return { blob, width: targetWidth, height: targetHeight };
}

/**
 * Crops an image according to a crop bounding rectangle
 */
export async function cropImage(
  file: File,
  cropArea: ImageCropArea,
  quality = 0.95
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropArea.width));
  canvas.height = Math.max(1, Math.round(cropArea.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const mime = file.type || 'image/png';
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate cropped image blob.'));
      },
      mime,
      quality
    );
  });

  return { blob, width: canvas.width, height: canvas.height };
}

/**
 * Rotates and/or flips an image
 */
export async function transformImage(
  file: File,
  rotationDegrees: number, // 0, 90, 180, 270 or arbitrary
  flipHorizontal = false,
  flipVertical = false,
  quality = 0.92
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const rad = (rotationDegrees * Math.PI) / 180;
  // Calculate bounding box after rotation
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const newW = Math.round(srcW * cos + srcH * sin);
  const newH = Math.round(srcW * sin + srcH * cos);

  const canvas = document.createElement('canvas');
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const mime = file.type || 'image/png';
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newW, newH);
  }

  ctx.save();
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(img, -srcW / 2, -srcH / 2);
  ctx.restore();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to transform image.'));
      },
      mime,
      quality
    );
  });

  return { blob, width: newW, height: newH };
}

/**
 * Enlarges / upscales an image with high-definition bicubic interpolation
 */
export async function enlargeImage(
  file: File,
  scaleFactor: number = 2.0 // 2x, 4x, etc.
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageFromFile(file);
  const newW = Math.round((img.naturalWidth || img.width) * scaleFactor);
  const newH = Math.round((img.naturalHeight || img.height) * scaleFactor);
  return resizeImage(file, newW, newH, 0.96);
}

/**
 * Extracts dominant color palette from an uploaded image
 */
export async function extractColorPalette(file: File, maxColors = 8): Promise<ExtractedColor[]> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  // Sample at 120x120 for fast high-accuracy clustering
  const sampleW = 120;
  const sampleH = Math.round((img.height / img.width) * sampleW) || 120;
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

  // Simple color binning quantization
  const colorBuckets: Record<string, { r: number; g: number; b: number; count: number }> = {};

  for (let i = 0; i < imgData.length; i += 16) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    if (a < 64) continue; // Skip transparency

    // Bin to 32 steps per channel
    const binR = Math.round(r / 32) * 32;
    const binG = Math.round(g / 32) * 32;
    const binB = Math.round(b / 32) * 32;
    const key = `${binR},${binG},${binB}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r: binR, g: binG, b: binB, count: 0 };
    }
    colorBuckets[key].count++;
  }

  const sorted = Object.values(colorBuckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  return sorted.map((c) => {
    const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
    const brightness = (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
    return {
      hex,
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      hsl: rgbToHslString(c.r, c.g, c.b),
      isLight: brightness > 150,
      count: c.count
    };
  });
}

function rgbToHslString(r: number, g: number, b: number): string {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Creates an animated GIF from a sequence of image files
 */
export async function createGifFromImages(
  files: File[],
  delayMs = 250,
  targetWidth = 480
): Promise<Blob> {
  if (files.length === 0) throw new Error('Please select at least one image file for the GIF.');

  // Pre-load all frames
  const loadedImgs: HTMLImageElement[] = [];
  for (const f of files) {
    loadedImgs.push(await loadImageFromFile(f));
  }

  const first = loadedImgs[0];
  const aspect = first.height / first.width;
  const width = targetWidth;
  const height = Math.round(targetWidth * aspect);

  // Render frames into canvas data
  const frameCanvases: HTMLCanvasElement[] = [];
  for (const img of loadedImgs) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      frameCanvases.push(c);
    }
  }

  return encodeCanvasFramesToGif(frameCanvases, delayMs, width, height);
}

/**
 * Lightweight client-side GIF89a encoder
 */
function encodeCanvasFramesToGif(
  frames: HTMLCanvasElement[],
  delayMs: number,
  width: number,
  height: number
): Blob {
  // GIF89a binary generator
  const delayHundredths = Math.max(2, Math.round(delayMs / 10));
  const parts: Uint8Array[] = [];

  // Header: 'GIF89a'
  const header = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  parts.push(header);

  // Logical Screen Descriptor
  const lsd = new Uint8Array(7);
  lsd[0] = width & 0xff;
  lsd[1] = (width >> 8) & 0xff;
  lsd[2] = height & 0xff;
  lsd[3] = (height >> 8) & 0xff;
  lsd[4] = 0x70; // 8 bits per pixel, no global color table
  lsd[5] = 0; // background color index
  lsd[6] = 0; // pixel aspect ratio
  parts.push(lsd);

  // Netscape 2.0 Loop Extension
  const netscape = new Uint8Array([
    0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
    0x03, 0x01, 0x00, 0x00, 0x00
  ]);
  parts.push(netscape);

  for (const canvas of frames) {
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const imgData = ctx.getImageData(0, 0, width, height).data;

    // Build 64-color palette for this frame
    const { palette, indexedPixels } = buildFramePalette(imgData, width * height);

    // Graphic Control Extension
    const gce = new Uint8Array([
      0x21, 0xf9, 0x04, 0x04,
      delayHundredths & 0xff, (delayHundredths >> 8) & 0xff,
      0x00, 0x00
    ]);
    parts.push(gce);

    // Image Descriptor with Local Color Table (64 colors = 2^6)
    const id = new Uint8Array(10);
    id[0] = 0x2c; // Image Separator
    id[1] = 0; id[2] = 0; // Left
    id[3] = 0; id[4] = 0; // Top
    id[5] = width & 0xff;
    id[6] = (width >> 8) & 0xff;
    id[7] = height & 0xff;
    id[8] = (height >> 8) & 0xff;
    id[9] = 0x85; // Local Color Table Present, 64 colors (2^(5+1))
    parts.push(id);

    // Local Color Table (64 colors * 3 bytes = 192 bytes)
    parts.push(palette);

    // LZW compressed image data
    const lzwData = lzwEncode(indexedPixels, 6);
    parts.push(lzwData);
  }

  // Trailer: ';'
  parts.push(new Uint8Array([0x3b]));

  // Combine into final GIF Blob
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const merged = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) {
    merged.set(p, offset);
    offset += p.length;
  }

  return new Blob([merged.buffer as ArrayBuffer], { type: 'image/gif' });
}

function buildFramePalette(data: Uint8ClampedArray, pixelCount: number): { palette: Uint8Array; indexedPixels: Uint8Array } {
  const palette = new Uint8Array(64 * 3);
  const indexed = new Uint8Array(pixelCount);

  // Generate 64-color uniform palette (4x4x4 cube)
  let pIdx = 0;
  for (let r = 0; r < 4; r++) {
    for (let g = 0; g < 4; g++) {
      for (let b = 0; b < 4; b++) {
        palette[pIdx++] = Math.round((r / 3) * 255);
        palette[pIdx++] = Math.round((g / 3) * 255);
        palette[pIdx++] = Math.round((b / 3) * 255);
      }
    }
  }

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const rIdx = Math.min(3, Math.floor((r / 256) * 4));
    const gIdx = Math.min(3, Math.floor((g / 256) * 4));
    const bIdx = Math.min(3, Math.floor((b / 256) * 4));

    indexed[i] = (rIdx << 4) | (gIdx << 2) | bIdx;
  }

  return { palette, indexedPixels: indexed };
}

function lzwEncode(pixels: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  const dict = new Map<string, number>();
  function resetDict() {
    dict.clear();
    for (let i = 0; i < clearCode; i++) dict.set(String(i), i);
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  }
  resetDict();

  const outputCodes: number[] = [clearCode];
  let curPattern = '';

  for (let i = 0; i < pixels.length; i++) {
    const k = String(pixels[i]);
    const patternPlusK = curPattern === '' ? k : `${curPattern},${k}`;

    if (dict.has(patternPlusK)) {
      curPattern = patternPlusK;
    } else {
      outputCodes.push(dict.get(curPattern)!);
      if (nextCode < 4096) {
        dict.set(patternPlusK, nextCode++);
        if (nextCode === (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        outputCodes.push(clearCode);
        resetDict();
      }
      curPattern = k;
    }
  }

  if (curPattern !== '') {
    outputCodes.push(dict.get(curPattern)!);
  }
  outputCodes.push(eoiCode);

  // Pack variable-length codes into sub-blocks
  return packLzwCodes(outputCodes, minCodeSize);
}

function packLzwCodes(codes: number[], minCodeSize: number): Uint8Array {
  const subBlocks: number[][] = [];
  let currentBlock: number[] = [];

  let curByte = 0;
  let curBits = 0;
  let codeSize = minCodeSize + 1;
  let clearCode = 1 << minCodeSize;
  let nextCode = clearCode + 2;

  function pushByte(b: number) {
    currentBlock.push(b);
    if (currentBlock.length === 254) {
      subBlocks.push(currentBlock);
      currentBlock = [];
    }
  }

  for (const code of codes) {
    curByte |= (code << curBits);
    curBits += codeSize;

    while (curBits >= 8) {
      pushByte(curByte & 0xff);
      curByte >>= 8;
      curBits -= 8;
    }

    if (code === clearCode) {
      codeSize = minCodeSize + 1;
      nextCode = clearCode + 2;
    } else {
      nextCode++;
      if (nextCode === (1 << codeSize) && codeSize < 12) {
        codeSize++;
      }
    }
  }

  if (curBits > 0) {
    pushByte(curByte & 0xff);
  }
  if (currentBlock.length > 0) {
    subBlocks.push(currentBlock);
  }

  // Calculate total size: 1 byte for minCodeSize + for each block (1 byte length + data) + 1 byte (0x00 terminator)
  let totalBytes = 1;
  for (const b of subBlocks) totalBytes += 1 + b.length;
  totalBytes += 1;

  const result = new Uint8Array(totalBytes);
  result[0] = minCodeSize;
  let idx = 1;

  for (const b of subBlocks) {
    result[idx++] = b.length;
    for (const byteVal of b) result[idx++] = byteVal;
  }
  result[idx++] = 0x00; // Block Terminator

  return result;
}
