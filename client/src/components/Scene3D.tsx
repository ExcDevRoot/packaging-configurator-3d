import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { useConfigStore } from '@/store/configStore';
import PackageModel from './PackageModel';
import { Loader2 } from 'lucide-react';

export default function Scene3D() {
  const { cameraPreset } = useConfigStore();
  
  // Camera position presets
  const cameraPositions = {
    front: [0, 0, 5] as [number, number, number],
    back: [0, 0, -5] as [number, number, number],
    side: [5, 0, 0] as [number, number, number],
    angle: [3, 2, 4] as [number, number, number],
  };
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        className="bg-gradient-to-br from-slate-50 to-slate-100"
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPositions[cameraPreset]}
          fov={50}
        />
        
        {/* Lighting Setup - PBR with HDRI environment */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight
          position={[-10, 10, -5]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        
        {/* Environment map for realistic reflections */}
        <Environment preset="studio" />
        
        {/* Main package model */}
        <Suspense fallback={null}>
          <PackageModel />
        </Suspense>
        
        {/* Ground shadows */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Interactive controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense fallback={
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="animate-spin" />
            <span>Loading 3D scene...</span>
          </div>
        } />
      </div>
    </div>
  );
}
