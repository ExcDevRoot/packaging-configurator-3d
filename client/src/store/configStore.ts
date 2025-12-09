import { create } from 'zustand';
import { savePreset as savePresetToStorage, getPresetById } from '@/utils/presetStorage';

export type PackageType = 'bottle-2oz' | 'can-12oz' | 'stick-pack' | 'bottle-750ml' | 'pkgtype5' | 'pkgtype6' | 'pkgtype7' | 'pkgtype8';

export interface TextStyle {
  fontFamily: string;
  color: string;
}

export interface LabelContent {
  productName: string;
  description: string;
  ingredients: string;
  volume: string;
  logoUrl: string;
  backside: {
    type: 'image' | 'text';
    content: string;  // URL for image, text string for text (max 512 chars)
  };
}

export interface TextStyles {
  productName: TextStyle;
  description: TextStyle;
  volume: TextStyle;
  ingredients: TextStyle;
}

export interface ElementTransform {
  offsetX: number;  // -100 to 100 (percentage)
  offsetY: number;  // -100 to 100 (percentage)
  scale: number;    // 0.5 to 2.0
}

export interface LabelTransform {
  logo: ElementTransform;
  textGroup: ElementTransform;
  backside: ElementTransform;
}

export interface PackageConfig {
  type: PackageType;
  baseColor: string;
  metalness: number;
  roughness: number;
  labelContent: LabelContent;
  labelTransform: LabelTransform;
  textStyles: TextStyles;
  labelBackgroundColor: string; // Background color for label area on 3D can
}

interface ConfigState {
  currentPackage: PackageType;
  packageConfig: PackageConfig;
  packageLabelTransforms: Record<PackageType, LabelTransform>; // Store label transforms per package type
  cameraPreset: 'front' | 'back' | 'side' | 'angle';
  showReferenceSurface: boolean;
  showWrapper: boolean;
  customSceneBackgroundColor: string | null;  // DEPRECATED: Use packageCustomSceneColors instead (kept for backward compatibility)
  customReferenceSurfaceColor: string | null; // DEPRECATED: Use packageCustomSceneColors instead (kept for backward compatibility)
  
  // Per-package custom scene colors (activated state)
  packageCustomSceneColors: Record<PackageType, {
    background: string | null;
    referenceSurface: string | null;
  }>;
  
  // Scene color activation mode
  sceneColorMode: 'single' | 'all';  // 'single' = apply to current package only, 'all' = apply to all packages
  
  // Actions
  setPackageType: (type: PackageType) => void;
  setBaseColor: (color: string) => void;
  setMaterial: (metalness: number, roughness: number) => void;
  setLabelBackgroundColor: (color: string) => void;
  updateLabelContent: (content: Partial<LabelContent>) => void;
  updateTextStyle: (element: keyof TextStyles, style: Partial<TextStyle>) => void;
  setLabelTransform: (element: keyof LabelTransform, transform: Partial<ElementTransform>) => void;
  setAllLabelTransforms: (transform: Partial<LabelTransform>) => void;
  resetLabelTransform: (element?: keyof LabelTransform) => void;
  setCameraPreset: (preset: 'front' | 'back' | 'side' | 'angle') => void;
  setShowReferenceSurface: (show: boolean) => void;
  setShowWrapper: (show: boolean) => void;
  setCustomSceneBackgroundColor: (color: string | null) => void;  // DEPRECATED
  setCustomReferenceSurfaceColor: (color: string | null) => void; // DEPRECATED
  resetSceneColors: () => void;  // DEPRECATED
  
  // New scene color actions (with activation support)
  setSceneColorMode: (mode: 'single' | 'all') => void;
  setPackageCustomSceneColor: (packageType: PackageType, background: string | null, referenceSurface: string | null) => void;
  applySceneColorsToAllPackages: (background: string | null, referenceSurface: string | null) => void;
  resetSceneColorsWithMode: (mode: 'single' | 'all', currentPackage: PackageType) => void;
  applyTemplate: (config: PackageConfig) => void;
  resetConfig: () => void;
  
  // Preset management
  saveAsPreset: (name: string, thumbnail?: string, cameraState?: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number }) => void;
  loadPreset: (presetId: string) => void;
}

const BASE_URL = import.meta.env.BASE_URL;

const defaultLabelContent: LabelContent = {
  productName: 'Brix Functional',
  description: 'Premium Wellness Beverage',
  ingredients: 'Lion\'s Mane Extract, Reishi Extract, Panax ginseng, Rhodiola rosea, Liposomal B-Complex',
  volume: '12 FL OZ (355mL)',
  logoUrl: `${BASE_URL}assets/brix-logo.png`,
  backside: {
    type: 'image',
    content: '',
  },
};

const defaultElementTransform: ElementTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1.0,
};

const defaultLabelTransform: LabelTransform = {
  logo: { ...defaultElementTransform },
  textGroup: { ...defaultElementTransform },
  backside: { offsetX: -14, offsetY: 7, scale: 1.0 },
};

const defaultTextStyles: TextStyles = {
  productName: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: 'auto', // 'auto' means use adaptive contrast
  },
  description: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: 'auto',
  },
  volume: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: 'auto',
  },
  ingredients: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: 'auto',
  },
};

const defaultConfig: PackageConfig = {
  type: 'can-12oz',
  baseColor: '#e0e0e0',
  metalness: 0.9,
  roughness: 0.1,
  labelContent: defaultLabelContent,
  labelTransform: defaultLabelTransform,
  textStyles: defaultTextStyles,
  labelBackgroundColor: '#ffffff', // White background for label
};

// Initialize default label transforms for all package types
const defaultPackageLabelTransforms: Record<PackageType, LabelTransform> = {
  'can-12oz': { ...defaultLabelTransform },
  'bottle-2oz': {
    logo: { offsetX: -2, offsetY: 10, scale: 0.90 },
    textGroup: { offsetX: -2, offsetY: 0, scale: 0.80 },
    backside: { offsetX: -18, offsetY: 22, scale: 0.95 },
  },
  'stick-pack': { ...defaultLabelTransform },
  'bottle-750ml': {
    logo: { offsetX: -4, offsetY: 22, scale: 0.80 },
    textGroup: { offsetX: -1, offsetY: 10, scale: 0.80 },
    backside: { offsetX: -15, offsetY: 20, scale: 1.05 },
  },
  'pkgtype5': {
    logo: { offsetX: 0, offsetY: 60, scale: 0.4 },
    textGroup: { offsetX: 0, offsetY: 30, scale: 0.4 },
    backside: { offsetX: 15, offsetY: 45, scale: 0.4 },
  },
  'pkgtype6': { ...defaultLabelTransform },
  'pkgtype7': {
    logo: { offsetX: -15, offsetY: 37, scale: 0.75 },
    textGroup: { offsetX: -14, offsetY: 17, scale: 0.75 },
    backside: { offsetX: -19, offsetY: 32, scale: 0.90 },
  },
  'pkgtype8': { ...defaultLabelTransform },
};

export const useConfigStore = create<ConfigState>((set) => ({
  currentPackage: 'can-12oz',
  packageConfig: defaultConfig,
  packageLabelTransforms: defaultPackageLabelTransforms,
  cameraPreset: 'angle',
  showReferenceSurface: true,
  showWrapper: true,
  customSceneBackgroundColor: null,
  customReferenceSurfaceColor: null,
  
  // Initialize per-package custom scene colors (all null = use package defaults)
  packageCustomSceneColors: {
    'can-12oz': { background: null, referenceSurface: null },
    'bottle-2oz': { background: null, referenceSurface: null },
    'stick-pack': { background: null, referenceSurface: null },
    'bottle-750ml': { background: null, referenceSurface: null },
    'pkgtype5': { background: null, referenceSurface: null },
    'pkgtype6': { background: null, referenceSurface: null },
    'pkgtype7': { background: null, referenceSurface: null },
    'pkgtype8': { background: null, referenceSurface: null },
  },
  
  sceneColorMode: 'single',  // Default to single package mode
  
  setPackageType: (type) => set((state) => {
    // Save current label transform before switching
    const updatedTransforms = {
      ...state.packageLabelTransforms,
      [state.currentPackage]: state.packageConfig.labelTransform,
    };
    
    return {
      currentPackage: type,
      packageLabelTransforms: updatedTransforms,
      packageConfig: {
        ...state.packageConfig,
        type,
        // Load label transform for the new package type
        labelTransform: updatedTransforms[type],
        // Adjust default materials based on package type
        metalness: type === 'can-12oz' ? 0.9 : type === 'bottle-750ml' ? 0.1 : type === 'pkgtype7' ? 0.2 : type === 'pkgtype8' ? 0.1 : 0.3,
        roughness: type === 'can-12oz' ? 0.1 : type === 'bottle-750ml' ? 0.05 : type === 'pkgtype7' ? 0.5 : type === 'pkgtype8' ? 0.05 : 0.4,
        baseColor: type === 'bottle-750ml' ? '#ffffff' : state.packageConfig.baseColor,
      },
    };
  }),
  
  setBaseColor: (color) => set((state) => ({
    packageConfig: { ...state.packageConfig, baseColor: color },
  })),
  
  setMaterial: (metalness, roughness) => set((state) => ({
    packageConfig: { ...state.packageConfig, metalness, roughness },
  })),
  
  setLabelBackgroundColor: (color) => set((state) => ({
    packageConfig: { ...state.packageConfig, labelBackgroundColor: color },
  })),
  
  updateLabelContent: (content) => set((state) => ({
    packageConfig: {
      ...state.packageConfig,
      labelContent: { ...state.packageConfig.labelContent, ...content },
    },
  })),
  
  updateTextStyle: (element, style) => set((state) => ({
    packageConfig: {
      ...state.packageConfig,
      textStyles: {
        ...state.packageConfig.textStyles,
        [element]: { ...state.packageConfig.textStyles[element], ...style },
      },
    },
  })),
  
  setLabelTransform: (element, transform) => set((state) => {
    const updatedLabelTransform = {
      ...state.packageConfig.labelTransform,
      [element]: { ...state.packageConfig.labelTransform[element], ...transform },
    };
    
    return {
      packageConfig: {
        ...state.packageConfig,
        labelTransform: updatedLabelTransform,
      },
      packageLabelTransforms: {
        ...state.packageLabelTransforms,
        [state.currentPackage]: updatedLabelTransform,
      },
    };
  }),
  
  setAllLabelTransforms: (transform) => set((state) => {
    const updatedLabelTransform = { ...state.packageConfig.labelTransform, ...transform };
    
    return {
      packageConfig: {
        ...state.packageConfig,
        labelTransform: updatedLabelTransform,
      },
      packageLabelTransforms: {
        ...state.packageLabelTransforms,
        [state.currentPackage]: updatedLabelTransform,
      },
    };
  }),
  
   resetLabelTransform: (element) => set((state) => {
    if (element) {
      const updatedLabelTransform = {
        ...state.packageConfig.labelTransform,
        [element]: { ...defaultElementTransform },
      };
      
      return {
        packageConfig: {
          ...state.packageConfig,
          labelTransform: updatedLabelTransform,
        },
        packageLabelTransforms: {
          ...state.packageLabelTransforms,
          [state.currentPackage]: updatedLabelTransform,
        },
      };
    }
    
    return {
      packageConfig: {
        ...state.packageConfig,
        labelTransform: defaultLabelTransform,
      },
      packageLabelTransforms: {
        ...state.packageLabelTransforms,
        [state.currentPackage]: defaultLabelTransform,
      },
    };
  }),
  
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  
  setShowReferenceSurface: (show) => set({ showReferenceSurface: show }),
  
  setShowWrapper: (show) => set({ showWrapper: show }),
  
  setCustomSceneBackgroundColor: (color) => set({ customSceneBackgroundColor: color }),
  
  setCustomReferenceSurfaceColor: (color) => set({ customReferenceSurfaceColor: color }),
  
  resetSceneColors: () => set({ customSceneBackgroundColor: null, customReferenceSurfaceColor: null }),  // DEPRECATED
  
  // New scene color actions (with activation support)
  setSceneColorMode: (mode) => set({ sceneColorMode: mode }),
  
  setPackageCustomSceneColor: (packageType, background, referenceSurface) => set((state) => ({
    packageCustomSceneColors: {
      ...state.packageCustomSceneColors,
      [packageType]: {
        background,
        referenceSurface,
      },
    },
  })),
  
  applySceneColorsToAllPackages: (background, referenceSurface) => set((state) => {
    const updatedColors: Record<PackageType, { background: string | null; referenceSurface: string | null }> = {} as any;
    
    // Apply same colors to all package types
    const packageTypes: PackageType[] = ['can-12oz', 'bottle-2oz', 'stick-pack', 'bottle-750ml', 'pkgtype5', 'pkgtype6', 'pkgtype7', 'pkgtype8'];
    packageTypes.forEach((pkgType) => {
      updatedColors[pkgType] = { background, referenceSurface };
    });
    
    return {
      packageCustomSceneColors: updatedColors,
    };
  }),
  
  resetSceneColorsWithMode: (mode, currentPackage) => set((state) => {
    if (mode === 'single') {
      // Reset only current package
      return {
        packageCustomSceneColors: {
          ...state.packageCustomSceneColors,
          [currentPackage]: {
            background: null,
            referenceSurface: null,
          },
        },
      };
    } else {
      // Reset all packages
      const resetColors: Record<PackageType, { background: string | null; referenceSurface: string | null }> = {} as any;
      const packageTypes: PackageType[] = ['can-12oz', 'bottle-2oz', 'stick-pack', 'bottle-750ml', 'pkgtype5', 'pkgtype6', 'pkgtype7', 'pkgtype8'];
      packageTypes.forEach((pkgType) => {
        resetColors[pkgType] = { background: null, referenceSurface: null };
      });
      
      return {
        packageCustomSceneColors: resetColors,
      };
    }
  }),
  
  applyTemplate: (config) => {
    // Migration: Add backside property if missing (for old templates)
    const migratedConfig = {
      ...config,
      labelTransform: {
        ...config.labelTransform,
        backside: config.labelTransform.backside || { offsetX: -14, offsetY: 7, scale: 1.0 },
      },
      labelContent: {
        ...config.labelContent,
        backside: config.labelContent.backside || { type: 'image' as const, content: '' },
      },
    };
    
    set({
      currentPackage: migratedConfig.type,
      packageConfig: migratedConfig,
    });
  },
  
  resetConfig: () => set({
    currentPackage: 'can-12oz',
    packageConfig: defaultConfig,
    cameraPreset: 'angle',
  }),
  
  saveAsPreset: (name: string, thumbnail?: string, cameraState?: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number }) => {
    const state = useConfigStore.getState();
    
    savePresetToStorage({
      name,
      config: state.packageConfig,
      cameraPreset: state.cameraPreset,
      showReferenceSurface: state.showReferenceSurface,
      cameraState,
      thumbnail,
    });
  },
  
  loadPreset: (presetId: string) => {
    const preset = getPresetById(presetId);
    
    if (preset) {
      // Migration: Add backside property if missing (for old presets)
      const migratedConfig = {
        ...preset.config,
        labelTransform: {
          ...preset.config.labelTransform,
          backside: preset.config.labelTransform.backside || { offsetX: -14, offsetY: 7, scale: 1.0 },
        },
        labelContent: {
          ...preset.config.labelContent,
          backside: preset.config.labelContent.backside || { type: 'image' as const, content: '' },
        },
      };
      
      set({
        currentPackage: migratedConfig.type,
        packageConfig: migratedConfig,
        cameraPreset: preset.cameraPreset,
        showReferenceSurface: preset.showReferenceSurface,
      });
    }
  },
}));
