import React from 'react';
import { Shield } from 'lucide-react';

interface FooterProps {
  onSelectMode: (mode: 'png-to-svg' | 'svg-to-png') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectMode }) => {
  return (
    <footer className="w-full bg-[#09090B] dark:bg-[#09090B] light:bg-slate-50 border-t border-white/[0.08] dark:border-white/[0.08] light:border-slate-200 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D1FF] to-[#8B5CF6] p-[1.5px]">
                <div className="w-full h-full bg-[#09090B] dark:bg-[#09090B] light:bg-white rounded-[9px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00D1FF] to-[#8B5CF6] text-base">
                    Z
                  </span>
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white dark:text-white light:text-slate-900">
                ZENDR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 max-w-sm leading-relaxed">
              Pixels in. Vectors out. A lightning-fast, privacy-first image conversion workspace that turns raster bitmaps into authentic SVG paths and renders SVGs into high-DPI PNGs.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero server logging • 100% Client-Side Engine</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-slate-900 font-mono">
              Conversion Modes
            </h4>
            <ul className="space-y-2 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
              <li>
                <button
                  onClick={() => onSelectMode('png-to-svg')}
                  className="hover:text-[#00D1FF] transition-colors"
                >
                  PNG to SVG (Vectorization)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectMode('svg-to-png')}
                  className="hover:text-[#8B5CF6] transition-colors"
                >
                  SVG to PNG (Rasterization)
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Multi-Color Tracing Guide
                </a>
              </li>
              <li>
                <a href="#true-vector" className="hover:text-white transition-colors">
                  Path Coordinates vs Base64
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-slate-900 font-mono">
              Engine Technology
            </h4>
            <ul className="space-y-1.5 text-xs font-mono text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
              <li>React 19 &amp; Vite 8</li>
              <li>Tailwind CSS Design System</li>
              <li>ImageTracer.js Vector Engine</li>
              <li>Canvg Canvas 2D Parser</li>
              <li>Lucide Icons &amp; Motion</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 dark:border-white/5 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} ZENDR. Free and open creative tool.</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[#00D1FF]">PNG → SVG</span>
            <span>•</span>
            <span className="text-[#8B5CF6]">SVG → PNG</span>
            <span>•</span>
            <span className="text-emerald-400">Pure Browser Sandbox</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
