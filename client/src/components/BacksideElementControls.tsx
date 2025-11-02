import { useConfigStore } from '@/store/configStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, ChevronDown, ChevronUp, Image as ImageIcon, Type as TypeIcon } from 'lucide-react';
import { useState } from 'react';

export default function BacksideElementControls() {
  const { packageConfig, updateLabelContent, setLabelTransform } = useConfigStore();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const backside = packageConfig.labelContent.backside;
  const transform = packageConfig.labelTransform.backside;
  const charCount = backside.type === 'text' ? backside.content.length : 0;
  const showCharCount = charCount > 400;
  const isOverLimit = charCount > 512;
  
  const handleTypeToggle = (type: 'image' | 'text') => {
    updateLabelContent({
      backside: {
        type,
        content: '',
      },
    });
  };
  
  const handleContentChange = (content: string) => {
    updateLabelContent({
      backside: {
        ...backside,
        content,
      },
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleContentChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleReset = () => {
    setLabelTransform('backside', { offsetX: 0, offsetY: 0, scale: 1.0 });
  };
  
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔄</span>
          <span className="font-medium text-sm text-slate-700">Backside Element</span>
        </div>
        
        {/* Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={backside.type === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeToggle('image')}
            className={`flex-1 gap-2 ${
              backside.type === 'image'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-blue-500 text-blue-700 hover:bg-blue-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </Button>
          <Button
            variant={backside.type === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeToggle('text')}
            className={`flex-1 gap-2 ${
              backside.type === 'text'
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border-blue-500 text-blue-700 hover:bg-blue-50'
            }`}
          >
            <TypeIcon className="w-4 h-4" />
            Text
          </Button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 space-y-4 bg-white border-b border-slate-200">
        {backside.type === 'image' ? (
          <div className="space-y-3">
            <Label htmlFor="backside-image" className="text-xs text-slate-600">
              Upload Image
            </Label>
            <Input
              id="backside-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {backside.content && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <img
                  src={backside.content}
                  alt="Backside preview"
                  className="w-full h-auto max-h-24 object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="backside-text" className="text-xs text-slate-600">
                Enter Text
              </Label>
              {showCharCount && (
                <span className={`text-xs ${isOverLimit ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                  {charCount} / 512
                </span>
              )}
            </div>
            <Textarea
              id="backside-text"
              value={backside.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter backside text (max 512 characters)"
              className={`min-h-[120px] ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
              maxLength={512}
            />
            {isOverLimit && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                ⚠️ Text exceeds 512 character limit
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Position & Scale Controls */}
      <div className="border-t border-slate-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-medium text-sm text-slate-700">Position & Scale</span>
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
        
        {isExpanded && (
          <div className="p-4 space-y-4 bg-white">
            {/* Horizontal Position */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-600">Horizontal Position</Label>
                <span className="text-xs text-slate-500">{transform.offsetX}%</span>
              </div>
              <Slider
                value={[transform.offsetX]}
                onValueChange={([value]) => setLabelTransform('backside', { offsetX: value })}
                min={-50}
                max={50}
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
                onValueChange={([value]) => setLabelTransform('backside', { offsetY: value })}
                min={-50}
                max={50}
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
                onValueChange={([value]) => setLabelTransform('backside', { scale: value })}
                min={0.5}
                max={2.0}
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
              Reset Backside
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
