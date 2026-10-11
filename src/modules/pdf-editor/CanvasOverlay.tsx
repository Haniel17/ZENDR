import React, { useRef, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import type { EditorTool, AnnotationItem, Point, PdfTextItem, TextAnnotation } from './types';

interface CanvasOverlayProps {
  pageWidth: number;
  pageHeight: number;
  zoomScale: number;
  currentTool: EditorTool;
  currentColor: string;
  strokeWidth: number;
  fontSize: number;
  annotations: AnnotationItem[];
  onAddAnnotation: (annotation: AnnotationItem) => void;
  onRemoveAnnotation: (id: string) => void;
  onUpdateAnnotation?: (id: string, updates: Partial<AnnotationItem>) => void;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  pageTextItems?: PdfTextItem[];
}

interface InlineEditorState {
  mode: 'native' | 'annotation' | 'new';
  annotationId?: string;
  originalItem?: PdfTextItem;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  isBold: boolean;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  pageWidth,
  pageHeight,
  zoomScale,
  currentTool,
  currentColor,
  strokeWidth,
  fontSize,
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
  selectedId: externalSelectedId,
  onSelectId,
  pageTextItems = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [tempShape, setTempShape] = useState<{
    type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'whiteout';
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Selection & drag/resize state (synced with parent workspace)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const selectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;
  const setSelectedId = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectId?.(id);
  };
  const [dragAction, setDragAction] = useState<'move' | 'resize' | null>(null);
  const [dragOrigin, setDragOrigin] = useState<Point | null>(null);
  const [initialAnnBounds, setInitialAnnBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // In-place text editor state for native PDF text, existing annotations, or new text
  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(null);

  // Helper to convert screen mouse event to unscaled PDF page coordinates
  const getPageCoords = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoomScale;
    const clickY = (e.clientY - rect.top) / zoomScale;
    return {
      x: Math.max(0, Math.min(pageWidth, clickX)),
      y: Math.max(0, Math.min(pageHeight, clickY))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pt = getPageCoords(e);

    if (currentTool === 'select') {
      // If clicked on empty space, deselect
      if ((e.target as HTMLElement).tagName === 'svg') {
        setSelectedId(null);
      }
      return;
    }

    if (currentTool === 'hand') return;

    if (currentTool === 'text') {
      setInlineEditor({
        mode: 'new',
        x: pt.x,
        y: pt.y,
        width: 140,
        height: fontSize * 1.4,
        text: '',
        fontSize,
        color: currentColor === '#ffffff' ? '#000000' : currentColor,
        isBold: true
      });
      return;
    }

    setIsDrawing(true);
    setStartPoint(pt);

    if (currentTool === 'draw' || currentTool === 'highlight') {
      setCurrentPath([pt]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getPageCoords(e);

    // Handle interactive Move or Resize of selected annotation
    if (dragAction && dragOrigin && initialAnnBounds && selectedId && onUpdateAnnotation) {
      const dx = pt.x - dragOrigin.x;
      const dy = pt.y - dragOrigin.y;

      if (dragAction === 'move') {
        const newX = Math.max(0, Math.min(pageWidth - 20, initialAnnBounds.x + dx));
        const newY = Math.max(0, Math.min(pageHeight - 20, initialAnnBounds.y + dy));
        onUpdateAnnotation(selectedId, { x: newX, y: newY });
      } else if (dragAction === 'resize') {
        const newW = Math.max(20, initialAnnBounds.width + dx);
        const newH = Math.max(15, initialAnnBounds.height + dy);
        onUpdateAnnotation(selectedId, { width: newW, height: newH });
      }
      return;
    }

    if (!isDrawing || !startPoint) return;

    if (currentTool === 'draw' || currentTool === 'highlight') {
      setCurrentPath((prev) => [...prev, pt]);
    } else if (currentTool === 'whiteout') {
      setTempShape({
        type: 'whiteout',
        x: Math.min(startPoint.x, pt.x),
        y: Math.min(startPoint.y, pt.y),
        w: Math.abs(pt.x - startPoint.x),
        h: Math.abs(pt.y - startPoint.y)
      });
    } else if (
      currentTool === 'rectangle' ||
      currentTool === 'circle' ||
      currentTool === 'line' ||
      currentTool === 'arrow'
    ) {
      setTempShape({
        type: currentTool,
        x: Math.min(startPoint.x, pt.x),
        y: Math.min(startPoint.y, pt.y),
        w: pt.x - startPoint.x,
        h: pt.y - startPoint.y
      });
    }
  };

  const handleMouseUp = () => {
    if (dragAction) {
      setDragAction(null);
      setDragOrigin(null);
      setInitialAnnBounds(null);
      return;
    }

    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    if ((currentTool === 'draw' || currentTool === 'highlight') && currentPath.length > 1) {
      onAddAnnotation({
        id: `draw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        color: currentColor,
        type: 'draw',
        points: currentPath,
        strokeWidth,
        isHighlight: currentTool === 'highlight'
      });
    } else if (tempShape && tempShape.type === 'whiteout' && (tempShape.w > 2 || tempShape.h > 2)) {
      onAddAnnotation({
        id: `whiteout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        color: '#ffffff',
        fill: '#ffffff',
        type: 'shape',
        shapeType: 'whiteout',
        x: tempShape.x,
        y: tempShape.y,
        width: Math.max(10, tempShape.w),
        height: Math.max(10, tempShape.h),
        strokeWidth: 1
      });
    } else if (tempShape && (Math.abs(tempShape.w) > 3 || Math.abs(tempShape.h) > 3)) {
      onAddAnnotation({
        id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        color: currentColor,
        type: 'shape',
        shapeType: tempShape.type,
        x: tempShape.type === 'line' || tempShape.type === 'arrow' ? startPoint.x : tempShape.x,
        y: tempShape.type === 'line' || tempShape.type === 'arrow' ? startPoint.y : tempShape.y,
        width: tempShape.w,
        height: tempShape.h,
        strokeWidth
      });
    }

    setStartPoint(null);
    setCurrentPath([]);
    setTempShape(null);
  };

  const startEditingNativeText = (item: PdfTextItem) => {
    setInlineEditor({
      mode: 'native',
      originalItem: item,
      x: item.x,
      y: item.y,
      width: Math.max(100, item.width),
      height: Math.max(20, item.height),
      text: item.str,
      fontSize: item.fontSize,
      color: currentColor === '#ffffff' ? '#000000' : currentColor,
      isBold: true
    });
  };

  const startEditingExistingAnnotation = (ann: TextAnnotation) => {
    setInlineEditor({
      mode: 'annotation',
      annotationId: ann.id,
      x: ann.x,
      y: ann.y,
      width: ann.width || Math.max(100, ann.text.length * ann.fontSize * 0.6),
      height: ann.height || ann.fontSize * 1.4,
      text: ann.text,
      fontSize: ann.fontSize,
      color: ann.color,
      isBold: Boolean(ann.isBold)
    });
  };

  const handleSaveInlineEditor = () => {
    if (!inlineEditor) return;
    const trimmed = inlineEditor.text.trim();
    if (!trimmed) {
      if (inlineEditor.mode === 'annotation' && inlineEditor.annotationId) {
        onRemoveAnnotation(inlineEditor.annotationId);
      }
      setInlineEditor(null);
      return;
    }

    if (inlineEditor.mode === 'native' && inlineEditor.originalItem) {
      const orig = inlineEditor.originalItem;
      const newAnn: TextAnnotation = {
        id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        type: 'text',
        x: inlineEditor.x,
        y: inlineEditor.y,
        text: trimmed,
        fontSize: inlineEditor.fontSize,
        color: inlineEditor.color,
        isBold: inlineEditor.isBold,
        width: inlineEditor.width,
        height: inlineEditor.height,
        whiteoutBounds: {
          x: Math.max(0, orig.x - 2),
          y: Math.max(0, orig.y - 2),
          width: orig.width + 4,
          height: orig.height + 4
        },
        originalText: orig.str
      };
      onAddAnnotation(newAnn);
      setSelectedId(newAnn.id);
    } else if (inlineEditor.mode === 'annotation' && inlineEditor.annotationId && onUpdateAnnotation) {
      onUpdateAnnotation(inlineEditor.annotationId, {
        text: trimmed,
        fontSize: inlineEditor.fontSize,
        color: inlineEditor.color,
        isBold: inlineEditor.isBold
      });
    } else if (inlineEditor.mode === 'new') {
      const newAnn: TextAnnotation = {
        id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        type: 'text',
        x: inlineEditor.x,
        y: inlineEditor.y,
        text: trimmed,
        fontSize: inlineEditor.fontSize,
        color: inlineEditor.color,
        isBold: inlineEditor.isBold
      };
      onAddAnnotation(newAnn);
      setSelectedId(newAnn.id);
    }

    setInlineEditor(null);
  };

  // Helper to initiate drag moving
  const startMove = (e: React.MouseEvent, ann: AnnotationItem, bounds: { x: number; y: number; width: number; height: number }) => {
    e.stopPropagation();
    if (currentTool !== 'select') return;
    setSelectedId(ann.id);
    const pt = getPageCoords(e);
    setDragAction('move');
    setDragOrigin(pt);
    setInitialAnnBounds(bounds);
  };

  // Helper to initiate resize
  const startResize = (e: React.MouseEvent, bounds: { x: number; y: number; width: number; height: number }) => {
    e.stopPropagation();
    if (currentTool !== 'select') return;
    const pt = getPageCoords(e);
    setDragAction('resize');
    setDragOrigin(pt);
    setInitialAnnBounds(bounds);
  };

  const selectedAnn = annotations.find((a) => a.id === selectedId);

  // Calculate selected annotation bounds
  const getSelectedBounds = () => {
    if (!selectedAnn) return null;
    if (selectedAnn.type === 'signature' || selectedAnn.type === 'stamp') {
      return {
        x: selectedAnn.x,
        y: selectedAnn.y,
        width: selectedAnn.width,
        height: selectedAnn.height
      };
    }
    if (selectedAnn.type === 'shape') {
      return {
        x: selectedAnn.x,
        y: selectedAnn.y,
        width: Math.abs(selectedAnn.width),
        height: Math.abs(selectedAnn.height)
      };
    }
    if (selectedAnn.type === 'text') {
      const approxWidth = Math.max(70, selectedAnn.text.length * (selectedAnn.fontSize * 0.65));
      return {
        x: selectedAnn.x,
        y: selectedAnn.y,
        width: approxWidth,
        height: selectedAnn.fontSize * 1.4
      };
    }
    return null;
  };

  const selectedBounds = getSelectedBounds();
  const scaledWidth = pageWidth * zoomScale;
  const scaledHeight = pageHeight * zoomScale;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-auto"
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      <svg
        ref={svgRef}
        className={`w-full h-full ${
          currentTool === 'select'
            ? 'cursor-default'
            : currentTool === 'hand'
            ? 'cursor-grab'
            : 'cursor-crosshair'
        }`}
        viewBox={`0 0 ${pageWidth} ${pageHeight}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={currentColor} />
          </marker>
        </defs>

        {/* Existing Committed Annotations */}
        {annotations.map((ann) => {
          // 1. Text Annotation
          if (ann.type === 'text') {
            return (
              <g key={ann.id}>
                {/* If this annotation replaced existing PDF text, draw solid white mask rectangle */}
                {ann.whiteoutBounds && (
                  <rect
                    x={ann.whiteoutBounds.x}
                    y={ann.whiteoutBounds.y}
                    width={ann.whiteoutBounds.width}
                    height={ann.whiteoutBounds.height}
                    fill="#ffffff"
                  />
                )}
                <text
                  x={ann.x}
                  y={ann.y + ann.fontSize}
                  fill={ann.color}
                  fontSize={ann.fontSize}
                  fontWeight={ann.isBold ? 'bold' : 'normal'}
                  className={`select-none font-sans ${currentTool === 'select' || currentTool === 'text' ? 'cursor-pointer' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditingExistingAnnotation(ann);
                  }}
                >
                  {ann.text}
                </text>
              </g>
            );
          }

          // 2. Freehand Draw & Highlighter
          if (ann.type === 'draw') {
            const pointsStr = ann.points.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <polyline
                key={ann.id}
                points={pointsStr}
                fill="none"
                stroke={ann.color}
                strokeWidth={ann.isHighlight ? ann.strokeWidth * 3 : ann.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={ann.isHighlight ? 0.35 : 1}
                className={currentTool === 'select' ? 'cursor-pointer' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTool === 'select') setSelectedId(ann.id);
                }}
              />
            );
          }

          // 3. Shape Annotations
          if (ann.type === 'shape') {
            if (ann.shapeType === 'whiteout') {
              return (
                <rect
                  key={ann.id}
                  x={ann.x}
                  y={ann.y}
                  width={Math.abs(ann.width)}
                  height={Math.abs(ann.height)}
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  strokeDasharray="3 3"
                  className={currentTool === 'select' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                />
              );
            }
            if (ann.shapeType === 'rectangle') {
              return (
                <rect
                  key={ann.id}
                  x={ann.x}
                  y={ann.y}
                  width={Math.abs(ann.width)}
                  height={Math.abs(ann.height)}
                  fill="none"
                  stroke={ann.color}
                  strokeWidth={ann.strokeWidth}
                  className={currentTool === 'select' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                />
              );
            }
            if (ann.shapeType === 'circle') {
              const r = Math.abs(ann.width) / 2;
              return (
                <circle
                  key={ann.id}
                  cx={ann.x + r}
                  cy={ann.y + r}
                  r={r}
                  fill="none"
                  stroke={ann.color}
                  strokeWidth={ann.strokeWidth}
                  className={currentTool === 'select' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                />
              );
            }
            if (ann.shapeType === 'line') {
              return (
                <line
                  key={ann.id}
                  x1={ann.x}
                  y1={ann.y}
                  x2={ann.x + ann.width}
                  y2={ann.y + ann.height}
                  stroke={ann.color}
                  strokeWidth={ann.strokeWidth}
                  strokeLinecap="round"
                  className={currentTool === 'select' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                />
              );
            }
            if (ann.shapeType === 'arrow') {
              return (
                <line
                  key={ann.id}
                  x1={ann.x}
                  y1={ann.y}
                  x2={ann.x + ann.width}
                  y2={ann.y + ann.height}
                  stroke={ann.color}
                  strokeWidth={ann.strokeWidth}
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className={currentTool === 'select' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                />
              );
            }
          }

          // 4. Digital Signature Annotation
          if (ann.type === 'signature') {
            return (
              <image
                key={ann.id}
                href={ann.dataUrl}
                x={ann.x}
                y={ann.y}
                width={ann.width}
                height={ann.height}
                preserveAspectRatio="xMidYMid meet"
                className={currentTool === 'select' ? 'cursor-pointer select-none' : 'select-none'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTool === 'select') setSelectedId(ann.id);
                }}
              />
            );
          }

          // 5. Document Stamp Annotation
          if (ann.type === 'stamp') {
            const { stampType, text, color, x, y, width, height } = ann;

            if (stampType === 'date') {
              return (
                <g
                  key={ann.id}
                  transform={`translate(${x}, ${y})`}
                  className={currentTool === 'select' ? 'cursor-pointer select-none' : 'select-none'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                >
                  <rect
                    width={width}
                    height={height}
                    rx={6}
                    fill="#18181b"
                    stroke={color || '#f59e0b'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={width / 2}
                    y={height / 2 + 4}
                    fill={color || '#f59e0b'}
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    📅 {text}
                  </text>
                </g>
              );
            }

            if (stampType === 'checkmark' || stampType === 'cross') {
              const isCheck = stampType === 'checkmark';
              return (
                <g
                  key={ann.id}
                  transform={`translate(${x}, ${y})`}
                  className={currentTool === 'select' ? 'cursor-pointer select-none' : 'select-none'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentTool === 'select') setSelectedId(ann.id);
                  }}
                >
                  <circle
                    cx={width / 2}
                    cy={height / 2}
                    r={width / 2 - 2}
                    fill={isCheck ? '#10b98125' : '#ef444425'}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <text
                    x={width / 2}
                    y={height / 2 + 6}
                    fill={color}
                    fontSize={20}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isCheck ? '✓' : '✗'}
                  </text>
                </g>
              );
            }

            // Approved / Confidential / Paid rubber stamps
            return (
              <g
                key={ann.id}
                transform={`translate(${x}, ${y})`}
                className={currentTool === 'select' ? 'cursor-pointer select-none' : 'select-none'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTool === 'select') setSelectedId(ann.id);
                }}
              >
                <rect
                  width={width}
                  height={height}
                  rx={4}
                  fill={`${color}15`}
                  stroke={color}
                  strokeWidth={2}
                />
                <rect
                  x={3}
                  y={3}
                  width={width - 6}
                  height={height - 6}
                  rx={2}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={width / 2}
                  y={height / 2 + 5}
                  fill={color}
                  fontSize={13}
                  fontFamily="sans-serif"
                  fontWeight="900"
                  letterSpacing="1.5"
                  textAnchor="middle"
                >
                  {text}
                </text>
              </g>
            );
          }

          return null;
        })}

        {/* Selection Bounding Box & Drag / Resize Handles */}
        {currentTool === 'select' && selectedAnn && selectedBounds && (
          <g className="select-none">
            {/* Outline Box */}
            <rect
              x={selectedBounds.x - 4}
              y={selectedBounds.y - 4}
              width={selectedBounds.width + 8}
              height={selectedBounds.height + 8}
              fill="rgba(245, 158, 11, 0.05)"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              className="cursor-move"
              onMouseDown={(e) => startMove(e, selectedAnn, selectedBounds)}
            />

            {/* Delete Pill Button (Top Right) */}
            <g
              transform={`translate(${selectedBounds.x + selectedBounds.width + 2}, ${selectedBounds.y - 14})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAnnotation(selectedAnn.id);
                setSelectedId(null);
              }}
            >
              <circle cx={6} cy={6} r={8} fill="#ef4444" />
              <text x={6} y={9.5} fill="#ffffff" fontSize={11} fontWeight="bold" textAnchor="middle">
                ✕
              </text>
            </g>

            {/* Resize Corner Handle (Bottom Right) */}
            <g
              transform={`translate(${selectedBounds.x + selectedBounds.width}, ${selectedBounds.y + selectedBounds.height})`}
              className="cursor-nwse-resize"
              onMouseDown={(e) => startResize(e, selectedBounds)}
            >
              <rect x={-3} y={-3} width={8} height={8} fill="#f59e0b" rx={2} />
            </g>
          </g>
        )}

        {/* Active Freehand Draw Line */}
        {currentPath.length > 1 && (
          <polyline
            points={currentPath.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={currentColor}
            strokeWidth={currentTool === 'highlight' ? strokeWidth * 3 : strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={currentTool === 'highlight' ? 0.4 : 1}
          />
        )}

        {/* Interactive Native PDF Text Layer */}
        {(currentTool === 'text' || currentTool === 'select') && (
          <g className="native-text-layer">
            {pageTextItems.map((item) => {
              // Check if this item is already replaced by a text annotation
              const isReplaced = annotations.some(
                (a) =>
                  a.type === 'text' &&
                  a.whiteoutBounds &&
                  Math.abs(a.whiteoutBounds.x - (item.x - 2)) < 8 &&
                  Math.abs(a.whiteoutBounds.y - (item.y - 2)) < 8
              );
              if (isReplaced) return null;

              return (
                <g
                  key={item.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingNativeText(item);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditingNativeText(item);
                  }}
                >
                  <rect
                    x={item.x - 2}
                    y={item.y - 2}
                    width={item.width + 4}
                    height={item.height + 4}
                    fill="transparent"
                    rx={2}
                    className="transition-all hover:fill-amber-400/20 hover:stroke-amber-400/70 hover:stroke-[1px]"
                  >
                    <title>Click or double-click to edit this text</title>
                  </rect>
                </g>
              );
            })}
          </g>
        )}

        {/* Active Shape In-Progress */}
        {tempShape && (
          <>
            {tempShape.type === 'whiteout' && (
              <rect
                x={tempShape.x}
                y={tempShape.y}
                width={tempShape.w}
                height={tempShape.h}
                fill="#ffffff"
                fillOpacity={0.85}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            {tempShape.type === 'rectangle' && (
              <rect
                x={tempShape.x}
                y={tempShape.y}
                width={Math.abs(tempShape.w)}
                height={Math.abs(tempShape.h)}
                fill="none"
                stroke={currentColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            )}
            {tempShape.type === 'circle' && (
              <circle
                cx={tempShape.x + Math.abs(tempShape.w) / 2}
                cy={tempShape.y + Math.abs(tempShape.h) / 2}
                r={Math.abs(tempShape.w) / 2}
                fill="none"
                stroke={currentColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            )}
            {tempShape.type === 'line' && startPoint && (
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={startPoint.x + tempShape.w}
                y2={startPoint.y + tempShape.h}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            )}
            {tempShape.type === 'arrow' && startPoint && (
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={startPoint.x + tempShape.w}
                y2={startPoint.y + tempShape.h}
                stroke={currentColor}
                strokeWidth={strokeWidth}
                markerEnd="url(#arrowhead)"
              />
            )}
          </>
        )}
      </svg>

      {/* Rich In-Place Text Editor */}
      {inlineEditor && (
        <div
          className="absolute z-50 rounded-2xl bg-[#09090f] border border-amber-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col p-2.5 gap-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: Math.max(10, Math.min(scaledWidth - 320, inlineEditor.x * zoomScale - 4)),
            top: Math.max(10, inlineEditor.y * zoomScale - 48),
            minWidth: '280px',
            maxWidth: '650px'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Top mini controls bar */}
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-semibold text-white">
                {inlineEditor.mode === 'native'
                  ? 'Edit PDF Text'
                  : inlineEditor.mode === 'annotation'
                  ? 'Edit Text'
                  : 'New Text'}
              </span>
              {inlineEditor.mode === 'native' && (
                <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.2 rounded font-mono">
                  Mask & Replace
                </span>
              )}
            </div>

            {/* Formatting controls */}
            <div className="flex items-center gap-1">
              {/* Font size adjustments */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 font-mono text-[10px]">
                <button
                  onClick={() =>
                    setInlineEditor((prev) =>
                      prev ? { ...prev, fontSize: Math.max(8, prev.fontSize - 1) } : null
                    )
                  }
                  className="w-4 h-4 flex items-center justify-center text-white/70 hover:text-white rounded hover:bg-white/10"
                  title="Decrease font size"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="px-1 text-white font-semibold">{inlineEditor.fontSize}px</span>
                <button
                  onClick={() =>
                    setInlineEditor((prev) =>
                      prev ? { ...prev, fontSize: Math.min(72, prev.fontSize + 1) } : null
                    )
                  }
                  className="w-4 h-4 flex items-center justify-center text-white/70 hover:text-white rounded hover:bg-white/10"
                  title="Increase font size"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Bold toggle */}
              <button
                onClick={() =>
                  setInlineEditor((prev) =>
                    prev ? { ...prev, isBold: !prev.isBold } : null
                  )
                }
                className={`w-6 h-5 rounded flex items-center justify-center font-bold text-xs transition-colors ${
                  inlineEditor.isBold ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Toggle Bold"
              >
                B
              </button>

              {/* Color Swatch / Quick Toggle */}
              <div className="flex items-center gap-1 pl-1">
                {['#000000', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setInlineEditor((prev) => (prev ? { ...prev, color: c } : null))}
                    className={`w-3.5 h-3.5 rounded-full border border-white/20 transition-transform ${
                      inlineEditor.color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Textarea with clean masking background */}
          <div className="relative">
            <textarea
              autoFocus
              rows={Math.max(1, inlineEditor.text.split('\n').length)}
              placeholder="Enter replacement text..."
              value={inlineEditor.text}
              onChange={(e) =>
                setInlineEditor((prev) => (prev ? { ...prev, text: e.target.value } : null))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveInlineEditor();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setInlineEditor(null);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-white text-black font-sans leading-relaxed border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner resize-none text-xs"
              style={{
                color: inlineEditor.color,
                fontWeight: inlineEditor.isBold ? 'bold' : 'normal',
                fontSize: `${Math.max(12, inlineEditor.fontSize * zoomScale)}px`,
                minHeight: `${Math.max(34, inlineEditor.height * zoomScale)}px`
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-white/40 font-mono">
              Press <kbd className="px-1 rounded bg-white/10 text-white/70">Enter</kbd> to apply • <kbd className="px-1 rounded bg-white/10 text-white/70">Esc</kbd> to cancel
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInlineEditor(null)}
                className="px-2.5 py-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInlineEditor}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
