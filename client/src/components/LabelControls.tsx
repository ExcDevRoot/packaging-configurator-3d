import { useConfigStore } from '@/store/configStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function LabelControls() {
  const { packageConfig, setLabelTransform, resetLabelTransform } = useConfigStore();
  const { labelTransform } = packageConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Label Position & Scale</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetLabelTransform}
          className="h-8 px-2"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>

      {/* Horizontal Position */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Horizontal Position</Label>
          <span className="text-xs text-slate-500">{labelTransform.offsetX}%</span>
        </div>
        <Slider
          value={[labelTransform.offsetX]}
          onValueChange={([value]) => setLabelTransform({ offsetX: value })}
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
          <Label className="text-xs font-medium">Vertical Position</Label>
          <span className="text-xs text-slate-500">{labelTransform.offsetY}%</span>
        </div>
        <Slider
          value={[labelTransform.offsetY]}
          onValueChange={([value]) => setLabelTransform({ offsetY: value })}
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
          <Label className="text-xs font-medium">Label Scale</Label>
          <span className="text-xs text-slate-500">{labelTransform.scale.toFixed(2)}x</span>
        </div>
        <Slider
          value={[labelTransform.scale]}
          onValueChange={([value]) => setLabelTransform({ scale: value })}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">Tip:</span> Adjust position and scale to fit your label perfectly on the package surface.
        </p>
      </div>
    </div>
  );
}
