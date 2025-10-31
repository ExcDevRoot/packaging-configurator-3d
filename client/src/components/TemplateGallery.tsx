import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DESIGN_TEMPLATES, TEMPLATE_CATEGORIES, DesignTemplate } from '@/data/templates';
import { useConfigStore } from '@/store/configStore';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplateGallery({ open, onClose }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { applyTemplate } = useConfigStore();
  
  const filteredTemplates = DESIGN_TEMPLATES.filter(template => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const handleApplyTemplate = (template: DesignTemplate) => {
    applyTemplate(template.config);
    toast.success(`Applied "${template.name}" template!`, {
      description: 'You can now customize it further',
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Design Templates
          </DialogTitle>
          <DialogDescription>
            Choose from professionally designed templates to get started quickly
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {TEMPLATE_CATEGORIES.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="gap-1"
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleApplyTemplate(template)}
              >
                {/* Template Preview */}
                <div 
                  className="h-40 flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: template.config.baseColor,
                    background: `linear-gradient(135deg, ${template.config.baseColor} 0%, ${adjustBrightness(template.config.baseColor, -20)} 100%)`
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="text-center z-10">
                    <div className="text-white font-bold text-lg drop-shadow-lg">
                      {template.config.labelContent.productName}
                    </div>
                    <div className="text-white/80 text-xs mt-1 drop-shadow">
                      {template.config.labelContent.description}
                    </div>
                  </div>
                  
                  {/* Package Type Badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs"
                  >
                    {formatPackageType(template.config.type)}
                  </Badge>
                </div>
                
                {/* Template Info */}
                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <span className="text-lg flex-shrink-0">
                      {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTemplate(template);
                    }}
                  >
                    Apply Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function formatPackageType(type: string): string {
  const map: Record<string, string> = {
    'can-12oz': '12oz Can',
    'bottle-2oz': '2oz Bottle',
    'stick-pack': 'Stick Pack',
    'bottle-750ml': '750ml Bottle',
  };
  return map[type] || type;
}
