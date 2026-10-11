import React from 'react';
import { PenTool, Layers } from 'lucide-react';

interface ModeSelectorProps {
  activeMode: 'png-to-svg' | 'svg-to-png';
  onSelectMode: (mode: 'png-to-svg' | 'svg-to-png') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onSelectMode }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0c0d10] border border-white/[0.08]">
        <button
          onClick={() => onSelectMode('png-to-svg')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-100 cursor-pointer select-none ${
            activeMode === 'png-to-svg'
              ? 'bg-amber-400 text-black font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>PNG → SVG (Vectorize)</span>
        </button>

        <button
          onClick={() => onSelectMode('svg-to-png')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-100 cursor-pointer select-none ${
            activeMode === 'svg-to-png'
              ? 'bg-amber-400 text-black font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>SVG → PNG (Rasterize)</span>
        </button>
      </div>
    </div>
  );
};
