import { PackageConfig, LabelTransform } from '@/store/configStore';

/**
 * Generate a canvas-based texture for 3D model labels
 * Uses the same rendering approach as Package3DViewerEnhanced for consistency
 * Supports logo rendering and position/scale transforms
 */
export async function generateLabelTexture(
  packageConfig: PackageConfig,
  labelTransform: LabelTransform,
  width: number = 4096, // Double width for front (0-2048) + back (2048-4096)
  height: number = 1024
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const { labelContent, baseColor, textStyles, labelBackgroundColor } = packageConfig;

  // Calculate scale factor (texture is larger than 2D view)
  // Front half is 2048px (width/2), 2D view uses ~400px width
  const frontHalfWidth = width / 2;
  const scale = frontHalfWidth / 400;

  // Draw label background with user-selected color
  ctx.fillStyle = labelBackgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Add subtle border
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(0, 0, width, height);

  // === LOGO RENDERING (with transform support) ===
  if (labelContent.logoUrl) {
    console.log('[3D Texture] Attempting to load logo:', labelContent.logoUrl);
    try {
      const logoImage = await loadImage(labelContent.logoUrl);
      console.log('[3D Texture] Logo loaded successfully, size:', logoImage.width, 'x', logoImage.height);
      
      const logoTransform = labelTransform.logo;
      
      // Base logo size and position
      const baseLogoSize = 80 * scale * logoTransform.scale;
      const logoOffsetX = (frontHalfWidth * logoTransform.offsetX) / 100;
      const logoOffsetY = (height * logoTransform.offsetY) / 100;
      const logoX = (frontHalfWidth - baseLogoSize) / 2 + logoOffsetX;
      const logoY = height * 0.05 + logoOffsetY; // Start 5% from top
      
      console.log('[3D Texture] Drawing logo at:', logoX, logoY, 'size:', baseLogoSize);
      
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6 * scale;
      ctx.drawImage(logoImage, logoX, logoY, baseLogoSize, baseLogoSize);
      ctx.restore();
      
      console.log('[3D Texture] Logo drawn successfully');
    } catch (error) {
      console.error('[3D Texture] Failed to load logo image:', error);
    }
  } else {
    console.log('[3D Texture] No logo URL provided');
  }

  // === TEXT GROUP RENDERING (with transform support) ===
  const textTransform = labelTransform.textGroup;
  const textOffsetX = (frontHalfWidth * textTransform.offsetX) / 100;
  const textOffsetY = (height * textTransform.offsetY) / 100;
  const textScale = textTransform.scale;

  // Center position for text group (on front half)
  const centerX = frontHalfWidth / 2 + textOffsetX;
  let currentY = height * 0.25 + textOffsetY; // Start 25% from top (below logo)

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Product Name (large, bold)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 6 * scale;
  const productNameColor = textStyles.productName.color === 'auto' ? '#000000' : textStyles.productName.color;
  ctx.fillStyle = productNameColor;
  ctx.font = `bold ${32 * scale * textScale}px ${textStyles.productName.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.productName, centerX, currentY);
  currentY += 40 * scale * textScale;

  // Description
  ctx.shadowBlur = 4 * scale;
  const descriptionColor = textStyles.description.color === 'auto' ? '#333333' : textStyles.description.color;
  ctx.fillStyle = descriptionColor;
  ctx.font = `${16 * scale * textScale}px ${textStyles.description.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.description, centerX, currentY);
  currentY += 28 * scale * textScale;

  // Volume
  const volumeColor = textStyles.volume.color === 'auto' ? '#666666' : textStyles.volume.color;
  ctx.fillStyle = volumeColor;
  ctx.font = `bold ${14 * scale * textScale}px ${textStyles.volume.fontFamily}, Arial, sans-serif`;
  ctx.fillText(labelContent.volume, centerX, currentY);
  currentY += 22 * scale * textScale;

  // Active Ingredients (first 3, center-aligned with wrapping)
  ctx.shadowBlur = 3 * scale;
  const ingredientsColor = textStyles.ingredients.color === 'auto' ? '#888888' : textStyles.ingredients.color;
  ctx.fillStyle = ingredientsColor;
  ctx.font = `bold ${11 * scale * textScale}px ${textStyles.ingredients.fontFamily}, Arial, sans-serif`;

  const allIngredients = labelContent.ingredients.split(',').map((i: string) => i.trim());
  const selectedIngredients = allIngredients.slice(0, 3);
  const ingredientsText = 'Active Ingredients: ' + selectedIngredients.join(', ');

  // Word wrap for ingredients
  const maxWidth = frontHalfWidth * 0.85 * textScale; // 85% of front half width
  const lineHeight = 13 * scale * textScale;

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

  // === BACK IMAGE RENDERING (180° from front) ===
  if (labelContent.backImageUrl) {
    console.log('[3D Texture] Attempting to load back image:', labelContent.backImageUrl);
    try {
      const backImage = await loadImage(labelContent.backImageUrl);
      console.log('[3D Texture] Back image loaded successfully, size:', backImage.width, 'x', backImage.height);
      
      // Position back image in the right half of canvas (2048-4096px)
      // This creates a 180° offset when wrapped around cylinder
      const backImageSize = 200 * scale; // Larger than logo for visibility
      const backImageX = frontHalfWidth + (frontHalfWidth - backImageSize) / 2; // Center in right half
      const backImageY = (height - backImageSize) / 2; // Center vertically
      
      console.log('[3D Texture] Drawing back image at:', backImageX, backImageY, 'size:', backImageSize);
      
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6 * scale;
      ctx.drawImage(backImage, backImageX, backImageY, backImageSize, backImageSize);
      ctx.restore();
      
      console.log('[3D Texture] Back image drawn successfully');
    } catch (error) {
      console.error('[3D Texture] Failed to load back image:', error);
    }
  } else {
    console.log('[3D Texture] No back image URL provided');
  }

  return canvas;
}

/**
 * Helper function to load an image and return a promise
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Don't set crossOrigin for same-origin images
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      console.log('[3D Texture] Image loaded:', src, 'size:', img.naturalWidth, 'x', img.naturalHeight);
      resolve(img);
    };
    img.onerror = (error) => {
      console.error('[3D Texture] Image load error:', src, error);
      reject(new Error(`Failed to load image: ${src}`));
    };
    // Ensure absolute URL
    if (src.startsWith('/')) {
      img.src = window.location.origin + src;
    } else {
      img.src = src;
    }
    console.log('[3D Texture] Loading image from:', img.src);
  });
}
