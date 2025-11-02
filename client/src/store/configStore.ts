import { create } from 'zustand';
import { savePreset as savePresetToStorage, getPresetById } from '@/utils/presetStorage';

export type PackageType = 'bottle-2oz' | 'can-12oz' | 'stick-pack' | 'bottle-750ml';

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
  viewMode: '2d' | '3d';
  cameraPreset: 'front' | 'back' | 'side' | 'angle';
  showReferenceSurface: boolean;
  
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
  setViewMode: (mode: '2d' | '3d') => void;
  setCameraPreset: (preset: 'front' | 'back' | 'side' | 'angle') => void;
  setShowReferenceSurface: (show: boolean) => void;
  applyTemplate: (config: PackageConfig) => void;
  resetConfig: () => void;
  
  // Preset management
  saveAsPreset: (name: string, thumbnail?: string) => void;
  loadPreset: (presetId: string) => void;
}

const defaultLabelContent: LabelContent = {
  productName: 'Brix Functional',
  description: 'Premium Wellness Beverage',
  ingredients: 'Lion\'s Mane Extract, Reishi Extract, Panax ginseng, Rhodiola rosea, Liposomal B-Complex',
  volume: '12 FL OZ (355mL)',
  logoUrl: '/assets/brix-logo.png',
};

const defaultElementTransform: ElementTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1.0,
};

const defaultLabelTransform: LabelTransform = {
  logo: { ...defaultElementTransform },
  textGroup: { ...defaultElementTransform },
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

export const useConfigStore = create<ConfigState>((set) => ({
  currentPackage: 'can-12oz',
  packageConfig: defaultConfig,
  viewMode: '3d',
  cameraPreset: 'angle',
  showReferenceSurface: true,
  
  setPackageType: (type) => set((state) => ({
    currentPackage: type,
    packageConfig: {
      ...state.packageConfig,
      type,
      // Adjust default materials based on package type
      metalness: type === 'can-12oz' ? 0.9 : type === 'bottle-750ml' ? 0.1 : 0.3,
      roughness: type === 'can-12oz' ? 0.1 : type === 'bottle-750ml' ? 0.05 : 0.4,
    },
  })),
  
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
  
  setLabelTransform: (element, transform) => set((state) => ({
    packageConfig: {
      ...state.packageConfig,
      labelTransform: {
        ...state.packageConfig.labelTransform,
        [element]: { ...state.packageConfig.labelTransform[element], ...transform },
      },
    },
  })),
  
  setAllLabelTransforms: (transform) => set((state) => ({
    packageConfig: {
      ...state.packageConfig,
      labelTransform: { ...state.packageConfig.labelTransform, ...transform },
    },
  })),
  
  resetLabelTransform: (element?) => set((state) => {
    if (element) {
      return {
        packageConfig: {
          ...state.packageConfig,
          labelTransform: {
            ...state.packageConfig.labelTransform,
            [element]: { ...defaultElementTransform },
          },
        },
      };
    }
    return {
      packageConfig: {
        ...state.packageConfig,
        labelTransform: defaultLabelTransform,
      },
    };
  }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  
  setShowReferenceSurface: (show) => set({ showReferenceSurface: show }),
  
  applyTemplate: (config) => set({
    currentPackage: config.type,
    packageConfig: config,
  }),
  
  resetConfig: () => set({
    currentPackage: 'can-12oz',
    packageConfig: defaultConfig,
    viewMode: '3d',
    cameraPreset: 'angle',
  }),
  
  saveAsPreset: (name: string, thumbnail?: string) => {
    const state = useConfigStore.getState();
    
    savePresetToStorage({
      name,
      config: state.packageConfig,
      viewMode: state.viewMode,
      cameraPreset: state.cameraPreset,
      showReferenceSurface: state.showReferenceSurface,
      thumbnail,
    });
  },
  
  loadPreset: (presetId: string) => {
    const preset = getPresetById(presetId);
    
    if (preset) {
      set({
        currentPackage: preset.config.type,
        packageConfig: preset.config,
        viewMode: preset.viewMode,
        cameraPreset: preset.cameraPreset,
        showReferenceSurface: preset.showReferenceSurface,
      });
    }
  },
}));
