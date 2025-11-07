import * as THREE from 'three';

/**
 * Unified material management for bottle-750ml (pkgtype4)
 * Handles both initial load and wrapper toggle states
 * 
 * @param materials - Array of materials from the mesh (or single material)
 * @param showWrapper - Whether wrapper/label should be visible
 * @param packageConfig - Package configuration from store
 * @param labelTexture - Optional label texture for wrapper ON state
 * @returns Array of materials to apply to the mesh
 */
export function applyBottleMaterials(
  materials: THREE.Material | THREE.Material[],
  showWrapper: boolean,
  packageConfig: { baseColor?: string; metalness: number; roughness: number },
  labelTexture: THREE.Texture | null = null
): THREE.Material[] {
  const materialsArray = Array.isArray(materials) ? materials : [materials];
  const textureLoader = new THREE.TextureLoader();
  const basePath = '/models/pkgtype4_textures/Tex_Metal_Rough/';
  
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
