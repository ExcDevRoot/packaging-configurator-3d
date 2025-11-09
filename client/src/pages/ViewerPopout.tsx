import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Package3DModelViewer from '@/components/Package3DModelViewer';
import { useConfigStore, type PackageConfig } from '@/store/configStore';

/**
 * ViewerPopout - Developer Demo Mode Pop-out 3D Viewer
 * 
 * This component renders a standalone 3D viewer in a pop-out window.
 * Configuration is passed via URL parameter (base64-encoded JSON).
 * 
 * Features:
 * - Snapshot-based: Captures config at pop-out time (no live sync)
 * - Independent camera controls: Rotate/zoom independently from parent
 * - Multiple instances: Can open multiple pop-outs for comparison
 * - Persistent: Continues working even if parent closes
 * 
 * Usage: Opened via "Pop-out 3D Viewer" button in Advanced Controls
 */
export default function ViewerPopout() {
  const [location] = useLocation();
  const { packageConfig, applyTemplate } = useConfigStore();
  const [isReady, setIsReady] = useState(false);
  const [configSource, setConfigSource] = useState<'url' | 'store'>('store');

  useEffect(() => {
    // Parse URL parameters
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const configParam = searchParams.get('config');
    
    if (configParam) {
      try {
        // Decode base64 and parse JSON
        const decoded = atob(configParam);
        const config = JSON.parse(decoded) as PackageConfig;
        
        // Apply decoded configuration to store
        applyTemplate(config);
        setConfigSource('url');
        setIsReady(true);
        
        console.log('[ViewerPopout] Loaded config from URL:', config.type);
      } catch (error) {
        console.error('[ViewerPopout] Failed to decode config from URL:', error);
        // Fall back to current store config
        setConfigSource('store');
        setIsReady(true);
      }
    } else {
      // No config in URL - use current store config
      console.log('[ViewerPopout] No config in URL, using current store config');
      setConfigSource('store');
      setIsReady(true);
    }
  }, [location, applyTemplate]);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-100 to-slate-200 relative">
      {/* 3D Viewer - Full Screen */}
      <Package3DModelViewer />
      
      {/* Top Right: Demo Mode Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-slate-200">
        <p className="text-xs font-semibold text-teal-600">🎬 Demo Viewer</p>
        <p className="text-xs text-slate-500">Snapshot Mode</p>
        {configSource === 'url' && (
          <p className="text-xs text-slate-400 mt-1">Config from URL</p>
        )}
      </div>
      
      {/* Bottom Left: Package Info */}
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
      
      {/* Bottom Right: Controls Info */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-slate-200">
        <p className="text-xs font-semibold text-slate-700 mb-2">Controls</p>
        <div className="text-xs text-slate-600 space-y-1">
          <div><span className="font-medium">Click + Drag:</span> Rotate</div>
          <div><span className="font-medium">Scroll:</span> Zoom In/Out</div>
          <div><span className="font-medium">Right-Click + Drag:</span> Translate View</div>
        </div>
      </div>
    </div>
  );
}
