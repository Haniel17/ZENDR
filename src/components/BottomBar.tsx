import React from 'react';

export const BottomBar: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <div>
          <span>ZENDR Studio — In-browser image converter. Zero server storage.</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>By using this tool, you accept its terms of use.</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]" title="Client-Side Privacy Active">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};
