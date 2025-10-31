import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

const AVAILABLE_INGREDIENTS = [
  "Lion's Mane - Soluble Extract Powder",
  "Lion's Mane - Whole Mushroom Powder",
  "Maitake - Soluble Extract Powder",
  "Maitake - Whole Mushroom Powder",
  "Panax ginseng",
  "Reishi - Soluble Extract Powder",
  "Reishi - Whole Mushroom Powder",
  "Rhodiola rosea",
  "Schisandra chinensis",
  "Shiitake - Soluble Extract Powder",
  "Liposomal Multivitamin",
  "Liposomal B-Complex",
  "Liposomal Magnesium",
  "Liposomal Creatine",
  "Liposomal Iron",
  "Vitamin K2 (MK-4)",
  "Vitamin K2 (MK-7)",
  "Bergamot Powder",
  "Coffee Powder",
  "Ginger Powder",
  "Cranberry",
  "Cucumber",
  "Dandelion/Burdock Root",
  "Date",
  "Earl Grey",
  "Elderberry",
  "Elderflower",
  "Turmeric",
  "Vanilla (Planifolia)",
  "Vanilla (Tahitensis)",
  "Walnut",
  "Watermelon",
  "White Pepper",
  "Yerba Mate",
  "Yuzu",
];

interface IngredientsSelectorProps {
  selectedIngredients: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientsSelector({ selectedIngredients, onChange }: IngredientsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredIngredients = AVAILABLE_INGREDIENTS.filter(
    ing => 
      ing.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.includes(ing)
  );
  
  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      onChange([...selectedIngredients, ingredient]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };
  
  const removeIngredient = (ingredient: string) => {
    onChange(selectedIngredients.filter(ing => ing !== ingredient));
  };
  
  return (
    <div className="space-y-3">
      {/* Selected Ingredients */}
      <div className="flex flex-wrap gap-2">
        {selectedIngredients.map((ingredient) => (
          <Badge
            key={ingredient}
            variant="secondary"
            className="pl-2 pr-1 py-1 text-xs"
          >
            <span className="mr-1">{ingredient}</span>
            <button
              onClick={() => removeIngredient(ingredient)}
              className="hover:bg-slate-300 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      {/* Add Ingredient Input */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search ingredients..."
            className="flex-1 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (searchTerm && !selectedIngredients.includes(searchTerm)) {
                addIngredient(searchTerm);
              }
            }}
            className="gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && searchTerm && filteredIngredients.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredIngredients.slice(0, 10).map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => addIngredient(ingredient)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors"
              >
                {ingredient}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
