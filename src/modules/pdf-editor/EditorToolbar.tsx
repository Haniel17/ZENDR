import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  Type,
  Highlighter,
  PenTool,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Stamp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Download,
  Trash2,
  RotateCw,
  Layers,
  BookOpen,
  Keyboard,
  Shapes,
  Check
} from 'lucide-react';
import type { EditorTool } from './types';
import { ThemedSelect } from '../../components/ThemedSelect';

interface EditorToolbarProps {
  currentTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (w: number) => void;
  fontSize: number;
  onSelectFontSize: (size: number) => void;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearPageAnnotations: () => void;
  hasSelectedAnnotation?: boolean;
  onDeleteSelectedAnnotation?: () => void;
  onExportPdf: () => void;
  isExporting: boolean;
  onOpenSignatureModal: () => void;
  onOpenStampModal: () => void;
  onOpenShortcutsModal?: () => void;
  onRotateCurrentPage?: () => void;
  onFlattenPdf?: () => void;
  isReaderMode?: boolean;
  onToggleReaderMode?: () => void;
}

const COLOR_PALETTE = [
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Obsidian', hex: '#18181b' }
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  currentTool,
  onSelectTool,
  currentColor,
  onSelectColor,
  strokeWidth,
  onSelectStrokeWidth,
  fontSize,
  onSelectFontSize,
  zoomScale,
  onZoomChange,
  onFitWidth,
  onFitPage,
  currentPage,
  totalPages,
  onPageChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearPageAnnotations,
  hasSelectedAnnotation = false,
  onDeleteSelectedAnnotation,
  onExportPdf,
  isExporting,
  onOpenSignatureModal,
  onOpenStampModal,
  onOpenShortcutsModal,
  onRotateCurrentPage,
  onFlattenPdf,
  isReaderMode,
  onToggleReaderMode
}) => {
  const [isShapesOpen, setIsShapesOpen] = useState(false);

  const isShapeToolActive = ['rectangle', 'circle', 'arrow', 'line'].includes(currentTool);

  return (
    <header className="border-b border-white/[0.08] bg-[#07070a]/95 backdrop-blur-2xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs text-white/80 select-none flex-shrink-0">
      {/* LEFT: Core Creation & Manipulation Tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Navigation & Selection Group */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => onSelectTool('select')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
              currentTool === 'select'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Select & Move Tool (Shortcut: V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Select</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded ${currentTool === 'select' ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-white/40'}`}>
              V
            </kbd>
          </button>

          <button
            onClick={() => onSelectTool('hand')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
              currentTool === 'hand'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Hand & Pan View Tool (Shortcut: H or Hold Spacebar)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Hand</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded ${currentTool === 'hand' ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-white/40'}`}>
              H
            </kbd>
          </button>
        </div>

        {/* Flagship Sign Button */}
        <button
          onClick={onOpenSignatureModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 hover:text-amber-200 border border-amber-400/30 transition-transform transition-colors duration-75 active:scale-95 font-semibold cursor-pointer shadow-sm select-none"
          title="Digital Signature Studio (Shortcut: S)"
        >
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">Sign</span>
          <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300">
            S
          </kbd>
        </button>

        {/* Annotations & Drawing Group */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {/* Text Tool */}
          <button
            onClick={() => onSelectTool('text')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
              currentTool === 'text'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Insert Text Annotation (Shortcut: T)"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Text</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded ${currentTool === 'text' ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-white/40'}`}>
              T
            </kbd>
          </button>

          {/* Freehand Draw */}
          <button
            onClick={() => onSelectTool('draw')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
              currentTool === 'draw'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Freehand Vector Pen (Shortcut: P or D)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Draw</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded ${currentTool === 'draw' ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-white/40'}`}>
              P
            </kbd>
          </button>

          {/* Highlighter */}
          <button
            onClick={() => onSelectTool('highlight')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
              currentTool === 'highlight'
                ? 'bg-amber-400 text-black shadow-md font-bold'
                : 'hover:bg-white/10 text-white/70 hover:text-white'
            }`}
            title="Text Highlighter (Shortcut: E)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Highlight</span>
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded ${currentTool === 'highlight' ? 'bg-black/20 text-black font-semibold' : 'bg-white/10 text-white/40'}`}>
              E
            </kbd>
          </button>

          {/* Shapes Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsShapesOpen(!isShapesOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none ${
                isShapeToolActive
                  ? 'bg-amber-400 text-black shadow-md font-bold'
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Geometric Shapes (Box: R, Circle: O, Arrow: A, Line: L)"
            >
              {currentTool === 'rectangle' ? (
                <Square className="w-3.5 h-3.5" />
              ) : currentTool === 'circle' ? (
                <Circle className="w-3.5 h-3.5" />
              ) : currentTool === 'arrow' ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : currentTool === 'line' ? (
                <Minus className="w-3.5 h-3.5" />
              ) : (
                <Shapes className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline text-[11px]">Shapes</span>
            </button>

            {/* Shapes Flyout Popover */}
            {isShapesOpen && (
              <div
                className="absolute top-full left-0 mt-2 z-40 bg-[#0d0d14] border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setIsShapesOpen(false)}
              >
                <button
                  onClick={() => {
                    onSelectTool('rectangle');
                    setIsShapesOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                    currentTool === 'rectangle'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Square className="w-3.5 h-3.5" />
                    <span>Rectangle</span>
                  </span>
                  <kbd className="font-mono text-[10px] text-white/40">R</kbd>
                </button>

                <button
                  onClick={() => {
                    onSelectTool('circle');
                    setIsShapesOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                    currentTool === 'circle'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Circle className="w-3.5 h-3.5" />
                    <span>Circle</span>
                  </span>
                  <kbd className="font-mono text-[10px] text-white/40">O</kbd>
                </button>

                <button
                  onClick={() => {
                    onSelectTool('arrow');
                    setIsShapesOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                    currentTool === 'arrow'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Arrow</span>
                  </span>
                  <kbd className="font-mono text-[10px] text-white/40">A</kbd>
                </button>

                <button
                  onClick={() => {
                    onSelectTool('line');
                    setIsShapesOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                    currentTool === 'line'
                      ? 'bg-amber-400 text-black font-semibold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Minus className="w-3.5 h-3.5" />
                    <span>Line</span>
                  </span>
                  <kbd className="font-mono text-[10px] text-white/40">L</kbd>
                </button>
              </div>
            )}
          </div>

          {/* Stamp Badges */}
          <button
            onClick={onOpenStampModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-transform transition-colors duration-75 active:scale-95 font-medium cursor-pointer select-none"
            title="Document Stamps & Status Badges (Shortcut: M)"
          >
            <Stamp className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline text-[11px]">Stamp</span>
            <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/40">
              M
            </kbd>
          </button>
        </div>

        {/* Color Palette & Stroke Properties */}
        <div className="flex items-center gap-2">
          {/* Swatches */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.06]">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => onSelectColor(c.hex)}
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full transition-transform duration-75 active:scale-75 cursor-pointer relative flex items-center justify-center ${
                  currentColor === c.hex
                    ? 'ring-2 ring-amber-400 scale-110 shadow-sm'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={`${c.name} Color`}
              >
                {currentColor === c.hex && (
                  <Check className={`w-2.5 h-2.5 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Dynamic Size / Stroke Select */}
          {currentTool === 'text' ? (
            <ThemedSelect
              value={fontSize}
              onChange={(val) => onSelectFontSize(Number(val))}
              labelPrefix="Size:"
              options={[
                { value: 12, label: '12pt' },
                { value: 16, label: '16pt' },
                { value: 20, label: '20pt' },
                { value: 28, label: '28pt' },
                { value: 36, label: '36pt' }
              ]}
            />
          ) : (
            <ThemedSelect
              value={strokeWidth}
              onChange={(val) => onSelectStrokeWidth(Number(val))}
              labelPrefix="Stroke:"
              options={[
                { value: 1, label: '1px' },
                { value: 2, label: '2px' },
                { value: 4, label: '4px' },
                { value: 8, label: '8px' }
              ]}
            />
          )}

          {/* Undo / Redo / Delete */}
          <div className="flex items-center gap-0.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer disabled:cursor-not-allowed select-none"
              title="Undo Last Action (Shortcut: ⌘Z or Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer disabled:cursor-not-allowed select-none"
              title="Redo Undone Action (Shortcut: ⌘⇧Z or Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            {hasSelectedAnnotation && onDeleteSelectedAnnotation ? (
              <button
                onClick={onDeleteSelectedAnnotation}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-transform transition-colors duration-75 active:scale-95 cursor-pointer ml-1 select-none font-medium text-[11px]"
                title="Delete Selected Element (Shortcut: Delete or Backspace)"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Delete</span>
                <kbd className="font-mono text-[9px] px-1 rounded bg-rose-500/30 text-rose-200">⌫</kbd>
              </button>
            ) : (
              <button
                onClick={onClearPageAnnotations}
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-white/10 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer ml-1 select-none"
                title="Clear All Annotations On Current Page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Document Viewport Navigation, Helpers & Save */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Page Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer disabled:cursor-not-allowed select-none"
            title="Previous Page (Shortcut: [ or Left Arrow)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1 text-white/80 font-medium">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer disabled:cursor-not-allowed select-none"
            title="Next Page (Shortcut: ] or Right Arrow)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoomScale - 0.15))}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer select-none"
            title="Zoom Out (Shortcut: -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1 text-white/70 min-w-[38px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoomScale + 0.15))}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer select-none"
            title="Zoom In (Shortcut: + or =)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onFitWidth}
            className="px-2 py-1 rounded-lg hover:bg-white/10 text-[10px] font-mono text-white/60 hover:text-white transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            title="Fit to Page Width (Shortcut: 0)"
          >
            Fit W
          </button>
          <button
            onClick={onFitPage}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-transform transition-colors duration-75 active:scale-90 cursor-pointer select-none"
            title="Fit Full Page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rotation & Document Actions */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {onRotateCurrentPage && (
            <button
              onClick={onRotateCurrentPage}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-transform transition-colors duration-75 active:scale-90 cursor-pointer select-none"
              title="Rotate Page +90° (Shortcut: Shift+R)"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {onToggleReaderMode && (
            <button
              onClick={onToggleReaderMode}
              className={`p-1.5 rounded-lg transition-transform transition-colors duration-75 active:scale-90 cursor-pointer select-none ${
                isReaderMode ? 'bg-amber-400 text-black shadow-sm' : 'hover:bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Toggle Distraction-Free Reader Mode"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {onFlattenPdf && (
            <button
              onClick={onFlattenPdf}
              disabled={isExporting}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition-transform transition-colors duration-75 active:scale-95 cursor-pointer disabled:opacity-40 select-none"
              title="Permanently bake all signatures & annotations into PDF"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Flatten</span>
            </button>
          )}
        </div>

        {/* Keyboard Shortcuts Trigger Button */}
        {onOpenShortcutsModal && (
          <button
            onClick={onOpenShortcutsModal}
            className="btn-secondary text-[11px] px-2.5 py-1.5 rounded-lg"
            title="View All Synced Keyboard Controls (Shortcut: ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono">Shortcuts</span>
            <kbd className="font-mono text-[9px] px-1 rounded bg-white/10 text-white/60">?</kbd>
          </button>
        )}

        {/* Primary Save PDF Button */}
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="btn-primary text-xs px-3.5 py-1.5 rounded-lg"
          title="Save and Download PDF (Shortcut: ⌘S or Ctrl+S)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Saving...' : 'Save PDF'}</span>
          <kbd className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/15 text-black font-bold">
            ⌘S
          </kbd>
        </button>
      </div>
    </header>
  );
};
