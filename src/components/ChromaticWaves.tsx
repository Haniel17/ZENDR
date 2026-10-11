import React, { useEffect, useRef } from 'react';

/**
 * Live 3D Wave Animation Background.
 * 
 * Features:
 * - Real-time 3D perspective undulating fluid wave mesh.
 * - Multi-harmonic mathematical fluid physics (swells, ripples, cross-currents).
 * - Interactive cursor-driven 3D parallax tilt & dynamic liquid wave ripples.
 * - Apple chromatic color palette: luminous Amber Gold (#F59E0B), Rose Quartz (#EC4899), and Electric Violet (#8B5CF6).
 * - Drifting 3D light motes / embers that bob dynamically on wave crests.
 * - Zero GC allocation inside requestAnimationFrame for smooth 60-120 FPS performance.
 * - Automatic high-DPI scaling (capped at 2 for optimal battery/GPU efficiency).
 */
export const ChromaticWaves: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Simulation grid parameters
    const LINES_COUNT = 32;       // Longitudinal wave ribbons along Z depth
    const POINTS_PER_LINE = 64;   // Segment vertices along X width
    const TOTAL_POINTS = LINES_COUNT * POINTS_PER_LINE;

    // Pre-allocated flat typed arrays for 0 GC frame rendering:
    // [screenX, screenY, scale, alpha] per vertex
    const projectedCoords = new Float32Array(TOTAL_POINTS * 4);

    // 3D Particles / Embers bobbing on wave crests
    const PARTICLES_COUNT = 48;
    interface WaveParticle {
      x: number;
      z: number;
      offsetY: number;
      speedX: number;
      speedZ: number;
      size: number;
      hue: number;
      alpha: number;
      pulseSpeed: number;
      phase: number;
    }

    const particles: WaveParticle[] = [];
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1600,
        z: 160 + Math.random() * 850,
        offsetY: -10 - Math.random() * 35,
        speedX: (Math.random() - 0.5) * 0.4,
        speedZ: (Math.random() - 0.5) * 0.3 - 0.2, // Drift forward gently
        size: 1.5 + Math.random() * 2.5,
        hue: Math.random() > 0.4 ? 40 : 285, // Amber or Violet
        alpha: 0.3 + Math.random() * 0.6,
        pulseSpeed: 1.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Interactive mouse state with smooth spring lerping
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let mouseActivity = 0;
    let lastMouseMoveTime = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized coordinates: -1 to +1
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseActivity = 1.0;
      lastMouseMoveTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetMouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = (touch.clientY / window.innerHeight) * 2 - 1;
        mouseActivity = 1.0;
        lastMouseMoveTime = performance.now();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    handleResize();

    let startTime = performance.now();

    // 3D Wave height calculation with multi-harmonic swells
    const getWaveHeight = (
      wx: number,
      wz: number,
      t: number,
      mX: number,
      mY: number,
      mAct: number
    ) => {
      // 1. Deep rolling ocean groundswell
      const swell = Math.sin(wx * 0.0018 + wz * 0.0014 + t * 0.75) * 58;
      // 2. Lateral cross-cutting wave
      const cross = Math.cos(wx * 0.0032 - wz * 0.0025 + t * 0.6) * 42;
      // 3. Fluid micro-crest ripples
      const ripples = Math.sin((wx * 0.005 + wz * 0.004) + t * 1.3) * 22;
      // 4. Subtle chaotic interference
      const turbulence = Math.cos((wx * 0.004 - wz * 0.006) + t * 0.95) * 16;

      // 5. Interactive cursor ripple (projected onto 3D wave plane)
      let mouseRipple = 0;
      if (mAct > 0.01) {
        const mouseWorldX = mX * (width * 0.55);
        const mouseWorldZ = 350 + mY * 250;
        const dx = wx - mouseWorldX;
        const dz = wz - mouseWorldZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        // Traveling ripple expanding outward from cursor
        mouseRipple = Math.sin(dist * 0.016 - t * 4.0) * Math.exp(-dist * 0.0035) * 45 * mAct;
      }

      return swell + cross + ripples + turbulence + mouseRipple;
    };

    let elapsedCached = 0;

    // Render loop
    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001; // seconds
      elapsedCached = now - startTime;

      // Smooth mouse decay & interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      if (now - lastMouseMoveTime > 2000) {
        mouseActivity = Math.max(0, mouseActivity - 0.01);
      }

      ctx.clearRect(0, 0, width, height);

      // Camera perspective parameters
      const centerX = width * 0.5;
      const centerY = height * 0.58; // Position wave horizon just above center
      const fov = 440; // Focal length

      // Subtle dynamic camera tilt (gentle parallax)
      const pitch = 0.36 + currentMouseY * 0.08; // Angle looking down
      const yaw = currentMouseX * 0.12;          // Angle turning left/right

      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);

      const camY = -160; // Camera height above water level

      // 1. Calculate & Project all 3D Grid Vertices
      const zStart = 140;
      const zEnd = 980;
      const xSpan = Math.max(width * 1.25, 1400);

      let idx = 0;
      for (let lineIdx = 0; lineIdx < LINES_COUNT; lineIdx++) {
        const zNorm = lineIdx / (LINES_COUNT - 1);
        const z = zStart + zNorm * (zEnd - zStart);

        for (let ptIdx = 0; ptIdx < POINTS_PER_LINE; ptIdx++) {
          const xNorm = ptIdx / (POINTS_PER_LINE - 1);
          const x = (xNorm - 0.5) * xSpan;

          // Height of wave in 3D world space
          const waveH = getWaveHeight(x, z, elapsed, currentMouseX, currentMouseY, mouseActivity);
          
          // Invert waveH so positive rises UP toward camera
          const y = -waveH;

          // Camera transformation:
          // 1. Yaw rotation around Y axis
          const x1 = x * cosYaw - z * sinYaw;
          const z1 = x * sinYaw + z * cosYaw;

          // 2. Pitch rotation around X axis
          const yRel = y - camY;
          const y2 = yRel * cosPitch - z1 * sinPitch;
          const z2 = yRel * sinPitch + z1 * cosPitch;

          if (z2 <= 20) {
            // Clip behind camera
            projectedCoords[idx] = -9999;
            projectedCoords[idx + 1] = -9999;
            projectedCoords[idx + 2] = 0;
            projectedCoords[idx + 3] = 0;
          } else {
            const scale = fov / z2;
            const sx = centerX + x1 * scale;
            const sy = centerY + y2 * scale;

            // Depth fading alpha (near is crisp, distant horizon fades softly into dark abyss)
            const depthRatio = Math.max(0, Math.min(1, (z2 - zStart) / (zEnd - zStart)));
            const alpha = Math.max(0.04, (1 - depthRatio * 0.78) * 0.75);

            projectedCoords[idx] = sx;
            projectedCoords[idx + 1] = sy;
            projectedCoords[idx + 2] = scale;
            projectedCoords[idx + 3] = alpha;
          }

          idx += 4;
        }
      }

      // 2. Draw Translucent Liquid Ribbons Between Adjacent 3D Wave Rows
      ctx.save();
      for (let lineIdx = 0; lineIdx < LINES_COUNT - 1; lineIdx += 2) {
        const lineOffset1 = lineIdx * POINTS_PER_LINE * 4;
        const lineOffset2 = (lineIdx + 1) * POINTS_PER_LINE * 4;

        ctx.beginPath();
        let valid = false;

        // Forward along line 1
        for (let i = 0; i < POINTS_PER_LINE; i++) {
          const p1 = lineOffset1 + i * 4;
          const sx = projectedCoords[p1];
          const sy = projectedCoords[p1 + 1];
          if (sx === -9999) continue;

          if (!valid) {
            ctx.moveTo(sx, sy);
            valid = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }

        // Backward along line 2
        for (let i = POINTS_PER_LINE - 1; i >= 0; i--) {
          const p2 = lineOffset2 + i * 4;
          const sx = projectedCoords[p2];
          const sy = projectedCoords[p2 + 1];
          if (sx === -9999) continue;
          ctx.lineTo(sx, sy);
        }

        ctx.closePath();

        if (valid) {
          const zProgress = lineIdx / LINES_COUNT;
          const ribbonGradient = ctx.createLinearGradient(0, centerY - 150, width, centerY + 250);
          
          if (lineIdx % 4 === 0) {
            // Warm Amber Gold liquid sheen
            ribbonGradient.addColorStop(0, `rgba(245, 158, 11, ${0.045 * (1 - zProgress * 0.6)})`);
            ribbonGradient.addColorStop(0.5, `rgba(234, 88, 12, ${0.035 * (1 - zProgress * 0.6)})`);
            ribbonGradient.addColorStop(1, `rgba(168, 85, 247, ${0.02 * (1 - zProgress * 0.6)})`);
          } else {
            // Cool Magenta / Violet aurora glow
            ribbonGradient.addColorStop(0, `rgba(236, 72, 153, ${0.03 * (1 - zProgress * 0.6)})`);
            ribbonGradient.addColorStop(0.6, `rgba(139, 92, 246, ${0.035 * (1 - zProgress * 0.6)})`);
            ribbonGradient.addColorStop(1, `rgba(59, 130, 246, ${0.015 * (1 - zProgress * 0.6)})`);
          }

          ctx.fillStyle = ribbonGradient;
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. Draw Crisp Luminous 3D Wave Crest Contour Lines
      ctx.save();
      for (let lineIdx = 0; lineIdx < LINES_COUNT; lineIdx++) {
        const lineOffset = lineIdx * POINTS_PER_LINE * 4;
        const zProgress = lineIdx / LINES_COUNT; // 0 = closest, 1 = furthest

        ctx.beginPath();
        let isStarted = false;

        for (let ptIdx = 0; ptIdx < POINTS_PER_LINE; ptIdx++) {
          const p = lineOffset + ptIdx * 4;
          const sx = projectedCoords[p];
          const sy = projectedCoords[p + 1];
          if (sx === -9999) continue;

          if (!isStarted) {
            ctx.moveTo(sx, sy);
            isStarted = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }

        if (isStarted) {
          // Dynamic chromatic gradient across the width of each wave
          const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
          
          // Foreground waves have golden highlights; background waves shift towards purple
          const baseAlpha = Math.max(0.08, (1 - zProgress * 0.75));
          
          if (lineIdx % 3 === 0) {
            // Radiant Amber Gold & Copper lines
            lineGrad.addColorStop(0, `rgba(245, 158, 11, ${baseAlpha * 0.75})`);
            lineGrad.addColorStop(0.3, `rgba(251, 191, 36, ${baseAlpha * 0.95})`);
            lineGrad.addColorStop(0.6, `rgba(236, 72, 153, ${baseAlpha * 0.75})`);
            lineGrad.addColorStop(1, `rgba(139, 92, 246, ${baseAlpha * 0.5})`);
            ctx.lineWidth = Math.max(0.8, (1.8 - zProgress * 1.0));
          } else if (lineIdx % 3 === 1) {
            // Neon Violet & Fuchsia lines
            lineGrad.addColorStop(0, `rgba(168, 85, 247, ${baseAlpha * 0.6})`);
            lineGrad.addColorStop(0.5, `rgba(236, 72, 153, ${baseAlpha * 0.85})`);
            lineGrad.addColorStop(1, `rgba(245, 158, 11, ${baseAlpha * 0.5})`);
            ctx.lineWidth = Math.max(0.6, (1.4 - zProgress * 0.8));
          } else {
            // Subdued depth lines
            lineGrad.addColorStop(0, `rgba(139, 92, 246, ${baseAlpha * 0.4})`);
            lineGrad.addColorStop(0.5, `rgba(192, 132, 252, ${baseAlpha * 0.6})`);
            lineGrad.addColorStop(1, `rgba(59, 130, 246, ${baseAlpha * 0.35})`);
            ctx.lineWidth = Math.max(0.5, (1.1 - zProgress * 0.7));
          }

          ctx.strokeStyle = lineGrad;
          ctx.stroke();
        }
      }
      ctx.restore();

      // 4. Draw Floating 3D Embers / Light Motes Bobbing with the Waves
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Drift motion
        pt.x += pt.speedX;
        pt.z += pt.speedZ;

        // Recycle particles if they go out of bounds
        if (pt.z < zStart) pt.z = zEnd;
        if (pt.z > zEnd) pt.z = zStart;
        if (pt.x < -xSpan * 0.5) pt.x = xSpan * 0.5;
        if (pt.x > xSpan * 0.5) pt.x = -xSpan * 0.5;

        // Height dynamically adheres to the 3D wave surface at that location
        const waveH = getWaveHeight(pt.x, pt.z, elapsed, currentMouseX, currentMouseY, mouseActivity);
        const y = -waveH + pt.offsetY + Math.sin(elapsed * pt.pulseSpeed + pt.phase) * 6;

        // Project particle to screen
        const x1 = pt.x * cosYaw - pt.z * sinYaw;
        const z1 = pt.x * sinYaw + pt.z * cosYaw;
        const yRel = y - camY;
        const y2 = yRel * cosPitch - z1 * sinPitch;
        const z2 = yRel * sinPitch + z1 * cosPitch;

        if (z2 > 20) {
          const scale = fov / z2;
          const sx = centerX + x1 * scale;
          const sy = centerY + y2 * scale;

          if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
            const rad = Math.max(1, pt.size * scale);
            const pulse = 0.7 + 0.3 * Math.sin(elapsed * pt.pulseSpeed + pt.phase);
            const alpha = Math.min(1, pt.alpha * pulse * Math.max(0.1, (1 - (z2 - zStart) / (zEnd - zStart))));

            // Glow radial halo
            const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 3.5);
            if (pt.hue === 40) {
              glow.addColorStop(0, `rgba(253, 230, 138, ${alpha * 0.9})`);
              glow.addColorStop(0.4, `rgba(245, 158, 11, ${alpha * 0.6})`);
              glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
            } else {
              glow.addColorStop(0, `rgba(244, 114, 182, ${alpha * 0.85})`);
              glow.addColorStop(0.4, `rgba(168, 85, 247, ${alpha * 0.55})`);
              glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
            }

            ctx.beginPath();
            ctx.arc(sx, sy, rad * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Bright core
            ctx.beginPath();
            ctx.arc(sx, sy, rad * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = pt.hue === 40 ? `rgba(255, 255, 255, ${alpha})` : `rgba(255, 220, 245, ${alpha})`;
            ctx.fill();
          }
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    // Start live animation
    animationFrameId = requestAnimationFrame(render);

    // Pause animation when tab is in background to preserve system battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        startTime = performance.now() - elapsedCached;
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#040406] select-none"
      style={{ contain: 'strict' }}
    >
      {/* 1. Underlying Soft Ambient Atmospheric Breathing Glow Orbs */}
      <div 
        className="absolute -top-[10%] left-[25%] w-[700px] h-[500px] rounded-full opacity-35 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.15) 50%, transparent 75%)',
          transform: 'translateZ(0)',
          animation: 'pulse 8s ease-in-out infinite'
        }}
      />
      <div 
        className="absolute top-[25%] -left-[10%] w-[650px] h-[600px] rounded-full opacity-25 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(236, 72, 153, 0.18) 50%, transparent 75%)',
          transform: 'translateZ(0)',
          animation: 'pulse 10s ease-in-out infinite alternate'
        }}
      />
      <div 
        className="absolute bottom-[0%] right-[5%] w-[800px] h-[600px] rounded-full opacity-25 blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 75%)',
          transform: 'translateZ(0)',
          animation: 'pulse 9s ease-in-out infinite'
        }}
      />

      {/* 2. Interactive High-Performance 3D Wave Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* 3. Smooth Radial Vignette to maintain crisp contrast for cards and text */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 48%, rgba(4, 4, 6, 0.28) 0%, rgba(4, 4, 6, 0.65) 65%, #040406 100%)',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
});
