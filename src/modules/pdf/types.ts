/**
 * Types for PDF and Document tools
 */

export type ToolSection = 'pdf' | 'image' | 'data';
export type ToolCategory = 'pdf' | 'image' | 'data';
export type PdfSubCategory = 'editor' | 'organize' | 'convert-from-pdf' | 'convert-to-pdf';

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  section: ToolSection; // 'pdf' | 'image'
  category: ToolCategory;
  subCategory?: PdfSubCategory;
  iconName: string;
  badge?: string;
  route: string;
  supportedInputExtensions: string[];
  outputExtension: string;
  supportsMultipleFiles?: boolean;
  accuracyDisclaimer?: string;
  isClientSideOnly?: boolean;
}

export interface PdfPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  thumbnailUrl?: string;
}

export interface PdfDocumentMeta {
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
  pages: PdfPageInfo[];
}

export interface ConversionProgress {
  status: 'idle' | 'validating' | 'processing' | 'done' | 'error';
  progressPercentage: number;
  currentStepMessage?: string;
  errorMessage?: string;
}

export interface ConvertedOutput {
  blob: Blob;
  filename: string;
  fileSizeBytes: number;
  previewUrl?: string;
  mimeType: string;
  meta?: Record<string, any>;
}
