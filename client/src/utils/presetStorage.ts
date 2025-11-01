import { PackageConfig } from '@/store/configStore';

export interface UserPreset {
  id: string;
  name: string;
  config: PackageConfig;
  viewMode: '2d' | '3d';
  cameraPreset: 'front' | 'back' | 'side' | 'angle';
  showReferenceSurface: boolean;
  thumbnail?: string; // Base64 encoded image
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'packaging-configurator-presets';

/**
 * Get all saved presets from localStorage
 */
export function getAllPresets(): UserPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const presets = JSON.parse(stored) as UserPreset[];
    // Sort by most recently updated
    return presets.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to load presets:', error);
    return [];
  }
}

/**
 * Save a new preset or update existing one
 */
export function savePreset(preset: Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>): UserPreset {
  try {
    const presets = getAllPresets();
    const now = Date.now();
    
    const newPreset: UserPreset = {
      ...preset,
      id: `preset-${now}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    
    presets.push(newPreset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    
    return newPreset;
  } catch (error) {
    console.error('Failed to save preset:', error);
    throw new Error('Failed to save preset');
  }
}

/**
 * Delete a preset by ID
 */
export function deletePreset(id: string): void {
  try {
    const presets = getAllPresets();
    const filtered = presets.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete preset:', error);
    throw new Error('Failed to delete preset');
  }
}

/**
 * Get a specific preset by ID
 */
export function getPresetById(id: string): UserPreset | null {
  const presets = getAllPresets();
  return presets.find(p => p.id === id) || null;
}

/**
 * Update an existing preset
 */
export function updatePreset(id: string, updates: Partial<Omit<UserPreset, 'id' | 'createdAt'>>): UserPreset | null {
  try {
    const presets = getAllPresets();
    const index = presets.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    const updatedPreset: UserPreset = {
      ...presets[index],
      ...updates,
      updatedAt: Date.now(),
    };
    
    presets[index] = updatedPreset;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    
    return updatedPreset;
  } catch (error) {
    console.error('Failed to update preset:', error);
    throw new Error('Failed to update preset');
  }
}

/**
 * Generate a thumbnail from current canvas/view
 */
export function generateThumbnail(canvas: HTMLCanvasElement, maxSize: number = 200): string {
  try {
    // Create a temporary canvas for thumbnail
    const thumbCanvas = document.createElement('canvas');
    const ctx = thumbCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Calculate scaled dimensions
    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    thumbCanvas.width = canvas.width * scale;
    thumbCanvas.height = canvas.height * scale;
    
    // Draw scaled image
    ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    
    // Return as base64 data URL
    return thumbCanvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return '';
  }
}
