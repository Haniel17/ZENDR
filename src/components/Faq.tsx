import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Is ZENDR really 100% free with no sign-up or paywalls?',
      answer: 'Yes! ZENDR is completely free, open for creative and commercial use, and requires zero account creation, subscription, or API keys. You can vectorize and rasterize as many images as you need.'
    },
    {
      question: 'Are my images uploaded to any remote server or cloud database?',
      answer: 'Never. All conversions happen entirely in your browser using WebAssembly, HTML5 Canvas, ImageTracer.js, and Canvg. Your images and vector paths never touch any backend server or third-party cloud.'
    },
    {
      question: 'Does PNG to SVG produce true vector paths or embedded images?',
      answer: 'ZENDR produces genuine vector geometry! We trace your bitmap pixels into mathematical bezier splines and polygonal SVG <path> elements with accurate fill and stroke colors. You can open the resulting SVG in Figma, Illustrator, or a text editor and manipulate every single coordinate.'
    },
    {
      question: 'How can I get the cleanest vector results from my raster images?',
      answer: 'For logos and illustrations, use the "Sharp / Logo" preset with 8–16 colors. For photos or gradients, use the "Detailed" or "Smooth" preset with 32–64 colors. Increasing "Noise Filter (Path Omit)" helps strip tiny unwanted speckles and smooths out edges.'
    },
    {
      question: 'Can I export high-resolution (2K/4K) PNGs from my SVG vector files?',
      answer: 'Yes! In the SVG → PNG mode, you can customize your width and height up to 8192×8192 pixels, lock the aspect ratio, and choose between transparent, dark, white, or custom background colors.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'ZENDR supports PNG, JPG, JPEG, and WEBP for vectorization into SVG, and valid SVG vector files for rasterization into 32-bit PNG.'
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 border-b border-white/[0.06] dark:border-white/[0.06] light:border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] text-xs font-mono mb-4 border border-[#00D1FF]/20">
            Knowledge Base
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600">
            Everything you need to know about ZENDR's conversion technology.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-[#131318]/70 dark:bg-[#131318]/70 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white dark:text-white light:text-slate-900">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-lg bg-white/5 text-[#A1A1AA] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00D1FF]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-600 leading-relaxed border-t border-white/5 dark:border-white/5 light:border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
