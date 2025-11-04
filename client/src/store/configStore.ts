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
  applyTemplate: (config: PackageConfig) => void;
  resetConfig: () => void;
  
  // Preset management
  saveAsPreset: (name: string, thumbnail?: string, cameraState?: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number }) => void;
  loadPreset: (presetId: string) => void;
}

const defaultLabelContent: LabelContent = {
  productName: 'Brix Functional',
  description: 'Premium Wellness Beverage',
  ingredients: 'Lion\'s Mane Extract, Reishi Extract, Panax ginseng, Rhodiola rosea, Liposomal B-Complex',
  volume: '12 FL OZ (355mL)',
  logoUrl: '/assets/brix-logo.png',
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
  'bottle-2oz': { ...defaultLabelTransform },
  'stick-pack': { ...defaultLabelTransform },
  'bottle-750ml': { ...defaultLabelTransform },
  'pkgtype5': { ...defaultLabelTransform },
  'pkgtype6': { ...defaultLabelTransform },
  'pkgtype7': { ...defaultLabelTransform },
  'pkgtype8': { ...defaultLabelTransform },
};

export const useConfigStore = create<ConfigState>((set) => ({
  currentPackage: 'can-12oz',
  packageConfig: defaultConfig,
  packageLabelTransforms: defaultPackageLabelTransforms,
  cameraPreset: 'angle',
  showReferenceSurface: true,
  showWrapper: true,
  
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
