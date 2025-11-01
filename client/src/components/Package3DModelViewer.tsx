import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import * as THREE from 'three';
import { GLTFLoader, RoomEnvironment, OrbitControls } from 'three-stdlib';

export default function Package3DModelViewer() {
  const { currentPackage, packageConfig } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<any>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get GLB model path (fallback to null if not available)
  const getModelPath = () => {
    switch (currentPackage) {
      case 'can-12oz':
        return '/assets/models/12oz_can.glb';
      case 'bottle-2oz':
        return null; // Not yet available
      case 'stick-pack':
        return null; // Not yet available
      case 'bottle-750ml':
        return null; // Not yet available
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const modelPath = getModelPath();
    if (!modelPath) {
      setError('3D model not available for this package type');
      setIsLoading(false);
      return;
    }

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      1000
    );
    camera.position.set(0.2, 0.1, 0.3);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.1;
    controls.maxDistance = 1;
    controls.target.set(0, 0.06, 0);
    controlsRef.current = controls;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Add environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new (RoomEnvironment as any)();
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Apply material properties from config
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material as THREE.MeshStandardMaterial;
            
            // Apply base color
            const color = new THREE.Color(packageConfig.baseColor);
            material.color = color;
            
            // Apply metalness and roughness
            material.metalness = packageConfig.metalness;
            material.roughness = packageConfig.roughness;
            material.needsUpdate = true;
          }
        });

        scene.add(model);
        setIsLoading(false);
        setError(null);
      },
      (progress) => {
        console.log('Loading:', (progress.loaded / progress.total) * 100 + '%');
      },
      (err) => {
        console.error('Error loading model:', err);
        setError('Failed to load 3D model');
        setIsLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [currentPackage]);

  // Update material when config changes
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        material.color = new THREE.Color(packageConfig.baseColor);
        material.metalness = packageConfig.metalness;
        material.roughness = packageConfig.roughness;
        material.needsUpdate = true;
      }
    });
  }, [packageConfig.baseColor, packageConfig.metalness, packageConfig.roughness]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm">{error}</p>
          <p className="text-slate-400 text-xs mt-2">Using 2D fallback view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* Label overlay - to be implemented */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-900">{packageConfig.labelContent.productName}</p>
          <p className="text-slate-600">{packageConfig.labelContent.description}</p>
          <p className="text-slate-500">{packageConfig.labelContent.volume}</p>
        </div>
      </div>
    </div>
  );
}
