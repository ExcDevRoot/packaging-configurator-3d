import React from 'react';
import {
  useConfigStore,
  type PackageType,
  type LabelContent,
} from '@/store/configStore';
import { Package3DModelViewerHandle } from './Package3DModelViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Package, 
  Palette, 
  Type, 
  Image as ImageIcon,
  RotateCcw,
  Camera,
  Eye,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import LabelElementControls from './LabelElementControls';
import TextStyleControls from './TextStyleControls';
import BacksideElementControls from './BacksideElementControls';

interface CustomizationPanelProps {
  modelViewerRef?: React.RefObject<Package3DModelViewerHandle>;
}

export default function CustomizationPanel({ modelViewerRef }: CustomizationPanelProps) {
  const {
    currentPackage,
    packageConfig,

    cameraPreset,
    showReferenceSurface,
    showWrapper,
    setPackageType,
    setBaseColor,
    setMaterial,
    setLabelBackgroundColor,
    updateLabelContent,
    setViewMode,
    setCameraPreset,
    setShowReferenceSurface,
    setShowWrapper,
    resetConfig,
  } = useConfigStore();
  
  const [cameraPOV, setCameraPOV] = React.useState<{
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    zoom: number;
  } | null>(null);
  
  const [advancedControlsExpanded, setAdvancedControlsExpanded] = React.useState(false);
  
  const packageTypes: { type: PackageType; label: string; icon: string }[] = [
    { type: 'can-12oz', label: '12oz or 16oz Can', icon: '/assets/12oz_aluminumcan_128x128px.png' },
    { type: 'bottle-2oz', label: '2oz Shot', icon: '/assets/2oz_whiteshot_128x128px.png' },
    { type: 'stick-pack', label: 'Stick Pack', icon: '/assets/icons/coffee_stick_icon.png' },
    { type: 'bottle-750ml', label: '750ml Bottle', icon: '/assets/bottle-750ml-icon.png' },
    { type: 'pkgtype5', label: '1L Bottle', icon: '/assets/icons/wine_bottle_icon.png' },
    { type: 'pkgtype6', label: 'Specialty Package', icon: '/assets/icons/crystal_head_icon.png' },
    { type: 'pkgtype7', label: 'Gummies Mylar Bag', icon: '/assets/icons/gummies_mylar_bag_icon.png' },
    { type: 'pkgtype8', label: 'Gummies Glass Jar', icon: '/assets/icons/gummies_glass_jar_icon.png' },
  ];
  
  return (
    <div className="h-full overflow-y-auto bg-[#47476b] border-l border-slate-200">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Customization Controls</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={resetConfig}
            className="gap-2 bg-[#d1d1e0] hover:bg-[#c1c1d0]"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        
        {/* View Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4" />
              3D View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-slate-600 mb-2 block">Camera Angle</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'back', 'side', 'angle'] as const).map((preset) => (
                  <Button
                    key={preset}
                    variant={cameraPreset === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setCameraPreset(preset);
                      // Apply camera position using setCameraState
                      const CAMERA_PRESETS = {
                        front: { position: { x: 8.61, y: 2.54, z: 52.28 }, target: { x: -4.03, y: -1.39, z: 0.50 }, zoom: 1 },
                        back: { position: { x: 46.57, y: 1.08, z: -23.50 }, target: { x: 5.45, y: 0.40, z: 4.94 }, zoom: 1 },
                        side: { position: { x: 49.92, y: 0.62, z: 25.00 }, target: { x: 2.57, y: -0.06, z: 8.93 }, zoom: 1 },
                        angle: { position: { x: 33.24, y: 20.92, z: 56.92 }, target: { x: -5.65, y: -9.82, z: 15.46 }, zoom: 1 },
                      };
                      modelViewerRef?.current?.setCameraState(CAMERA_PRESETS[preset]);
                    }}
                    className="capitalize"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Advanced Controls Header */}
              <button
                onClick={() => setAdvancedControlsExpanded(!advancedControlsExpanded)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-sm text-slate-700">Advanced Controls</span>
                </div>
                {advancedControlsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              
              {/* Advanced Controls Content */}
              {advancedControlsExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-slate-600">Reference Surface</Label>
                      <p className="text-xs text-slate-500 mt-0.5">Show/hide ground platform</p>
                    </div>
                    <Switch
                      checked={showReferenceSurface}
                      onCheckedChange={setShowReferenceSurface}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-slate-600">Show Wrapper</Label>
                      <p className="text-xs text-slate-500 mt-0.5">Toggle label/wrapper visibility</p>
                    </div>
                    <Switch
                      checked={showWrapper}
                      onCheckedChange={setShowWrapper}
                    />
                  </div>
                  
                  <div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const state = modelViewerRef?.current?.getCameraState();
                          if (state) {
                            setCameraPOV(state);
                          }
                        }}
                      className="w-full gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Get Camera POV
                    </Button>
                    
                    {cameraPOV && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                        <div className="text-xs font-semibold text-slate-700">Camera Position</div>
                        <div className="text-xs text-slate-600 font-mono">
                          x: {cameraPOV.position.x.toFixed(2)}, y: {cameraPOV.position.y.toFixed(2)}, z: {cameraPOV.position.z.toFixed(2)}
                        </div>
                        
                        <div className="text-xs font-semibold text-slate-700 mt-2">Camera Target</div>
                        <div className="text-xs text-slate-600 font-mono">
                          x: {cameraPOV.target.x.toFixed(2)}, y: {cameraPOV.target.y.toFixed(2)}, z: {cameraPOV.target.z.toFixed(2)}
                        </div>
                        
                        <div className="text-xs font-semibold text-slate-700 mt-2">Zoom</div>
                        <div className="text-xs text-slate-600 font-mono">
                          {cameraPOV.zoom.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for different customization sections */}
        <Tabs defaultValue="package" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="package" className="gap-1">
              <Package className="w-3 h-3" />
              <span className="text-xs">Package</span>
            </TabsTrigger>
            <TabsTrigger value="material" className="gap-1">
              <Palette className="w-3 h-3" />
              <span className="text-xs">Material</span>
            </TabsTrigger>
            <TabsTrigger value="label" className="gap-1">
              <Type className="w-3 h-3" />
              <span className="text-xs">Label</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Package Selection */}
          <TabsContent value="package" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Package Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {packageTypes.map(({ type, label, icon }) => (
                    <Button
                      key={type}
                      variant={currentPackage === type ? 'default' : 'outline'}
                      className={`h-20 flex flex-col gap-2 ${currentPackage === type ? '' : 'bg-[#cce6ff] hover:bg-[#b3d9ff]'}`}
                      onClick={() => setPackageType(type)}
                    >
                      <img src={icon} alt={label} className="w-12 h-12 object-contain" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Material Properties */}
          <TabsContent value="material" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Base Color</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={packageConfig.baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={packageConfig.baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Label Background Color</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={packageConfig.labelBackgroundColor}
                    onChange={(e) => setLabelBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={packageConfig.labelBackgroundColor}
                    onChange={(e) => setLabelBackgroundColor(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Background color for the label area on the can (visible in 3D view)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Material Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-600 mb-2 flex justify-between">
                    <span>Metalness</span>
                    <span className="font-mono">{packageConfig.metalness.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[packageConfig.metalness]}
                    onValueChange={([value]) => setMaterial(value, packageConfig.roughness)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-slate-600 mb-2 flex justify-between">
                    <span>Roughness</span>
                    <span className="font-mono">{packageConfig.roughness.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[packageConfig.roughness]}
                    onValueChange={([value]) => setMaterial(packageConfig.metalness, value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Label Content */}
          <TabsContent value="label" className="space-y-4">
            {/* Label Position & Scale */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Label Position & Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LabelElementControls element="logo" title="Logo" icon="🏷️" />
                <LabelElementControls element="textGroup" title="Text Group" icon="📝" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Label Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName" className="text-xs text-slate-600">
                    Product Name
                  </Label>
                  <Input
                    id="productName"
                    value={packageConfig.labelContent.productName}
                    onChange={(e) => updateLabelContent({ productName: e.target.value })}
                    placeholder="Enter product name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-xs text-slate-600">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={packageConfig.labelContent.description}
                    onChange={(e) => updateLabelContent({ description: e.target.value })}
                    placeholder="Enter description"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ingredients" className="text-xs text-slate-600">
                    Ingredients
                  </Label>
                  <Textarea
                    id="ingredients"
                    value={packageConfig.labelContent.ingredients}
                    onChange={(e) => updateLabelContent({ ingredients: e.target.value })}
                    placeholder="List ingredients"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="volume" className="text-xs text-slate-600">
                    Volume / Size
                  </Label>
                  <Input
                    id="volume"
                    value={packageConfig.labelContent.volume}
                    onChange={(e) => updateLabelContent({ volume: e.target.value })}
                    placeholder="e.g., 12 FL OZ (355mL)"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Text Styling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Text Styling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TextStyleControls element="productName" title="Product Name" icon="📝" />
                <TextStyleControls element="description" title="Description" icon="📄" />
                <TextStyleControls element="volume" title="Volume" icon="📏" />
                <TextStyleControls element="ingredients" title="Ingredients" icon="🌿" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logo Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateLabelContent({ logoUrl: event.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="cursor-pointer"
                />
                {packageConfig.labelContent.logoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <img
                      src={packageConfig.labelContent.logoUrl}
                      alt="Logo preview"
                      className="w-full h-auto max-h-24 object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Backside Element */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Backside Element</CardTitle>
              </CardHeader>
              <CardContent>
                <BacksideElementControls />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
