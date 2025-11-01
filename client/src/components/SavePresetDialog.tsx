import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/store/configStore';
import { toast } from 'sonner';

interface SavePresetDialogProps {
  open: boolean;
  onClose: () => void;
  thumbnail?: string;
}

export default function SavePresetDialog({ open, onClose, thumbnail }: SavePresetDialogProps) {
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveAsPreset = useConfigStore(state => state.saveAsPreset);
  
  const handleSave = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      saveAsPreset(presetName.trim(), thumbnail);
      toast.success('Preset saved successfully!', {
        description: `"${presetName}" has been added to your presets`,
      });
      setPresetName('');
      onClose();
    } catch (error) {
      toast.error('Failed to save preset');
      console.error('Save preset error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    setPresetName('');
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Current Configuration</DialogTitle>
          <DialogDescription>
            Save your current package design as a preset for quick access later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="e.g., Summer Edition 2024"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaving) {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
          
          {thumbnail && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={thumbnail} 
                  alt="Preset preview" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !presetName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Preset'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
