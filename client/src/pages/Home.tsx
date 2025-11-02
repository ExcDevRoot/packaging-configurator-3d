import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Save, Sparkles, Bookmark, FolderOpen } from 'lucide-react';
import Package3DViewerEnhanced from '@/components/Package3DViewerEnhanced';
import Package3DModelViewer, { Package3DModelViewerHandle } from '@/components/Package3DModelViewer';
import CustomizationPanel from '@/components/CustomizationPanel';
import TemplateGallery from '@/components/TemplateGallery';
import SavePresetDialog from '@/components/SavePresetDialog';
import PresetGallery from '@/components/PresetGallery';
import { useConfigStore } from '@/store/configStore';
import { toast } from 'sonner';
import { generateThumbnail } from '@/utils/presetStorage';

export default function Home() {
  const { packageConfig, currentPackage, viewMode } = useConfigStore();
  const modelViewerRef = useRef<Package3DModelViewerHandle>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [presetThumbnail, setPresetThumbnail] = useState<string>();
  const [presetCameraState, setPresetCameraState] = useState<{ position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number } | null>(null);
  const [lastPresetLoadTime, setLastPresetLoadTime] = useState<number>(0);

  // Restore camera state when preset is loaded
  useEffect(() => {
    if (lastPresetLoadTime > 0 && modelViewerRef.current && presetCameraState) {
      // Small delay to ensure the model is updated
      setTimeout(() => {
        modelViewerRef.current?.setCameraState(presetCameraState);
      }, 100);
    }
  }, [lastPresetLoadTime, presetCameraState]);
  
  const handleExport = () => {
    toast.success('Export feature coming soon!', {
      description: 'Will export high-resolution PNG/JPEG of current view',
    });
  };
  
  const handleShare = () => {
    const configData = JSON.stringify(packageConfig);
    const shareUrl = `${window.location.origin}?config=${encodeURIComponent(configData)}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy share link');
    });
  };
  
  const handleSave = () => {
    const configJson = JSON.stringify(packageConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `package-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Configuration saved!');
  };
  
  const handleSavePreset = () => {
    // Try to capture thumbnail from canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        const thumbnail = generateThumbnail(canvas);
        setPresetThumbnail(thumbnail);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }
    
    // Capture camera state if in 3D view
    if (viewMode === '3d' && modelViewerRef.current) {
      const cameraState = modelViewerRef.current.getCameraState();
      setPresetCameraState(cameraState);
    } else {
      setPresetCameraState(null);
    }
    
    setShowSavePreset(true);
  };
  
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">3D</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Packaging Configurator</h1>
            <p className="text-xs text-slate-500">Professional 3D Visualization Tool</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTemplates(true)} 
            className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
          >
            <Sparkles className="w-4 h-4" />
            Templates
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPresetGallery(true)} 
            className="gap-2 border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <FolderOpen className="w-4 h-4" />
            My Presets
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSavePreset} 
            className="gap-2 border-teal-500 text-teal-700 hover:bg-teal-50"
          >
            <Bookmark className="w-4 h-4" />
            Save Preset
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="default" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-100 to-slate-200">
          {viewMode === '3d' ? <Package3DModelViewer ref={modelViewerRef} /> : <Package3DViewerEnhanced />}
          
          {/* Viewport Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-slate-200">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Package:</span>
                <span className="capitalize">{packageConfig.type.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Material:</span>
                <span>M: {packageConfig.metalness.toFixed(2)} / R: {packageConfig.roughness.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Controls Info */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-2">Controls</p>
            <div className="text-xs text-slate-600 space-y-1">
              {viewMode === '3d' && <div><span className="font-medium">Click + Drag:</span> Rotate</div>}
              <div><span className="font-medium">Scroll:</span> Zoom In/Out</div>
              <div><span className="font-medium">Right-Click + Drag:</span> Translate View</div>
            </div>
          </div>
        </div>
        
        {/* Customization Panel */}
        {isPanelOpen && (
          <div className="w-96 flex-shrink-0 border-l border-slate-300">
            <CustomizationPanel modelViewerRef={modelViewerRef} />
          </div>
        )}
        
        {/* Panel Toggle */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-l-lg px-2 py-4 shadow-lg hover:bg-slate-50 transition-all z-10 ${
            isPanelOpen ? 'right-96' : 'right-0'
          }`}
        >
          <span className="text-slate-600 text-lg font-bold">
            {isPanelOpen ? '›' : '‹'}
          </span>
        </button>
      </div>
      
      {/* Template Gallery Modal */}
      <TemplateGallery open={showTemplates} onClose={() => setShowTemplates(false)} />
      
      {/* Save Preset Dialog */}
      <SavePresetDialog 
        open={showSavePreset} 
        onClose={() => setShowSavePreset(false)}
        thumbnail={presetThumbnail}
        cameraState={presetCameraState}
      />
      
      {/* Preset Gallery */}
        <PresetGallery 
          open={showPresetGallery}
          onClose={() => setShowPresetGallery(false)}
          onPresetLoaded={(cameraState) => {
            setPresetCameraState(cameraState || null);
            setLastPresetLoadTime(Date.now());
          }}
        />
    </div>
  );
}
