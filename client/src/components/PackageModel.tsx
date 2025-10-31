import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { useConfigStore } from '@/store/configStore';

export default function PackageModel() {
  const meshRef = useRef<Mesh>(null);
  const { packageConfig, currentPackage } = useConfigStore();
  
  // Subtle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  
  // Package geometry based on type
  const geometry = useMemo(() => {
    switch (currentPackage) {
      case 'can-12oz':
        return <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />;
      case 'bottle-2oz':
        return (
          <group>
            <mesh position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 1.4, 32]} />
              <meshStandardMaterial
                color={packageConfig.baseColor}
                metalness={packageConfig.metalness}
                roughness={packageConfig.roughness}
              />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.4, 32]} />
              <meshStandardMaterial
                color="#d0d0d0"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      case 'stick-pack':
        return <boxGeometry args={[0.8, 2.5, 0.3]} />;
      case 'bottle-750ml':
        return (
          <group>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.7, 0.7, 2.5, 32]} />
              <meshStandardMaterial
                color={packageConfig.baseColor}
                metalness={packageConfig.metalness}
                roughness={packageConfig.roughness}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.35, 0.5, 0.8, 32]} />
              <meshStandardMaterial
                color={packageConfig.baseColor}
                metalness={packageConfig.metalness}
                roughness={packageConfig.roughness}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0, 2.1, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.4, 32]} />
              <meshStandardMaterial
                color="#c9b896"
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>
          </group>
        );
      default:
        return <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />;
    }
  }, [currentPackage, packageConfig]);
  
  // For simple geometries (can and stick-pack), render with material
  if (currentPackage === 'can-12oz' || currentPackage === 'stick-pack') {
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial
          color={packageConfig.baseColor}
          metalness={packageConfig.metalness}
          roughness={packageConfig.roughness}
        />
      </mesh>
    );
  }
  
  // For complex geometries (bottles), return the group
  return <group ref={meshRef as any}>{geometry}</group>;
}
