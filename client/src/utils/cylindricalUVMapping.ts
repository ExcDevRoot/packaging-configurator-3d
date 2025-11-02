import * as THREE from 'three';

/**
 * Generate cylindrical UV coordinates for a mesh
 * This wraps a texture around a cylindrical surface
 * 
 * @param mesh - The mesh to apply UV mapping to
 * @param topMargin - Vertical margin at top (0.0-1.0), excludes top rim from texture
 * @param bottomMargin - Vertical margin at bottom (0.0-1.0), excludes bottom rim from texture
 */
export function applyCylindricalUVMapping(
  mesh: THREE.Mesh,
  topMargin: number = 0.1,
  bottomMargin: number = 0.1
): void {
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
    // Apply margins to exclude top/bottom rim regions
    const vRaw = (y - bbox.min.y) / height; // Normalize to 0-1
    const vRange = 1.0 - topMargin - bottomMargin; // Available texture range
    const v = bottomMargin + (vRaw * vRange); // Map to margin-constrained range

    uvs.push(u, v);
  }

  // Apply UV coordinates to geometry
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
  
  console.log(`Applied cylindrical UV mapping: ${positions.count} vertices`);
}
