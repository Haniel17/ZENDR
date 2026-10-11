import React, { useRef, useState } from 'react';
import type { EditorTool, AnnotationItem, Point } from './types';

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
  onSelectId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [tempShape, setTempShape] = useState<{
    type: 'rectangle' | 'circle' | 'line' | 'arrow';
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

  // Text insertion dialog/inline state
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    value: string;
  } | null>(null);

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
      setActiveTextInput({ x: pt.x, y: pt.y, value: '' });
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
        const newW = Math.max(30, initialAnnBounds.width + dx);
        const newH = Math.max(20, initialAnnBounds.height + dy);
        onUpdateAnnotation(selectedId, { width: newW, height: newH });
      }
      return;
    }

    if (!isDrawing || !startPoint) return;

    if (currentTool === 'draw' || currentTool === 'highlight') {
      setCurrentPath((prev) => [...prev, pt]);
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

  const handleCommitText = () => {
    if (activeTextInput && activeTextInput.value.trim()) {
      onAddAnnotation({
        id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: 1,
        color: currentColor,
        type: 'text',
        x: activeTextInput.x,
        y: activeTextInput.y,
        text: activeTextInput.value.trim(),
        fontSize,
        isBold: true
      });
    }
    setActiveTextInput(null);
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
              <text
                key={ann.id}
                x={ann.x}
                y={ann.y + ann.fontSize}
                fill={ann.color}
                fontSize={ann.fontSize}
                fontWeight={ann.isBold ? 'bold' : 'normal'}
                className={`select-none font-sans ${currentTool === 'select' ? 'cursor-pointer' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentTool === 'select') setSelectedId(ann.id);
                }}
              >
                {ann.text}
              </text>
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

        {/* Active Shape In-Progress */}
        {tempShape && (
          <>
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

      {/* Inline Text Input Bubble */}
      {activeTextInput && (
        <div
          className="absolute z-30 p-2 rounded-xl bg-zinc-900 border border-amber-400 shadow-2xl flex items-center gap-2"
          style={{
            left: activeTextInput.x * zoomScale,
            top: activeTextInput.y * zoomScale
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Type text annotation..."
            value={activeTextInput.value}
            onChange={(e) =>
              setActiveTextInput({ ...activeTextInput, value: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitText();
              if (e.key === 'Escape') setActiveTextInput(null);
            }}
            className="px-2 py-1 rounded bg-black text-white text-xs font-medium border border-white/20 focus:outline-none min-w-[200px]"
            style={{ color: currentColor, fontSize: `${fontSize}px` }}
          />
          <button
            onClick={handleCommitText}
            className="px-2.5 py-1 rounded bg-amber-400 text-black text-xs font-semibold hover:bg-amber-300 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => setActiveTextInput(null)}
            className="px-1.5 py-1 text-white/50 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
