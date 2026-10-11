export type EditorTool =
  | 'select'
  | 'hand'
  | 'text'
  | 'whiteout'
  | 'signature'
  | 'stamp'
  | 'highlight'
  | 'draw'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line';

export interface Point {
  x: number;
  y: number;
}

export interface PdfTextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  baselineY: number;
  width: number;
  height: number;
  fontSize: number;
  fontName?: string;
}

export interface BaseAnnotation {
  id: string;
  pageNumber: number;
  color: string;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  isBold?: boolean;
  width?: number;
  height?: number;
  whiteoutBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  originalText?: string;
}

export interface DrawAnnotation extends BaseAnnotation {
  type: 'draw';
  points: Point[];
  strokeWidth: number;
  isHighlight?: boolean;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow' | 'whiteout';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeWidth: number;
  fill?: string;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  dataUrl: string; // Base64 data URL
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  stampType: 'date' | 'checkmark' | 'cross' | 'approved' | 'confidential' | 'paid';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnnotationItem =
  | TextAnnotation
  | DrawAnnotation
  | ShapeAnnotation
  | SignatureAnnotation
  | StampAnnotation;

export interface EditorPageState {
  pageNumber: number; // original 1-based index
  customRotation: number; // 0, 90, 180, 270
  thumbnailUrl?: string;
  width: number;
  height: number;
  isDeleted?: boolean;
}

export interface EditorHistoryEntry {
  pages: EditorPageState[];
  annotations: Record<number, AnnotationItem[]>;
  description: string;
}
