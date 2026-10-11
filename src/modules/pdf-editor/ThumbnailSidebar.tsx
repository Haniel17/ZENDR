import React from 'react';
import { RotateCw, ArrowUp, ArrowDown, Trash2, Download, Plus, FileText } from 'lucide-react';
import type { EditorPageState } from './types';

interface ThumbnailSidebarProps {
  pages: EditorPageState[];
  currentPageNumber: number;
  onSelectPage: (pageNumber: number) => void;
  onRotatePage: (pageNumber: number) => void;
  onMovePage: (index: number, direction: 'up' | 'down') => void;
  onReorderPage?: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (pageNumber: number) => void;
  onExtractPage: (pageNumber: number) => void;
  onMergePdf: (file: File) => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageNumber,
  onSelectPage,
  onRotatePage,
  onMovePage,
  onReorderPage,
  onDeletePage,
  onExtractPage,
  onMergePdf
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const selectedThumbnailRef = React.useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const activePages = pages.filter((p) => !p.isDeleted);

  React.useEffect(() => {
    selectedThumbnailRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    });
  }, [currentPageNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMergePdf(file);
      e.target.value = '';
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/[0.08] bg-[#07070a]/90 backdrop-blur-xl flex flex-col h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white/90">Pages ({activePages.length})</span>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 text-[11px] font-medium transition-colors cursor-pointer"
          title="Append pages from another PDF file"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add PDF</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Pages Scroll Area - Only the left tab scrolls */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {pages.map((page, index) => {
          if (page.isDeleted) return null;
          const isSelected = page.pageNumber === currentPageNumber;

          const isDraggingThis = draggedIndex === index;
          const isDragTarget = dragOverIndex === index && !isDraggingThis;

          return (
            <div
              key={page.pageNumber}
              ref={isSelected ? selectedThumbnailRef : undefined}
              onClick={() => onSelectPage(page.pageNumber)}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                  if (onReorderPage) {
                    onReorderPage(draggedIndex, index);
                  } else {
                    onMovePage(draggedIndex, index > draggedIndex ? 'down' : 'up');
                  }
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`group relative rounded-xl border p-2 transition-all cursor-pointer ${
                isDraggingThis
                  ? 'opacity-40 border-amber-400/40 border-dashed scale-95'
                  : isDragTarget
                  ? 'border-amber-400 bg-amber-400/20 scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50'
                  : isSelected
                  ? 'border-amber-400 bg-amber-400/[0.07] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {/* Page Number Badge & Status */}
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span
                  className={`text-[11px] font-mono font-medium ${
                    isSelected ? 'text-amber-400' : 'text-white/60'
                  }`}
                >
                  Page {index + 1}
                </span>

                {page.customRotation !== 0 && (
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-1 rounded">
                    {page.customRotation}°
                  </span>
                )}
              </div>

              {/* Thumbnail Preview Canvas Container */}
              <div
                className="w-full aspect-[3/4] bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-white/5 relative"
                style={{
                  transform: `rotate(${page.customRotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
              >
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-white/30 text-xs">Page {page.pageNumber}</div>
                )}
              </div>

              {/* Page Action Controls (Visible on Hover or Selected) */}
              <div className="mt-2 pt-1 border-t border-white/[0.06] flex items-center justify-between text-white/50">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage(index, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 rounded hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors"
                    title="Move Page Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage(index, 'down');
                    }}
                    disabled={index === pages.length - 1}
                    className="p-1 rounded hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors"
                    title="Move Page Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.pageNumber);
                    }}
                    className="p-1 rounded hover:text-amber-400 hover:bg-white/10 transition-colors"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExtractPage(page.pageNumber);
                    }}
                    className="p-1 rounded hover:text-emerald-400 hover:bg-white/10 transition-colors"
                    title="Extract this single page as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(page.pageNumber);
                    }}
                    disabled={activePages.length <= 1}
                    className="p-1 rounded hover:text-rose-400 hover:bg-white/10 disabled:opacity-20 transition-colors"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
