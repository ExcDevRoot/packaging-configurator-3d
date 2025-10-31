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
    
    // Calculate dimensions based on package type
    let width = 200;
    let height = 400;
    
    if (packageType === 'can-12oz') {
      width = 180;
      height = 350;
    } else if (packageType === 'bottle-2oz') {
      width = 120;
      height = 300;
    } else if (packageType === 'stick-pack') {
      width = 300;
      height = 120;
    } else if (packageType === 'bottle-750ml') {
      width = 160;
      height = 450;
    }
    
    // Apply 3D rotation effect
    const scaleX = Math.cos(rotY);
    const scaleY = Math.cos(rotX);
    const adjustedWidth = width * Math.abs(scaleX);
    const adjustedHeight = height * Math.abs(scaleY);
    
    // Draw package base image
    ctx.save();
    ctx.globalAlpha = 1;
    
    // Apply tint based on base color
    if (packageConfig.baseColor !== '#e0e0e0') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = packageConfig.baseColor;
      ctx.fillRect(-adjustedWidth / 2, -adjustedHeight / 2, adjustedWidth, adjustedHeight);
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.drawImage(
      packageImage,
      -adjustedWidth / 2,
      -adjustedHeight / 2,
      adjustedWidth,
      adjustedHeight
    );
    
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
    // Calculate label position and size - make label smaller relative to package
    const labelWidth = width * 0.65;
    const labelHeight = height * 0.4;
    const labelY = -labelHeight / 2;
    
    // Create label background with wrapping effect
    ctx.save();
    
    // Apply cylindrical perspective
    const wrapFactor = Math.sin(rotY) * 0.3;
    const labelX = -labelWidth / 2;
    
    // Draw label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = wrapFactor * 10;
    ctx.shadowOffsetY = 5;
    
    // Draw rounded rectangle for label
    const radius = 12;
    ctx.beginPath();
    ctx.moveTo(labelX + radius, labelY);
    ctx.lineTo(labelX + labelWidth - radius, labelY);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
    ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
    ctx.lineTo(labelX + radius, labelY + labelHeight);
    ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
    ctx.lineTo(labelX, labelY + radius);
    ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    // Draw label content
    drawLabelContent(ctx, labelX, labelY, labelWidth, labelHeight);
    
    ctx.restore();
  };
  
  const drawFlatLabel = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const labelWidth = width * 0.65;
    const labelHeight = height * 0.55;
    const labelX = -labelWidth / 2;
    const labelY = -labelHeight / 2;
    
    ctx.save();
    
    // Draw label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(labelX + radius, labelY);
    ctx.lineTo(labelX + labelWidth - radius, labelY);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
    ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
    ctx.lineTo(labelX + radius, labelY + labelHeight);
    ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
    ctx.lineTo(labelX, labelY + radius);
    ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    
    drawLabelContent(ctx, labelX, labelY, labelWidth, labelHeight);
    
    ctx.restore();
  };
  
  const drawLabelContent = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const { labelContent } = packageConfig;
    const padding = 20;
    let currentY = y + padding;
    
    // Draw logo
    if (logoImage) {
      const logoSize = Math.min(width * 0.3, 80);
      const logoX = x + (width - logoSize) / 2;
      ctx.drawImage(logoImage, logoX, currentY, logoSize, logoSize);
      currentY += logoSize + 15;
    }
    
    // Draw product name
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labelContent.productName, x + width / 2, currentY);
    currentY += 40;
    
    // Draw description
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#4a4a4a';
    ctx.fillText(labelContent.description, x + width / 2, currentY);
    currentY += 30;
    
    // Draw volume
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(labelContent.volume, x + width / 2, currentY);
    currentY += 25;
    
    // Draw active ingredients (only first 3)
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#888';
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
  };
  
  const getPackageImage = () => {
    switch (currentPackage) {
      case 'can-12oz':
        return '/assets/packages/12oz_aluminumcan.png';
      case 'bottle-2oz':
        return '/assets/packages/2oz_whiteshot.png';
      case 'stick-pack':
        return '/assets/packages/StickPackProductPhoto.png';
      case 'bottle-750ml':
        return '/assets/packages/750ml_glassalcoholbottle.png';
      default:
        return '/assets/packages/12oz_aluminumcan.png';
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
