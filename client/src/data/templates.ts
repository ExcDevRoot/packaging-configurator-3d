import type { PackageConfig, TextStyles } from '../store/configStore';

const BASE_URL = import.meta.env.BASE_URL;

const DEFAULT_TEXT_STYLES: TextStyles = {
  productName: { fontFamily: 'Inter, system-ui, sans-serif', color: 'auto' },
  description: { fontFamily: 'Inter, system-ui, sans-serif', color: 'auto' },
  volume: { fontFamily: 'Inter, system-ui, sans-serif', color: 'auto' },
  ingredients: { fontFamily: 'Inter, system-ui, sans-serif', color: 'auto' },
};

export interface DesignTemplate {
  id: string;
  name: string;
  category: 'energy' | 'wellness' | 'coffee' | 'juice' | 'alcohol' | 'water';
  description: string;
  thumbnail?: string;
  config: PackageConfig;
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  // Energy Drinks
  {
    id: 'energy-bolt',
    name: 'Energy Bolt',
    category: 'energy',
    description: 'High-energy design with bold colors and dynamic branding',
    config: {
      type: 'can-12oz',
      baseColor: '#ff1744',
      metalness: 0.95,
      roughness: 0.05,
      labelContent: {
        productName: 'BOLT Energy',
        description: 'Maximum Performance Formula',
        ingredients: 'Caffeine, Taurine, B-Vitamins, Panax ginseng, L-Carnitine',
        volume: '12 FL OZ (355mL)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'energy-thunder',
    name: 'Thunder Strike',
    category: 'energy',
    description: 'Electric blue energy drink with premium metallic finish',
    config: {
      type: 'can-12oz',
      baseColor: '#2196f3',
      metalness: 0.90,
      roughness: 0.10,
      labelContent: {
        productName: 'THUNDER',
        description: 'Unleash Your Power',
        ingredients: 'Caffeine, Guarana, Yerba Mate, B-Complex, Electrolytes',
        volume: '16 FL OZ (473mL)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  
  // Wellness Beverages
  {
    id: 'wellness-calm',
    name: 'Calm & Clarity',
    category: 'wellness',
    description: 'Soothing wellness drink with natural ingredients',
    config: {
      type: 'bottle-750ml',
      baseColor: '#e8f5e9',
      metalness: 0.20,
      roughness: 0.40,
      labelContent: {
        productName: 'Calm Clarity',
        description: 'Adaptogenic Wellness Blend',
        ingredients: "Lion's Mane Extract, Reishi Extract, Rhodiola rosea, Liposomal Magnesium",
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'wellness-immunity',
    name: 'Immunity Boost',
    category: 'wellness',
    description: 'Vitamin-rich immunity support beverage',
    config: {
      type: 'bottle-2oz',
      baseColor: '#fff3e0',
      metalness: 0.15,
      roughness: 0.50,
      labelContent: {
        productName: 'Immunity+',
        description: 'Daily Defense Formula',
        ingredients: 'Elderberry, Vitamin C, Zinc, Echinacea, Ginger Powder, Turmeric',
        volume: '2 FL OZ (60mL)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  
  // Coffee Drinks
  {
    id: 'coffee-cold-brew',
    name: 'Cold Brew Classic',
    category: 'coffee',
    description: 'Premium cold brew coffee with smooth finish',
    config: {
      type: 'bottle-750ml',
      baseColor: '#3e2723',
      metalness: 0.30,
      roughness: 0.35,
      labelContent: {
        productName: 'Cold Brew',
        description: 'Small Batch Roasted',
        ingredients: 'Coffee Powder, Filtered Water, Natural Vanilla (Planifolia)',
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'coffee-nitro',
    name: 'Nitro Coffee',
    category: 'coffee',
    description: 'Nitrogen-infused coffee for creamy texture',
    config: {
      type: 'can-12oz',
      baseColor: '#1a1a1a',
      metalness: 0.85,
      roughness: 0.15,
      labelContent: {
        productName: 'NITRO',
        description: 'Nitrogen-Infused Cold Brew',
        ingredients: 'Coffee Powder, Nitrogen, Filtered Water',
        volume: '12 FL OZ (355mL)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  
  // Juice & Smoothies
  {
    id: 'juice-tropical',
    name: 'Tropical Fusion',
    category: 'juice',
    description: 'Vibrant tropical fruit blend',
    config: {
      type: 'bottle-750ml',
      baseColor: '#ff9800',
      metalness: 0.10,
      roughness: 0.60,
      labelContent: {
        productName: 'Tropical Fusion',
        description: 'Fresh Pressed Juice',
        ingredients: 'Mango, Pineapple, Passion Fruit, Coconut Water, Yuzu',
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'juice-green',
    name: 'Green Vitality',
    category: 'juice',
    description: 'Nutrient-packed green juice blend',
    config: {
      type: 'bottle-750ml',
      baseColor: '#66bb6a',
      metalness: 0.10,
      roughness: 0.55,
      labelContent: {
        productName: 'Green Vitality',
        description: 'Cold-Pressed Greens',
        ingredients: 'Kale, Spinach, Cucumber, Celery, Ginger Powder, Lemon',
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  
  // Alcohol
  {
    id: 'alcohol-craft-spirit',
    name: 'Craft Spirit',
    category: 'alcohol',
    description: 'Premium artisanal spirit with elegant design',
    config: {
      type: 'bottle-750ml',
      baseColor: '#f5f5f5',
      metalness: 0.05,
      roughness: 0.70,
      labelContent: {
        productName: 'Artisan Spirit',
        description: 'Small Batch Distilled',
        ingredients: 'Premium Grain, Filtered Water, Natural Botanicals',
        volume: '750mL (40% ABV)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'alcohol-cocktail-rtd',
    name: 'Ready-to-Drink Cocktail',
    category: 'alcohol',
    description: 'Pre-mixed cocktail in a can',
    config: {
      type: 'can-12oz',
      baseColor: '#ec407a',
      metalness: 0.88,
      roughness: 0.12,
      labelContent: {
        productName: 'Sunset Spritz',
        description: 'Premium RTD Cocktail',
        ingredients: 'Vodka, Cranberry, Elderflower, Sparkling Water',
        volume: '12 FL OZ (355mL, 8% ABV)',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  
  // Water & Hydration
  {
    id: 'water-alkaline',
    name: 'Alkaline Water',
    category: 'water',
    description: 'pH-balanced premium water',
    config: {
      type: 'bottle-750ml',
      baseColor: '#e3f2fd',
      metalness: 0.05,
      roughness: 0.80,
      labelContent: {
        productName: 'Alkaline Pure',
        description: 'pH 9.5+ Ionized Water',
        ingredients: 'Purified Water, Electrolytes, Himalayan Minerals',
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
  {
    id: 'water-electrolyte',
    name: 'Electrolyte Sport',
    category: 'water',
    description: 'Sports hydration with electrolytes',
    config: {
      type: 'bottle-750ml',
      baseColor: '#4fc3f7',
      metalness: 0.10,
      roughness: 0.70,
      labelContent: {
        productName: 'Hydrate Pro',
        description: 'Performance Hydration',
        ingredients: 'Purified Water, Sodium, Potassium, Magnesium, Watermelon Extract',
        volume: '750mL',
        logoUrl: `${BASE_URL}assets/brix-logo.png`,
      },
      labelTransform: {
        logo: { offsetX: 0, offsetY: 0, scale: 1.0 },
        textGroup: { offsetX: 0, offsetY: 0, scale: 1.0 },
      },
      textStyles: DEFAULT_TEXT_STYLES,
      labelBackgroundColor: "#ffffff",
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'energy', name: 'Energy Drinks', icon: '⚡' },
  { id: 'wellness', name: 'Wellness', icon: '🌿' },
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'juice', name: 'Juice & Smoothies', icon: '🍊' },
  { id: 'alcohol', name: 'Alcohol', icon: '🍸' },
  { id: 'water', name: 'Water & Hydration', icon: '💧' },
] as const;
