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
        <div className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20">
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
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">Sign &amp; Stamp</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Visual Editor</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Merge &amp; Split</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Word ⇄ PDF</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/pdf-converter"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            >
              <span>Open PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/pdf-editor"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Visual Editor</span>
            </Link>
          </div>
        </div>

        {/* Image Studio Card */}
        <div className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Image className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20">
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
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">PNG to SVG (Vector)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">SVG to PNG (Raster)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Quantization</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Zero Upload</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/image-converter"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            >
              <span>Open Image Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/image-converter/png-to-svg"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            >
              <span>PNG → SVG</span>
            </Link>
          </div>
        </div>

        {/* Data & Code Suite Studio Card */}
        <div className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <Braces className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono text-amber-400/90 bg-amber-400/10 border border-amber-400/20">
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
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400">JSON ⇄ CSV</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">JSON ⇄ YAML</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">XML ⇄ JSON</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">Base64</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/[0.06]">
            <Link
              to="/text-to-json"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
            >
              <span>Open Data Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/csv-to-json"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-transform transition-colors duration-75 active:scale-95 cursor-pointer select-none"
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
