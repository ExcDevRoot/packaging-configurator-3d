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
  const [decodedConfig, setDecodedConfig] = useState<PackageConfig | null>(null);

  useEffect(() => {
    // Parse URL parameters from window.location.search (wouter's location hook doesn't include query string)
    const searchParams = new URLSearchParams(window.location.search);
    const configParam = searchParams.get('config');
    
    if (configParam) {
      try {
        // Decode base64 and parse JSON
        const decoded = atob(configParam);
        const snapshot = JSON.parse(decoded);
        
        // Handle both old format (just config) and new format (snapshot with view settings)
        const config = (snapshot.packageConfig || snapshot) as PackageConfig;  // Backwards compatible
        const showWrapper = snapshot.showWrapper !== undefined ? snapshot.showWrapper : true;  // Default to true
        const showReferenceSurface = snapshot.showReferenceSurface !== undefined ? snapshot.showReferenceSurface : false;
        const customSceneBackgroundColor = snapshot.customSceneBackgroundColor || null;
        const customReferenceSurfaceColor = snapshot.customReferenceSurfaceColor || null;
        
        console.log('[ViewerPopout] Config decoded from URL:', config.type);
        console.log('[ViewerPopout] Wrapper state from URL:', showWrapper);
        console.log('[ViewerPopout] Reference surface from URL:', showReferenceSurface);
        console.log('[ViewerPopout] Store BEFORE update:', useConfigStore.getState().currentPackage);
        
        // FIX OPTION 1: Synchronously update store to prevent race condition
        // This ensures Package3DModelViewer reads correct values on mount
        useConfigStore.setState({
          currentPackage: config.type,
          showWrapper,           // ← Apply wrapper state from URL
          showReferenceSurface,  // ← Apply reference surface state from URL
          customSceneBackgroundColor,  // ← Apply custom scene background color from URL
          customReferenceSurfaceColor, // ← Apply custom reference surface color from URL
          packageConfig: {
            ...config,
            // Migration: Add backside property if missing (for old templates)
            labelTransform: {
              ...config.labelTransform,
              backside: config.labelTransform.backside || { offsetX: -14, offsetY: 7, scale: 1.0 },
            },
            labelContent: {
              ...config.labelContent,
              backside: config.labelContent.backside || { type: 'image' as const, content: '' },
            },
          },
        });
        
        console.log('[ViewerPopout] Store AFTER update:', useConfigStore.getState().currentPackage);
        
        // OPTION 2: Store decoded config to pass as prop (deterministic, no timing dependency)
        setDecodedConfig({
          ...config,
          labelTransform: {
            ...config.labelTransform,
            backside: config.labelTransform.backside || { offsetX: -14, offsetY: 7, scale: 1.0 },
          },
          labelContent: {
            ...config.labelContent,
            backside: config.labelContent.backside || { type: 'image' as const, content: '' },
          },
        });
        
        setConfigSource('url');
        
        // Minimal delay (not relying on store propagation anymore)
        setTimeout(() => {
          console.log('[ViewerPopout] Setting isReady=true after 10ms delay');
          setIsReady(true);
        }, 10);
        
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
  }, [location]);

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
      {/* OPTION 2: Pass decoded config as prop for deterministic rendering */}
      <Package3DModelViewer 
        overrideConfig={decodedConfig ? {
          type: decodedConfig.type,
          packageConfig: decodedConfig
        } : undefined}
      />
      
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
