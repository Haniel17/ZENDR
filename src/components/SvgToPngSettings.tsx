import { useState } from 'react';
import { Layers, Lock, Unlock, RotateCcw, Image } from 'lucide-react';
import type { SvgToPngOptions, SvgDimensions } from '../utils/svgToPng';

interface SvgToPngSettingsProps {
  options: SvgToPngOptions;
  nativeDimensions: SvgDimensions;
  onChange: (options: SvgToPngOptions) => void;
  onRender: () => void;
  isProcessing: boolean;
}

export const SvgToPngSettings: React.FC<SvgToPngSettingsProps> = ({
  options,
  nativeDimensions,
  onChange,
  onRender,
  isProcessing
}) => {
  const [isAspectLocked, setIsAspectLocked] = useState(true);

  // Background presets
  const bgPresets: { id: string; label: string; value: string; displayClass: string }[] = [
    { id: 'trans', label: 'Transparent', value: 'transparent', displayClass: 'checkerboard-pattern' },
    { id: 'dark', label: 'Dark (#09090B)', value: '#09090B', displayClass: 'bg-[#09090B]' },
    { id: 'white', label: 'White (#FFFFFF)', value: '#FFFFFF', displayClass: 'bg-white' },
    { id: 'purple', label: 'Neon Glow', value: '#131318', displayClass: 'bg-[#131318]' },
  ];

  const resolutionPresets = [
    { label: '512 px', size: 512 },
    { label: '1024 px', size: 1024 },
    { label: '2048 px (2K)', size: 2048 },
    { label: '4096 px (4K)', size: 4096 },
  ];

  const handleWidthChange = (newWidth: number) => {
    if (isNaN(newWidth) || newWidth <= 0) return;
    if (isAspectLocked && nativeDimensions.aspectRatio > 0) {
      const calculatedHeight = Math.round(newWidth / nativeDimensions.aspectRatio);
      onChange({
        ...options,
        width: newWidth,
        height: Math.max(1, calculatedHeight)
      });
    } else {
      onChange({ ...options, width: newWidth });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (isNaN(newHeight) || newHeight <= 0) return;
    if (isAspectLocked && nativeDimensions.aspectRatio > 0) {
      const calculatedWidth = Math.round(newHeight * nativeDimensions.aspectRatio);
      onChange({
        ...options,
        height: newHeight,
        width: Math.max(1, calculatedWidth)
      });
    } else {
      onChange({ ...options, height: newHeight });
    }
  };

  const handlePresetResolution = (targetSize: number) => {
    if (nativeDimensions.aspectRatio >= 1) {
      // Landscape or square
      const targetWidth = targetSize;
      const targetHeight = Math.round(targetSize / nativeDimensions.aspectRatio);
      onChange({ ...options, width: targetWidth, height: targetHeight });
    } else {
      // Portrait
      const targetHeight = targetSize;
      const targetWidth = Math.round(targetSize * nativeDimensions.aspectRatio);
      onChange({ ...options, width: targetWidth, height: targetHeight });
    }
  };

  const handleScaleMultiplier = (scale: number) => {
    onChange({
      ...options,
      width: Math.round(nativeDimensions.width * scale),
      height: Math.round(nativeDimensions.height * scale)
    });
  };

  const resetToOriginal = () => {
    onChange({
      width: nativeDimensions.width,
      height: nativeDimensions.height,
      backgroundColor: 'transparent'
    });
  };

  return (
    <div className="rounded-2xl bg-[#131318] dark:bg-[#131318] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 dark:border-white/5 light:border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Rasterization Settings
            </h4>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-mono">
              Output dimensions, canvas resolution &amp; background
            </p>
          </div>
        </div>

        <button
          onClick={resetToOriginal}
          disabled={isProcessing}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white dark:hover:text-white light:hover:text-slate-900 py-1 px-2.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Reset to native SVG dimensions"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset to Native</span>
        </button>
      </div>

      {/* Dimensions Input with Aspect Ratio Lock */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white dark:text-white light:text-slate-800">
            Output Dimensions
          </label>
          <span className="text-[11px] text-[#A1A1AA] font-mono">
            Native: {nativeDimensions.width} × {nativeDimensions.height} px
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Width */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] text-[#A1A1AA] font-mono">Width (px)</span>
            <input
              type="number"
              min="16"
              max="8192"
              value={options.width}
              disabled={isProcessing}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] dark:bg-[#09090B] light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-300 text-white dark:text-white light:text-slate-900 font-mono text-sm focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          {/* Aspect Lock Toggle */}
          <div className="pt-5">
            <button
              type="button"
              onClick={() => setIsAspectLocked(!isAspectLocked)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isAspectLocked
                  ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[#A78BFA]'
                  : 'bg-white/5 border-white/10 text-[#A1A1AA] hover:text-white'
              }`}
              title={isAspectLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
            >
              {isAspectLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Height */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] text-[#A1A1AA] font-mono">Height (px)</span>
            <input
              type="number"
              min="16"
              max="8192"
              value={options.height}
              disabled={isProcessing}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#09090B] dark:bg-[#09090B] light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-300 text-white dark:text-white light:text-slate-900 font-mono text-sm focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resolution Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white dark:text-white light:text-slate-800">
          Quick Resolution Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {resolutionPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetResolution(preset.size)}
              disabled={isProcessing}
              className="py-2 px-2.5 rounded-xl bg-[#09090B]/60 dark:bg-[#09090B]/60 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 text-xs font-mono text-[#FAFAFA] dark:text-[#FAFAFA] light:text-slate-800 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 transition-all text-center"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale Factor Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA] font-mono">Scale factor:</span>
        <div className="flex gap-1.5">
          {[1, 2, 4].map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => handleScaleMultiplier(scale)}
              disabled={isProcessing}
              className="px-3 py-1 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 hover:bg-white/10 border border-white/10 text-xs font-mono text-white dark:text-white light:text-slate-800 transition-colors"
            >
              {scale}×
            </button>
          ))}
        </div>
      </div>

      {/* Background Options */}
      <div className="space-y-2 pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white dark:text-white light:text-slate-800">
            Background Canvas
          </label>
          <span className="text-[11px] text-[#A1A1AA] font-mono capitalize">
            {options.backgroundColor === 'transparent' ? 'Transparent' : options.backgroundColor}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {bgPresets.map((bg) => {
            const isSelected = options.backgroundColor === bg.value;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => onChange({ ...options, backgroundColor: bg.value })}
                disabled={isProcessing}
                className={`p-2 rounded-xl flex items-center gap-2 border transition-all text-left ${
                  isSelected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 shadow-sm shadow-[#8B5CF6]/20'
                    : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-[#09090B]/40 hover:border-white/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border border-white/20 ${bg.displayClass} flex-shrink-0`} />
                <span className="text-xs font-medium text-white dark:text-white light:text-slate-900 truncate">
                  {bg.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Color Input */}
        <div className="flex items-center gap-3 pt-2">
          <label className="text-xs text-[#A1A1AA] font-mono flex items-center gap-2 cursor-pointer">
            <input
              type="color"
              value={options.backgroundColor && options.backgroundColor !== 'transparent' ? options.backgroundColor : '#8B5CF6'}
              onChange={(e) => onChange({ ...options, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <span>Custom background color</span>
          </label>
        </div>
      </div>

      {/* Render PNG Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRender}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D76F8] hover:to-[#8B5CF6] text-white font-bold text-sm shadow-lg shadow-[#8B5CF6]/25 hover:shadow-[#8B5CF6]/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Rendering High-Res PNG...</span>
            </>
          ) : (
            <>
              <Image className="w-4 h-4" />
              <span>Render {options.width} × {options.height} PNG</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
