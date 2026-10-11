import React, { useState } from 'react';
import { Layers, Lock, Unlock, RotateCcw } from 'lucide-react';
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

  const bgPresets: { id: string; label: string; value: string; displayClass: string }[] = [
    { id: 'trans', label: 'Transparent', value: 'transparent', displayClass: 'checkerboard-pattern' },
    { id: 'dark', label: 'Obsidian', value: '#040406', displayClass: 'bg-[#040406]' },
    { id: 'white', label: 'White', value: '#ffffff', displayClass: 'bg-white' },
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
      const targetWidth = targetSize;
      const targetHeight = Math.round(targetSize / nativeDimensions.aspectRatio);
      onChange({ ...options, width: targetWidth, height: targetHeight });
    } else {
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

  const resetToNative = () => {
    onChange({
      ...options,
      width: nativeDimensions.width,
      height: nativeDimensions.height,
      backgroundColor: 'transparent'
    });
  };

  return (
    <div className="rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/10 p-6 space-y-6 shadow-2xl text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Raster Resolution</span>
        </div>
        <button
          onClick={resetToNative}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-amber-400 transition-colors"
          title="Reset to native dimensions"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Dimensions Inputs */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-white/70 block">
          Target Dimensions
        </label>
        <div className="flex items-center gap-2">
          {/* Width */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-mono text-white/40 block">Width (px)</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={options.width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Aspect ratio lock button */}
          <div className="pt-5">
            <button
              onClick={() => setIsAspectLocked(!isAspectLocked)}
              className={`p-2 rounded-xl border transition-colors ${
                isAspectLocked
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-400'
                  : 'bg-white/[0.03] border-white/10 text-white/40'
              }`}
              title={isAspectLocked ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
            >
              {isAspectLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Height */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-mono text-white/40 block">Height (px)</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={options.height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Quick Scale Multipliers */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70 block">
          Scale Multiplier
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((scale) => {
            const isCurrent = options.width === nativeDimensions.width * scale;
            return (
              <button
                key={scale}
                onClick={() => handleScaleMultiplier(scale)}
                className={`py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {scale}×
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Resolutions */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70 block">
          Target Resolution
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {resolutionPresets.map((preset) => (
            <button
              key={preset.size}
              onClick={() => handlePresetResolution(preset.size)}
              className="py-1.5 px-2 rounded-xl text-xs font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color Options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70 block">
          Background Fill
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {bgPresets.map((bg) => {
            const isSelected = options.backgroundColor === bg.value;
            return (
              <button
                key={bg.id}
                onClick={() => onChange({ ...options, backgroundColor: bg.value })}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border border-white/20 ${bg.displayClass}`} />
                <span className="truncate">{bg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onRender}
        disabled={isProcessing}
        className="w-full btn-primary py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Rendering High-DPI...</span>
          </>
        ) : (
          <span>Render PNG</span>
        )}
      </button>
    </div>
  );
};
