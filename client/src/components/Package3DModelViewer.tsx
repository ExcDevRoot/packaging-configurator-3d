import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useConfigStore } from '@/store/configStore';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { generateLabelTexture } from '@/utils/labelTextureGenerator';
import { applyCylindricalUVMapping } from '@/utils/cylindricalUVMapping';
import { applyViewOffsets } from '@/utils/viewOffsets';
import { generateAlphaGradient } from '@/utils/generateAlphaGradient';
import { getCameraPresetPosition, getInitialCameraPosition, getCameraConfig, type CameraPreset } from '@/config/cameraConfigs';

export interface Package3DModelViewerHandle {
  resetCamera: () => void;
  getCameraState: () => { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number } | null;
  setCameraState: (state: { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number }; zoom: number }) => void;
}

const Package3DModelViewer = forwardRef<Package3DModelViewerHandle>((props, ref) => {
  // Use selectors to properly subscribe to store changes
  const currentPackage = useConfigStore((state) => state.currentPackage);
  const packageConfig = useConfigStore((state) => state.packageConfig);
  const showReferenceSurface = useConfigStore((state) => state.showReferenceSurface);
  const showWrapper = useConfigStore((state) => state.showWrapper);
  const cameraPreset = useConfigStore((state) => state.cameraPreset);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const labelTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const stickPackLabelMeshesRef = useRef<{ front: THREE.Mesh | null; back: THREE.Mesh | null }>({ front: null, back: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose resetCamera method to parent component
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current && controlsRef.current) {
        // Reset camera position
        cameraRef.current.position.set(0, 50, 150);
        // Reset controls target
        controlsRef.current.target.set(0, 0, 0);
        // Reset zoom
        cameraRef.current.zoom = 1;
        cameraRef.current.updateProjectionMatrix();
        // Update controls
        controlsRef.current.update();
      }
    },
    getCameraState: () => {
      if (cameraRef.current && controlsRef.current) {
        return {
          position: {
            x: cameraRef.current.position.x,
            y: cameraRef.current.position.y,
            z: cameraRef.current.position.z,
          },
          target: {
            x: controlsRef.current.target.x,
            y: controlsRef.current.target.y,
            z: controlsRef.current.target.z,
          },
          zoom: cameraRef.current.zoom,
        };
      }
      return null;
    },
    setCameraState: (state) => {
      if (cameraRef.current && controlsRef.current) {
        // Set camera position
        cameraRef.current.position.set(state.position.x, state.position.y, state.position.z);
        // Set controls target
        controlsRef.current.target.set(state.target.x, state.target.y, state.target.z);
        // Set zoom
        cameraRef.current.zoom = state.zoom;
        cameraRef.current.updateProjectionMatrix();
        // Update controls
        controlsRef.current.update();
      }
    },
  }));

  // Helper function to apply camera preset
  const applyCameraPreset = (preset: CameraPreset) => {
    if (cameraRef.current && controlsRef.current) {
      const presetPosition = getCameraPresetPosition(currentPackage, preset);
      cameraRef.current.position.set(...presetPosition.position);
      controlsRef.current.target.set(...presetPosition.target);
      cameraRef.current.zoom = 1;
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
    }
  };

  // Get OBJ+MTL model paths
  const getModelPaths = () => {
    switch (currentPackage) {
      case 'can-12oz':
        return {
          obj: '/assets/models/12oz-beverage-can.obj',
          mtl: '/assets/models/12oz-beverage-can.mtl'
        };
      case 'bottle-2oz':
        return {
          obj: '/models/bottle_2oz.obj',
          mtl: '/models/bottle_2oz.mtl'
        };
      case 'stick-pack':
        return {
          obj: '/models/coffee_stick.obj',
          mtl: '/models/coffee_stick.mtl'
        };
      case 'bottle-750ml':
        return {
          obj: '/models/can_12oz.obj',
          mtl: '/models/can_12oz.mtl'
        };
      case 'pkgtype5':
        return {
          obj: '/models/Red_Wine_Bottle_Cabernet_convert.obj',
          mtl: null
        };
      case 'pkgtype6':
        return {
          obj: '/models/Crystal_Head_Vodka.obj',
          mtl: null
        };
      case 'pkgtype7':
        return {
          obj: '/models/pkgtype7.obj',
          mtl: '/models/pkgtype7.mtl'
        };
      case 'pkgtype8':
        return {
          obj: '/models/pkgtype8.obj',
          mtl: '/models/pkgtype8.mtl'
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove old model from scene before loading new one
    if (modelRef.current && sceneRef.current) {
      // Removing old model
      sceneRef.current.remove(modelRef.current);
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      modelRef.current = null;
      
      // Clear stick pack label refs and remove from scene
      if (stickPackLabelMeshesRef.current.front) {
        sceneRef.current.remove(stickPackLabelMeshesRef.current.front);
        stickPackLabelMeshesRef.current.front.geometry.dispose();
        (stickPackLabelMeshesRef.current.front.material as THREE.Material).dispose();
        stickPackLabelMeshesRef.current.front = null;
      }
      if (stickPackLabelMeshesRef.current.back) {
        sceneRef.current.remove(stickPackLabelMeshesRef.current.back);
        stickPackLabelMeshesRef.current.back.geometry.dispose();
        (stickPackLabelMeshesRef.current.back.material as THREE.Material).dispose();
        stickPackLabelMeshesRef.current.back = null;
      }
    }

    const modelPaths = getModelPaths();
    if (!modelPaths) {
      setError('3D model not available for this package type');
      setIsLoading(false);
      return;
    }
    
    // Loading model
    setIsLoading(true);

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
    
    // Remove rotation limits to allow unlimited rotation
    controls.minPolarAngle = -Infinity; // Unlimited vertical rotation
    controls.maxPolarAngle = Infinity; // Unlimited vertical rotation
    controls.minAzimuthAngle = -Infinity; // Unlimited horizontal rotation
    controls.maxAzimuthAngle = Infinity; // Unlimited horizontal rotation
    
    // Enable pan control with right-click drag
    controls.enablePan = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    
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

    // Helper function to load PBR textures for stick-pack
    const loadStickPackTextures = () => {
      const textureLoader = new THREE.TextureLoader();
      const textures: Record<string, THREE.Texture> = {};
      
      // Load all PBR texture maps
      const texturePromises = [
        textureLoader.loadAsync('/models/packing_Mat_baseColor.png').then(tex => { textures.baseColor = tex; }),
        textureLoader.loadAsync('/models/packing_Mat_normal.png').then(tex => { textures.normal = tex; }),
        textureLoader.loadAsync('/models/packing_Mat_metallic.png').then(tex => { textures.metallic = tex; }),
        textureLoader.loadAsync('/models/packing_Mat_roughness.png').then(tex => { textures.roughness = tex; }),
      ].map(p => p.catch(err => console.warn('Texture load failed:', err)));
      
      return Promise.all(texturePromises).then(() => textures);
    };

    // Load OBJ model
    const objLoader = new OBJLoader();
    objLoader.load(
      modelPaths.obj,
      (object) => {
        // OBJ loaded successfully
        // OBJ loaded successfully
        console.log('[3D Model] OBJ loaded successfully for package:', currentPackage);
        console.log('[3D Model] Object children count:', object.children.length);
        modelRef.current = object;

        // Generate label texture from current config (async) - only if showWrapper is true
        if (showWrapper) {
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
        }

        // Filter 750ml bottle to show only one variant
        if (currentPackage === 'bottle-750ml') {
          // Remove all bottles except Gallo_Chard
          const childrenToRemove: THREE.Object3D[] = [];
          object.traverse((child) => {
            if (child.name && child.name !== 'Gallo_Chard' && child.name !== object.name) {
              childrenToRemove.push(child);
            }
          });
          childrenToRemove.forEach(child => {
            if (child.parent) {
              child.parent.remove(child);
            }
          });
        }

        // Apply materials to model
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const meshName = child.name.toLowerCase();
            console.log('[3D Model] Found mesh:', child.name, '(lowercase:', meshName, ')');
            
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
            
            // Determine if this mesh should receive label texture based on package type
            const shouldReceiveLabel = (
              (currentPackage === 'can-12oz' && meshName.includes('cylinder')) ||
              (currentPackage === 'bottle-2oz' && meshName.includes('bottle') && !meshName.includes('cap')) ||
              (currentPackage === 'stick-pack' && meshName.includes('blank_mockup')) ||
              (currentPackage === 'bottle-750ml' && (meshName.includes('gallo_chard') || meshName.includes('bottle'))) ||
              (currentPackage === 'pkgtype7' && meshName.includes('mylar_bag')) ||
              (currentPackage === 'pkgtype8' && meshName.includes('glass_jar') && !meshName.includes('lid'))
            );
            
            if (shouldReceiveLabel) {
              // Special handling for stick-pack: use temporary A/B labels for orientation testing
              if (currentPackage === 'stick-pack') {
                // Load PBR textures for stick pack base (no label baked in)
                const textureLoader = new THREE.TextureLoader();
                const baseColorMap = textureLoader.load('/models/packing_Mat_baseColor.png');
                const normalMap = textureLoader.load('/models/packing_Mat_normal.png');
                const metallicMap = textureLoader.load('/models/packing_Mat_metallic.png');
                const roughnessMap = textureLoader.load('/models/packing_Mat_roughness.png');
                
                // Apply PBR material with base textures only
                const baseMaterial = new THREE.MeshStandardMaterial({
                  map: baseColorMap,
                  normalMap: normalMap,
                  metalnessMap: metallicMap,
                  roughnessMap: roughnessMap,
                  metalness: 1.0,
                  roughness: 1.0,
                });
                child.material = baseMaterial;
                child.material.needsUpdate = true;
                
                // Get bounding box to calculate decal positions
                const bbox = new THREE.Box3().setFromObject(child);
                const size = bbox.getSize(new THREE.Vector3());
                const center = bbox.getCenter(new THREE.Vector3());
                
                console.log('[Stick Pack] Stick pack model center:', center);
                console.log('[Stick Pack] Dimensions:', { size, center });
                
                // Create label textures for decals - only if showWrapper is true
                if (showWrapper) {
                const createLabelTexture = (text: string, bgColor: string, textColor: string, id: string) => {
                  const canvas = document.createElement('canvas');
                  canvas.id = `stick-pack-label-${id}`;
                  canvas.width = 512;
                  canvas.height = 256;
                  const ctx = canvas.getContext('2d', { willReadFrequently: false })!;
                  
                  // Solid colored background for visibility
                  ctx.fillStyle = bgColor;
                  ctx.fillRect(0, 0, 512, 256);
                  
                  // Text
                  ctx.fillStyle = textColor;
                  ctx.font = 'bold 64px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(text, 256, 128);
                  
                  const texture = new THREE.CanvasTexture(canvas);
                  texture.needsUpdate = true;
                  console.log(`[Stick Pack] Created ${id} texture with bg:${bgColor}, text:${textColor}`);
                  return texture;
                };
                
                const frontTexture = createLabelTexture('FRONT', '#ff0000', '#ffffff', 'front'); // Red with white text
                
                const backTexture = createLabelTexture('BACK', '#0000ff', '#ffffff', 'back'); // Blue with white text
                
                // Create plane geometries for labels
                // The flat faces are on +Y and -Y, with dimensions X (length) × Z (width)
                const labelWidth = size.x * 0.8 * 0.78; // 80% of length × 78% scale
                const labelHeight = size.z * 0.5 * 0.78; // 50% of width × 78% scale
                
                // Front label plane (positive Y - top flat face)
                const frontPlaneGeometry = new THREE.PlaneGeometry(labelWidth, labelHeight);
                const frontPlaneMaterial = new THREE.MeshBasicMaterial({
                  map: frontTexture,
                  transparent: true,
                  opacity: 0.33, // 67% transparency
                  side: THREE.DoubleSide,
                  depthTest: true,
                  depthWrite: false,
                });
                const frontPlaneMesh = new THREE.Mesh(frontPlaneGeometry, frontPlaneMaterial);
                
                // Clean positioning: labels on opposite flat faces (Y-axis)
                // Stick pack is now upright (no rotation), flat faces are on +Y and -Y
                const separation = size.y * 2.0; // 200% - red label stays here, blue will match
                
                // Front label - positioned on +Y face (top flat face)
                // Symmetric positioning: same distance as back label
                // Position labels just outside the stick pack's max thickness (size.y)
                // Current distance between label centers: 2 * (size.y * 0.1 - 1.0)
                // Target: 1.617x that distance, positioned symmetrically from center
                const currentOffset = size.y * 0.1 - 1.0;
                const currentSeparation = 2 * Math.abs(currentOffset);
                const targetSeparation = currentSeparation * 1.617 * 0.85; // Golden ratio, then 15% closer
                const labelOffset = targetSeparation / 2; // Half the separation for each side
                frontPlaneMesh.position.set(0, 0.88, 0);
                frontPlaneMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on XZ plane, facing up
                scene.add(frontPlaneMesh);
                stickPackLabelMeshesRef.current.front = frontPlaneMesh;
                console.log('[Stick Pack] RED FRONT label center:', { x: center.x, y: center.y + labelOffset, z: center.z });
                
                // Back label plane
                const backPlaneGeometry = new THREE.PlaneGeometry(labelWidth, labelHeight);
                const backPlaneMaterial = new THREE.MeshBasicMaterial({
                  map: backTexture,
                  transparent: true,
                  opacity: 0.33, // 67% transparency
                  side: THREE.DoubleSide,
                  depthTest: true,
                  depthWrite: false,
                });
                const backPlaneMesh = new THREE.Mesh(backPlaneGeometry, backPlaneMaterial);
                
                // Back label - positioned on -Y face (bottom flat face)
                backPlaneMesh.position.set(0, -0.88, 0);
                backPlaneMesh.rotation.x = Math.PI / 2; // Flip to face opposite direction (upside down from front)
                scene.add(backPlaneMesh);
                stickPackLabelMeshesRef.current.back = backPlaneMesh;
                console.log('[Stick Pack] BLUE BACK label center:', { x: center.x, y: -center.y - labelOffset, z: center.z });
                
                // Verify equidistant positioning (3-norm)
                const frontDist = Math.sqrt(
                  Math.pow(frontPlaneMesh.position.x - center.x, 2) +
                  Math.pow(frontPlaneMesh.position.y - center.y, 2) +
                  Math.pow(frontPlaneMesh.position.z - center.z, 2)
                );
                const backDist = Math.sqrt(
                  Math.pow(backPlaneMesh.position.x - center.x, 2) +
                  Math.pow(backPlaneMesh.position.y - center.y, 2) +
                  Math.pow(backPlaneMesh.position.z - center.z, 2)
                );
                console.log('[Stick Pack] Front label 3-norm distance from CG:', frontDist.toFixed(4));
                console.log('[Stick Pack] Back label 3-norm distance from CG:', backDist.toFixed(4));
                console.log('[Stick Pack] Labels equidistant:', Math.abs(frontDist - backDist) < 0.001);
                } // End showWrapper condition for stick pack labels
                
                console.log('[Stick Pack] PBR base material + Plane mesh labels applied.');
              } else if (currentPackage === 'bottle-2oz') {
                // Generate cylindrical UV mapping for bottle body
                applyCylindricalUVMapping(child);
                
                // Flip normals to point outward (fixes inside-out texture)
                child.geometry.scale(-1, 1, 1); // Flip X axis to invert mesh
                child.geometry.computeVertexNormals(); // Recompute normals
                
                // Bottle body gets the label texture (will be applied async)
                const material = new THREE.MeshStandardMaterial({
                  color: packageConfig.baseColor,
                  metalness: packageConfig.metalness * 0.2, // Low metalness for plastic
                  roughness: packageConfig.roughness * 1.3, // Matte plastic finish
                  map: null, // Texture will be applied asynchronously after generation
                  transparent: false,
                });
                child.material = material;
                
                // Store reference to bottle body for texture updates
                child.userData.isCanBody = true;
              } else if (currentPackage === 'pkgtype7') {
                // Mylar bag uses planar UV mapping (bag has flat front/back faces)
                // Keep existing UVs from model (already properly mapped)
                
                if (showWrapper) {
                  // Wrapper ON: Mylar bag gets matte plastic/foil material with label texture
                  const material = new THREE.MeshStandardMaterial({
                    color: packageConfig.baseColor,
                    metalness: packageConfig.metalness * 0.3, // Low metalness for mylar/plastic
                    roughness: packageConfig.roughness * 1.2, // Semi-matte finish
                    map: null, // Texture will be applied asynchronously after generation
                    transparent: false,
                  });
                  child.material = material;
                  
                  // Store reference to mylar bag for texture updates
                  child.userData.isCanBody = true;
                } else {
                  // Wrapper OFF: Load PBR textures with silver metallic base color
                  const textureLoader = new THREE.TextureLoader();
                  const basePath = '/models/pkgtype7_textures/';
                  
                  // Load PBR texture maps (skip BaseColor map - use direct color instead)
                  const normalMap = textureLoader.load(basePath + 'pkgtype7_Normal.png');
                  const metallicMap = textureLoader.load(basePath + 'pkgtype7_Metallic.png');
                  const roughnessMap = textureLoader.load(basePath + 'pkgtype7_Roughness.png');
                  
                  // Apply PBR material with silver metallic color (no BaseColor map)
                  const material = new THREE.MeshStandardMaterial({
                    color: 0xC0C0C0, // Silver metallic base color
                    normalMap: normalMap,
                    metalnessMap: metallicMap,
                    roughnessMap: roughnessMap,
                    metalness: 1.0, // Full metalness for shiny metal
                    roughness: 0.3, // Lower roughness for shinier appearance
                    transparent: false,
                  });
                  child.material = material;
                  
                  // Store reference to mylar bag for material updates
                  child.userData.isCanBody = true;
                  
                  console.log('[pkgtype7] Silver metallic PBR material applied (no BaseColor map)');
                }
              } else if (currentPackage === 'pkgtype8') {
                // Generate cylindrical UV mapping for glass jar body
                applyCylindricalUVMapping(child);
                
                // Flip normals to point outward (fixes inside-out texture)
                child.geometry.scale(-1, 1, 1); // Flip X axis to invert mesh
                child.geometry.computeVertexNormals(); // Recompute normals
                
                // Glass jar gets semi-transparent frosted glass material with label texture
                const material = new THREE.MeshStandardMaterial({
                  color: packageConfig.baseColor,
                  metalness: packageConfig.metalness * 0.1, // Very low metalness for glass
                  roughness: packageConfig.roughness * 0.4, // Smooth but slightly frosted
                  map: null, // Texture will be applied asynchronously after generation
                  transparent: true,
                  opacity: 0.4, // Semi-transparent frosted glass effect
                  side: THREE.DoubleSide, // Render both sides for glass
                });
                child.material = material;
                
                // Store reference to glass jar for texture updates
                child.userData.isCanBody = true;
              } else {
                // Generate cylindrical UV mapping for the can body
                applyCylindricalUVMapping(child);
                
                // Flip normals to point outward (fixes inside-out texture)
                child.geometry.scale(-1, 1, 1); // Flip X axis to invert mesh
                child.geometry.computeVertexNormals(); // Recompute normals
                
                // Generate alpha gradient for top/bottom transparency (5% margins)
                const alphaCanvas = generateAlphaGradient(512, 512);
                const alphaTexture = new THREE.CanvasTexture(alphaCanvas);
                alphaTexture.needsUpdate = true;
                
                // Can body gets the label texture (will be applied async)
                const material = new THREE.MeshStandardMaterial({
                  color: packageConfig.baseColor, // Use template/base color for can body
                  metalness: packageConfig.metalness * 0.3, // Reduce metalness for label area
                  roughness: packageConfig.roughness * 1.5, // Increase roughness for matte label
                  map: null, // Texture will be applied asynchronously after generation
                  alphaMap: alphaTexture, // Vertical gradient for rim transparency
                  transparent: true, // Enable transparency
                });
                child.material = material;
                
                // Store reference to can body for texture updates
                child.userData.isCanBody = true;
              }
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

        // Center model and adjust camera
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        object.position.sub(center); // Center the model at origin
        
        // Apply package-specific initial camera position
        const initialPosition = getInitialCameraPosition(currentPackage);
        cameraRef.current!.position.set(...initialPosition.position);
        cameraRef.current!.lookAt(...initialPosition.target);
        
        // Apply package-specific distance limits
        const cameraConfig = getCameraConfig(currentPackage);
        if (controlsRef.current) {
          controlsRef.current.minDistance = cameraConfig.distanceLimits.min;
          controlsRef.current.maxDistance = cameraConfig.distanceLimits.max;
          controlsRef.current.target.set(...initialPosition.target);
          
          // Ensure unlimited rotation (override any defaults)
          controlsRef.current.minPolarAngle = -Infinity; // Unlimited vertical rotation
          controlsRef.current.maxPolarAngle = Infinity;  // Unlimited vertical rotation
          controlsRef.current.minAzimuthAngle = -Infinity; // Unlimited horizontal rotation
          controlsRef.current.maxAzimuthAngle = Infinity;  // Unlimited horizontal rotation
          
          console.log('[OrbitControls] Rotation limits set:', {
            minPolarAngle: controlsRef.current.minPolarAngle,
            maxPolarAngle: controlsRef.current.maxPolarAngle,
            minAzimuthAngle: controlsRef.current.minAzimuthAngle,
            maxAzimuthAngle: controlsRef.current.maxAzimuthAngle,
            minDistance: controlsRef.current.minDistance,
            maxDistance: controlsRef.current.maxDistance
          });
          
          controlsRef.current.update();
        }
        
        // Model loaded and centered
        
        // Apply package-specific rotations
        if (currentPackage === 'pkgtype5') {
          object.rotation.x = -Math.PI / 2; // -90 degrees to orient neck upward
          
          // Position bottle on reference floor
          const rotatedBox = new THREE.Box3().setFromObject(object);
          const minY = rotatedBox.min.y;
          const floorY = -30; // Reference floor position
          object.position.y += (floorY - minY); // Move bottom to floor
        }
        
        if (currentPackage === 'stick-pack') {
          object.rotation.x = 0; // No rotation - keep upright
          // Keep at Y=0 (centered at origin, no floor positioning)
        }
        
        if (currentPackage === 'pkgtype6') {
          // Position skull bottle on reference floor
          const rotatedBox = new THREE.Box3().setFromObject(object);
          const minY = rotatedBox.min.y;
          const floorY = -30; // Reference floor position
          object.position.y += (floorY - minY); // Move bottom to floor
        }

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
      console.log('[3D Viewer] Cleanup triggered for package:', currentPackage);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of the old model and its materials/geometries
      if (modelRef.current && sceneRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        modelRef.current = null;
      }
      
      // Dispose of label texture
      if (labelTextureRef.current) {
        labelTextureRef.current.dispose();
        labelTextureRef.current = null;
      }
      
      // Remove renderer DOM element
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('[3D Viewer] Could not remove renderer element:', e);
        }
      }
      
      // Dispose of renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Dispose of controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      // Clear scene
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
    };
  }, [currentPackage]);

  // Update model materials and label texture when packageConfig or labelTransform changes
  useEffect(() => {
    if (!modelRef.current) return;

    // Regenerate label texture asynchronously - only if showWrapper is true
    if (showWrapper) {
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
    } else {
      // showWrapper is false - remove label texture and show base/PBR material
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData.isCanBody) {
            const material = child.material as THREE.MeshStandardMaterial;
            
            // Special handling for pkgtype7: load PBR textures with silver metallic color
            if (currentPackage === 'pkgtype7') {
              const textureLoader = new THREE.TextureLoader();
              const basePath = '/models/pkgtype7_textures/';
              
              // Load PBR texture maps
              const normalMap = textureLoader.load(basePath + 'pkgtype7_Normal.png');
              const metallicMap = textureLoader.load(basePath + 'pkgtype7_Metallic.png');
              const roughnessMap = textureLoader.load(basePath + 'pkgtype7_Roughness.png');
              
              // Apply dark gray metallic material with PBR maps
              material.map = null; // No base color texture
              material.color.setHex(0x6d6969); // Dark gray base color (hardcoded)
              material.normalMap = normalMap;
              material.metalnessMap = metallicMap;
              material.roughnessMap = roughnessMap;
              material.metalness = packageConfig.metalness; // Use slider value
              material.roughness = packageConfig.roughness; // Use slider value
              
              console.log('[pkgtype7] Applied silver metallic PBR material (wrapper OFF)');
            } else {
              // For other packages: remove wrapper texture, show base color
              material.map = null;
              material.color.setStyle(packageConfig.baseColor);
              material.metalness = packageConfig.metalness;
              material.roughness = packageConfig.roughness;
            }
            
            material.needsUpdate = true;
          }
        });
      }
      
      // Dispose old label texture
      if (labelTextureRef.current) {
        labelTextureRef.current.dispose();
        labelTextureRef.current = null;
      }
    }
  }, [packageConfig, showWrapper, currentPackage]);

  // Toggle reference surface visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    
    sceneRef.current.traverse((child) => {
      if (child.userData.isReferenceSurface) {
        child.visible = showReferenceSurface;
      }
    });
  }, [showReferenceSurface]);

  // Toggle stick pack label visibility when showWrapper changes
  useEffect(() => {
    if (currentPackage !== 'stick-pack') return;
    
    const { front, back } = stickPackLabelMeshesRef.current;
    if (front) front.visible = showWrapper;
    if (back) back.visible = showWrapper;
  }, [showWrapper, currentPackage]);

  // Apply camera preset when it changes
  useEffect(() => {
    if (cameraPreset && cameraRef.current && controlsRef.current) {
      applyCameraPreset(cameraPreset as CameraPreset);
    }
  }, [cameraPreset, currentPackage]);

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
      {/* Debug info */}

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
});

Package3DModelViewer.displayName = 'Package3DModelViewer';

export default Package3DModelViewer;
export type { Package3DModelViewerHandle };
