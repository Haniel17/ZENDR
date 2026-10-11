import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ZENDR_TOOLS } from '../pdf/toolsCatalog';
import {
  Search,
  PenTool,
  Layers,
  Image,
  FileImage,
  ArrowRight,
  Minimize2,
  Crop,
  Scaling,
  RotateCw,
  Pipette,
  Film
} from 'lucide-react';

export const ImageToolsMenu: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const imageTools = useMemo(() => {
    return ZENDR_TOOLS.filter((t) => t.section === 'image');
  }, []);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return imageTools;

    return imageTools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.supportedInputExtensions.some((ext) => ext.toLowerCase().includes(q)) ||
        t.outputExtension.toLowerCase().includes(q) ||
        (t.badge && t.badge.toLowerCase().includes(q))
    );
  }, [imageTools, searchQuery]);

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-amber-400' };
    switch (iconName) {
      case 'PenTool':
        return <PenTool {...props} />;
      case 'Crop':
        return <Crop {...props} />;
      case 'Scaling':
        return <Scaling {...props} />;
      case 'RotateCw':
        return <RotateCw {...props} />;
      case 'Pipette':
        return <Pipette {...props} />;
      case 'Film':
        return <Film {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'FileImage':
        return <FileImage {...props} />;
      case 'Minimize2':
        return <Minimize2 {...props} />;
      case 'Image':
      default:
        return <Image {...props} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 select-none">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Image Tools <span className="font-editorial text-amber-400 lowercase">menu.</span>
        </h1>

        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          Convert and compress between Apple HEIC, modern WEBP, camera JFIF, lossless PNG, standard JPG, and scalable SVG vectors.
        </p>
      </div>

      {/* 2. Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="text-xs font-mono text-white/50">
          Showing {filteredTools.length} image conversion tools
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search image tools (e.g. heic, webp, svg)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/40 text-xs focus:outline-none focus:border-amber-400/50 transition-colors"
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

      {/* 3. Image Tool Cards Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-white/10 bg-white/[0.02] space-y-3">
          <p className="text-white/60 text-sm">No image tools found matching "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-amber-400 text-xs underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.route}
              className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/40 p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center transition-colors group-hover:border-amber-400/30">
                    {renderIcon(tool.iconName)}
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-white/[0.04] border border-white/10 text-white/70 group-hover:text-amber-400 group-hover:border-amber-400/30 transition-colors">
                    {tool.badge || 'Image Tool'}
                  </span>
                </div>

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

              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-white/40">In-Browser</span>

                <div className="flex items-center gap-1.5 font-semibold text-white/80 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
