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
  Sparkles,
  Clock,
  HardDrive,
  FileCode,
  Trash2
} from 'lucide-react';

interface PreviewWorkspaceProps {
  mode: 'png-to-svg' | 'svg-to-png';
  originalFileName: string;
  originalFileSize: number;
  originalSrc: string; // URL for original PNG or SVG
  convertedSrc: string; // URL or data URL of result (SVG string data URL or PNG data URL)
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
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
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

  // Slider Dragging Logic
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

  // Download converted file
  const handleDownload = () => {
    if (!convertedSrc) return;
    const link = document.createElement('a');
    link.href = convertedSrc;

    // Generate output filename
    const baseName = originalFileName.replace(/\.[^/.]+$/, '');
    const extension = mode === 'png-to-svg' ? 'svg' : 'png';
    link.download = `${baseName}_zendr.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy SVG Code
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
    <div className="rounded-2xl bg-[#131318] dark:bg-[#131318] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 overflow-hidden shadow-2xl space-y-0">
      {/* Top Workspace Toolbar */}
      <div className="p-4 sm:p-5 border-b border-white/5 dark:border-white/5 light:border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-[#09090B]/50 dark:bg-[#09090B]/50 light:bg-slate-50">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131318] dark:bg-[#131318] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
            title="Interactive Split Slider"
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
            title="Side by Side Comparison"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side by Side</span>
          </button>

          <button
            onClick={() => setViewMode('result')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'result'
                ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
            title="Only Converted Result"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          {mode === 'png-to-svg' && convertedSvgString && (
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'code'
                  ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Inspect SVG XML Code"
            >
              <Code className="w-3.5 h-3.5" />
              <span>SVG Code</span>
            </button>
          )}
        </div>

        {/* Right: Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Transparency Toggle */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
              showCheckerboard
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-[#A1A1AA] border-white/5'
            }`}
            title="Toggle transparency grid background"
          >
            Grid
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#131318] dark:bg-[#131318] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:text-white text-[#A1A1AA]"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-white dark:text-white light:text-slate-800">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:text-white text-[#A1A1AA]"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:text-white text-[#A1A1AA]"
              title="Reset 100% zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            title="Remove current image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="p-4 sm:p-6 bg-[#09090B] dark:bg-[#09090B] light:bg-slate-100 flex items-center justify-center min-h-[380px] sm:min-h-[460px] overflow-hidden relative">
        {/* VIEW MODE 1: Interactive Split Slider */}
        {viewMode === 'split' && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            className={`relative max-w-full max-h-[500px] aspect-square rounded-xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl ${
              showCheckerboard ? 'checkerboard-pattern' : 'bg-[#131318]'
            }`}
            style={{ width: `${Math.min(500 * zoomLevel, 650)}px`, height: `${Math.min(500 * zoomLevel, 650)}px` }}
          >
            {/* Background: Converted (Right) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={convertedSrc}
                alt="Converted result"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Foreground: Original (Left, clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ width: `${containerRef.current?.clientWidth || 500}px` }}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Vertical Divider Line with Grab Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-lg shadow-black/80 flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-black shadow-xl flex items-center justify-center -ml-0.5 border-2 border-[#09090B]">
                <Split className="w-4 h-4" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-3 left-3 z-10 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
              Original ({mode === 'png-to-svg' ? 'Raster' : 'Vector'})
            </div>
            <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-[#00D1FF] border border-[#00D1FF]/30">
              Converted ({mode === 'png-to-svg' ? 'SVG Paths' : 'Raster PNG'})
            </div>
          </div>
        )}

        {/* VIEW MODE 2: Side by Side */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {/* Original Box */}
            <div className="rounded-xl border border-white/10 bg-[#131318]/60 p-3 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider font-mono">
                  Original Image
                </span>
                <span className="text-[11px] font-mono text-[#A1A1AA]">
                  {formatFileSize(originalFileSize)}
                </span>
              </div>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden border border-white/5 ${
                  showCheckerboard ? 'checkerboard-pattern' : 'bg-[#09090B]'
                }`}
              >
                <img
                  src={originalSrc}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
                />
              </div>
            </div>

            {/* Converted Box */}
            <div className="rounded-xl border border-[#00D1FF]/30 bg-[#131318]/60 p-3 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-[#00D1FF] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Converted Output</span>
                </span>
                <span className="text-[11px] font-mono text-[#00D1FF]">
                  {formatFileSize(convertedSizeBytes)}
                </span>
              </div>
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden border border-[#00D1FF]/20 ${
                  showCheckerboard ? 'checkerboard-pattern' : 'bg-[#09090B]'
                }`}
              >
                <img
                  src={convertedSrc}
                  alt="Converted"
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: Single Result */}
        {viewMode === 'result' && (
          <div
            className={`w-full max-w-xl aspect-square rounded-xl overflow-hidden border border-[#00D1FF]/30 flex items-center justify-center shadow-2xl ${
              showCheckerboard ? 'checkerboard-pattern' : 'bg-[#09090B]'
            }`}
          >
            <img
              src={convertedSrc}
              alt="Converted Output"
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
            />
          </div>
        )}

        {/* VIEW MODE 4: SVG Code Viewer */}
        {viewMode === 'code' && convertedSvgString && (
          <div className="w-full max-w-4xl rounded-xl border border-white/10 bg-[#09090B] overflow-hidden flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#131318]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                <FileCode className="w-4 h-4 text-[#00D1FF]" />
                <span>output.svg</span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                  {convertedSvgString.split('\n').length} lines • {pathCount || 0} paths
                </span>
              </div>
              <button
                onClick={handleCopySvgCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20 text-xs font-semibold border border-[#00D1FF]/30 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied XML!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 overflow-auto text-xs font-mono text-slate-300 bg-[#09090B] leading-relaxed selection:bg-[#00D1FF]/30">
              <code>{convertedSvgString}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Conversion Metadata Banner */}
      <div className="p-4 sm:p-5 border-t border-white/5 dark:border-white/5 light:border-slate-100 bg-[#131318]/90 dark:bg-[#131318]/90 light:bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono">
          {/* File dimensions */}
          <div className="flex items-center gap-1.5 text-[#A1A1AA]">
            <Maximize2 className="w-3.5 h-3.5 text-[#00D1FF]" />
            <span>Resolution:</span>
            <span className="text-white dark:text-white light:text-slate-900 font-bold">
              {width} × {height} px
            </span>
          </div>

          {/* File size difference */}
          <div className="flex items-center gap-1.5 text-[#A1A1AA]">
            <HardDrive className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Size:</span>
            <span className="text-white dark:text-white light:text-slate-900 font-bold">
              {formatFileSize(originalFileSize)} → {formatFileSize(convertedSizeBytes)}
            </span>
          </div>

          {/* Path count for SVG */}
          {pathCount !== undefined && pathCount > 0 && (
            <div className="flex items-center gap-1.5 text-[#A1A1AA]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vector Paths:</span>
              <span className="text-emerald-400 font-bold">
                {pathCount.toLocaleString()} paths
              </span>
            </div>
          )}

          {/* Execution time */}
          {executionTimeMs !== undefined && (
            <div className="flex items-center gap-1.5 text-[#A1A1AA]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Render time:</span>
              <span className="text-amber-400 font-bold">
                {executionTimeMs} ms
              </span>
            </div>
          )}
        </div>

        {/* Primary Download & Action CTAs */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {mode === 'png-to-svg' && convertedSvgString && (
            <button
              onClick={handleCopySvgCode}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white dark:text-white light:text-slate-900 text-xs font-semibold transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied!' : 'Copy SVG'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
              mode === 'png-to-svg'
                ? 'bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] text-[#09090B] shadow-[#00D1FF]/25 hover:shadow-[#00D1FF]/40'
                : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[#8B5CF6]/25 hover:shadow-[#8B5CF6]/40'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>
              Download {mode === 'png-to-svg' ? 'SVG Vector' : 'PNG Image'} ({formatFileSize(convertedSizeBytes)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
