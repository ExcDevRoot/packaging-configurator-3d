import { PackageConfig } from '@/store/configStore';

/**
 * Generate a canvas-based texture for 3D model labels
 * Uses the same rendering approach as Package3DViewerEnhanced for consistency
 */
export function generateLabelTexture(
  packageConfig: PackageConfig,
  width: number = 2048,
  height: number = 1024
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const { labelContent, baseColor, textStyles } = packageConfig;

  // Calculate scale factor (texture is larger than 2D view)
  const scale = width / 400; // 2D view uses ~400px width

  // Draw white label background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Add subtle border
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(0, 0, width, height);

  // Center position
  const centerX = width / 2;
  let currentY = height * 0.15; // Start 15% from top

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Product Name (large, bold)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 6 * scale;
  const productNameColor = textStyles.productName.color === 'auto' ? '#000000' : textStyles.productName.color;
  ctx.fillStyle = productNameColor;
  ctx.font = `bold ${32 * scale}px ${textStyles.productName.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.productName, centerX, currentY);
  currentY += 40 * scale;

  // Description
  ctx.shadowBlur = 4 * scale;
  const descriptionColor = textStyles.description.color === 'auto' ? '#333333' : textStyles.description.color;
  ctx.fillStyle = descriptionColor;
  ctx.font = `${16 * scale}px ${textStyles.description.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.description, centerX, currentY);
  currentY += 28 * scale;

  // Volume
  const volumeColor = textStyles.volume.color === 'auto' ? '#666666' : textStyles.volume.color;
  ctx.fillStyle = volumeColor;
  ctx.font = `bold ${14 * scale}px ${textStyles.volume.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.volume, centerX, currentY);
  currentY += 22 * scale;

  // Active Ingredients (first 3, center-aligned with wrapping)
  ctx.shadowBlur = 3 * scale;
  const ingredientsColor = textStyles.ingredients.color === 'auto' ? '#888888' : textStyles.ingredients.color;
  ctx.fillStyle = ingredientsColor;
  ctx.font = `bold ${11 * scale}px ${textStyles.ingredients.fontFamily}, Arial, sans-serif`;

  const allIngredients = labelContent.ingredients.split(',').map((i: string) => i.trim());
  const selectedIngredients = allIngredients.slice(0, 3);
  const ingredientsText = 'Active Ingredients: ' + selectedIngredients.join(', ');

  // Word wrap for ingredients
  const maxWidth = width * 0.85; // 85% of canvas width
  const lineHeight = 13 * scale;

  const words = ingredientsText.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim()) lines.push(line.trim());

  // Draw each line center-aligned
  lines.forEach(line => {
    ctx.fillText(line, centerX, currentY);
    currentY += lineHeight;
  });

  // Reset shadow
  ctx.shadowBlur = 0;

  return canvas;
}
