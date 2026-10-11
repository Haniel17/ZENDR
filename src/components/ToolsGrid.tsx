import React from 'react';
import { ZENDR_TOOLS } from '../modules/pdf/toolsCatalog';
import {
  Image,
  Edit3,
  FileText,
  ArrowRight,
  Braces
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConversionDirectory } from './ConversionDirectory';

const pdfCount = ZENDR_TOOLS.filter((t) => t.section === 'pdf').length;
const imageCount = ZENDR_TOOLS.filter((t) => t.section === 'image').length;
const dataCount = ZENDR_TOOLS.filter((t) => t.section === 'data').length;

export const ToolsGrid: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14 select-none">
      {/* 1. Core Studio Workspaces (3 Flagship Cards - Decluttered Apple Pattern) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        
        {/* =========================================================
            CARD 1: PDF Tools & Editor
            ========================================================= */}
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Subtle Top Ambient Glow on Hover */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-5 relative z-10">
            {/* Header: Icon & Clean Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{pdfCount} Tools • Private</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                PDF Tools &amp; Editor
              </h2>
              <p className="text-sm text-white/60 leading-relaxed font-normal">
                Full visual editor, page organizers (merge, split, rotate), and two-way office conversions for Word, Excel, and PowerPoint.
              </p>
            </div>

            {/* Curated Interactive Feature Pills (Single clean row, zero duplication) */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
              <Link
                to="/pdf-editor"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Sign &amp; Stamp
              </Link>
              <Link
                to="/pdf-editor"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Visual Editor
              </Link>
              <Link
                to="/pdf-converter/merge-pdf"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Merge &amp; Split
              </Link>
              <Link
                to="/pdf-converter/pdf-to-docx"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Word ⇄ PDF
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06] relative z-10">
            <Link
              to="/pdf-converter"
              className="btn-primary text-xs px-5 py-2.5 rounded-full flex-1 flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
            >
              <span>Open PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/pdf-editor"
              className="btn-secondary text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editor</span>
            </Link>
          </div>
        </div>

        {/* =========================================================
            CARD 2: Image Studio
            ========================================================= */}
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Subtle Top Ambient Glow on Hover */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-5 relative z-10">
            {/* Header: Icon & Clean Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                <Image className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{imageCount} Tools • Client-Side</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Image Studio
              </h2>
              <p className="text-sm text-white/60 leading-relaxed font-normal">
                Precision client-side vectorizer: converts raster PNGs to clean vector SVGs with color quantization, plus instant SVG rasterization.
              </p>
            </div>

            {/* Curated Interactive Feature Pills (Single clean row, zero duplication) */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
              <Link
                to="/image-converter/png-to-svg"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                PNG to SVG (Vector)
              </Link>
              <Link
                to="/image-converter/svg-to-png"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                SVG to PNG (Raster)
              </Link>
              <Link
                to="/image-converter/heic-to-png"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Apple HEIC
              </Link>
              <Link
                to="/image-compressor"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Compressor
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06] relative z-10">
            <Link
              to="/image-converter"
              className="btn-primary text-xs px-5 py-2.5 rounded-full flex-1 flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
            >
              <span>Open Image Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/image-converter/png-to-svg"
              className="btn-secondary text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
            >
              <span>PNG → SVG</span>
            </Link>
          </div>
        </div>

        {/* =========================================================
            CARD 3: Data & Code Suite
            ========================================================= */}
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Subtle Top Ambient Glow on Hover */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-5 relative z-10">
            {/* Header: Icon & Clean Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                <Braces className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{dataCount} Tools • Client-Side</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Data &amp; Code Suite
              </h2>
              <p className="text-sm text-white/60 leading-relaxed font-normal">
                Bi-directional multi-format conversions: JSON, CSV tables, YAML DevOps configs, XML schemas, raw text logs &amp; Base64 encoding.
              </p>
            </div>

            {/* Curated Interactive Feature Pills (Single clean row, zero duplication) */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
              <Link
                to="/csv-to-json"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                CSV ➔ JSON
              </Link>
              <Link
                to="/json-to-csv"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                JSON ➔ CSV
              </Link>
              <Link
                to="/yaml-to-json"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                YAML ⇄ JSON
              </Link>
              <Link
                to="/base64-converter"
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95"
              >
                Base64 Codec
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06] relative z-10">
            <Link
              to="/text-to-json"
              className="btn-primary text-xs px-5 py-2.5 rounded-full flex-1 flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.25)]"
            >
              <span>Open Data Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/csv-to-json"
              className="btn-secondary text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5"
            >
              <span>CSV ➔ JSON</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 2. Format Conversions Directory */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Format Conversions Directory
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-normal">
              Direct access to all image, document, and ebook conversions. 100% in-browser.
            </p>
          </div>
        </div>

        <ConversionDirectory />
      </div>
    </section>
  );
};
