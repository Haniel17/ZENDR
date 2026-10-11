import React from 'react';
import { Sun, Moon, Zap, Sparkles, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeMode: 'png-to-svg' | 'svg-to-png';
  onSelectMode: (mode: 'png-to-svg' | 'svg-to-png') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeMode, onSelectMode }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] bg-[#09090B]/80 dark:bg-[#09090B]/85 light:bg-white/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D1FF] to-[#8B5CF6] p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-[#00D1FF]/20">
              <div className="w-full h-full bg-[#09090B] dark:bg-[#09090B] light:bg-white rounded-[10px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00D1FF] to-[#8B5CF6] text-lg tracking-wider">
                  Z
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 group-hover:text-[#00D1FF] transition-colors">
                ZENDR
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 -mt-1 hidden sm:block">
                Pixels in • Vectors out
              </span>
            </div>
          </a>

          {/* Quick Mode Switches in Header */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#131318]/60 dark:bg-[#131318]/60 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-200">
            <button
              onClick={() => onSelectMode('png-to-svg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMode === 'png-to-svg'
                  ? 'bg-gradient-to-r from-[#00D1FF]/20 to-[#8B5CF6]/20 text-[#00D1FF] dark:text-[#00D1FF] light:text-sky-600 border border-[#00D1FF]/40 shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-slate-600 light:hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PNG → SVG</span>
            </button>
            <button
              onClick={() => onSelectMode('svg-to-png')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMode === 'svg-to-png'
                  ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 text-[#A78BFA] dark:text-[#A78BFA] light:text-purple-600 border border-[#8B5CF6]/40 shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white dark:text-[#A1A1AA] dark:hover:text-white light:text-slate-600 light:hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SVG → PNG</span>
            </button>
          </nav>
        </div>

        {/* Navigation Anchor Links & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
            <a href="#workspace" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">
              Converter
            </a>
            <a href="#how-it-works" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#true-vector" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">
              True Paths
            </a>
            <a href="#faq" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Privacy Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>100% Client-Side</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-[#131318] dark:bg-[#131318] light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-[#A1A1AA] hover:text-white dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#00D1FF]" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
