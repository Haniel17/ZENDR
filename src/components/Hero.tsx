import React from 'react';
import { Sparkles, Layers, ShieldCheck, Cpu, ArrowDown } from 'lucide-react';

interface HeroProps {
  activeMode: 'png-to-svg' | 'svg-to-png';
  onSelectMode: (mode: 'png-to-svg' | 'svg-to-png') => void;
  onScrollToWorkspace: () => void;
}

export const Hero: React.FC<HeroProps> = ({ activeMode, onSelectMode, onScrollToWorkspace }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-22 border-b border-white/[0.06] dark:border-white/[0.06] light:border-slate-200">
      {/* Decorative gradient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-[#00D1FF]/15 via-[#8B5CF6]/15 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-[#00D1FF]/10 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute top-40 -left-16 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131318]/90 dark:bg-[#131318]/90 light:bg-slate-100 border border-[#00D1FF]/30 dark:border-[#00D1FF]/30 light:border-sky-300 shadow-lg shadow-[#00D1FF]/5 mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-[#00D1FF] animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-[#FAFAFA] dark:text-[#FAFAFA] light:text-slate-800">
            Client-Side Image Vectorization &amp; Canvas Engine
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00D1FF]/15 text-[#00D1FF] dark:text-[#00D1FF] light:text-sky-700">
            v1.0
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 leading-[1.08] mb-6">
          Pixels in.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] via-[#8B5CF6] to-[#EC4899]">
            Vectors out.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 leading-relaxed mb-10 font-normal">
          Convert raster <span className="text-white dark:text-white light:text-slate-900 font-medium">PNG to SVG</span> with genuine bezier path tracing — never fake embedded base64 images. Or render scalable <span className="text-white dark:text-white light:text-slate-900 font-medium">SVG to PNG</span> with custom dimensions up to 4K resolution.
        </p>

        {/* Quick Mode Switches & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => {
              onSelectMode('png-to-svg');
              onScrollToWorkspace();
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg ${
              activeMode === 'png-to-svg'
                ? 'bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] text-[#09090B] font-bold shadow-[#00D1FF]/25 hover:shadow-[#00D1FF]/40 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-[#131318] dark:bg-[#131318] light:bg-white text-white dark:text-white light:text-slate-800 border border-white/10 dark:border-white/10 light:border-slate-200 hover:border-[#00D1FF]/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Vectorize: PNG → SVG</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('svg-to-png');
              onScrollToWorkspace();
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg ${
              activeMode === 'svg-to-png'
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[#8B5CF6]/25 hover:shadow-[#8B5CF6]/40 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-[#131318] dark:bg-[#131318] light:bg-white text-white dark:text-white light:text-slate-800 border border-white/10 dark:border-white/10 light:border-slate-200 hover:border-[#8B5CF6]/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Render: SVG → PNG</span>
          </button>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 text-left">
          <div className="p-3.5 rounded-xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
            <div className="flex items-center gap-2 text-[#00D1FF] font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>True Paths</span>
            </div>
            <p className="text-[12px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 leading-snug">
              Generates editable XML vector shapes &amp; bezier curves.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
            <div className="flex items-center gap-2 text-[#8B5CF6] font-semibold text-xs mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Private</span>
            </div>
            <p className="text-[12px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 leading-snug">
              Client-side computation. Files never leave your browser.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
            <div className="flex items-center gap-2 text-[#00D1FF] font-semibold text-xs mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Color Tracing</span>
            </div>
            <p className="text-[12px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 leading-snug">
              Quantize 2 to 64 color layers with adaptive palettes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200">
            <div className="flex items-center gap-2 text-[#8B5CF6] font-semibold text-xs mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Up to 4K Export</span>
            </div>
            <p className="text-[12px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 leading-snug">
              Render SVGs at any custom width, height, and background.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onScrollToWorkspace}
            className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#00D1FF] transition-colors py-1 px-3 rounded-full hover:bg-white/5"
          >
            <span>Jump to Workspace</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
