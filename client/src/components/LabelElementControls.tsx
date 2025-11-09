import { useConfigStore } from '@/store/configStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface LabelElementControlsProps {
  element: 'logo' | 'textGroup';
  title: string;
  icon?: string;
}

export default function LabelElementControls({ element, title, icon }: LabelElementControlsProps) {
  const { packageConfig, setLabelTransform } = useConfigStore();
  const [isExpanded, setIsExpanded] = useState(true); // Both expanded by default
  
  const transform = packageConfig.labelTransform[element];
  
  // Package-type specific slider ranges (pkgtype5 uses re-centered ranges)
  const isPkgtype5 = packageConfig.type === 'pkgtype5';
  const offsetXRange = isPkgtype5 ? { min: -100, max: 100 } : { min: -50, max: 50 };
  const offsetYRange = isPkgtype5 && element === 'logo' 
    ? { min: -50, max: 150 }  // Logo offsetY centered at 50
    : isPkgtype5 && element === 'textGroup'
    ? { min: -70, max: 130 }  // Text Group offsetY centered at 30
    : { min: -50, max: 50 };  // Default for other packages
  const scaleRange = isPkgtype5 
    ? { min: 0.2, max: 1.4 }  // Scale centered at 0.4
    : { min: 0.5, max: 2.0 }; // Default
  
  const handleReset = () => {
    setLabelTransform(element, { offsetX: 0, offsetY: 0, scale: 1.0 });
  };
  
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-sm text-slate-700">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {transform.offsetX !== 0 || transform.offsetY !== 0 || transform.scale !== 1.0 ? '●' : ''}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>
      
      {/* Controls */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Description for textGroup */}
          {element === 'textGroup' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
              <p className="text-xs text-blue-900">
                Controls all text elements together (Product Name, Description, Volume, Ingredients)
              </p>
            </div>
          )}
          
          {/* Horizontal Position */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-600">Horizontal Position</Label>
              <span className="text-xs text-slate-500">{transform.offsetX}%</span>
            </div>
            <Slider
              value={[transform.offsetX]}
              onValueChange={([value]) => setLabelTransform(element, { offsetX: value })}
              min={offsetXRange.min}
              max={offsetXRange.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Left</span>
              <span>Center</span>
              <span>Right</span>
            </div>
          </div>
          
          {/* Vertical Position */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-600">Vertical Position</Label>
              <span className="text-xs text-slate-500">{transform.offsetY}%</span>
            </div>
            <Slider
              value={[transform.offsetY]}
              onValueChange={([value]) => setLabelTransform(element, { offsetY: value })}
              min={offsetYRange.min}
              max={offsetYRange.max}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Top</span>
              <span>Center</span>
              <span>Bottom</span>
            </div>
          </div>
          
          {/* Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-600">Scale</Label>
              <span className="text-xs text-slate-500">{transform.scale.toFixed(2)}x</span>
            </div>
            <Slider
              value={[transform.scale]}
              onValueChange={([value]) => setLabelTransform(element, { scale: value })}
              min={scaleRange.min}
              max={scaleRange.max}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
          
          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full gap-2 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            Reset {title}
          </Button>
        </div>
      )}
    </div>
  );
}
