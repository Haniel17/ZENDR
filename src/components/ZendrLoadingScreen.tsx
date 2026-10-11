import React from 'react';
import { motion } from 'motion/react';

interface ZendrLoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  showBrandText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ZendrLoadingScreen: React.FC<ZendrLoadingScreenProps> = ({
  fullScreen = true,
  message = 'Loading workspace...',
  showBrandText = true,
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: {
      icon: 'w-10 h-10',
      ring: 'w-[calc(100%+16px)] h-[calc(100%+16px)] -inset-2',
      halo: '-inset-4',
      track: 'w-16'
    },
    md: {
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      ring: 'w-[calc(100%+24px)] h-[calc(100%+24px)] -inset-3',
      halo: '-inset-8',
      track: 'w-24'
    },
    lg: {
      icon: 'w-24 h-24 sm:w-28 sm:h-28',
      ring: 'w-[calc(100%+32px)] h-[calc(100%+32px)] -inset-4',
      halo: '-inset-12',
      track: 'w-32'
    }
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 select-none ${className}`}>
      {/* Central Z Emblem Container */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Breathing Radial Halo */}
        <motion.div
          animate={{
            opacity: [0.15, 0.45, 0.15],
            scale: [0.92, 1.08, 0.92]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute ${currentSize.halo} rounded-full bg-radial from-amber-400/25 via-amber-500/5 to-transparent blur-2xl pointer-events-none`}
        />

        {/* Minimalist Subtle Orbit Ring with Luminous Spark */}
        <svg
          className={`absolute ${currentSize.ring} pointer-events-none`}
          viewBox="0 0 100 100"
        >
          {/* Subtle perimeter border */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="0.8"
          />
          {/* Rotating luminous amber spark */}
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="24 265"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'linear'
            }}
            style={{ transformOrigin: '50px 50px' }}
          />
        </svg>

        {/* Z Logo with Light Sweep Shimmer Animation */}
        <motion.div
          animate={{
            scale: [0.985, 1.02, 0.985]
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`relative ${currentSize.icon} flex items-center justify-center`}
        >
          {/* Base Logo Emblem */}
          <img
            src="/Zendr-icon.png"
            alt="ZENDR Logo"
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.25)] select-none pointer-events-none opacity-85"
          />

          {/* Precision Light-Sweep Shimmer (Masked to the exact Z shape) */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              maskImage: "url('/Zendr-icon.png')",
              WebkitMaskImage: "url('/Zendr-icon.png')",
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center'
            }}
          >
            <motion.div
              className="w-[220%] h-full"
              style={{
                background:
                  'linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.95) 48%, rgba(245, 158, 11, 1) 52%, rgba(255, 255, 255, 0.9) 56%, transparent 70%)'
              }}
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: [0.4, 0, 0.2, 1],
                repeatDelay: 0.5
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Brand Wordmark & Minimalist Progress Hairline */}
      {showBrandText && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col items-center space-y-2.5 pt-2"
        >
          <span className="text-[11px] font-mono tracking-[0.35em] text-white/90 uppercase font-semibold pl-1 select-none">
            Z E N D R
          </span>

          {/* Minimalist 1px hairline pulse track */}
          <div className={`${currentSize.track} h-[1.5px] rounded-full bg-white/[0.08] overflow-hidden relative`}>
            <motion.div
              className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: 'easeInOut'
              }}
            />
          </div>

          {message && (
            <span className="text-[10px] font-mono text-white/40 tracking-wider">
              {message}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]/95 backdrop-blur-2xl">
        {content}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[360px] flex items-center justify-center p-8">
      {content}
    </div>
  );
};
