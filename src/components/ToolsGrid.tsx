import React from 'react';
import { ConversionDirectory } from './ConversionDirectory';

export const ToolsGrid: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 select-none">
      {/* Format Conversions Directory */}
      <div className="space-y-4">
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

