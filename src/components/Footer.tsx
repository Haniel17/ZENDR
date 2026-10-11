import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onSelectMode?: (mode: 'png-to-svg' | 'svg-to-png') => void;
}

const currentYear = new Date().getFullYear();

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#040406]/75 backdrop-blur-xl py-6 text-xs text-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Row: Brand & Module Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/Zendr-icon.png"
              alt="ZENDR"
              className="w-4 h-4 object-contain opacity-80 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]"
            />
            <span className="text-[11px] font-mono text-white/50">ZENDR Studio</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-white/40">
            <Link to="/pdf-converter" className="hover:text-amber-400 transition-colors">
              PDF Tools
            </Link>
            <Link to="/pdf-editor" className="hover:text-amber-400 transition-colors">
              PDF Editor
            </Link>
            <Link to="/image-converter" className="hover:text-amber-400 transition-colors">
              Image Tools
            </Link>
            <Link to="/text-to-json" className="hover:text-amber-400 transition-colors">
              Data Tools
            </Link>
            <Link to="/image-compressor" className="hover:text-amber-400 transition-colors">
              Compressors
            </Link>
            <Link to="/document-converter" className="hover:text-amber-400 transition-colors">
              Office Docs
            </Link>
          </div>
        </div>

        {/* Bottom Row: All Rights Reserved & Privacy */}
        <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/30 gap-2">
          <span>© {currentYear} ZENDR. All rights reserved.</span>
          <span className="text-[10px] text-white/40">100% In-Browser Privacy • Zero Server Uploads</span>
        </div>
      </div>
    </footer>
  );
};
