import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ZENDR_TOOLS } from './toolsCatalog';
import type { PdfSubCategory } from './types';
import {
  Search,
  Edit3,
  Merge,
  Scissors,
  FileCheck,
  RotateCw,
  Minimize2,
  ArrowDownUp,
  FileText,
  Table,
  Presentation,
  FileArchive,
  FileUp,
  FileImage,
  Image,
  ArrowRight,
  PenTool,
  Layers
} from 'lucide-react';

const CATEGORY_TABS: Array<{ id: 'all' | PdfSubCategory; label: string; count?: number }> = [
  { id: 'all', label: 'All PDF Tools' },
  { id: 'editor', label: 'Editor & Sign' },
  { id: 'organize', label: 'Organize & Pages' },
  { id: 'convert-from-pdf', label: 'Convert from PDF' },
  { id: 'convert-to-pdf', label: 'Convert to PDF' }
];

export const PdfToolsMenu: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | PdfSubCategory>('all');

  const pdfTools = useMemo(() => {
    return ZENDR_TOOLS.filter((t) => t.section === 'pdf');
  }, []);

  const filteredTools = useMemo(() => {
    return pdfTools.filter((tool) => {
      // Category tab filter
      const matchesCategory =
        selectedCategory === 'all' || tool.subCategory === selectedCategory;

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.supportedInputExtensions.some((ext) => ext.toLowerCase().includes(q)) ||
        tool.outputExtension.toLowerCase().includes(q) ||
        (tool.badge && tool.badge.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [pdfTools, selectedCategory, searchQuery]);

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-amber-400' };
    switch (iconName) {
      case 'Edit3':
        return <Edit3 {...props} />;
      case 'Merge':
        return <Merge {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'FileCheck':
        return <FileCheck {...props} />;
      case 'RotateCw':
        return <RotateCw {...props} />;
      case 'Minimize2':
        return <Minimize2 {...props} />;
      case 'ArrowDownUp':
        return <ArrowDownUp {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Table':
        return <Table {...props} />;
      case 'Presentation':
        return <Presentation {...props} />;
      case 'FileArchive':
        return <FileArchive {...props} />;
      case 'FileUp':
        return <FileUp {...props} />;
      case 'FileImage':
        return <FileImage {...props} />;
      case 'Image':
        return <Image {...props} />;
      default:
        return <FileText {...props} />;
    }
  };

  const renderToolCard = (tool: (typeof ZENDR_TOOLS)[0]) => {
    const isEditor = tool.id === 'pdf-editor';

    return (
      <Link
        key={tool.id}
        to={tool.route}
        className={`group relative rounded-3xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
          isEditor
            ? 'border-amber-400/40 bg-gradient-to-b from-amber-400/[0.08] to-white/[0.02] hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]'
            : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]'
        }`}
      >
        <div className="space-y-3.5">
          {/* Top Row: Icon & Badges */}
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-amber-400/30">
              {renderIcon(tool.iconName)}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/[0.04] border border-white/10 text-white/70 group-hover:text-amber-400 group-hover:border-amber-400/30 transition-colors">
                {tool.badge || 'Tool'}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wide">
                {tool.supportedInputExtensions[0]} → {tool.outputExtension}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors">
              {tool.title}
            </h3>
            <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[11px] font-mono text-white/40">
            <span>Client-side</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-white/80 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
            <span>Open Tool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    );
  };

  // Grouped sections for the default "all" view
  const editorTools = useMemo(() => pdfTools.filter((t) => t.subCategory === 'editor'), [pdfTools]);
  const organizeTools = useMemo(() => pdfTools.filter((t) => t.subCategory === 'organize'), [pdfTools]);
  const fromPdfTools = useMemo(() => pdfTools.filter((t) => t.subCategory === 'convert-from-pdf'), [pdfTools]);
  const toPdfTools = useMemo(() => pdfTools.filter((t) => t.subCategory === 'convert-to-pdf'), [pdfTools]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 select-none">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          PDF Tools <span className="font-editorial text-amber-400 lowercase">menu.</span>
        </h1>

        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          Select any tool below to edit, organize, or convert your documents. All processing runs entirely inside your browser.
        </p>
      </div>

      {/* 2. Search & Category Switcher Bar */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                      : 'bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.07] border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search PDF tools (e.g. word, merge, sign)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filtered Grid / Category Layout */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-white/10 bg-white/[0.02] space-y-3">
          <p className="text-white/60 text-sm">No PDF tools found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-amber-400 text-xs underline cursor-pointer"
          >
            Clear filters and search
          </button>
        </div>
      ) : selectedCategory === 'all' && !searchQuery ? (
        /* Categorized Grouping when viewing All */
        <div className="space-y-12">
          {/* Section: Flagship Editor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <PenTool className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Interactive Editor &amp; Sign</h2>
              <span className="text-[11px] font-mono text-white/40">• 1 Workspace</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editorTools.map((t) => renderToolCard(t))}
            </div>
          </div>

          {/* Section: Organize & Pages */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Organize &amp; Page Tools</h2>
              <span className="text-[11px] font-mono text-white/40">• {organizeTools.length} Tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizeTools.map((t) => renderToolCard(t))}
            </div>
          </div>

          {/* Section: Convert from PDF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Convert from PDF (Export to Office)</h2>
              <span className="text-[11px] font-mono text-white/40">• {fromPdfTools.length} Tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fromPdfTools.map((t) => renderToolCard(t))}
            </div>
          </div>

          {/* Section: Convert to PDF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <FileUp className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Convert to PDF (Create PDF)</h2>
              <span className="text-[11px] font-mono text-white/40">• {toPdfTools.length} Tools</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toPdfTools.map((t) => renderToolCard(t))}
            </div>
          </div>
        </div>
      ) : (
        /* Filtered Flat Grid */
        <div className="space-y-4">
          <div className="text-xs text-white/40 font-mono">
            Showing {filteredTools.length} tools
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((t) => renderToolCard(t))}
          </div>
        </div>
      )}
    </div>
  );
};
