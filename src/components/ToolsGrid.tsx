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
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 select-none">
      {/* 1. Core Studio Workspaces (3 Flagship Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* PDF Suite Studio Card */}
        <div className="group relative rounded-[28px] liquid-glass-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-0.5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <FileText className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                {pdfCount} Tools • Client-Side
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                PDF Tools &amp; Editor
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
                Full visual editor, page organizers (merge, split, rotate, extract), and two-way office conversions for Word, Excel, and PowerPoint.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono text-white/50">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">Sign &amp; Stamp</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Visual Editor</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Merge &amp; Split</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Word ⇄ PDF</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/pdf-converter"
              className="btn-primary text-xs px-4 py-2 rounded-full"
            >
              <span>Open PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/pdf-editor"
              className="btn-secondary text-xs px-4 py-2 rounded-full"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Visual Editor</span>
            </Link>
          </div>
        </div>

        {/* Image Studio Card */}
        <div className="group relative rounded-[28px] liquid-glass-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-0.5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <Image className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                {imageCount} Tools • Client-Side
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Image Studio
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
                Precision client-side vectorizer: converts raster PNGs to clean vector SVGs with color quantization, plus instant SVG rasterization.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono text-white/50">
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">PNG to SVG (Vector)</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">SVG to PNG (Raster)</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Quantization</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Zero Upload</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/image-converter"
              className="btn-primary text-xs px-4 py-2 rounded-full"
            >
              <span>Open Image Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/image-converter/png-to-svg"
              className="btn-secondary text-xs px-4 py-2 rounded-full"
            >
              <span>PNG → SVG</span>
            </Link>
          </div>
        </div>

        {/* Data & Code Suite Studio Card */}
        <div className="group relative rounded-[28px] liquid-glass-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-0.5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <Braces className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                {dataCount} Tools • Client-Side
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Data &amp; Code Suite
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
                Bi-directional multi-format conversions: JSON, CSV tables, YAML DevOps configs, XML schemas, raw text logs &amp; Base64 encoding.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono text-white/50">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">JSON ⇄ CSV</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">JSON ⇄ YAML</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">XML ⇄ JSON</span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">Base64</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/text-to-json"
              className="btn-primary text-xs px-4 py-2 rounded-full"
            >
              <span>Open Data Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/csv-to-json"
              className="btn-secondary text-xs px-4 py-2 rounded-full"
            >
              <span>CSV ➔ JSON</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Format Conversions Directory (From Screenshot) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Format Conversions Directory
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Direct access to all image, document, and ebook conversions. 100% in-browser.
            </p>
          </div>
        </div>

        <ConversionDirectory />
      </div>
    </section>
  );
};
