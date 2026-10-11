import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, FileText, ArrowUpRight, Minimize2, Edit3, Braces } from 'lucide-react';

interface ToolItem {
  name: string;
  route: string;
  badge?: string;
}

// 1. File Conversions (Image & Office/PDF)
const IMAGE_CONVERSIONS: ToolItem[] = [
  { name: 'Image Converter', route: '/image-converter/image-converter', badge: 'Universal' },
  { name: 'WEBP to PNG', route: '/image-converter/webp-to-png' },
  { name: 'PNG to WEBP', route: '/image-converter/png-to-webp' },
  { name: 'JFIF to PNG', route: '/image-converter/jfif-to-png' },
  { name: 'PNG to SVG', route: '/image-converter/png-to-svg', badge: 'Vectorize' },
  { name: 'SVG to PNG', route: '/image-converter/svg-to-png', badge: 'Raster' },
  { name: 'HEIC to JPG', route: '/image-converter/heic-to-jpg', badge: 'Apple' },
  { name: 'HEIC to PNG', route: '/image-converter/heic-to-png', badge: 'Apple' },
  { name: 'WEBP to JPG', route: '/image-converter/webp-to-jpg' },
  { name: 'JPG to WEBP', route: '/image-converter/jpg-to-webp' },
  { name: 'SVG Converter', route: '/image-converter/svg-converter', badge: 'Raster' }
];

const PDF_DOC_CONVERSIONS: ToolItem[] = [
  { name: 'PDF Converter', route: '/pdf-converter', badge: 'Hub' },
  { name: 'Document Converter', route: '/document-converter', badge: 'Office' },
  { name: 'Ebook Converter', route: '/pdf-converter/ebook-converter', badge: 'Ebook' },
  { name: 'PDF to Word', route: '/pdf-converter/pdf-to-docx' },
  { name: 'DOCX to PDF', route: '/pdf-converter/docx-to-pdf' },
  { name: 'PDF to Excel', route: '/pdf-converter/pdf-to-xlsx' },
  { name: 'Excel (XLSX) to PDF', route: '/pdf-converter/xlsx-to-pdf' },
  { name: 'PDF to PowerPoint', route: '/pdf-converter/pdf-to-pptx' },
  { name: 'PowerPoint (PPTX) to PDF', route: '/pdf-converter/pptx-to-pdf' },
  { name: 'PDF to Text', route: '/pdf-converter/pdf-to-txt' },
  { name: 'Text to PDF', route: '/pdf-converter/txt-to-pdf' },
  { name: 'PDF to JPG', route: '/pdf-converter/pdf-to-jpg' },
  { name: 'JPG to PDF', route: '/pdf-converter/jpg-to-pdf' },
  { name: 'PDF to PNG', route: '/pdf-converter/pdf-to-png' },
  { name: 'PNG to PDF', route: '/pdf-converter/png-to-pdf' },
  { name: 'PDF to EPUB', route: '/pdf-converter/pdf-to-epub' },
  { name: 'EPUB to PDF', route: '/pdf-converter/epub-to-pdf' },
  { name: 'HEIC to PDF', route: '/pdf-converter/heic-to-pdf' }
];

// 2. Data & Text Conversions (Text to JSON, CSV, YAML, XML, Base64)
const DATA_CONVERSIONS_INPUT: ToolItem[] = [
  { name: 'Text to JSON', route: '/text-to-json', badge: 'Universal JSON' },
  { name: 'CSV to JSON', route: '/csv-to-json', badge: 'Table to JSON' },
  { name: 'YAML to JSON', route: '/yaml-to-json', badge: 'Config' },
  { name: 'XML to JSON', route: '/xml-to-json', badge: 'Markup' }
];

const DATA_CONVERSIONS_OUTPUT: ToolItem[] = [
  { name: 'JSON to CSV', route: '/json-to-csv', badge: 'Spreadsheet' },
  { name: 'JSON to YAML', route: '/json-to-yaml', badge: 'Config' },
  { name: 'JSON to XML', route: '/json-to-xml', badge: 'Markup' },
  { name: 'Base64 Encoder / Decoder', route: '/base64-converter', badge: 'UTF-8' }
];

// 3. Compressors
const IMAGE_COMPRESSORS: ToolItem[] = [
  { name: 'Image Compressor', route: '/image-compressor', badge: 'Universal' },
  { name: 'JPEG Compressor', route: '/jpeg-compressor', badge: 'JPEG' },
  { name: 'PNG Compressor', route: '/png-compressor', badge: 'Quantize' }
];

const PDF_DOC_COMPRESSORS: ToolItem[] = [
  { name: 'PDF Compressor', route: '/pdf-compressor', badge: 'Stream Optimize' }
];

// 4. Tools & Editors
const IMAGE_TOOLS: ToolItem[] = [
  { name: 'GIF Maker', route: '/gif-maker', badge: 'Animated' },
  { name: 'Resize Image', route: '/resize-image', badge: 'Scale' },
  { name: 'Crop Image', route: '/crop-image', badge: 'Aspect' },
  { name: 'Color Picker', route: '/color-picker', badge: 'Palette' },
  { name: 'Rotate Image', route: '/rotate-image', badge: 'Angle' },
  { name: 'Flip Image', route: '/flip-image', badge: 'Mirror' },
  { name: 'Image Enlarger', route: '/image-enlarger', badge: '2x / 4x' }
];

const PDF_TOOLS: ToolItem[] = [
  { name: 'Edit PDF', route: '/pdf-editor', badge: 'Visual' },
  { name: 'Annotate PDF', route: '/pdf-editor', badge: 'Notes' },
  { name: 'E-sign', route: '/pdf-editor', badge: 'Signatures' },
  { name: 'Create Fillable PDF', route: '/pdf-editor', badge: 'Forms' },
  { name: 'PDF Reader', route: '/pdf-editor', badge: 'Reader' },
  { name: 'PDF Merge', route: '/pdf-converter/merge-pdf', badge: 'Merge' },
  { name: 'PDF Split', route: '/pdf-converter/split-pdf', badge: 'Split' },
  { name: 'Flatten PDF', route: '/pdf-converter/flatten-pdf', badge: 'Flatten' },
  { name: 'Resize PDF', route: '/pdf-converter/resize-pdf', badge: 'Paper' },
  { name: 'Unlock PDF', route: '/pdf-converter/unlock-pdf', badge: 'Decrypt' },
  { name: 'Rotate PDF', route: '/pdf-converter/rotate-pdf', badge: 'Rotate' },
  { name: 'Protect PDF', route: '/pdf-converter/protect-pdf', badge: 'Security' },
  { name: 'Crop PDF', route: '/pdf-converter/crop-pdf', badge: 'Margins' },
  { name: 'Organize PDF', route: '/pdf-editor', badge: 'Reorder' },
  { name: 'Extract image from PDF', route: '/pdf-converter/extract-image-from-pdf', badge: 'Extract' },
  { name: 'PDF page remover', route: '/pdf-converter/pdf-page-remover', badge: 'Delete' },
  { name: 'Extract Pages from PDF', route: '/pdf-converter/extract-pages', badge: 'Pull' }
];

export const ConversionDirectory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'data' | 'compress' | 'tools'>('convert');

  let imageItems: ToolItem[];
  let pdfDocItems: ToolItem[];
  let imageColTitle = 'Image';
  let pdfColTitle = 'PDF & Documents';
  let leftExploreLink = '/image-converter';
  let rightExploreLink = '/pdf-converter';

  if (activeTab === 'convert') {
    imageItems = IMAGE_CONVERSIONS;
    pdfDocItems = PDF_DOC_CONVERSIONS;
    leftExploreLink = '/image-converter';
    rightExploreLink = '/pdf-converter';
  } else if (activeTab === 'data') {
    imageItems = DATA_CONVERSIONS_INPUT;
    pdfDocItems = DATA_CONVERSIONS_OUTPUT;
    imageColTitle = 'Text & Ingestion';
    pdfColTitle = 'Data Formats & Output';
    leftExploreLink = '/text-to-json';
    rightExploreLink = '/text-to-json';
  } else if (activeTab === 'compress') {
    imageItems = IMAGE_COMPRESSORS;
    pdfDocItems = PDF_DOC_COMPRESSORS;
    imageColTitle = 'Image Compressors';
    pdfColTitle = 'PDF Compressor';
    leftExploreLink = '/image-compressor';
    rightExploreLink = '/pdf-compressor';
  } else {
    imageItems = IMAGE_TOOLS;
    pdfDocItems = PDF_TOOLS;
    imageColTitle = 'Image Tools';
    pdfColTitle = 'PDF Tools';
    leftExploreLink = '/image-editor';
    rightExploreLink = '/pdf-editor';
  }

  return (
    <div className="w-full space-y-4">
      {/* Category Tab Switcher: Convert vs Data vs Compress vs Tools */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <button
            onClick={() => setActiveTab('convert')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium active:scale-[0.95] transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'convert'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            File Conversions (29)
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium active:scale-[0.95] transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'data'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Data &amp; Code Suite (8)</span>
          </button>

          <button
            onClick={() => setActiveTab('compress')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium active:scale-[0.95] transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'compress'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Compressors (4)</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium active:scale-[0.95] transition-all duration-200 cursor-pointer select-none ${
              activeTab === 'tools'
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Tools &amp; Editors (24)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/40 hidden sm:inline">
          {activeTab === 'convert'
            ? '29 client-side image, office, and document transformers'
            : activeTab === 'data'
            ? '7 text-to-json, CSV, YAML, XML, and data converters'
            : activeTab === 'compress'
            ? '4 dedicated in-browser file size reducers'
            : '24 interactive tools, visual editors & PDF managers'}
        </div>
      </div>

      {/* Two-Column Directory Panel */}
      <div 
        className="w-full rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] via-[#090a0f]/90 to-[#06060a]/95 backdrop-blur-2xl overflow-hidden shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.16)]"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Table Headers */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/[0.08]">
          {/* Left Column Header: Image */}
          <div className="md:col-span-4 px-6 sm:px-8 py-5 flex items-center justify-between border-b md:border-b-0 md:border-r border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{imageColTitle}</h2>
                <p className="text-[11px] text-white/50 font-mono">
                  {imageItems.length} {activeTab === 'convert' ? 'Converters' : activeTab === 'compress' ? 'Compressors' : 'Editor Tools'}
                </p>
              </div>
            </div>
            <Link
              to={leftExploreLink}
              className="text-[11px] font-mono text-amber-400 hover:text-black hover:bg-amber-400 flex items-center gap-1 transition-all px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 active:scale-95 shadow-sm"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Right Column Header: PDF */}
          <div className="md:col-span-8 px-6 sm:px-8 py-5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-400/5 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{pdfColTitle}</h2>
                <p className="text-[11px] text-white/50 font-mono">
                  {pdfDocItems.length} {activeTab === 'convert' ? 'Converters' : activeTab === 'compress' ? 'Compressor' : activeTab === 'data' ? 'Formats' : 'PDF Tools'}
                </p>
              </div>
            </div>
            <Link
              to={rightExploreLink}
              className="text-[11px] font-mono text-amber-400 hover:text-black hover:bg-amber-400 flex items-center gap-1 transition-all px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 active:scale-95 shadow-sm"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {/* Left List: Image Tools */}
          <div className="md:col-span-4 p-4 sm:p-6 space-y-1">
            {imageItems.map((item) => (
              <Link
                key={item.name}
                to={item.route}
                className="group flex items-center justify-between px-3.5 py-2.5 rounded-full hover:bg-white/[0.06] hover:border hover:border-white/10 border border-transparent transition-all duration-150 active:scale-[0.98] cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-400 transition-colors duration-150" />
                  <span className="text-sm font-medium text-white/80 group-hover:text-amber-400 transition-colors duration-150">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-white/50 group-hover:text-amber-400/90 group-hover:border-amber-400/30 transition-colors duration-150">
                      {item.badge}
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-amber-400 transition-colors duration-150" />
                </div>
              </Link>
            ))}
          </div>

          {/* Right List: PDF Tools */}
          <div className="md:col-span-8 p-4 sm:p-6">
            <div className={`grid gap-1 ${activeTab === 'tools' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : activeTab === 'convert' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {pdfDocItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.route}
                  className="group flex items-center justify-between px-3.5 py-2.5 rounded-full hover:bg-white/[0.06] hover:border hover:border-white/10 border border-transparent transition-all duration-150 active:scale-[0.98] cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-amber-400 shrink-0 transition-colors" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-white/50 group-hover:text-amber-400/80 group-hover:border-amber-400/30 transition-colors">
                        {item.badge}
                      </span>
                    )}
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
