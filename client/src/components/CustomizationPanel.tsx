import { useConfigStore, PackageType } from '@/store/configStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Package, 
  Palette, 
  Type, 
  Image as ImageIcon,
  RotateCcw,
  Camera,
  Eye
} from 'lucide-react';

export default function CustomizationPanel() {
  const {
    currentPackage,
    packageConfig,
    viewMode,
    cameraPreset,
    setPackageType,
    setBaseColor,
    setMaterial,
    updateLabelContent,
    setViewMode,
    setCameraPreset,
    resetConfig,
  } = useConfigStore();
  
  const packageTypes: { type: PackageType; label: string; icon: string }[] = [
    { type: 'can-12oz', label: '12oz Can', icon: '🥫' },
    { type: 'bottle-2oz', label: '2oz Bottle', icon: '🍶' },
    { type: 'stick-pack', label: 'Stick Pack', icon: '📦' },
    { type: 'bottle-750ml', label: '750ml Bottle', icon: '🍾' },
  ];
  
  return (
    <div className="h-full overflow-y-auto bg-white border-l border-slate-200">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Customize</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={resetConfig}
            className="gap-2"
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
              View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-slate-600 mb-2 block">View Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === '3d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('3d')}
                  className="flex-1"
                >
                  3D View
                </Button>
                <Button
                  variant={viewMode === '2d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('2d')}
                  className="flex-1"
                >
                  2D View
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-slate-600 mb-2 block">Camera Angle</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'back', 'side', 'angle'] as const).map((preset) => (
                  <Button
                    key={preset}
                    variant={cameraPreset === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCameraPreset(preset)}
                    className="capitalize"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
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
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setPackageType(type)}
                    >
                      <span className="text-2xl">{icon}</span>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
