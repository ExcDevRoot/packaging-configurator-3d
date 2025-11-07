import * as THREE from 'three';

/**
 * Unified material management for bottle-750ml (pkgtype4) and pkgtype5 (1L bottle)
 * Handles both initial load and wrapper toggle states
 * 
 * @param materials - Array of materials from the mesh (or single material)
 * @param showWrapper - Whether wrapper/label should be visible
 * @param packageConfig - Package configuration from store
 * @param labelTexture - Optional label texture for wrapper ON state
 * @param meshName - Optional mesh name for pkgtype5 identification (Water, Bottle, Cap)
 * @param packageType - Package type identifier ('bottle-750ml' or 'pkgtype5')
 * @returns Array of materials to apply to the mesh
 */
export function applyBottleMaterials(
  materials: THREE.Material | THREE.Material[],
  showWrapper: boolean,
  packageConfig: { baseColor?: string; metalness: number; roughness: number },
  labelTexture: THREE.Texture | null = null,
  meshName: string = '',
  packageType: string = 'bottle-750ml'
): THREE.Material[] {
  const materialsArray = Array.isArray(materials) ? materials : [materials];
  const textureLoader = new THREE.TextureLoader();
  const basePath = '/models/pkgtype4_textures/Tex_Metal_Rough/';
  const meshNameLower = meshName.toLowerCase();
  
  // Handle pkgtype5 (1L bottle) - identify by mesh name since all use 'Bottle_mat'
  if (packageType === 'pkgtype5') {
    const mat = materialsArray[0]; // pkgtype5 uses single material
    const matName = mat?.name || '';
    
    if (meshNameLower.includes('bottle')) {
      // Glass bottle body
      if (showWrapper) {
        console.log('[pkgtype5] Wrapper ON - Applying label texture to glass bottle');
        return [new THREE.MeshStandardMaterial({
          name: matName,
          color: packageConfig.baseColor || '#ffffff',
          metalness: 0.1,
          roughness: 0.2,
          map: labelTexture,
          transparent: true,
          opacity: 0.5,
        })];
      } else {
        console.log('[pkgtype5] Wrapper OFF - Applying clear glass material');
        return [new THREE.MeshPhysicalMaterial({
          name: matName,
          color: new THREE.Color(0xffffff),
          metalness: 0.0,
          roughness: 0.05,
          transparent: true,
          opacity: 0.3,
          map: null,
        })];
      }
    } else if (meshNameLower.includes('cap')) {
      // Bottle cap - use base color
      console.log('[pkgtype5] Applying cap material');
      return [new THREE.MeshStandardMaterial({
        name: matName,
        color: new THREE.Color(0xcccccc), // Light gray cap
        metalness: 0.9,
        roughness: 0.3,
      })];
    } else if (meshNameLower.includes('water')) {
      // Water/liquid content
      console.log('[pkgtype5] Applying water/liquid material');
      return [new THREE.MeshStandardMaterial({
        name: matName,
        color: new THREE.Color(0x4da6ff), // Light blue water color
        metalness: 0.0,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      })];
    }
    // Fallback for unknown meshes
    return [mat];
  }
  
  // Handle bottle-750ml (pkgtype4) - identify by material name
  return materialsArray.map((mat) => {
    const matName = mat?.name || '';
    
    if (matName === 'glass_Mat') {
      // Glass body material - changes based on wrapper state
      if (showWrapper) {
        // Wrapper ON: Apply label texture with semi-transparent material
        console.log('[bottle-750ml] Wrapper ON - Applying label texture to glass');
        return new THREE.MeshStandardMaterial({
          name: matName,  // Preserve material name for future toggles
          color: packageConfig.baseColor || '#ffffff',
          metalness: 0.1,
          roughness: 0.2,
          map: labelTexture,
          transparent: true,
          opacity: 0.5,
        });
      } else {
        // Wrapper OFF: Clear glass with MeshPhysicalMaterial
        console.log('[bottle-750ml] Wrapper OFF - Applying clear glass material');
        return new THREE.MeshPhysicalMaterial({
          name: matName,  // Preserve material name for future toggles
          color: new THREE.Color(0xffffff),  // Pure white/clear glass
          metalness: 0.0,  // Glass is not metallic
          roughness: 0.05,  // Very smooth for clear glass
          transparent: true,
          opacity: 0.3,  // 70% transparent - can see liquid inside
          map: null,  // No texture map
        });
      }
    } else if (matName === 'metal_Mat') {
      // Metal cap - always uses PBR textures, never changes
      const baseColorMap = textureLoader.load(basePath + 'metal_Mat_baseColor.png');
      const normalMap = textureLoader.load(basePath + 'metal_Mat_normal.png');
      const metallicMap = textureLoader.load(basePath + 'metal_Mat_metallic.png');
      const roughnessMap = textureLoader.load(basePath + 'metal_Mat_roughness.png');
      
      console.log('[bottle-750ml] Applying metal cap PBR material');
      return new THREE.MeshStandardMaterial({
        name: matName,  // Preserve material name for future toggles
        map: baseColorMap,
        normalMap: normalMap,
        metalnessMap: metallicMap,
        roughnessMap: roughnessMap,
        metalness: 0.9,
        roughness: 0.3,
      });
    } else if (matName === 'liquid_Mat') {
      // Amber liquid - always uses bourbon color, never changes
      const normalMap = textureLoader.load(basePath + 'liquid_Mat_normal.png');
      const metallicMap = textureLoader.load(basePath + 'liquid_Mat_metallic.png');
      const roughnessMap = textureLoader.load(basePath + 'liquid_Mat_roughness.png');
      
      console.log('[bottle-750ml] Applying bourbon amber liquid material');
      return new THREE.MeshStandardMaterial({
        name: matName,  // Preserve material name for future toggles
        color: new THREE.Color(0x9a5f1a),  // Darker bourbon amber
        normalMap: normalMap,
        metalnessMap: metallicMap,
        roughnessMap: roughnessMap,
        metalness: 0.0,
        roughness: 0.3,
        transparent: true,
        opacity: 0.90,
      });
    } else {
      // Unknown material - keep original
      return mat;
    }
  });
}
