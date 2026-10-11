import React from 'react';
import { UploadCloud, Sliders, Cpu, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Drop & Select Mode',
      desc: 'Drag & drop any PNG, JPG or SVG file. Choose whether you want to trace raster pixels into vectors or rasterize vector shapes into PNG.',
      icon: UploadCloud,
      color: 'from-[#00D1FF] to-[#00A3FF]',
      border: 'border-[#00D1FF]/30'
    },
    {
      step: '02',
      title: 'Tweak Precision Parameters',
      desc: 'Adjust color palettes, spline curve smoothing, straight-line threshold, noise suppression, or scale canvas dimensions up to 4K.',
      icon: Sliders,
      color: 'from-[#8B5CF6] to-[#7C3AED]',
      border: 'border-[#8B5CF6]/30'
    },
    {
      step: '03',
      title: 'Client-Side Processing',
      desc: 'ImageTracer.js traces contours directly in your browser while Canvg executes GPU-accelerated canvas renders. 0 bytes sent to external servers.',
      icon: Cpu,
      color: 'from-[#00D1FF] to-[#8B5CF6]',
      border: 'border-[#00D1FF]/30'
    },
    {
      step: '04',
      title: 'Inspect & Download',
      desc: 'Use the interactive split slider to compare before and after, copy raw SVG XML code directly, or download production-ready files.',
      icon: Download,
      color: 'from-[#EC4899] to-[#8B5CF6]',
      border: 'border-pink-500/30'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-white/[0.06] dark:border-white/[0.06] light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] text-xs font-mono mb-4 border border-[#00D1FF]/20">
            Pipeline Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight mb-4">
            How ZENDR Converts Your Graphics
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
            A 100% browser-native engine designed for designers, developers, and creators who need clean assets in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative rounded-2xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 p-6 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:scale-[1.02] shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white/40 to-white/10 dark:from-white/40 dark:to-white/10 light:from-slate-400 light:to-slate-200">
                      {s.step}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 mb-2 group-hover:text-[#00D1FF] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 dark:border-white/5 light:border-slate-100 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                  <span>Step {s.step}</span>
                  <span className="text-emerald-400">Zero Latency</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
