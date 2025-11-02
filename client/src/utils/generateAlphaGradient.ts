/**
 * Generate a vertical alpha gradient texture for label transparency
 * Top 5% and bottom 5% fade to fully transparent, middle 90% is fully opaque
 */
export function generateAlphaGradient(width: number = 512, height: number = 512): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context for alpha gradient canvas');
  }

  // Create vertical gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  
  // Top 5%: Fully transparent
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.05, 'rgba(255, 255, 255, 0)');
  
  // Middle 90%: Fully opaque
  gradient.addColorStop(0.05, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.95, 'rgba(255, 255, 255, 1)');
  
  // Bottom 5%: Fully transparent
  gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  // Fill canvas with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas;
}
