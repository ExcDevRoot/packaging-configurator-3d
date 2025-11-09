import { PackageConfig, LabelTransform, LabelContent } from '@/store/configStore';

/**
 * Generate a canvas-based texture for 3D model labels
 * Uses the same rendering approach as Package3DViewerEnhanced for consistency
 * Supports logo rendering and position/scale transforms
 */
export async function generateLabelTexture(
  packageConfig: PackageConfig,
  labelTransform: LabelTransform,
  width: number = 2048,
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
  const scale = width / 400; // 2D view uses ~400px width

  // Define safe zone with safety margins (7% at top/bottom for UV distortion buffer)
  const safeZoneTop = height * 0.07;      // 71.68px for 1024px height
  const safeZoneBottom = height * 0.93;    // 952.32px for 1024px height
  const safeZoneHeight = safeZoneBottom - safeZoneTop;  // 880.64px (86% of height)

  // Fill ONLY safe zone area with label background color
  // Leave top/bottom 5% transparent so metallic base color shows through
  ctx.fillStyle = labelBackgroundColor;
  ctx.fillRect(0, safeZoneTop, width, safeZoneHeight);

  // Create clipping region for safe zone
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, safeZoneTop, width, safeZoneHeight);
  ctx.clip();

  // === LOGO RENDERING (with transform support) ===
  if (labelContent.logoUrl) {
    console.log('[3D Texture] Attempting to load logo:', labelContent.logoUrl);
    try {
      const logoImage = await loadImage(labelContent.logoUrl);
      console.log('[3D Texture] Logo loaded successfully, size:', logoImage.width, 'x', logoImage.height);
      
      const logoTransform = labelTransform.logo;
      
      // Base logo size and position
      const baseLogoSize = 80 * scale * logoTransform.scale;
      const logoOffsetX = (width * logoTransform.offsetX) / 100;
      const logoOffsetY = (safeZoneHeight * logoTransform.offsetY) / 100; // Use safe zone height
      const logoX = (width - baseLogoSize) / 2 + logoOffsetX;
      const logoY = safeZoneTop + (safeZoneHeight * 0.05) + logoOffsetY; // Start 5% from safe zone top
      
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
  const textOffsetX = (width * textTransform.offsetX) / 100;
  const textOffsetY = (safeZoneHeight * textTransform.offsetY) / 100; // Use safe zone height
  const textScale = textTransform.scale;

  // Center position for text group
  const centerX = width / 2 + textOffsetX;
  let currentY = safeZoneTop + (safeZoneHeight * 0.25) + textOffsetY; // Start 25% from safe zone top (below logo)

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
  const maxWidth = width * 0.85 * textScale; // 85% of canvas width
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

  // === BACKSIDE ELEMENT RENDERING (180° from logo) ===
  // Fallback to defaults if backside properties are undefined (for old presets)
  const backsideContent = (labelContent as any).backside || { type: 'image' as const, content: '' };
  const backsideTransform = (labelTransform as any).backside || { offsetX: 0, offsetY: 0, scale: 1.0 };
  const backsideOffsetX = (width * backsideTransform.offsetX) / 100;
  const backsideOffsetY = (safeZoneHeight * backsideTransform.offsetY) / 100; // Use safe zone height
  const backsideScale = backsideTransform.scale;
  
  // pkgtype5-specific: 2% angular offset (7.2° rotation)
  const PKGTYPE5_ANGULAR_OFFSET = packageConfig.type === 'pkgtype5' ? (Math.PI * 2 * 0.02) : 0; // 2% of full circle = 7.2°
  
  // Position 180° opposite from logo (add half canvas width)
  // Default position is 150px to the left (offsetX=0 corresponds to -150px)
  const backsideBaseX = width / 2;
  const backsideCenterX = backsideBaseX + backsideOffsetX - 150;
  const backsideCenterY = safeZoneTop + (safeZoneHeight * 0.4) + backsideOffsetY; // Position within safe zone
  
  if (backsideContent.content === '') {
    // Render placeholder for empty state (3D view only - controlled by caller)
    const placeholderSize = 100 * scale * backsideScale;
    const placeholderX = backsideCenterX - placeholderSize / 2;
    const placeholderY = backsideCenterY - placeholderSize / 2;
    
    // Apply rotation for pkgtype5
    ctx.save();
    ctx.translate(backsideCenterX, backsideCenterY);
    ctx.rotate(PKGTYPE5_ANGULAR_OFFSET);
    ctx.translate(-backsideCenterX, -backsideCenterY);
    
    // Draw placeholder box
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(placeholderX, placeholderY, placeholderSize, placeholderSize);
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(placeholderX, placeholderY, placeholderSize, placeholderSize);
    
    // Draw placeholder text
    ctx.fillStyle = '#000000';
    const ingredientsFontSize = 11 * scale * backsideScale;
    ctx.font = `bold ${ingredientsFontSize}px ${textStyles.ingredients.fontFamily}, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Backside Element', backsideCenterX, backsideCenterY);
    
    ctx.restore();
  } else if (backsideContent.type === 'image') {
    // Render backside image
    try {
      const backsideImage = await loadImage(backsideContent.content);
      const backsideSize = 100 * scale * backsideScale;
      const backsideX = backsideCenterX - backsideSize / 2;
      const backsideY = backsideCenterY - backsideSize / 2;
      
      ctx.save();
      ctx.translate(backsideCenterX, backsideCenterY);
      ctx.rotate(PKGTYPE5_ANGULAR_OFFSET);
      ctx.translate(-backsideCenterX, -backsideCenterY);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 6 * scale;
      ctx.drawImage(backsideImage, backsideX, backsideY, backsideSize, backsideSize);
      ctx.restore();
    } catch (error) {
      console.error('[3D Texture] Failed to load backside image:', error);
    }
  } else if (backsideContent.type === 'text') {
    // Render backside text with wrapping
    ctx.save();
    ctx.translate(backsideCenterX, backsideCenterY);
    ctx.rotate(PKGTYPE5_ANGULAR_OFFSET);
    ctx.translate(-backsideCenterX, -backsideCenterY);
    const ingredientsColor = textStyles.ingredients.color === 'auto' ? '#888888' : textStyles.ingredients.color;
    ctx.fillStyle = ingredientsColor;
    const ingredientsFontSize = 11 * scale * backsideScale;
    ctx.font = `bold ${ingredientsFontSize}px ${textStyles.ingredients.fontFamily}, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Word wrap for backside text
    const maxTextWidth = width * 0.4 * backsideScale;
    const lineHeight = 13 * scale * backsideScale;
    wrapText(ctx, backsideContent.content, backsideCenterX, backsideCenterY, maxTextWidth, lineHeight);
    
    ctx.restore();
  }

  // Restore context to remove clipping region
  ctx.restore();

  return canvas;
}

/**
 * Helper function to wrap text within a maximum width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
  }
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
