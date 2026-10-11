import { useState, useRef } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import {
  Download,
  Copy,
  Check,
  Split,
  Eye,
  Code,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  FileCode,
  Bookmark
} from 'lucide-react';

interface PreviewWorkspaceProps {
  mode: 'png-to-svg' | 'svg-to-png';
  originalFileName: string;
  originalFileSize: number;
  originalSrc: string;
  convertedSrc: string;
  convertedSvgString?: string;
  convertedBlob?: Blob;
  convertedSizeBytes: number;
  width: number;
  height: number;
  pathCount?: number;
  executionTimeMs?: number;
  onClear: () => void;
  onReconvert?: () => void;
  isProcessing: boolean;
  onSaveVault?: () => void;
  isSavedToVault?: boolean;
}

type ViewMode = 'split' | 'side-by-side' | 'result' | 'code';

export const PreviewWorkspace: React.FC<PreviewWorkspaceProps> = ({
  mode,
  originalFileName,
  originalFileSize,
  originalSrc,
  convertedSrc,
  convertedSvgString,
  convertedSizeBytes,
  width,
  height,
  pathCount,
  executionTimeMs,
  onClear,
  onSaveVault,
  isSavedToVault,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseUp = () => setIsDraggingSlider(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingSlider) handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
  };

  const handleDownload = () => {
    if (!convertedSrc) return;
    const link = document.createElement('a');
    link.href = convertedSrc;

    const baseName = originalFileName.replace(/\.[^/.]+$/, '');
    const extension = mode === 'png-to-svg' ? 'svg' : 'png';
    link.download = `${baseName}_converted.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySvgCode = async () => {
    if (!convertedSvgString) return;
    try {
      await navigator.clipboard.writeText(convertedSvgString);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
    }
  };

  return (
    <div className="rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl space-y-0 text-left">
      {/* Top Workspace Toolbar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.95] cursor-pointer select-none ${
              viewMode === 'split'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.95] cursor-pointer select-none ${
              viewMode === 'side-by-side'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('result')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.95] cursor-pointer select-none ${
              viewMode === 'result'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span>Result</span>
          </button>

          {mode === 'png-to-svg' && convertedSvgString && (
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-[0.95] cursor-pointer select-none ${
                viewMode === 'code'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>SVG Code</span>
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Transparency Grid Toggle */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all duration-150 active:scale-95 cursor-pointer select-none ${
              showCheckerboard
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-white/40 border-white/5 hover:text-white'
            }`}
          >
            Grid
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-full p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-full hover:text-white text-white/50 transition-all duration-150 active:scale-90 cursor-pointer select-none"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-white/80">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1.5 rounded-full hover:text-white text-white/50 transition-all duration-150 active:scale-90 cursor-pointer select-none"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-full hover:text-white text-white/50 transition-all duration-150 active:scale-90 cursor-pointer select-none"
              title="Reset 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Remove / Clear button */}
          <button
            onClick={onClear}
            className="p-2 rounded-full text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 active:scale-90 ml-1 cursor-pointer select-none"
            title="Discard current image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="p-4 sm:p-6 bg-black/40 flex items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden relative">
        {/* VIEW 1: Split Slider */}
        {viewMode === 'split' && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            className={`relative max-w-full max-h-[500px] aspect-square rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl ${
              showCheckerboard ? 'checkerboard-pattern' : 'bg-black/80'
            }`}
            style={{ width: `${Math.min(500 * zoomLevel, 650)}px`, height: `${Math.min(500 * zoomLevel, 650)}px` }}
          >
            {/* Background: Converted (Right) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={convertedSrc}
                alt="Converted"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground: Original (Left, clipped by slider) */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ width: '500px' }}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Split Divider Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 cursor-ew-resize z-20 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 text-black shadow-xl flex items-center justify-center border-2 border-black font-bold">
                <Split className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Tags */}
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
              Original
            </div>
            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400 border border-amber-400/30">
              Vector Output
            </div>
          </div>
        )}

        {/* VIEW 2: Side by Side */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            <div className="space-y-2">
              <div className="text-xs font-mono text-white/50">Original Bitmap</div>
              <div
                className={`w-full aspect-square rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center ${
                  showCheckerboard ? 'checkerboard-pattern' : 'bg-black/80'
                }`}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-amber-400">Converted Output</div>
              <div
                className={`w-full aspect-square rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center ${
                  showCheckerboard ? 'checkerboard-pattern' : 'bg-black/80'
                }`}
              >
                <img
                  src={convertedSrc}
                  alt="Converted"
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Result Only */}
        {viewMode === 'result' && (
          <div
            className={`w-full max-w-xl aspect-square rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl ${
              showCheckerboard ? 'checkerboard-pattern' : 'bg-black/80'
            }`}
          >
            <img
              src={convertedSrc}
              alt="Converted Output"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        )}

        {/* VIEW 4: SVG Code */}
        {viewMode === 'code' && convertedSvgString && (
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black/90 overflow-hidden flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>output.svg</span>
                <span>•</span>
                <span>{convertedSvgString.split('\n').length} lines</span>
                <span>•</span>
                <span>{pathCount || 0} paths</span>
              </div>
              <button
                onClick={handleCopySvgCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-semibold border border-amber-400/30 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied XML!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-auto text-xs font-mono text-white/80 bg-black/95 leading-relaxed selection:bg-amber-400/30">
              <code>{convertedSvgString}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Metrics & Action Bar */}
      <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-white/50">
          <div>
            <span>Resolution: </span>
            <span className="text-white font-semibold">{width} × {height} px</span>
          </div>

          <div>
            <span>Size: </span>
            <span className="text-white font-semibold">
              {formatFileSize(originalFileSize)} → {formatFileSize(convertedSizeBytes)}
            </span>
          </div>

          {pathCount !== undefined && pathCount > 0 && (
            <div>
              <span>Paths: </span>
              <span className="text-amber-400 font-semibold">{pathCount.toLocaleString()}</span>
            </div>
          )}

          {executionTimeMs !== undefined && (
            <div>
              <span>Time: </span>
              <span className="text-emerald-400 font-semibold">{executionTimeMs} ms</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onSaveVault && (
            <button
              onClick={onSaveVault}
              className={`flex-1 sm:flex-initial btn-secondary text-xs px-4 py-2 rounded-full ${
                isSavedToVault ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' : ''
              }`}
            >
              {isSavedToVault ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved in Vault</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Save to Vault</span>
                </>
              )}
            </button>
          )}

          {mode === 'png-to-svg' && convertedSvgString && (
            <button
              onClick={handleCopySvgCode}
              className="flex-1 sm:flex-initial btn-secondary text-xs px-4 py-2 rounded-full"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied!' : 'Copy SVG'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-full font-semibold"
          >
            <Download className="w-4 h-4 text-black" />
            <span>
              Download {mode === 'png-to-svg' ? 'SVG Vector' : 'PNG Image'} ({formatFileSize(convertedSizeBytes)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
