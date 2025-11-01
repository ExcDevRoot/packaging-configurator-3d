# Project TODO

## Phase 1: Asset Preparation & Project Setup
- [x] Initialize web project with React + TypeScript
- [x] Copy packaging images to public assets folder
- [x] Install Three.js and React Three Fiber dependencies
- [x] Install additional 3D libraries (drei, postprocessing)
- [x] Create placeholder logo/branding assets
- [x] Set up project structure for 3D components

## Phase 2: Core 3D Scene Setup
- [x] Create CSS 3D transform-based scene (alternative to Three.js)
- [x] Implement visual effects and shadows
- [x] Configure camera presets and view angles
- [x] Add interactive rotation and zoom controls
- [ ] Set up scene background and environment
- [ ] Implement basic material system (metallic, glass, matte)

## Phase 3: Package Geometry & Textures
- [ ] Create 3D geometry for 2oz bottle (cylinder primitive)
- [ ] Create 3D geometry for 12oz aluminum can (cylinder with top indent)
- [ ] Create 3D geometry for stick pack (box primitive)
- [ ] Create 3D geometry for 750ml glass bottle (custom shape)
- [ ] Apply base textures from uploaded images
- [ ] Implement UV mapping for label areas
- [ ] Set up material properties per package type

## Phase 4: Customization UI & Label System
- [x] Build package selector UI (4 package types)
- [x] Create color picker for package base color
- [x] Implement text input fields (product name, description, ingredients)
- [x] Add logo upload functionality
- [x] Create label overlay system for packages
- [ ] Implement dynamic texture generation for labels
- [ ] Add font selector for text customization (future)
- [ ] Create size/volume dimension controls

## Phase 5: Interactive Controls & Collaboration
- [x] Implement 2D/3D view toggle
- [x] Add camera preset positions (front, back, side views)
- [ ] Create snapshot/export functionality (PNG/JPEG)
- [x] Build configuration save/export system
- [ ] Add shareable link generation
- [ ] Implement basic collaboration hooks (future: comments, annotations)
- [ ] Add zoom level controls
- [ ] Create reset/undo functionality

## Phase 6: Optimization & Polish
- [ ] Optimize texture sizes and compression
- [ ] Implement frustum culling
- [ ] Add loading states and progress indicators
- [ ] Test performance across devices
- [ ] Add responsive design for mobile/tablet
- [ ] Implement error boundaries
- [ ] Add keyboard shortcuts
- [ ] Create user guide/help section

## Phase 7: Documentation & Deployment
- [ ] Write comprehensive user guide
- [ ] Document API/component structure
- [ ] Create example configurations
- [ ] Save checkpoint for deployment
- [ ] Test in production environment

## Phase 6: Template Library System
- [x] Create template data structure with pre-configured designs
- [x] Build template categories (Energy, Wellness, Coffee, Juice, etc.)
- [x] Design template gallery UI component
- [x] Implement template preview cards
- [x] Add "Apply Template" functionality
- [x] Create template modal/dialog
- [x] Add template search and filtering
- [x] Design 12 professional templates across 6 categories

## Phase 7: Realistic Label Wrapping & Surface Projection
- [x] Create canvas-based label texture generator
- [x] Implement cylindrical UV mapping for cans
- [x] Implement cylindrical UV mapping for bottles
- [x] Add perspective distortion for curved surfaces
- [x] Create label zones (front label with proper positioning)
- [x] Apply lighting and shadow effects to labels
- [x] Implement label scaling based on package dimensions
- [x] Dynamic rendering with rotation and zoom support
- [x] Create realistic mockup rendering for production-ready visualization

## Bug Fixes - Label Display
- [x] Fix package image to be larger than label (label should be smaller overlay)
- [x] Change ingredients display to show only 3 random ingredients
- [x] Add "Active Ingredients:" prefix to ingredient list on label

## Label Scaling Adjustment
- [x] Keep package image at original scale and aspect ratio (no scaling)
- [x] Set label height to exactly 50% of package image height
- [x] Ensure label width scales proportionally

## Label Transparency Fix
- [x] Remove white background from label rendering
- [x] Make label background fully transparent
- [x] Ensure text and logo render directly on package surface

## Label Integration and Legibility Improvements
- [x] Center logo within inner package boundaries
- [x] Ensure label geometry is integrated with package (transforms together during rotation/zoom)
- [x] Add adaptive text shadows for ingredient text to ensure legibility
- [x] Implement adaptive text contrast for all label text against any package color
- [x] Verify label stays within visible package surface during all transformations

## Replace PNG with BMP Package Images
- [x] Copy BMP files to assets/packages directory
- [x] Update file references in code to use .bmp extensions
- [x] Delete old PNG package image files
- [x] Test that all package types load correctly with BMP files

## Phase 8: GLB 3D Model Support
- [x] Install Three.js GLTFLoader for loading GLB files
- [x] Create procedural cylinder geometry for 12oz can placeholder
- [x] Generate GLB file from procedural geometry with texture mapping
- [x] Create Package3DModelViewer component with Three.js
- [x] Implement true 3D rotation and camera controls for GLB models (OrbitControls)
- [x] Create fallback system (use GLB for 12oz can, BMP for others)
- [x] Test GLB model loading and rendering
- [x] Prepare asset structure for user-uploaded GLB files (/assets/models/)
- [ ] Fix material color application to GLB model
- [ ] Add label texture mapping to 3D model surface

## Dynamic Label Positioning & Scaling
- [x] Add label position controls (X, Y offset) to configStore
- [x] Add label scale control to configStore
- [x] Create UI controls for label positioning (sliders/inputs)
- [x] Update Package3DViewerEnhanced to use dynamic label position
- [ ] Update Package3DModelViewer to use dynamic label position (GLB models)
- [x] Add reset button for label position/scale
- [x] Test label positioning across 2D package types

## Label Visibility Bug Fix
- [x] Investigate why label is not visible on 12oz can (black cylinder only)
- [x] Fix GLB model viewer to show labels or switch back to 2D image viewer
- [x] Ensure label renders in front of package image
- [x] Verify label visibility across all package types
- [x] Test label positioning controls with visible labels

## Hybrid Label Positioning (Logo + Text Group)
- [x] Add separate position/scale controls for logo (independent)
- [x] Add position/scale controls for text group (productName, description, ingredients, volume)
- [x] Update configStore with logo and textGroup transforms
- [x] Create LabelElementControls component for logo and text group
- [x] Update Package3DViewerEnhanced to render logo independently (always on top)
- [x] Update Package3DViewerEnhanced to render text group with center alignment
- [x] Update CustomizationPanel to show separate Logo and Text Group controls
- [x] Update resetLabelTransform to support individual element reset
- [x] Test UI showing both control sections with proper layout

## Individual Text Element Font & Color Customization
- [x] Add TextStyle interface to configStore (fontFamily, color)
- [x] Add textStyles property to PackageConfig for each text element
- [x] Create defaultTextStyles with 10 web-safe fonts
- [x] Add updateTextStyle action to store
- [x] Update all 12 templates to include textStyles
- [x] Create TextStyleControls component with font dropdown and color picker
- [x] Update CustomizationPanel to show Text Styling section with collapsible controls
- [x] Update Package3DViewerEnhanced to apply individual fonts and colors
- [x] Test font changes (Georgia font applied to Product Name)
- [x] Test color changes (Red #ff0000 applied to Product Name)
- [x] Verify 'auto' color mode maintains adaptive contrast
- [x] Add visual indicator (dot) for elements with custom styling

## OBJ+MTL 3D Model Support Implementation
- [x] Examine uploaded 12oz-beverage-can.obj and .mtl files
- [x] Copy OBJ and MTL files to client/public/assets/models/
- [x] Fix MTL file paths (remove Windows absolute paths)
- [x] Install OBJLoader from Three.js examples
- [x] Update Package3DModelViewer to use OBJLoader instead of GLTFLoader
- [x] Fix RoomEnvironment import to use three/examples
- [x] Update Home.tsx to conditionally render 3D vs 2D viewer based on viewMode
- [x] Test 3D model loading and rendering (12oz can renders successfully)
- [x] Apply base color and material properties to 3D model
- [ ] Apply label texture dynamically to 3D model surface
- [ ] Test camera angles and controls
- [ ] Save checkpoint with OBJ+MTL support

## Dynamic Label Texture for 3D Models
- [x] Create canvas-based label texture generator utility
- [x] Generate label texture from packageConfig (logo, text, colors, fonts)
- [x] Identify label mesh/material in OBJ model
- [x] Apply generated texture to 3D model surface
- [x] Implement UV mapping for cylindrical wrapping
- [x] Add real-time texture updates when label properties change
- [x] Test label visibility and alignment on 3D can
- [x] Verify label rotates/scales with 3D model controls (tested with product name change)
- [x] Confirm texture updates in real-time (changed "Brix Functional" to "TEST PRODUCT 3D")
