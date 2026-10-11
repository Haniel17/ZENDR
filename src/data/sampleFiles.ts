// Sample assets for 1-click testing in ZENDR

export const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="cyberGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D1FF" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <linearGradient id="cyberGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF3366" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background decorative element -->
  <rect x="25" y="25" width="450" height="450" rx="36" fill="#131318" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Outer geometric ring -->
  <circle cx="250" cy="250" r="170" fill="none" stroke="url(#cyberGrad1)" stroke-width="6" stroke-dasharray="12 8" opacity="0.8" />
  <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(0, 209, 255, 0.25)" stroke-width="2" />

  <!-- Hexagonal frame -->
  <polygon points="250,130 354,190 354,310 250,370 146,310 146,190" fill="rgba(139, 92, 246, 0.12)" stroke="url(#cyberGrad1)" stroke-width="4" />

  <!-- Stylized Z Symbol -->
  <path d="M 185 195 L 315 195 L 185 305 L 315 305" fill="none" stroke="url(#cyberGrad1)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Vector Anchor Points -->
  <circle cx="185" cy="195" r="9" fill="#00D1FF" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="315" cy="195" r="9" fill="#00D1FF" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="185" cy="305" r="9" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="315" cy="305" r="9" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="3" />
  <circle cx="250" cy="250" r="7" fill="#00D1FF" />

  <!-- Secondary accents -->
  <circle cx="250" cy="90" r="8" fill="#FF3366" />
  <circle cx="250" cy="410" r="8" fill="#00D1FF" />
  <circle cx="90" cy="250" r="8" fill="#8B5CF6" />
  <circle cx="410" cy="250" r="8" fill="#FFCC00" />
</svg>`;

/**
 * Creates a demo PNG file on the fly using HTML Canvas with high visual interest (shapes, lines, colors).
 * This ensures the PNG has clear contrasts that produce amazing vector paths when converted to SVG!
 */
export function createSamplePngFile(): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not available');
    }

    // Transparent background
    ctx.clearRect(0, 0, 400, 400);

    // Dark rounded emblem card
    ctx.fillStyle = '#131318';
    ctx.beginPath();
    ctx.roundRect(20, 20, 360, 360, 32);
    ctx.fill();
    ctx.strokeStyle = '#00D1FF';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Vibrant gradient circle
    const grad = ctx.createLinearGradient(100, 100, 300, 300);
    grad.addColorStop(0, '#00D1FF');
    grad.addColorStop(0.5, '#8B5CF6');
    grad.addColorStop(1, '#EC4899');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(200, 200, 110, 0, Math.PI * 2);
    ctx.fill();

    // Inner cutout polygon
    ctx.fillStyle = '#131318';
    ctx.beginPath();
    ctx.moveTo(200, 130);
    ctx.lineTo(260, 235);
    ctx.lineTo(140, 235);
    ctx.closePath();
    ctx.fill();

    // Cyber star / vector node
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(200, 200, 14, 0, Math.PI * 2);
    ctx.fill();

    // Accent lines
    ctx.strokeStyle = '#00D1FF';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(60, 330);
    ctx.lineTo(340, 330);
    ctx.stroke();

    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(80, 70, 40, 10);
    ctx.fillRect(280, 70, 40, 10);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'zendr-sample-emblem.png', { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  });
}

/**
 * Creates a demo SVG file on the fly
 */
export function createSampleSvgFile(): File {
  const blob = new Blob([SAMPLE_SVG], { type: 'image/svg+xml;charset=utf-8' });
  return new File([blob], 'zendr-sample-vector.svg', { type: 'image/svg+xml' });
}
