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


## Fix "require is not defined" Error in Home.tsx
- [x] Locate the require() usage in handleSavePreset function (line 53)
- [x] Replace require() with ES6 import or alternative approach
- [x] Test preset save functionality
- [x] Verify error is resolved


## Reset 3D View Camera When Loading Preset
- [ ] Investigate how presets are loaded in Pr## Reset 3D View Camera on Preset Load
- [x] Add camera reset method to Package3DModelViewer component
- [x] Trigger camera reset when preset is applied
- [x] Test preset loading with camera reset functionality

## Save and Restore Camera State with Presets
- [x] Add cameraState property to UserPreset interface (position, target, zoom)
- [x] Update savePreset to capture current camera state from Package3DModelViewer
- [x] Add getCameraState method to Package3DModelViewer using useImperativeHandle
- [x] Update loadPreset to restore camera state instead of resetting to default
- [x] Add setCameraState method to Package3DModelViewer
- [x] Test: Zoom to max, save preset, zoom out, rotate, load preset → should restore max zoom
- [x] Verify camera state persists across page reloads


## Fix Customize Sidebar Positioning During Browser Resize
- [x] Investigate current sidebar positioning implementation in Home.tsx
- [x] Identify why sidebar gets left behind when browser resizes
- [x] Analyze CSS positioning (fixed vs absolute vs sticky)
- [x] Propose solution approach to user for approval
- [x] Implement approved fix for sidebar positioning
- [x] Test sidebar behavior with browser resize (wider then narrower)
- [x] Verify sidebar stays aligned with right edge of viewport


## Add Backside Element to Label Controls
- [x] Investigate current Label tab controls structure in CustomizationPanel
- [x] Analyze existing LabelContent and LabelTransform data structures
- [x] Design backside element data structure (type: 'image' | 'text', content, position, scale)
- [x] Propose UI layout for backside controls (toggle, upload/text input, position, scale)
- [x] Get user approval on proposed implementation approach
- [x] Implement backside data structure in configStore
- [x] Implement backside UI controls in Label tab
- [x] Add toggle between image upload and text entry
- [x] Add image upload functionality for backside
- [x] Add text input with 512 character limit for backside
- [x] Add position controls (offsetX, offsetY) for backside
- [x] Add scale control for backside
- [x] Test backside controls functionality


## Render Backside Element on 3D Model
- [x] Investigate current label texture generation (labelTextureGenerator.ts)
- [x] Investigate how textures are applied to 3D models (Package3DModelViewer.tsx)
- [x] Analyze canvas-based texture generation approach
- [x] Propose rendering strategy for backside element (image vs text)
- [x] Get user approval on rendering approach
- [x] Implement backside image rendering on texture canvas
- [x] Implement backside text rendering on texture canvas
- [x] Apply position and scale transforms for backside element
- [x] Test backside rendering in 3D view with both image and text
- [x] Verify backside element positioning relative to logo and text group


## Fix Backside Transform Undefined Error
- [x] Add fallback default for labelTransform.backside in labelTextureGenerator
- [x] Test with existing presets that don't have backside property
- [x] Verify error is resolved


## Change Backside Element Initial Size to 100×100px
- [x] Update placeholder size from 256px to 100px in labelTextureGenerator
- [x] Update image size from 256px to 100px in labelTextureGenerator
- [x] Test backside element rendering with new size
- [x] Test position and scale controls


## Fix Backside Element Position & Scale Controls Not Updating 3D View
- [x] Investigate why backside controls don't trigger texture regeneration
- [x] Compare with working logo/text group control implementation
- [x] Identify missing state update or re-render trigger
- [x] Propose fix approach to user for approval
- [x] Implement approved fix
- [x] Test real-time updates with backside position/scale sliders


## Implement Camera Angle Presets (Front, Back, Side)
- [x] Investigate current camera angle button implementation in Home.tsx
- [x] Analyze how setCameraState works from preset save/restore
- [x] Propose camera position/target/zoom values for front, back, side angles
- [x] Get user approval on proposed camera angles
- [x] Implement camera angle preset functionality
- [x] Test all three camera angle buttons (front, back, side)
- [x] Verify angle button highlights current view correctly


## Initialize Backside Element Position 50px Left as Default
- [x] Clarify if offsetX should be -50 in store or adjusted in rendering
- [x] Update backside element default offsetX position
- [x] Ensure control slider shows "center" (0%) at the -50px position
- [x] Test backside element renders at new default position (-50px left)


## Adjust Backside Element Position Another 100px Left
- [x] Update backside position offset from -50 to -150 in labelTextureGenerator
- [x] Test backside element renders at new position (-150px left)


## Fix Backside Element Position & Scale Controls Not Updating 3D View
- [x] Investigate why backside controls don't trigger real-time texture regeneration
- [x] Compare backside control implementation with working logo/text group controls
- [x] Fix reactivity issue to enable real-time updates
- [x] Test backside position and scale sliders with 3D view updates

## Adjust Preset Camera Angles
- [x] Update Front camera to (0, 30, 60)
- [x] Update Back camera to (0, 30, -60)
- [x] Update Side camera to (60, 30, 0)
- [x] Update Angle camera to (30, 30, 30)
- [x] Test all camera presets in browser

## Adjust Camera Presets to Closer Positions (Round 2)
- [x] Update Front camera to (0, 5, 20)
- [x] Update Back camera to (0, 5, -20)
- [x] Update Side camera to (20, 5, 0)
- [x] Update Angle camera to (10, 10, 10)
- [x] Test all camera presets in browser

## Fix Backside Element Control Reactivity (Retest)
- [x] Test backside position slider with real-time 3D view updates - FAILED: No real-time update
- [ ] Test backside scale slider with real-time 3D view updates - SKIPPED: position test failed
- [x] Investigate why previous fix didn't work
- [x] Identify actual root cause of reactivity failure - Zustand selector issue
- [x] Implement correct fix - Use Zustand selectors instead of destructuring
- [x] Add type assertions to force TypeScript to accept backside property
- [ ] Verify fix with comprehensive testing

## Debug Backside Controls with Console Logging
- [x] Add console.log to BacksideElementControls slider onChange handlers
- [x] Add console.log to configStore setLabelTransform action
- [x] Add console.log to Package3DModelViewer useEffect when packageConfig changes
- [x] Add console.log to labelTextureGenerator when backside transform is applied
- [x] Test backside slider and analyze console output to find where data flow breaks
- [x] Identify root cause based on logging - Slider onValueChange NOT firing at all
- [x] Implement proper fix - Added missing useConfigStore import to BacksideElementControls
- [x] Remove debug logging after fix is verified

## Fix Backside offsetX Being Lost in applyViewOffsets
- [x] Investigate applyViewOffsets function to see why backside.offsetX becomes 0
- [x] Check if backside element is handled differently than logo/textGroup - backside is MISSING from return value!
- [x] Fix applyViewOffsets to preserve backside.offsetX
- [x] Test that backside element moves horizontally on 3D view - WORKING!

## Get Camera POV Feature
- [x] Add "Get Camera POV" button in View Controls section
- [x] Expose getCameraState method from Package3DModelViewer
- [x] Display current camera position (x, y, z) values
- [x] Display current camera target (x, y, z) values
- [x] Display current zoom value
- [x] Test feature with different camera angles and zoom levels
- [x] Verify display updates when button is clicked

## Update Camera Preset Coordinates
- [x] Update Front preset: Position (8.61, 2.54, 52.28), Target (-4.03, -1.39, 0.50)
- [x] Update Back preset: Position (46.57, 1.08, -23.50), Target (5.45, 0.40, 4.94)
- [x] Update Side preset: Position (49.92, 0.62, 25.00), Target (2.57, -0.06, 8.93)
- [x] Update Angle preset: Position (33.24, 20.92, 56.92), Target (-5.65, -9.82, 15.46)
- [x] Test all four camera presets to verify correct positioning
- [x] Verify camera targets are off-center as intended

## Update Backside Element Initial Position
- [x] Update defaultLabelTransform backside offsetX to -14 (renders at -437px from canvas center)
- [x] Update defaultLabelTransform backside offsetY to 7 (renders at +72px from baseline vertical)
- [x] Test backside element appears at correct initial position in 3D view
- [x] Verify backside position sliders start at -14% horizontal and +7% vertical

## Fix Template Loading Error - Backside Property Migration
- [x] Add migration logic to applyTemplate function to add backside property if missing
- [x] Add migration logic to loadPreset function to add backside property if missing
- [x] Use default backside values: offsetX: -14, offsetY: 7, scale: 1.0
- [x] Test loading old templates (Bolt Energy, Thunder) without errors
- [x] Test loading user presets created before backside feature
- [x] Verify backside element appears correctly after template/preset load

## Implement UV Exclusion Zones (Proper Solution)
- [x] Define safe zone constants in labelTextureGenerator.ts (top: 10%, bottom: 10%)
- [x] Modify background rendering to fill ONLY safe zone area (leave top/bottom transparent)
- [x] Add canvas clipping region for safe zone boundaries
- [x] Adjust logo positioning to be within safe zone
- [x] Adjust text group positioning to be within safe zone
- [x] Adjust backside element positioning to be within safe zone
- [x] Verify UV mapping uses standard 0-1 range (no compression)
- [x] Test with extreme vertical positions to verify cropping behavior
- [x] Verify metallic rim bands visible at top and bottom
- [x] Verify no black bands, seams, or artifacts

## Fix Black Bands and Vertical Seam Artifacts (Despite Safe Zone Implementation)
- [x] Investigate black bands at top/bottom edges in browser
- [x] Investigate vertical seam stripe artifact location and cause
- [x] Check if artifacts are from texture generation or UV mapping
- [x] Check if artifacts are from mesh geometry or material settings
- [x] Identify root cause of black bands - Linear texture filtering blending transparent pixels
- [x] Identify root cause of vertical seam - Transparent gaps between front/back elements
- [x] Implement fix for black bands - Fill entire canvas with background color
- [x] Implement fix for vertical seam - Full canvas background eliminates gaps
- [x] Implement alpha gradient transparency for rim visibility (5% top/bottom)
- [x] Test solution across all camera angles (front, side, back)
- [x] Verify no artifacts remain - Clean transitions, no seams, rims visible

## Fix Safe Zone Clipping Region Not Cropping Elements
- [x] Investigate why clipping region isn't preventing element wrapping
- [x] Check if ctx.save() and clipping region are properly scoped
- [x] Verify clipping region is active when drawing logo, text, and backside elements
- [x] Check if ctx.restore() is being called too early
- [x] Fix offset calculations to use safe zone height instead of full canvas height
- [x] Test that logo stays within safe zone boundaries
- [x] Test that text group stays within safe zone boundaries
- [x] Test that backside element stays within safe zone boundaries
- [x] Verify elements don't wrap onto top/bottom surfaces

## Fix Logo Wrapping Onto Top Surface
- [x] Investigate why logo extends beyond safe zone boundary onto top surface - UV distortion at curved edges
- [x] Check if clipping region needs tighter margins - Yes, 5% too close to curved geometry
- [x] Check if logo positioning calculation allows it to exceed boundary - Positioning OK, margin issue
- [x] Implement fix to ensure logo crops at safe zone top edge - Increased safety margin to 7%
- [x] Test with default logo position - Logo no longer wraps onto top surface
- [ ] Test with extreme vertical offsets
- [ ] Verify no wrapping onto top or bottom surfaces

## Integrate New Package Type 3D Models
- [x] Examine stick pack OBJ file structure and mesh names - blank_mockup
- [x] Examine 2oz bottle OBJ file structure - Plastic_Square_Bottle_2oz, Plastic_Cap_2oz
- [x] Examine 750ml bottle OBJ file - Multiple bottles, chose Gallo_Chard
- [x] Copy coffee_stick.obj and coffee_stick.mtl to client/public/models/
- [x] Copy bottle_2oz.obj and bottle_2oz.mtl to client/public/models/
- [x] Copy bottle_750ml.obj to client/public/models/
- [x] Update model paths in Package3DModelViewer.tsx
- [x] Add mesh identification logic for different package types
- [ ] Debug why models aren't loading (no console output, blank 3D view)
- [ ] Fix 3D viewer component re-rendering on package type change
- [ ] Test each model loads correctly
- [ ] Apply appropriate UV mapping for each package geometry
- [ ] Test label texture rendering on each package type
- [ ] Verify safe zone cropping works on each geometry
- [ ] Adjust camera positions/zoom for each package type
- [ ] Test with different templates on each package
- [ ] Save checkpoint with all package types working

## Fix Model Switching Bug in 3D Viewer
- [ ] Analyze useEffect hook structure and cleanup function
- [ ] Check if scene/renderer are being properly disposed on package change
- [ ] Verify currentPackage dependency triggers re-render
- [ ] Check if getModelPaths() is being called with updated currentPackage
- [ ] Identify why console.log statements aren't appearing
- [ ] Implement proper cleanup and re-initialization on package change
- [ ] Test switching between all package types
- [ ] Verify each model loads and displays correctly

## Per-Package Camera Configurations
- [x] Create cameraConfigs.ts utility file with camera settings for all 4 packages
- [x] Define initial camera position for each package type
- [x] Define front preset camera position for each package type
- [x] Define back preset camera position for each package type
- [x] Define side preset camera position for each package type
- [x] Define angle preset camera position for each package type
- [x] Update Package3DModelViewer to use package-specific initial position on load
- [x] Implement applyCameraPreset function to apply preset positions
- [x] Add useEffect to watch cameraPreset changes and update camera
- [x] Test initial camera position for 12oz can - Working
- [x] Test initial camera position for 2oz bottle - Working
- [x] Test camera presets for 12oz can (front, side tested) - Working
- [x] Test camera presets for 2oz bottle (front tested) - Working
- [ ] Fine-tune positions for optimal viewing angles if needed
- [ ] Save checkpoint with working per-package camera system

## Update Camera Configurations with User-Provided Values
- [ ] Update 12oz can camera positions (initial, front, back, side, angle)
- [ ] Update 2oz bottle camera positions (initial, front, back, side, angle)
- [ ] Update stick pack camera positions (initial, front, back, side, angle)
- [ ] Update 750ml bottle camera positions (initial, front, back, side, angle)
- [ ] Test all presets for 12oz can
- [ ] Test all presets for 2oz bottle
- [ ] Test all presets for stick pack
- [ ] Test all presets for 750ml bottle
- [ ] Save checkpoint with updated camera configurations

## Stick Pack DecalGeometry Label System
- [x] Restore PBR base textures for stick pack
- [x] Remove OrbitControls rotation limits for unlimited rotation
- [x] Import DecalGeometry from Three.js
- [x] Implement DecalGeometry-based label placement (independent of UV mapping)
- [x] Create separate FRONT and BACK label textures
- [x] Position decals on opposite flat faces using 3D coordinates
- [ ] Test and adjust decal positioning for correct face orientation
- [ ] Integrate decal labels with user customization (logo, text, colors)
- [ ] Save checkpoint with DecalGeometry implementation

## Phase 2: Bottle Wrapper Implementation

### Analysis & Planning
- [ ] Analyze bottle-2oz model structure
- [ ] Analyze pkgtype5 (1L Bottle) model structure
- [ ] Analyze bottle-750ml model (currently using wrong file)
- [ ] Determine wrapper zones for each bottle type

### bottle-2oz (2oz Shot)
- [x] Implement cylindrical UV mapping for bottle body
- [x] Generate label texture with canvas
- [x] Apply texture to bottle mesh
- [x] Add wrapper toggle support

### pkgtype5 (1L Bottle)
- [ ] Implement cylindrical UV mapping for bottle body
- [ ] Generate label texture with canvas
- [ ] Apply texture to bottle mesh
- [ ] Add wrapper toggle support

### bottle-750ml (750ml Bottle)
- [ ] Fix model file path (currently using can_12oz.obj)
- [ ] Implement cylindrical UV mapping for bottle body
- [ ] Generate label texture with canvas
- [ ] Apply texture to bottle mesh
- [ ] Add wrapper toggle support

### Testing & Validation
- [ ] Test wrapper visibility toggle for all bottles
- [ ] Verify label content updates dynamically
- [ ] Test camera angles and material customization
- [ ] Verify no memory leaks on package switching

### pkgtype7 (Gummies Mylar Bag)
- [x] Analyze mylar bag model structure
- [x] Implement planar UV mapping for front/back faces
- [x] Generate label texture with canvas
- [x] Apply texture to bag faces
- [x] Add wrapper toggle support

### pkgtype8 (Gummies Glass Jar)
- [x] Analyze glass jar model structure
- [x] Implement cylindrical UV mapping for jar body
- [x] Generate label texture with canvas
- [x] Apply texture to jar mesh
- [x] Add wrapper toggle support
- [x] Configure semi-transparent glass material

## pkgtype7 PBR Texture Implementation (Wrapper OFF State)
- [x] Update MTL file to reference renamed pkgtype7 texture files
- [x] Implement PBR texture loading when showWrapper is false
- [x] Implement texture switching between PBR and label textures
- [x] Test wrapper toggle to verify PBR textures load correctly
- [x] Verify realistic mylar bag appearance matches icon

## pkgtype7 Silver Metallic Appearance

- [x] Update pkgtype7 PBR material to skip BaseColor map and use silver color (0xC0C0C0)
- [x] Test wrapper OFF state shows silver metallic mylar appearance
- [x] Verify no black flash or overlay appears during loading

## Diagnostic: pkgtype7 White Surface Issue

- [x] Add console logging to track currentPackage value in wrapper OFF path
- [x] Add console logging to identify which code branch executes
- [x] Identify root cause: stale currentPackage value in useEffect closure
- [x] Add currentPackage to useEffect dependency array
- [x] Remove diagnostic console logging
- [x] Save checkpoint before implementing fix
- [x] Add child.userData.isCanBody = true to pkgtype7 wrapper OFF path
- [x] Test pkgtype7 wrapper OFF shows silver metallic
- [x] Test wrapper toggle stability
- [x] Test material controls don't cause white overlay

## pkgtype7 White Overlay Issue - Deep Investigation

- [x] Search for all useEffects that might update materials after initial load
- [x] Check if there are multiple useEffects with overlapping dependencies
- [x] Verify the execution order of useEffects
- [x] Test with wrapper OFF from initial load vs toggling after load
- [x] Investigate 2.5 second delay - likely async texture loading callback
- [x] Check if texture loading completion triggers material color reset
- [x] Add onLoad callbacks to texture loading to prevent color override
- [x] Identify the exact code line that applies the white color after delay
- [x] Verified fix works - silver metallic persists after 3+ seconds with no white overlay

## pkgtype7 Still Shows White - Further Investigation

- [x] Check if pkgtype7 condition is being evaluated correctly in wrapper OFF path
- [x] Verify currentPackage value matches 'pkgtype7' string exactly
- [x] Identified issue: hardcoded metalness/roughness values not responding to sliders
- [x] Implemented Option 1: Use packageConfig.metalness and packageConfig.roughness
- [ ] Test material controls affect silver metallic appearance
- [ ] Verify silver color persists and is visible against background

## pkgtype7 Hardcoded Dark Gray Color Fix

- [x] Remove onLoad callbacks that were re-applying color
- [x] Simplify pkgtype7 wrapper OFF code
- [x] Change color from silver (0xC0C0C0) to dark gray (#6d6969)
- [x] Implemented hardcoded dark gray color for pkgtype7 wrapper OFF
- [x] Simplified code by removing onLoad callbacks

## Custom Initial Label Positions for Package Types

- [x] Update bottle-2oz (pkgtype2) label positions in defaultPackageLabelTransforms
  - Logo: H:-2%, V:10%, S:0.90x
  - Text Group: H:-2%, V:0%, S:0.80x
  - Backside: H:-18%, V:22%, S:0.95x
- [x] Update pkgtype7 label positions in defaultPackageLabelTransforms
  - Logo: H:-15%, V:37%, S:0.75x
  - Text Group: H:-14%, V:17%, S:0.75x
  - Backside: H:-19%, V:32%, S:0.90x
- [ ] Save checkpoint with custom initial positions

## PkgType5 (1L Bottle) Integration
- [x] Copy 1L bottle model files (OBJ, MTL, textures) to assets/models/
- [x] Add pkgtype5 camera configuration to cameraConfigs.ts
- [x] Add pkgtype5 material handling logic to Package3DModelViewer
- [x] Implement wrapper toggle functionality for pkgtype5
- [x] Set up initial label transforms for pkgtype5
- [x] Test model loading and rendering
- [x] Test wrapper ON/OFF functionality
- [x] Fine-tune camera presets based on user feedback
- [x] Create checkpoint once pkgtype5 is fully functional

## Phase 1: PkgType5 Wrapper Visibility Testing
- [ ] Open configurator and select 1L Bottle package
- [ ] Test wrapper toggle ON state - verify label/texture visible
- [ ] Test wrapper toggle OFF state - verify clear glass visible
- [ ] Check if all three mesh components respond to toggle
- [ ] Document any visibility issues found
- [ ] Verify material properties are applying correctly

## PkgType5 Orientation Fix
- [x] Remove incorrect -90° X-rotation (change to 0)
- [ ] Test bottle stands upright in all camera views
- [ ] Verify wrapper ON/OFF toggle works correctly
- [ ] Adjust camera positions if needed
- [ ] Create checkpoint after orientation fix
