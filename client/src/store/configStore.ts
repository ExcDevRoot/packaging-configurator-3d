import { create } from 'zustand';

export type PackageType = 'bottle-2oz' | 'can-12oz' | 'stick-pack' | 'bottle-750ml';

export interface LabelContent {
  productName: string;
  description: string;
  ingredients: string;
  volume: string;
  logoUrl: string;
}

export interface PackageConfig {
  type: PackageType;
  baseColor: string;
  metalness: number;
  roughness: number;
  labelContent: LabelContent;
}

interface ConfigState {
  currentPackage: PackageType;
  packageConfig: PackageConfig;
  viewMode: '2d' | '3d';
  cameraPreset: 'front' | 'back' | 'side' | 'angle';
  
  // Actions
  setPackageType: (type: PackageType) => void;
  setBaseColor: (color: string) => void;
  setMaterial: (metalness: number, roughness: number) => void;
  updateLabelContent: (content: Partial<LabelContent>) => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setCameraPreset: (preset: 'front' | 'back' | 'side' | 'angle') => void;
  applyTemplate: (config: PackageConfig) => void;
  resetConfig: () => void;
}

const defaultLabelContent: LabelContent = {
  productName: 'Brix Functional',
  description: 'Premium Wellness Beverage',
  ingredients: 'Lion\'s Mane Extract, Reishi Extract, Panax ginseng, Rhodiola rosea, Liposomal B-Complex',
  volume: '12 FL OZ (355mL)',
  logoUrl: '/assets/brix-logo.png',
};

const defaultConfig: PackageConfig = {
  type: 'can-12oz',
  baseColor: '#e0e0e0',
  metalness: 0.9,
  roughness: 0.1,
  labelContent: defaultLabelContent,
};

export const useConfigStore = create<ConfigState>((set) => ({
  currentPackage: 'can-12oz',
  packageConfig: defaultConfig,
  viewMode: '3d',
  cameraPreset: 'angle',
  
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
  
  updateLabelContent: (content) => set((state) => ({
    packageConfig: {
      ...state.packageConfig,
      labelContent: { ...state.packageConfig.labelContent, ...content },
    },
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  
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
}));
