import { Sliders, Sparkles, RotateCcw, Check } from 'lucide-react';
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
  const presets: { id: VectorPreset; label: string; desc: string }[] = [
    { id: 'default', label: 'Balanced', desc: 'Standard balance of detail and smooth paths' },
    { id: 'detailed', label: 'High Detail', desc: 'Preserves small details, textures & fine lines' },
    { id: 'smoothed', label: 'Smooth', desc: 'Smooths out noise & creates flowing curves' },
    { id: 'sharp', label: 'Sharp / Logo', desc: 'Optimized for logos, text & geometric shapes' },
    { id: 'curvy', label: 'Curvy Splines', desc: 'Emphasizes fluid bezier curves' },
    { id: 'posterized1', label: 'Posterize', desc: 'Artistic vector posterization effect' },
    { id: 'grayscale', label: 'Grayscale', desc: 'Monochrome shades of gray' }
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
      case 'posterized1':
        presetDefaults = {
          ...presetDefaults,
          numberOfColors: 8,
          pathOmit: 16
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
    <div className="rounded-2xl bg-[#131318] dark:bg-[#131318] light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 dark:border-white/5 light:border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Vectorization Settings
            </h4>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-mono">
              Configure path tracing algorithm parameters
            </p>
          </div>
        </div>

        <button
          onClick={resetDefaults}
          disabled={isProcessing}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white dark:hover:text-white light:hover:text-slate-900 py-1 px-2.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Reset to default settings"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white dark:text-white light:text-slate-800 flex items-center justify-between">
          <span>Preset Style</span>
          <span className="text-[11px] text-[#00D1FF] font-mono capitalize">
            {options.preset || 'default'}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = (options.preset || 'default') === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id)}
                disabled={isProcessing}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-[#00D1FF] bg-[#00D1FF]/10 text-white dark:text-white light:text-slate-900 shadow-sm shadow-[#00D1FF]/10'
                    : 'border-white/5 dark:border-white/5 light:border-slate-200 bg-[#09090B]/50 dark:bg-[#09090B]/50 light:bg-slate-50 text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{p.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00D1FF]" />}
                </div>
                <p className="text-[10px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 line-clamp-1 mt-0.5">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Number of Colors Slider */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white dark:text-white light:text-slate-800 flex items-center gap-1.5">
            <span>Color Palette Quantization</span>
          </label>
          <span className="px-2.5 py-0.5 rounded-md bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20 text-xs font-mono font-bold">
            {options.numberOfColors} colors
          </span>
        </div>
        <input
          type="range"
          min="2"
          max="64"
          step="1"
          value={options.numberOfColors}
          disabled={isProcessing}
          onChange={(e) => onChange({ ...options, numberOfColors: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D1FF]"
        />
        <div className="flex justify-between text-[10px] text-[#A1A1AA] font-mono">
          <span>2 (Minimal)</span>
          <div className="flex gap-2">
            {[4, 8, 16, 32, 64].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onChange({ ...options, numberOfColors: cnt })}
                className={`hover:text-white ${options.numberOfColors === cnt ? 'text-[#00D1FF] font-bold' : ''}`}
              >
                {cnt}
              </button>
            ))}
          </div>
          <span>64 (Vibrant)</span>
        </div>
      </div>

      {/* Sliders Grid: Detail & Smoothing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Line Threshold */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#09090B]/60 dark:bg-[#09090B]/60 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white dark:text-white light:text-slate-800 font-medium">Line Detail (ltres)</span>
            <span className="text-[#00D1FF] font-mono text-[11px]">{options.lineThreshold}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={options.lineThreshold}
            disabled={isProcessing}
            onChange={(e) => onChange({ ...options, lineThreshold: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D1FF]"
          />
          <p className="text-[10px] text-[#A1A1AA] font-mono">Lower = higher line fidelity</p>
        </div>

        {/* Spline Threshold */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#09090B]/60 dark:bg-[#09090B]/60 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white dark:text-white light:text-slate-800 font-medium">Curve Fit (qtres)</span>
            <span className="text-[#00D1FF] font-mono text-[11px]">{options.splineThreshold}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={options.splineThreshold}
            disabled={isProcessing}
            onChange={(e) => onChange({ ...options, splineThreshold: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D1FF]"
          />
          <p className="text-[10px] text-[#A1A1AA] font-mono">Lower = sharper bezier curves</p>
        </div>

        {/* Path Omit (Noise Filter) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#09090B]/60 dark:bg-[#09090B]/60 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white dark:text-white light:text-slate-800 font-medium">Noise Filter (Path Omit)</span>
            <span className="text-[#00D1FF] font-mono text-[11px]">{options.pathOmit} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            value={options.pathOmit}
            disabled={isProcessing}
            onChange={(e) => onChange({ ...options, pathOmit: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D1FF]"
          />
          <p className="text-[10px] text-[#A1A1AA] font-mono">Filters out specks &amp; artifacts</p>
        </div>

        {/* Blur Radius */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#09090B]/60 dark:bg-[#09090B]/60 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white dark:text-white light:text-slate-800 font-medium">Smoothing Blur</span>
            <span className="text-[#00D1FF] font-mono text-[11px]">{options.blurRadius} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={options.blurRadius}
            disabled={isProcessing}
            onChange={(e) => onChange({ ...options, blurRadius: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D1FF]"
          />
          <p className="text-[10px] text-[#A1A1AA] font-mono">Pre-filters pixelated edges</p>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2.5 text-xs text-white dark:text-white light:text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.rightAngleEnhance}
            disabled={isProcessing}
            onChange={(e) => onChange({ ...options, rightAngleEnhance: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00D1FF] focus:ring-[#00D1FF] accent-[#00D1FF]"
          />
          <span className="font-medium">Enhance Right Angles</span>
          <span className="text-[10px] text-[#A1A1AA] font-mono">(Great for logos)</span>
        </label>
      </div>

      {/* Vectorize Trigger CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onVectorize}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] hover:from-[#38E1FF] hover:to-[#00B4FF] text-[#09090B] font-bold text-sm shadow-lg shadow-[#00D1FF]/25 hover:shadow-[#00D1FF]/40 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              <span>Tracing Vector Paths...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Vectorize to SVG Paths</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
