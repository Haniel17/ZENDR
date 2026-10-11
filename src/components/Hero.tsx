import React from 'react';
import { Image, FileText, ArrowDown, Braces } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  onScrollToTools?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToTools }) => {
  return (
    <section className="pt-16 sm:pt-24 pb-10 text-center max-w-3xl mx-auto px-4 sm:px-6 select-none">
      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-5">
        Every file.{' '}
        <span className="font-editorial text-4xl sm:text-6xl md:text-7xl text-amber-400 tracking-wide font-normal inline-block lowercase drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]">
          one workspace.
        </span>
      </h1>

      {/* Supporting Text */}
      <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed font-normal">
        Fast, private file conversions, visual PDF editing, and multi-format data transformations in your browser.
      </p>

      {/* Direct Workspace Quick Launch Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
        <Link
          to="/pdf-converter"
          className="btn-primary text-sm px-5 py-2.5 rounded-lg"
        >
          <FileText className="w-4 h-4 text-black" />
          <span>Explore PDF Tools</span>
        </Link>

        <Link
          to="/image-converter"
          className="btn-secondary text-sm px-5 py-2.5 rounded-lg"
        >
          <Image className="w-4 h-4 text-amber-400" />
          <span>Image Studio</span>
        </Link>

        <Link
          to="/text-to-json"
          className="btn-secondary text-sm px-5 py-2.5 rounded-lg"
        >
          <Braces className="w-4 h-4 text-amber-400" />
          <span>Data Suite (8 Formats)</span>
        </Link>
      </div>

      {/* Minimalistic Scroll Indicator */}
      {onScrollToTools && (
        <div className="pt-8">
          <button
            onClick={onScrollToTools}
            className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white/80 transition-colors cursor-pointer group"
          >
            <span>Browse all tools</span>
            <ArrowDown className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-400 group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>
      )}
    </section>
  );
};

