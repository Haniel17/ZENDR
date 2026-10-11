/**
 * File validation and sanitization utilities
 * Implements security measures: extension checks, MIME validation, size limits, path traversal protection.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'],
  word: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ],
  excel: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ],
  powerpoint: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint'
  ]
};

/**
 * Sanitizes a filename to prevent path traversal and unsafe character injection.
 */
export function sanitizeFilename(filename: string): string {
  // Strip directory paths
  const baseName = filename.replace(/^.*[\\/]/, '');
  // Replace unsafe characters
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Avoid empty or dangerous names
  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return `file_${Date.now()}`;
  }
  return cleaned;
}

/**
 * Validates a file for specific tool requirements.
 */
export function validateFile(
  file: File,
  allowedExtensions: string[],
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  if (file.size <= 0) {
    return { isValid: false, error: 'The file appears to be empty (0 bytes).' };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit (${maxMb} MB).`
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowedExtensions.map((e) => e.toLowerCase()).includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file format (.${extension}). Allowed formats: ${allowedExtensions.map((e) => `.${e}`).join(', ')}.`
    };
  }

  return {
    isValid: true,
    sanitizedName: sanitizeFilename(file.name)
  };
}

/**
 * Formats bytes to human-readable size.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Helper to trigger browser download of a blob or file.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizeFilename(filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
