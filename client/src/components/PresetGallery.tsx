import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfigStore } from '@/store/configStore';
import { getAllPresets, deletePreset, UserPreset } from '@/utils/presetStorage';
import { toast } from 'sonner';
import { Trash2, Download } from 'lucide-react';

interface PresetGalleryProps {
  open: boolean;
  onClose: () => void;
}

export default function PresetGallery({ open, onClose }: PresetGalleryProps) {
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const loadPreset = useConfigStore(state => state.loadPreset);
  
  // Load presets when dialog opens
  useEffect(() => {
    if (open) {
      setPresets(getAllPresets());
    }
  }, [open]);
  
  const handleLoadPreset = (preset: UserPreset) => {
    try {
      loadPreset(preset.id);
      toast.success('Preset loaded!', {
        description: `"${preset.name}" has been applied`,
      });
      onClose();
    } catch (error) {
      toast.error('Failed to load preset');
      console.error('Load preset error:', error);
    }
  };
  
  const handleDeletePreset = (preset: UserPreset, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!confirm(`Delete preset "${preset.name}"?`)) {
      return;
    }
    
    try {
      deletePreset(preset.id);
      setPresets(getAllPresets()); // Refresh list
      toast.success('Preset deleted', {
        description: `"${preset.name}" has been removed`,
      });
    } catch (error) {
      toast.error('Failed to delete preset');
      console.error('Delete preset error:', error);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>My Presets</DialogTitle>
          <DialogDescription>
            Load or delete your saved configurations
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {presets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No presets saved yet</p>
              <p className="text-sm text-muted-foreground">
                Customize your package and click "Save Preset" to save your configuration
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Card
                  key={preset.id}
                  className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                  onClick={() => handleLoadPreset(preset)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {preset.thumbnail ? (
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Download className="w-8 h-8" />
                      </div>
                    )}
                    
                    {/* Delete button overlay */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleDeletePreset(preset, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {preset.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(preset.updatedAt)}</span>
                      <span className="capitalize">{preset.viewMode} View</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
