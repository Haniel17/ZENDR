import React from 'react';
import { Sparkles, Layers, ArrowRight } from 'lucide-react';

interface ModeSelectorProps {
  activeMode: 'png-to-svg' | 'svg-to-png';
  onSelectMode: (mode: 'png-to-svg' | 'svg-to-png') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onSelectMode }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-[#131318]/90 dark:bg-[#131318]/90 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200">
      <div className="grid grid-cols-2 gap-2 flex-1">
        {/* PNG -> SVG Mode Tab */}
        <button
          onClick={() => onSelectMode('png-to-svg')}
          className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeMode === 'png-to-svg'
              ? 'bg-[#09090B] dark:bg-[#09090B] light:bg-white text-white dark:text-white light:text-slate-900 border border-[#00D1FF]/50 shadow-md shadow-[#00D1FF]/10'
              : 'text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeMode === 'png-to-svg' ? 'bg-[#00D1FF]/15 text-[#00D1FF]' : 'text-[#A1A1AA]'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs sm:text-sm">PNG → SVG</span>
            <span className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-mono hidden md:inline">
              Vectorize to real paths
            </span>
          </div>
        </button>

        {/* SVG -> PNG Mode Tab */}
        <button
          onClick={() => onSelectMode('svg-to-png')}
          className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeMode === 'svg-to-png'
              ? 'bg-[#09090B] dark:bg-[#09090B] light:bg-white text-white dark:text-white light:text-slate-900 border border-[#8B5CF6]/50 shadow-md shadow-[#8B5CF6]/10'
              : 'text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeMode === 'svg-to-png' ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'text-[#A1A1AA]'}`}>
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs sm:text-sm">SVG → PNG</span>
            <span className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-mono hidden md:inline">
              Render to raster image
            </span>
          </div>
        </button>
      </div>

      {/* Mode info tag */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-200/60 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 font-mono">
        <span>Current engine:</span>
        <span className="text-white dark:text-white light:text-slate-900 font-semibold flex items-center gap-1">
          {activeMode === 'png-to-svg' ? (
            <>
              ImageTracer.js <ArrowRight className="w-3 h-3 text-[#00D1FF]" /> SVG Paths
            </>
          ) : (
            <>
              Canvg Canvas <ArrowRight className="w-3 h-3 text-[#8B5CF6]" /> 32-bit PNG
            </>
          )}
        </span>
      </div>
    </div>
  );
};
