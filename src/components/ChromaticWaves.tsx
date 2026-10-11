import React from 'react';

/**
 * Ultra-responsive, GPU-accelerated Chromatic Waves background.
 * Uses hardware-accelerated CSS and optimized vector gradients
 * with ZERO software-filter CPU lag.
 */
export const ChromaticWaves: React.FC = React.memo(() => {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#040406] select-none"
      style={{
        contain: 'strict',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      {/* GPU-composited Ambient Glow Orbs */}
      <div 
        className="absolute -top-[15%] left-[20%] w-[650px] h-[450px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 75%)',
          transform: 'translateZ(0)'
        }}
      />
      <div 
        className="absolute top-[20%] -left-[10%] w-[600px] h-[550px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 75%)',
          transform: 'translateZ(0)'
        }}
      />
      <div 
        className="absolute -bottom-[15%] right-[10%] w-[750px] h-[550px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 75%)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Smooth, Hardware-Accelerated Vector Silk Waves (Zero CPU filter overhead) */}
      <svg 
        className="absolute inset-0 w-full h-full object-cover opacity-75"
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          {/* Amber / Fire Silk Wave */}
          <linearGradient id="silkAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#EA580C" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#BE185D" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7E22CE" stopOpacity="0" />
          </linearGradient>

          {/* Magenta / Violet Aurora Wave */}
          <linearGradient id="silkMagenta" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </linearGradient>

          {/* Gold Filament Highlight */}
          <linearGradient id="silkGoldRim" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Primary Flowing Wave Ribbon */}
        <path
          d="M -100 220 
             C 320 80, 780 40, 1150 180 
             C 1520 320, 1850 210, 2050 90
             L 2050 480
             C 1750 560, 1380 420, 1020 310
             C 660 200, 240 380, -100 520 Z"
          fill="url(#silkAmber)"
        />

        {/* Sweeping Crest Ribbon */}
        <path
          d="M -150 680
             C 180 420, 620 340, 1080 520
             C 1540 700, 1820 620, 2100 480
             L 2100 860
             C 1780 980, 1320 820, 880 710
             C 440 600, 120 820, -150 940 Z"
          fill="url(#silkMagenta)"
        />

        {/* Luminous Filament Accent Lines */}
        <path
          d="M -50 250
             C 380 110, 820 80, 1180 200
             C 1540 320, 1840 240, 2050 130"
          stroke="url(#silkGoldRim)"
          strokeWidth="3"
          fill="none"
        />

        <path
          d="M -80 620
             C 240 380, 680 320, 1120 480
             C 1560 640, 1860 560, 2100 460"
          stroke="url(#silkGoldRim)"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Dark vignette to isolate crisp foreground text and cards */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(4, 4, 6, 0.5) 0%, rgba(4, 4, 6, 0.88) 75%, #040406 100%)',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
});
