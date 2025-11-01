import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';

export default function Package3DViewerEnhanced() {
  const { currentPackage, packageConfig } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
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
    
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    
    // Apply rotation (simplified 3D projection)
    const rotX = (rotation.x * Math.PI) / 180;
    const rotY = (rotation.y * Math.PI) / 180;
    
    // Draw package with perspective
    drawPackageWithLabel(ctx, rotY, rotX);
    
    ctx.restore();
  }, [packageImage, logoImage, packageConfig, rotation, zoom, currentPackage]);
  
  const drawPackageWithLabel = (ctx: CanvasRenderingContext2D, rotY: number, rotX: number) => {
    if (!packageImage) return;
    
    const packageType = currentPackage;
    
    // Use original image dimensions with a scale factor for canvas
    const scaleFactor = 0.8; // Scale down for better fit in viewport
    const width = packageImage.width * scaleFactor;
    const height = packageImage.height * scaleFactor;
    
    // Apply 3D rotation effect
    const scaleX = Math.cos(rotY);
    const scaleY = Math.cos(rotX);
    const adjustedWidth = width * Math.abs(scaleX);
    const adjustedHeight = height * Math.abs(scaleY);
    
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
    
    // Apply color tint overlay AFTER drawing the image
    if (packageConfig.baseColor !== '#e0e0e0') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = packageConfig.baseColor;
      ctx.fillRect(-adjustedWidth / 2, -adjustedHeight / 2, adjustedWidth, adjustedHeight);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.restore();
    
    // Draw wrapped label
    if (packageType !== 'stick-pack') {
      drawCylindricalLabel(ctx, rotY, width, height);
    } else {
      drawFlatLabel(ctx, width, height);
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
  
  const drawCylindricalLabel = (ctx: CanvasRenderingContext2D, rotY: number, width: number, height: number) => {
    const { labelTransform } = packageConfig;
    
    // Calculate label position and size - label height is 50% of package height, scaled by transform
    const baseHeight = height * 0.5;
    const labelHeight = baseHeight * labelTransform.scale;
    const labelWidth = labelHeight * 1.5; // Maintain aspect ratio
    
    // Apply position offsets (convert percentage to pixels)
    const offsetXPixels = (width * labelTransform.offsetX) / 100;
    const offsetYPixels = (height * labelTransform.offsetY) / 100;
    const labelY = -labelHeight / 2 + offsetYPixels;
    
    // Transparent label - text renders directly on package
    ctx.save();
    
    // Apply cylindrical perspective
    const wrapFactor = Math.sin(rotY) * 0.3;
    const labelX = -labelWidth / 2 + offsetXPixels;
    
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
    const labelHeight = baseHeight * labelTransform.scale;
    const labelWidth = (width * 0.7) * labelTransform.scale; // Wider for horizontal stick pack
    
    // Apply position offsets
    const offsetXPixels = (width * labelTransform.offsetX) / 100;
    const offsetYPixels = (height * labelTransform.offsetY) / 100;
    const labelX = -labelWidth / 2 + offsetXPixels;
    const labelY = -labelHeight / 2 + offsetYPixels;
    
    ctx.save();
    
    // No background - transparent label for stick packs
    // Text and logo render directly on package surface
    
    drawLabelContent(ctx, labelX, labelY, labelWidth, labelHeight);
    
    ctx.restore();
  };
  
  const drawLabelContent = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const { labelContent } = packageConfig;
    const padding = 20;
    let currentY = y + padding + 10; // Add extra top padding to center within package
    
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
    
    // Draw logo - centered within package boundaries
    if (logoImage) {
      const logoSize = Math.min(width * 0.25, 70); // Slightly smaller for better fit
      const logoX = x + (width - logoSize) / 2;
      ctx.save();
      ctx.shadowBlur = 6; // Stronger shadow for logo
      ctx.drawImage(logoImage, logoX, currentY, logoSize, logoSize);
      ctx.restore();
      currentY += logoSize + 12;
    }
    
    // Draw product name with adaptive contrast
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 6;
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labelContent.productName, x + width / 2, currentY);
    ctx.restore();
    currentY += 40;
    
    // Draw description
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = textColorSecondary;
    ctx.fillText(labelContent.description, x + width / 2, currentY);
    ctx.restore();
    currentY += 28;
    
    // Draw volume
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = textColorTertiary;
    ctx.fillText(labelContent.volume, x + width / 2, currentY);
    ctx.restore();
    currentY += 22;
    
    // Draw active ingredients (only first 3) with adaptive contrast
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 3;
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.fillStyle = textColorIngredients;
    ctx.textAlign = 'left';
    
    // Get first 3 ingredients
    const allIngredients = labelContent.ingredients.split(',').map(i => i.trim());
    const selectedIngredients = allIngredients.slice(0, 3);
    const ingredientsText = 'Active Ingredients: ' + selectedIngredients.join(', ');
    
    const maxWidth = width - padding * 2;
    const lineHeight = 13;
    
    // Wrap text
    const words = ingredientsText.split(' ');
    let line = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x + padding, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x + padding, currentY);
    ctx.restore(); // Restore context after ingredients
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
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
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
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
      />
    </div>
  );
}
