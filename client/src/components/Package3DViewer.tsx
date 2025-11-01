import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';

export default function Package3DViewer() {
  const { currentPackage, packageConfig } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
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
  
  // Get package image
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
  
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative transition-transform duration-100"
        style={{
          transform: `
            rotateX(${rotation.x}deg)
            rotateY(${rotation.y}deg)
            scale(${zoom})
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Package Image */}
        <div className="relative">
          <img
            src={getPackageImage()}
            alt={currentPackage}
            className="max-w-md max-h-[600px] object-contain drop-shadow-2xl"
            style={{
              filter: `
                brightness(${packageConfig.metalness > 0.7 ? 1.1 : 1})
                contrast(${packageConfig.metalness > 0.7 ? 1.1 : 1})
              `,
            }}
            draggable={false}
          />
          
          {/* Label Overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: 'translateZ(10px)',
            }}
          >
            <div className="text-center px-8 py-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg max-w-xs">
              {packageConfig.labelContent.logoUrl && (
                <img
                  src={packageConfig.labelContent.logoUrl}
                  alt="Logo"
                  className="w-20 h-20 mx-auto mb-2 object-contain"
                />
              )}
              <h3 className="font-bold text-lg text-slate-900">
                {packageConfig.labelContent.productName}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {packageConfig.labelContent.description}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {packageConfig.labelContent.volume}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
