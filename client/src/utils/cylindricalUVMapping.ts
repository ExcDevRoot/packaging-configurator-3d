import * as THREE from 'three';

/**
 * Generate cylindrical UV coordinates for a mesh
 * This wraps a texture around a cylindrical surface
 */
export function applyCylindricalUVMapping(mesh: THREE.Mesh): void {
  const geometry = mesh.geometry;
  
  if (!geometry.attributes.position) {
    console.warn('Geometry has no position attribute');
    return;
  }

  const positions = geometry.attributes.position;
  const uvs: number[] = [];

  // Calculate bounding box to find cylinder axis and dimensions
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  
  const height = bbox.max.y - bbox.min.y;
  const radius = Math.max(
    bbox.max.x - bbox.min.x,
    bbox.max.z - bbox.min.z
  ) / 2;

  // Generate UV coordinates for each vertex
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    // Calculate U coordinate (horizontal wrap around cylinder)
    // Use atan2 to get angle around Y axis
    const angle = Math.atan2(z - center.z, x - center.x);
    const u = (angle + Math.PI) / (2 * Math.PI); // Normalize to 0-1

    // Calculate V coordinate (vertical position on cylinder)
    // Map texture middle 90% (0.05-0.95) to cylinder full height (0-1)
    // Top/bottom 5% of texture are unused, so those mesh areas show base material
    const vRaw = (y - bbox.min.y) / height; // Normalize cylinder height to 0-1
    const v = 0.05 + (vRaw * 0.9); // Map to texture range 0.05-0.95

    uvs.push(u, v);
  }

  // Apply UV coordinates to geometry
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
  
  console.log(`Applied cylindrical UV mapping: ${positions.count} vertices`);
}
