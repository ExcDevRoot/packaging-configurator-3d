import { useConfigStore } from '@/store/configStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TextStyleControlsProps {
  element: 'productName' | 'description' | 'volume' | 'ingredients';
  title: string;
  icon?: string;
}

const FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (Default)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
];

export default function TextStyleControls({ element, title, icon }: TextStyleControlsProps) {
  const { packageConfig, updateTextStyle } = useConfigStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const style = packageConfig.textStyles[element];
  
  const handleFontChange = (fontFamily: string) => {
    updateTextStyle(element, { fontFamily });
  };
  
  const handleColorChange = (color: string) => {
    updateTextStyle(element, { color });
  };
  
  const isCustomColor = style.color !== 'auto';
  
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
            {isCustomColor ? '●' : ''}
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
          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Font</Label>
            <Select value={style.fontFamily} onValueChange={handleFontChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Color</Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex gap-2">
                <Input
                  type="color"
                  value={isCustomColor ? style.color : '#000000'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-9 p-1 cursor-pointer"
                  disabled={!isCustomColor}
                />
                <Input
                  type="text"
                  value={style.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="auto or #hex"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Use "auto" for adaptive contrast, or enter a custom hex color
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
