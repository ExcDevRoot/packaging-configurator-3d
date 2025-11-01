import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import { applyViewOffsets } from '@/utils/viewOffsets';

export default function Package3DViewerEnhanced() {
  const { currentPackage, packageConfig } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [packageImage, setPackageImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  
  // Load package image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setPackageImage(img);
    img.src = getPackageImage();
  }, [currentPackage]);
  
  // Load logo image
  useEffect(() => {
    if (packageConfig.labelContent.logoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setLogoImage(img);
      img.onerror = () => setLogoImage(null);
      img.src = packageConfig.labelContent.logoUrl;
    }
  }, [packageConfig.labelContent.logoUrl]);
  
  // Render wrapped label on canvas
  useEffect(() => {
    if (!canvasRef.current || !packageImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Save context
    ctx.save();
    
    // Apply 3D transformations
    const centerX = size / 2;
    const centerY = size / 2;
    
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw package without rotation
    drawPackageWithLabel(ctx);
    
    ctx.restore();
  }, [packageImage, logoImage, packageConfig, zoom, pan, currentPackage]);
  
  const drawPackageWithLabel = (ctx: CanvasRenderingContext2D) => {
    if (!packageImage) return;
    
    const packageType = currentPackage;
    
    // Use original image dimensions with a scale factor for canvas
    const scaleFactor = 0.8; // Scale down for better fit in viewport
    const adjustedWidth = packageImage.width * scaleFactor;
    const adjustedHeight = packageImage.height * scaleFactor;
    
    // Draw package base image
    ctx.save();
    ctx.globalAlpha = 1;
    
    ctx.drawImage(
      packageImage,
      -adjustedWidth / 2,
      -adjustedHeight / 2,
      adjustedWidth,
      adjustedHeight
    );
    
    // Apply color tint overlay AFTER drawing the image using hybrid approach
    if (packageConfig.baseColor !== '#e0e0e0') {
      ctx.save();
      
      // Step 1: Create mask canvas at original image size
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = adjustedWidth;
      maskCanvas.height = adjustedHeight;
      const maskCtx = maskCanvas.getContext('2d')!;
      
      // Draw the package image to mask canvas at original size
      maskCtx.drawImage(packageImage, 0, 0, adjustedWidth, adjustedHeight);
      
      // Get image data from mask canvas (not main canvas)
      const imageData = maskCtx.getImageData(0, 0, adjustedWidth, adjustedHeight);
      const pixels = imageData.data;
      
      // Create mask data
      const maskData = maskCtx.createImageData(adjustedWidth, adjustedHeight);
      
      // Step 2: Analyze pixels and build mask
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        
        // Identify can pixels: darker than border (brightness < 200) and opaque
        const isCanPixel = brightness < 200 && a > 10;
        
        if (isCanPixel) {
          // Mark as can pixel (white in mask)
          maskData.data[i] = 255;
          maskData.data[i + 1] = 255;
          maskData.data[i + 2] = 255;
          maskData.data[i + 3] = 255;
        }
        // else: leave transparent (border/background)
      }
      
      maskCtx.clearRect(0, 0, adjustedWidth, adjustedHeight);
      maskCtx.putImageData(maskData, 0, 0);
      
      // Step 3: Create colored version
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = adjustedWidth;
      colorCanvas.height = adjustedHeight;
      const colorCtx = colorCanvas.getContext('2d')!;
      
      // Draw package image
      colorCtx.drawImage(packageImage, 0, 0, adjustedWidth, adjustedHeight);
      
      // Apply color with multiply
      colorCtx.globalCompositeOperation = 'multiply';
      colorCtx.fillStyle = packageConfig.baseColor;
      colorCtx.fillRect(0, 0, adjustedWidth, adjustedHeight);
      
      // Apply mask
      colorCtx.globalCompositeOperation = 'destination-in';
      colorCtx.drawImage(maskCanvas, 0, 0);
      
      // Step 4: Draw colored version back at TRANSFORMED coordinates
      // This will respect the current zoom/scale
      ctx.drawImage(
        colorCanvas,
        -adjustedWidth / 2,
        -adjustedHeight / 2,
        adjustedWidth,
        adjustedHeight
      );
      
      ctx.restore();
    }
    
    ctx.restore();
    
    // Draw wrapped label
    if (packageType !== 'stick-pack') {
      drawCylindricalLabel(ctx, adjustedWidth, adjustedHeight);
    } else {
      drawFlatLabel(ctx, adjustedWidth, adjustedHeight);
    }
    
    // Apply metallic effect
    if (packageConfig.metalness > 0.5) {
      ctx.save();
      const gradient = ctx.createLinearGradient(-adjustedWidth / 2, 0, adjustedWidth / 2, 0);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${(packageConfig.metalness - 0.5) * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-adjustedWidth / 2, -adjustedHeight / 2, adjustedWidth, adjustedHeight);
      ctx.restore();
    }
  };
  
  const drawCylindricalLabel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { labelTransform } = packageConfig;
    
    // Calculate label position and size - label height is 50% of package height
    const baseHeight = height * 0.5;
    const labelHeight = baseHeight;
    const labelWidth = labelHeight * 1.5; // Maintain aspect ratio
    
    // Base position (centered)
    const labelY = -labelHeight / 2;
    
    // Transparent label - text renders directly on package
    ctx.save();
    
    // Center label horizontally
    const labelX = -labelWidth / 2;
    
    // No background - transparent label
    // Text and logo will render directly on the package surface
    
    // Draw label content
    drawLabelContent(ctx, labelX, labelY, labelWidth, labelHeight);
    
    ctx.restore();
  };
  
  const drawFlatLabel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { labelTransform } = packageConfig;
    
    // Label height is 50% of package height for stick packs, scaled by transform
    const baseHeight = height * 0.5;
    const labelHeight = baseHeight;
    const labelWidth = width * 0.7; // Wider for horizontal stick pack
    
    // Base position (centered)
    const labelX = -labelWidth / 2;
    const labelY = -labelHeight / 2;
    
    ctx.save();
    
    // No background - transparent label for stick packs
    // Text and logo render directly on package surface
    
    drawLabelContent(ctx, labelX, labelY, labelWidth, labelHeight);
    
    ctx.restore();
  };
  
  const drawLabelContent = (ctx: CanvasRenderingContext2D, baseX: number, baseY: number, baseWidth: number, baseHeight: number) => {
    const { labelContent, textStyles } = packageConfig;
    
    // Apply 2D view offsets to transform
    const labelTransform = applyViewOffsets(packageConfig.labelTransform, '2d');
    
    // Determine if background is dark or light for adaptive text color
    const baseColor = packageConfig.baseColor;
    const rgb = parseInt(baseColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 128;
    
    // Adaptive text colors and shadows
    const textColor = isDark ? '#ffffff' : '#1a1a1a';
    const textColorSecondary = isDark ? '#e0e0e0' : '#2a2a2a';
    const textColorTertiary = isDark ? '#cccccc' : '#333333';
    const textColorIngredients = isDark ? '#f5f5f5' : '#1a1a1a';
    const shadowColor = isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    
    // === LOGO RENDERING (Independent positioning, always on top) ===
    if (logoImage) {
      const logoTransform = labelTransform.logo;
      const baseLogoSize = Math.min(baseWidth * 0.25, 70);
      const logoSize = baseLogoSize * logoTransform.scale;
      
      // Apply logo transform
      const logoOffsetX = (baseWidth * logoTransform.offsetX) / 100;
      const logoOffsetY = (baseHeight * logoTransform.offsetY) / 100;
      const logoX = baseX + (baseWidth - logoSize) / 2 + logoOffsetX;
      const logoY = baseY + 30 + logoOffsetY;
      
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }
    
    // === TEXT GROUP RENDERING (All text elements together, center-aligned) ===
    const textTransform = labelTransform.textGroup;
    const textOffsetX = (baseWidth * textTransform.offsetX) / 100;
    const textOffsetY = (baseHeight * textTransform.offsetY) / 100;
    const textScale = textTransform.scale;
    
    // Base position for text group (below logo)
    const textGroupX = baseX + baseWidth / 2 + textOffsetX;
    let textGroupY = baseY + 120 + textOffsetY;
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Product Name
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 6;
    const productNameColor = textStyles.productName.color === 'auto' ? textColor : textStyles.productName.color;
    ctx.fillStyle = productNameColor;
    ctx.font = `bold ${32 * textScale}px ${textStyles.productName.fontFamily}`;
    ctx.fillText(labelContent.productName, textGroupX, textGroupY);
    textGroupY += 40 * textScale;
    
    // Description
    ctx.shadowBlur = 4;
    const descriptionColor = textStyles.description.color === 'auto' ? textColorSecondary : textStyles.description.color;
    ctx.fillStyle = descriptionColor;
    ctx.font = `${16 * textScale}px ${textStyles.description.fontFamily}`;
    ctx.fillText(labelContent.description, textGroupX, textGroupY);
    textGroupY += 28 * textScale;
    
    // Volume
    const volumeColor = textStyles.volume.color === 'auto' ? textColorTertiary : textStyles.volume.color;
    ctx.fillStyle = volumeColor;
    ctx.font = `bold ${14 * textScale}px ${textStyles.volume.fontFamily}`;
    ctx.fillText(labelContent.volume, textGroupX, textGroupY);
    textGroupY += 22 * textScale;
    
    // Active Ingredients (only first 3, center-aligned)
    ctx.shadowBlur = 3;
    const ingredientsColor = textStyles.ingredients.color === 'auto' ? textColorIngredients : textStyles.ingredients.color;
    ctx.fillStyle = ingredientsColor;
    ctx.font = `bold ${11 * textScale}px ${textStyles.ingredients.fontFamily}`;
    
    const allIngredients = labelContent.ingredients.split(',').map((i: string) => i.trim());
    const selectedIngredients = allIngredients.slice(0, 3);
    const ingredientsText = 'Active Ingredients: ' + selectedIngredients.join(', ');
    
    // For center alignment with wrapping
    const maxWidth = (baseWidth - 40) * textScale;
    const lineHeight = 13 * textScale;
    
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
      ctx.fillText(line, textGroupX, textGroupY);
      textGroupY += lineHeight;
    });
    
    ctx.restore();
  };
  
  const getPackageImage = () => {
    switch (currentPackage) {
      case 'can-12oz':
        return '/assets/packages/12oz_aluminumcan.bmp';
      case 'bottle-2oz':
        return '/assets/packages/2oz_whiteshot.bmp';
      case 'stick-pack':
        return '/assets/packages/StickPackProductPhoto.bmp';
      case 'bottle-750ml':
        return '/assets/packages/750ml_glassalcoholbottle.bmp';
      default:
        return '/assets/packages/12oz_aluminumcan.bmp';
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow right-click for panning
    if (e.button === 2) {
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
      e.preventDefault(); // Prevent context menu
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    // Pan logic
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2));
  };
  
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing bg-gradient-to-br from-slate-100 to-slate-200"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
      />
    </div>
  );
}
