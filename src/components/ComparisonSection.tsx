import React from 'react';
import { Check, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="true-vector" className="py-20 border-b border-white/[0.06] dark:border-white/[0.06] light:border-slate-200 bg-[#09090B]/50 dark:bg-[#09090B]/50 light:bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#A78BFA] text-xs font-mono mb-4 border border-[#8B5CF6]/20">
            True Vector Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight mb-4">
            Real SVG Paths vs. Fake Base64 Wrappers
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
            Most online "PNG to SVG" converters simply wrap your bitmap in a <code className="text-rose-400 font-mono">&lt;image&gt;</code> tag. ZENDR traces genuine mathematical contours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* FAKE CONVERTER TRAP */}
          <div className="rounded-2xl bg-[#131318]/90 dark:bg-[#131318]/90 light:bg-white border border-rose-500/20 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-rose-500/10 border-b border-l border-rose-500/20 rounded-bl-xl text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Generic Converters</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                    The Fake Base64 Trick
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Embeds the raster PNG inside an SVG wrapper
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="rounded-xl bg-[#09090B] p-4 font-mono text-xs text-rose-300 border border-rose-500/10 mb-6 overflow-x-auto">
                <span className="text-[#A1A1AA]">&lt;!-- Not actually a vector graphic! --&gt;</span>
                <br />
                &lt;<span className="text-pink-400">svg</span> xmlns="..." width="400"&gt;
                <br />
                &nbsp;&nbsp;&lt;<span className="text-pink-400">image</span> href="<span className="text-rose-400 font-bold">data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...</span>" /&gt;
                <br />
                &lt;/<span className="text-pink-400">svg</span>&gt;
              </div>

              {/* Drawbacks list */}
              <ul className="space-y-3 text-xs text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Pixelates when scaled:</strong> Still made of raster pixels, becoming blurry when resized or printed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Cannot edit nodes:</strong> Figma, Illustrator, and Inkscape cannot select or modify individual paths.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Fails for fabrication:</strong> CNC machines, laser cutters, vinyl cutters, and embroidery reject it.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Inflated file sizes:</strong> Base64 increases the raster image byte size by 33%.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-rose-400">
              <span>Status: Pseudo-Vector</span>
              <span>Zoom Quality: Blurry</span>
            </div>
          </div>

          {/* ZENDR TRUE VECTORIZATION */}
          <div className="rounded-2xl bg-[#131318]/90 dark:bg-[#131318]/90 light:bg-white border border-[#00D1FF]/40 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#00D1FF]/10 border-b border-l border-[#00D1FF]/30 rounded-bl-xl text-[#00D1FF] text-xs font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ZENDR Engine</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-[#00D1FF]/15 text-[#00D1FF]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                    True Bezier Vector Paths
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Traces actual mathematical splines, shapes &amp; layers
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="rounded-xl bg-[#09090B] p-4 font-mono text-xs text-[#00D1FF] border border-[#00D1FF]/20 mb-6 overflow-x-auto">
                <span className="text-[#A1A1AA]">&lt;!-- Real mathematical coordinates &amp; colors --&gt;</span>
                <br />
                &lt;<span className="text-sky-400">svg</span> viewBox="0 0 400 400"&gt;
                <br />
                &nbsp;&nbsp;&lt;<span className="text-sky-400">path</span> fill="<span className="text-emerald-400">#00D1FF</span>" d="<span className="text-purple-300 font-bold">M 12 34 Q 85 110 160 85 L 210 140 Z</span>" /&gt;
                <br />
                &nbsp;&nbsp;&lt;<span className="text-sky-400">path</span> fill="<span className="text-purple-400">#8B5CF6</span>" d="<span className="text-purple-300 font-bold">M 160 85 Q 240 45 320 120 Z</span>" /&gt;
                <br />
                &lt;/<span className="text-sky-400">svg</span>&gt;
              </div>

              {/* Advantages list */}
              <ul className="space-y-3 text-xs text-[#FAFAFA] dark:text-[#FAFAFA] light:text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                  <span><strong>Infinitely Scalable:</strong> Zoom to 10,000% or print on a 50-foot billboard with razor-sharp edges.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                  <span><strong>Editable in Design Tools:</strong> Import into Figma, Adobe Illustrator, or Affinity to restyle every node.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                  <span><strong>Fabrication-Ready:</strong> Works with Cricut, glowforge laser cutters, CNC milling, and vinyl plotters.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                  <span><strong>CSS &amp; SVG Animatable:</strong> Color paths dynamically with CSS, Tailwind, or Framer Motion.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#00D1FF]">
              <span>Status: Pure Vector Geometry</span>
              <span>Zoom Quality: 100% Crisp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
