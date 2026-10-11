import React from 'react';
import { ZENDR_TOOLS } from '../modules/pdf/toolsCatalog';
import {
  Image,
  Edit3,
  FileText,
  ArrowRight,
  Braces,
  CheckCircle2,
  Sparkles,
  Layers,
  Code2,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConversionDirectory } from './ConversionDirectory';

const pdfCount = ZENDR_TOOLS.filter((t) => t.section === 'pdf').length;
const imageCount = ZENDR_TOOLS.filter((t) => t.section === 'image').length;
const dataCount = ZENDR_TOOLS.filter((t) => t.section === 'data').length;

export const ToolsGrid: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14 select-none">
      {/* 1. Core Studio Workspaces (3 Flagship Cards - Apple / Linear / Raycast Pattern) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        
        {/* =========================================================
            CARD 1: PDF Tools & Editor
            ========================================================= */}
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Ambient Top Light Wash */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-4 relative z-10">
            {/* Eyebrow & Status Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/80 font-bold block">
                    STUDIO 01
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    Document Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{pdfCount} Tools</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                PDF Tools &amp; Editor
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed font-normal">
                Full visual editor, page organizers (merge, split, rotate, extract), and two-way office conversions for Word, Excel, and PowerPoint.
              </p>
            </div>

            {/* In-Card Interactive Visual Artifact (design md pattern) */}
            <div className="rounded-2xl border border-white/[0.07] bg-black/40 p-3.5 space-y-2.5 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-white/60">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>contract_spec.pdf</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Private</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">E-Sign &amp; Stamp</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Layers className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Page Organizer</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Edit3 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">In-Page Text Edit</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">Word ⇄ PDF ⇄ XLSX</span>
                </div>
              </div>
            </div>

            {/* Actionable Quick Feature Link Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
              <Link
                to="/pdf-editor"
                className="px-2.5 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Sign &amp; Stamp
              </Link>
              <Link
                to="/pdf-editor"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Visual Editor
              </Link>
              <Link
                to="/pdf-converter/merge-pdf"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Merge &amp; Split
              </Link>
              <Link
                to="/pdf-converter/pdf-to-docx"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Word ⇄ PDF
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-2.5 pt-5 mt-5 border-t border-white/[0.06] relative z-10">
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
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Ambient Top Light Wash */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-4 relative z-10">
            {/* Eyebrow & Status Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/80 font-bold block">
                    STUDIO 02
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    Vector Graphics
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{imageCount} Tools</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Image Studio
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed font-normal">
                Precision client-side vectorizer: converts raster PNGs to clean vector SVGs with color quantization, plus instant SVG rasterization.
              </p>
            </div>

            {/* In-Card Interactive Visual Artifact (design md pattern) */}
            <div className="rounded-2xl border border-white/[0.07] bg-black/40 p-3.5 space-y-2.5 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-white/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>vector_render.svg</span>
                </span>
                <span className="text-amber-400 font-medium">
                  Zero Quality Loss
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">48 Bezier Curves</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">Color Quantization</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Image className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">PNG ➔ SVG Vector</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">HEIC / WEBP / JPG</span>
                </div>
              </div>
            </div>

            {/* Actionable Quick Feature Link Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
              <Link
                to="/image-converter/png-to-svg"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                PNG to SVG (Vector)
              </Link>
              <Link
                to="/image-converter/svg-to-png"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                SVG to PNG (Raster)
              </Link>
              <Link
                to="/image-converter/heic-to-png"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Apple HEIC
              </Link>
              <Link
                to="/image-compressor"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Compressor
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-2.5 pt-5 mt-5 border-t border-white/[0.06] relative z-10">
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
        <div className="group relative rounded-[28px] border border-white/[0.08] hover:border-amber-400/40 bg-gradient-to-b from-white/[0.05] via-[#090a0f]/90 to-[#06060a]/95 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] overflow-hidden">
          {/* Ambient Top Light Wash */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-400/10 blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500 rounded-full" />

          <div className="space-y-4 relative z-10">
            {/* Eyebrow & Status Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform">
                  <Braces className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/80 font-bold block">
                    STUDIO 03
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    Data Schema
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{dataCount} Tools</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
                Data &amp; Code Suite
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed font-normal">
                Bi-directional multi-format conversions: JSON, CSV tables, YAML DevOps configs, XML schemas, raw text logs &amp; Base64 encoding.
              </p>
            </div>

            {/* In-Card Interactive Visual Artifact (design md pattern) */}
            <div className="rounded-2xl border border-white/[0.07] bg-black/40 p-3.5 space-y-2.5 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pb-2 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5 text-white/60">
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>schema_payload.json</span>
                </span>
                <span className="text-cyan-400 font-medium">
                  Bi-Directional
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">JSON ⇄ CSV Table</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Braces className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">YAML DevOps Manifest</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">XML Schema Parser</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/70">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Base64 UTF-8 Codec</span>
                </div>
              </div>
            </div>

            {/* Actionable Quick Feature Link Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
              <Link
                to="/csv-to-json"
                className="px-2.5 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                CSV ➔ JSON
              </Link>
              <Link
                to="/json-to-csv"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                JSON ➔ CSV
              </Link>
              <Link
                to="/yaml-to-json"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                YAML ⇄ JSON
              </Link>
              <Link
                to="/base64-converter"
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Base64 Codec
              </Link>
            </div>
          </div>

          {/* Bottom Action Pill Dock */}
          <div className="flex items-center gap-2.5 pt-5 mt-5 border-t border-white/[0.06] relative z-10">
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
