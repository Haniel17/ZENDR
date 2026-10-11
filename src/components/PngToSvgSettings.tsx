import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import type { PngToSvgOptions, VectorPreset } from '../utils/pngToSvg';

interface PngToSvgSettingsProps {
  options: PngToSvgOptions;
  onChange: (options: PngToSvgOptions) => void;
  onVectorize: () => void;
  isProcessing: boolean;
}

export const PngToSvgSettings: React.FC<PngToSvgSettingsProps> = ({
  options,
  onChange,
  onVectorize,
  isProcessing
}) => {
  const presets: { id: VectorPreset; label: string }[] = [
    { id: 'default', label: 'Balanced' },
    { id: 'detailed', label: 'Detailed' },
    { id: 'smoothed', label: 'Smooth' },
    { id: 'sharp', label: 'Sharp' },
    { id: 'curvy', label: 'Curvy' },
    { id: 'grayscale', label: 'Grayscale' }
  ];

  const handlePresetSelect = (preset: VectorPreset) => {
    let presetDefaults: Partial<PngToSvgOptions> = { preset };

    switch (preset) {
      case 'detailed':
        presetDefaults = {
          ...presetDefaults,
          numberOfColors: Math.max(options.numberOfColors, 24),
          lineThreshold: 0.5,
          splineThreshold: 0.5,
          pathOmit: 2,
          blurRadius: 0
        };
        break;
      case 'smoothed':
        presetDefaults = {
          ...presetDefaults,
          lineThreshold: 2.0,
          splineThreshold: 2.0,
          pathOmit: 12,
          blurRadius: 2
        };
        break;
      case 'sharp':
        presetDefaults = {
          ...presetDefaults,
          rightAngleEnhance: true,
          lineThreshold: 0.8,
          splineThreshold: 1.2,
          pathOmit: 4
        };
        break;
      case 'grayscale':
        presetDefaults = {
          ...presetDefaults,
          numberOfColors: 8
        };
        break;
      default:
        presetDefaults = {
          ...presetDefaults,
          lineThreshold: 1,
          splineThreshold: 1,
          pathOmit: 8,
          blurRadius: 0,
          rightAngleEnhance: true
        };
        break;
    }

    onChange({
      ...options,
      ...presetDefaults
    });
  };

  const resetDefaults = () => {
    onChange({
      preset: 'default',
      numberOfColors: 16,
      lineThreshold: 1,
      splineThreshold: 1,
      pathOmit: 8,
      blurRadius: 0,
      strokeWidth: 1,
      rightAngleEnhance: true,
      removeBackground: false
    });
  };

  return (
    <div className="rounded-[28px] liquid-glass-card p-6 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.14)] text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Vector Precision</span>
        </div>
        <button
          onClick={resetDefaults}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-amber-400 transition-colors px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/5 active:scale-95 cursor-pointer"
          title="Reset to default values"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/70 block">
          Preset
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              className={`py-1.5 px-2 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 text-center cursor-pointer ${
                options.preset === p.id
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-bold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Sliders with Amber Accents */}
      <div className="space-y-4">
        {/* Number of Colors */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">Color Palette</span>
            <span className="font-mono text-amber-400 font-semibold">
              {options.numberOfColors} colors
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={64}
            step={2}
            value={options.numberOfColors}
            onChange={(e) => onChange({ ...options, numberOfColors: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Straight Line Detail (ltres) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">Straight-Line Threshold</span>
            <span className="font-mono text-amber-400 font-semibold">
              {options.lineThreshold}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={options.lineThreshold}
            onChange={(e) => onChange({ ...options, lineThreshold: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Curve Smoothness (qtres) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">Spline Curve Detail</span>
            <span className="font-mono text-amber-400 font-semibold">
              {options.splineThreshold}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={options.splineThreshold}
            onChange={(e) => onChange({ ...options, splineThreshold: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Speckle Noise Filter (pathomit) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">Speckle Suppression</span>
            <span className="font-mono text-amber-400 font-semibold">
              {options.pathOmit} px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            step={1}
            value={options.pathOmit}
            onChange={(e) => onChange({ ...options, pathOmit: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur Pre-Filter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-medium">Smooth Pre-Filter</span>
            <span className="font-mono text-amber-400 font-semibold">
              {options.blurRadius} px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={options.blurRadius}
            onChange={(e) => onChange({ ...options, blurRadius: Number(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-white/80 font-medium">
            Enhance Right Angles (90°)
          </span>
          <input
            type="checkbox"
            checked={options.rightAngleEnhance}
            onChange={(e) => onChange({ ...options, rightAngleEnhance: e.target.checked })}
            className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-white/80 font-medium">
            Omit White Background
          </span>
          <input
            type="checkbox"
            checked={options.removeBackground}
            onChange={(e) => onChange({ ...options, removeBackground: e.target.checked })}
            className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
          />
        </label>
      </div>

      {/* Action Button */}
      <button
        onClick={onVectorize}
        disabled={isProcessing}
        className="w-full btn-primary py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Tracing Contours...</span>
          </>
        ) : (
          <span>Re-Vectorize Image</span>
        )}
      </button>
    </div>
  );
};
