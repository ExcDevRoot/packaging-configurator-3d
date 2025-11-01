import { PackageConfig, LabelContent } from '@/store/configStore';

/**
 * Generate a canvas-based texture for 3D model labels
 * This creates a 2D canvas with the label content that can be applied as a texture
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

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, width, height);

  const { labelContent, baseColor, textStyles } = packageConfig;

  // Calculate adaptive text color based on label background
  const getTextColor = (elementKey: keyof typeof textStyles): string => {
    const style = textStyles[elementKey];
    if (style.color !== 'auto') {
      return style.color;
    }
    
    // Parse base color to determine if it's light or dark
    const rgb = baseColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    }
    return '#000000';
  };

  // Draw semi-transparent label background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(0, 0, width, height);

  // Add padding
  const padding = width * 0.05;
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2;

  // Logo section (top 30% of label)
  if (labelContent.logoUrl) {
    const logoHeight = contentHeight * 0.3;
    const logoY = padding;
    
    // Draw logo placeholder or actual logo
    ctx.fillStyle = getTextColor('productName');
    ctx.font = `bold ${logoHeight * 0.5}px ${textStyles.productName.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOGO', width / 2, logoY + logoHeight / 2);
  }

  // Text content section (bottom 70% of label)
  const textStartY = padding + contentHeight * 0.35;
  let currentY = textStartY;

  // Product Name
  if (labelContent.productName) {
    ctx.fillStyle = getTextColor('productName');
    ctx.font = `bold ${height * 0.08}px ${textStyles.productName.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labelContent.productName, width / 2, currentY);
    currentY += height * 0.12;
  }

  // Description
  if (labelContent.description) {
    ctx.fillStyle = getTextColor('description');
    ctx.font = `${height * 0.05}px ${textStyles.description.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Word wrap description
    const words = labelContent.description.split(' ');
    let line = '';
    const maxWidth = contentWidth * 0.8;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, width / 2, currentY);
        currentY += height * 0.07;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, width / 2, currentY);
      currentY += height * 0.09;
    }
  }

  // Volume
  if (labelContent.volume) {
    ctx.fillStyle = getTextColor('volume');
    ctx.font = `${height * 0.045}px ${textStyles.volume.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labelContent.volume, width / 2, currentY);
    currentY += height * 0.08;
  }

  // Ingredients
  if (labelContent.ingredients) {
    ctx.fillStyle = getTextColor('ingredients');
    ctx.font = `${height * 0.035}px ${textStyles.ingredients.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Add text shadow for better legibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(`Active Ingredients: ${labelContent.ingredients}`, width / 2, currentY);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  return canvas;
}
