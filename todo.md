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

## Fix Label Texture Visibility on 3D Can Body
- [x] Analyze OBJ model to identify mesh names and structure (found Cylinder, Plane, Plane.001_Plane.002)
- [x] Identify which mesh is the cylindrical can body (Cylinder mesh)
- [x] Apply label texture only to can body mesh (not top/bottom)
- [x] Implement cylindrical UV mapping for proper texture wrapping
- [x] Ensure texture is oriented correctly (front-facing)
- [x] Test label visibility in 3D view (white label visible on can body)
- [x] Verify texture updates in real-time (changed to "LABEL VISIBLE 3D!" and texture updated)
- [x] Confirmed top/bottom remain metallic while body shows matte label

## Fix 3D Label Content Rendering
- [x] Debug labelTextureGenerator.ts to identify why logo and text weren't rendering
- [x] Check canvas size and scaling in texture generation (used 2048x1024 canvas)
- [x] Verify font loading and text drawing on canvas (used proven 2D viewer approach)
- [x] Fix text color visibility (forced black text on white background for contrast)
- [x] Rewrite texture generator using Package3DViewerEnhanced rendering logic
- [x] Verify all label elements render correctly (product name "Brix Functional" visible on 3D can)
- [x] Test real-time updates when label content changes (confirmed working)
- [x] Confirmed text visible on cylindrical 3D can surface in front view

## Add Logo to 3D Label Texture
- [x] Update labelTextureGenerator to accept labelTransform parameter
- [x] Add async logo loading function with error handling
- [x] Apply logo transform (offsetX, offsetY, scale) from labelTransform.logo
- [x] Apply text group position/scale transforms to canvas drawing
- [ ] Fix logo image loading (currently fails silently in 3D texture)
- [ ] Pre-load logo into memory before texture generation
- [ ] Test logo visibility on 3D can model

## Enable Position/Scale Controls in 3D View
- [x] Update labelTextureGenerator to accept labelTransform parameter
- [x] Apply logo position/scale transforms to canvas drawing logic
- [x] Apply text group position/scale transforms to canvas drawing logic
- [x] Update Package3DModelViewer to pass labelTransform to texture generator
- [x] Add useEffect to regenerate texture when labelTransform changes
- [ ] Test Logo controls (horizontal/vertical position, scale) in 3D view after logo loads
- [ ] Test Text Group controls (horizontal/vertical position, scale) in 3D view
- [ ] Verify controls persist when toggling between 2D and 3D views

## Can Background Color Picker for 3D View
- [x] Add labelBackgroundColor property to PackageConfig
- [x] Add setLabelBackgroundColor action to configStore
- [x] Add labelBackgroundColor to all 12 templates (#ffffff)
- [x] Add color picker control to Material tab (color input + hex text field)
- [x] Update labelTextureGenerator to use labelBackgroundColor instead of white
- [x] Update Package3DModelViewer to regenerate texture when background color changes
- [x] Verified color picker visible in Material tab

## 3D Reference Surface Visibility Toggle
- [x] Add showReferenceSurface boolean to config store (default: true)
- [x] Add setShowReferenceSurface action
- [x] Create ground plane mesh in Package3DModelViewer (500x500, gray)
- [x] Add toggle switch control to View Controls section (only visible in 3D mode)
- [x] Update Package3DModelViewer to show/hide ground plane based on toggle
- [x] Add label and description for toggle ("Show/hide ground platform")

## Fix 3D Label Orientation (Inside vs Outside Surface)
- [x] Attempted UV mapping flip (reverted - didn't work correctly)
- [x] Flip mesh normals in Package3DModelViewer to point outward (scale -1, 1, 1)
- [x] Recompute vertex normals after geometry flip
- [x] Test label orientation by rotating 3D can
- [x] Verify label appears on outer surface (not inner surface)

## Layout Swap - Sidebar to Left, 3D Viewer to Right
- [x] Swap order of sidebar and 3D viewer in Home.tsx flex container
- [x] Update panel toggle button position from right to left
- [x] Verify all functionality works after layout change
- [x] Test that 3D viewer renders correctly on right side

## 3D View Baseline with 2D Alignment Offset
- [x] Update default labelTransform values to center (0%, 0%, 1.0x)
- [x] Map 3D view actual positions: Logo (H:27%, V:2%, S:1.10x), Text (H:27%, V:30%, S:0.55x)
- [x] Create 2D view conversion offset: Logo (V:-33%, S:1.75x), Text (V:-17%, S:0.55x)
- [x] Apply 3D positions directly in 3D renderer
- [x] Apply 2D offsets automatically in 2D renderer
- [x] Test that both views show labels in correct positions
- [x] Verify user adjustments work proportionally in both views

## User Preset System
- [x] Create preset data structure and TypeScript types
- [x] Build localStorage utility for preset persistence
- [x] Add preset actions to configStore (save, load, delete, list)
- [x] Create SavePresetDialog component with name input
- [x] Create PresetGallery component with grid layout
- [x] Add preset thumbnail generation
- [x] Integrate "Save Preset" button in header
- [x] Integrate "My Presets" button to open gallery
- [x] Test save preset with all configuration properties
- [x] Test load preset restores complete state
- [x] Test delete preset removes from storage
- [x] Verify presets persist across page reloads

## Fix Template Color Application
- [x] Investigate current template application logic in TemplateGallery
- [x] Change template color target from reference surface to can base material
- [x] Ensure label texture is preserved/reapplied after template color change
- [x] Test that template colors apply to can surface correctly
- [x] Verify label remains visible after template application

## Add Visual Separator Between Sidebar and Viewer
- [x] Add border-right to Customize sidebar for visual separation
- [x] Test appearance in browser

## Enable Pan Control in 3D Viewer
- [x] Enable pan functionality in OrbitControls
- [x] Configure Right-Click + Drag for pan/translate
- [x] Test pan control with right-click drag
- [x] Verify no conflicts with existing rotate/zoom controls

## Update Controls Overlay with Pan Instruction
- [x] Locate Controls overlay component in Package3DModelViewer
- [x] Add "Right-Click + Drag: Translate View" line to overlay
- [x] Test overlay appearance in browser

## Hybrid Approach: Replace Image + Pixel Analysis Mask
- [x] Backup current 12oz_aluminumcan.bmp
- [x] Replace with new version with improved alpha channel
- [x] Implement pixel brightness analysis to identify can vs border
- [x] Create mask canvas with white for can pixels, transparent for border
- [x] Apply base color using mask with composite operations
- [x] Test with templates to verify border exclusion
- [x] Test with zoom to verify transformation handling

## Fix Base Color Zoom Scaling
- [x] Update hybrid approach to use temporary canvas instead of main canvas getImageData
- [x] Ensure mask is created at original image size
- [x] Draw colored result with transformed coordinates to respect zoom
- [x] Test zoom in/out to verify color scales with can

## Fix 2D View Controls - Add Pan and Remove Rotation
### Stage 1: Add Right-Click Pan
- [x] Add pan state (x, y) to Package3DViewerEnhanced
- [x] Add dragMode state to track 'rotate' vs 'pan'
- [x] Update handleMouseDown to detect button (0=left, 2=right)
- [x] Update handleMouseMove to handle both rotate and pan modes
- [x] Apply pan translation in canvas rendering
- [x] Prevent context menu on right-click
- [x] Test Right-Click + Drag pan functionality

### Stage 2: Remove Rotation Control
- [x] Remove rotation state and logic from 2D view
- [x] Update mouse handlers to only support pan (no rotation)
- [x] Test that 2D view only has zoom and pan controls
- [x] Verify 3D view controls remain unchanged

## Swap Sidebar Back to Right Side
- [x] Reorder flex container: 3D Viewer on left, Sidebar on right
- [x] Update panel toggle button position from left to right
- [x] Reverse toggle arrow directions (› open, ‹ close)
- [x] Test layout and verify all functionality intact

## Replace Package Type Icons with Images
- [x] Copy 12oz_aluminumcan_128x128px.png to public/assets/
- [x] Copy 2oz_whiteshot_128x128px.png to public/assets/
- [x] Copy StickPack_128x128px.png to public/assets/
- [x] Copy 750ml_bottle_128x128px.png to public/assets/
- [x] Update CustomizationPanel to use img tags instead of emoji
- [x] Test package type icon display

## Scale Package Type Icons Individually
- [x] Update 12oz Can icon to w-18 h-18 (72px, +50% from 48px)
- [x] Update Stick Pack icon to w-30 h-30 (120px, +150% from 48px)
- [x] Keep 2oz Bottle and 750ml Bottle at w-12 h-12 (48px)
- [x] Test icon sizes in browser
- [x] Save checkpoint

## Rescale Stick Pack Icon to 72px
- [x] Update Stick Pack icon from w-30 h-30 (120px) to w-18 h-18 (72px)
- [x] Test icon size in browser
- [x] Save checkpoint

## Replace Stick Pack Icon with 128x72px Version
- [x] Copy StickPack_128x72px.png to public/assets/
- [x] Rename to StickPack_128x128px.png (replace existing file)
- [x] Test icon display in browser
- [x] Save checkpoint

## Replace 12oz Can Icon with 111x128px Version
- [x] Copy 12oz_can_111x128px.png to public/assets/
- [x] Rename to 12oz_aluminumcan_128x128px.png (replace existing file)
- [x] Test icon display in browser
- [ ] Save checkpoint
