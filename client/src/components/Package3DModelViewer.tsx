import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/store/configStore';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateLabelTexture } from '@/utils/labelTextureGenerator';
import { applyCylindricalUVMapping } from '@/utils/cylindricalUVMapping';
import { applyViewOffsets } from '@/utils/viewOffsets';

export default function Package3DModelViewer() {
  const { currentPackage, packageConfig, showReferenceSurface } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const labelTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get OBJ+MTL model paths
  const getModelPaths = () => {
    switch (currentPackage) {
      case 'can-12oz':
        return {
          obj: '/assets/models/12oz-beverage-can.obj',
          mtl: '/assets/models/12oz-beverage-can.mtl'
        };
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

    const modelPaths = getModelPaths();
    if (!modelPaths) {
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
    camera.position.set(0, 50, 150);
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
    controls.minDistance = 50;
    controls.maxDistance = 300;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 150);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-100, 0, -100);
    scene.add(fillLight);

    // Add reference ground plane
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundMesh.position.y = -30; // Position below the can
    groundMesh.receiveShadow = true;
    groundMesh.userData.isReferenceSurface = true;
    scene.add(groundMesh);

    // Add environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;
    
    // Debug helpers removed - model loading successfully

    // Load OBJ model
    const objLoader = new OBJLoader();
    objLoader.load(
      modelPaths.obj,
      (object) => {
        // OBJ loaded successfully
        modelRef.current = object;

        // Generate label texture from current config (async)
        // Apply 3D view offsets to transform
        const adjustedTransform = applyViewOffsets(packageConfig.labelTransform, '3d');
        generateLabelTexture(packageConfig, adjustedTransform).then((labelCanvas) => {
          const labelTexture = new THREE.CanvasTexture(labelCanvas);
          labelTexture.needsUpdate = true;
          labelTextureRef.current = labelTexture;
          
          // Apply texture to can body after generation
          if (modelRef.current) {
            modelRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh && child.userData.isCanBody) {
                const material = child.material as THREE.MeshStandardMaterial;
                material.map = labelTexture;
                material.needsUpdate = true;
              }
            });
          }
        }).catch((error) => {
          console.error('Failed to generate initial label texture:', error);
        });

        // Apply materials to model
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const meshName = child.name.toLowerCase();
            
            // Skip plane meshes (background/floor from OBJ file)
            if (meshName.includes('plane')) {
              // Keep plane meshes with default gray material
              const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.8,
                metalness: 0.2,
              });
              child.material = material;
              child.userData.isBackgroundPlane = true;
              return;
            }
            
            // Apply label texture only to the cylindrical can body
            if (meshName.includes('cylinder')) {
              // Generate cylindrical UV mapping for the can body
              applyCylindricalUVMapping(child);
              
              // Flip normals to point outward (fixes inside-out texture)
              child.geometry.scale(-1, 1, 1); // Flip X axis to invert mesh
              child.geometry.computeVertexNormals(); // Recompute normals
              
              // Can body gets the label texture (will be applied async)
              const material = new THREE.MeshStandardMaterial({
                color: packageConfig.baseColor, // Use template/base color for can body
                metalness: packageConfig.metalness * 0.3, // Reduce metalness for label area
                roughness: packageConfig.roughness * 1.5, // Increase roughness for matte label
                map: null, // Texture will be applied asynchronously after generation
              });
              child.material = material;
              
              // Store reference to can body for texture updates
              child.userData.isCanBody = true;
            } else {
              // Top and bottom get metallic material without label
              const material = new THREE.MeshStandardMaterial({
                color: packageConfig.baseColor,
                metalness: packageConfig.metalness,
                roughness: packageConfig.roughness,
              });
              child.material = material;
            }
          }
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Model centered and added to scene
        
        scene.add(object);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading OBJ:', error);
        setError(`Failed to load 3D model: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [currentPackage]);

  // Update model materials and label texture when packageConfig or labelTransform changes
  useEffect(() => {
    if (!modelRef.current) return;

    // Regenerate label texture asynchronously
    // Apply 3D view offsets to transform
    const adjustedTransform = applyViewOffsets(packageConfig.labelTransform, '3d');
    generateLabelTexture(packageConfig, adjustedTransform).then((labelCanvas) => {
      const newLabelTexture = new THREE.CanvasTexture(labelCanvas);
      newLabelTexture.needsUpdate = true;
      
      // Dispose old texture
      if (labelTextureRef.current) {
        labelTextureRef.current.dispose();
      }
      labelTextureRef.current = newLabelTexture;

      // Update all materials
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Skip background planes from OBJ file
            if (child.userData.isBackgroundPlane) {
              return;
            }
            
            if (child.material) {
              const material = child.material as THREE.MeshStandardMaterial;
              
              // Update can body with new label texture
              if (child.userData.isCanBody) {
                material.color.setStyle(packageConfig.baseColor); // Use template/base color
                material.metalness = packageConfig.metalness * 0.3;
                material.roughness = packageConfig.roughness * 1.5;
                material.map = newLabelTexture;
              } else {
                // Update top/bottom with base color
                material.color.setStyle(packageConfig.baseColor);
                material.metalness = packageConfig.metalness;
                material.roughness = packageConfig.roughness;
              }
              material.needsUpdate = true;
            }
          }
        });
      }
    }).catch((error) => {
      console.error('Failed to generate label texture:', error);
    });
  }, [packageConfig, packageConfig.labelTransform]);

  // Toggle reference surface visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    
    sceneRef.current.traverse((child) => {
      if (child.userData.isReferenceSurface) {
        child.visible = showReferenceSurface;
      }
    });
  }, [showReferenceSurface]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold mb-2">Error Loading 3D Model</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading 3D Model...</p>
          </div>
        </div>
      )}
    </div>
  );
}
