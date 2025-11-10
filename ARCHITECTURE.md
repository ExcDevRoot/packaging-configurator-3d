# Architecture Documentation

**3D Packaging Configurator - Technical Architecture and Design Patterns**

This document provides comprehensive technical documentation for the 3D Packaging Configurator application, covering component architecture, state management patterns, 3D rendering pipeline, and extension points for future development.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [3D Rendering Pipeline](#3d-rendering-pipeline)
6. [Label Generation System](#label-generation-system)
7. [Pop-out Viewer Architecture](#pop-out-viewer-architecture)
8. [Data Flow](#data-flow)
9. [Extension Points](#extension-points)
10. [Performance Optimizations](#performance-optimizations)

---

## System Overview

The 3D Packaging Configurator is a client-side single-page application that provides real-time 3D visualization and customization of product packaging. The application follows a component-based architecture built on React 19 with TypeScript for type safety and developer productivity.

### Architecture Principles

The system adheres to several core architectural principles that guide implementation decisions. **Separation of concerns** isolates UI components, business logic, and rendering concerns into distinct modules. **Reactive state management** ensures UI automatically updates when configuration changes occur. **Declarative rendering** leverages React's component model for predictable UI behavior. **Type safety** employs TypeScript throughout the codebase to catch errors at compile time rather than runtime.

### Application Layers

The application is structured in three primary layers. The **presentation layer** consists of React components that render UI elements and handle user interactions. The **state management layer** uses Zustand stores to maintain application state and provide actions for state mutations. The **rendering layer** utilizes Three.js for WebGL-based 3D visualization with React Three Fiber bindings for declarative scene composition.

---

## Technology Stack

### Core Framework

**React 19** serves as the foundational UI framework, providing component composition, hooks for state and lifecycle management, and efficient virtual DOM reconciliation. The application uses functional components exclusively with hooks rather than class-based components for cleaner code and better performance.

**TypeScript 5.x** adds static type checking across the entire codebase. Interface definitions for package configurations, label content, and store state ensure type safety when passing data between components. Discriminated unions model package types and camera presets, enabling exhaustive pattern matching and compile-time validation.

### Routing

**Wouter** provides lightweight client-side routing with a minimal API surface. The application defines routes for the main configurator page (`/`), pop-out viewer (`/viewer-popout`), and 404 fallback. Wouter's hook-based API integrates seamlessly with React components without introducing unnecessary complexity.

### State Management

**Zustand** manages global application state with a simple, unopinionated API. Unlike Redux, Zustand requires no boilerplate for actions, reducers, or middleware. The store is defined as a single object with state properties and mutation functions. Components subscribe to specific state slices using selectors, ensuring re-renders only occur when relevant state changes.

### 3D Rendering

**Three.js r170** powers the WebGL rendering engine. Three.js provides abstractions over raw WebGL for scene management, camera controls, lighting, materials, and geometry loading. The application uses PBR (Physically Based Rendering) materials with metalness and roughness properties for realistic material appearance under various lighting conditions.

**@react-three/fiber** wraps Three.js in React components, enabling declarative scene composition. Rather than imperatively creating and managing Three.js objects, the application declares scene structure using JSX. React Three Fiber handles object lifecycle, updates, and cleanup automatically.

**@react-three/drei** supplies pre-built helpers for common 3D patterns including orbit controls for camera manipulation, environment maps for realistic lighting, and geometry primitives. These utilities reduce boilerplate and accelerate development.

### UI Components

**shadcn/ui** provides accessible, customizable UI components built on Radix UI primitives. Components include buttons, toggles, sliders, dialogs, and form inputs. Unlike traditional component libraries, shadcn/ui components are copied into the project source, allowing full customization without library constraints.

**Tailwind CSS 4** enables utility-first styling with CSS variables for theming. The application defines design tokens (colors, spacing, typography) in CSS custom properties, which Tailwind utilities reference. This approach combines the productivity of utility classes with the flexibility of CSS variables for dynamic theming.

**Lucide React** supplies consistent iconography throughout the interface. Icons are imported as React components and styled using Tailwind classes. The icon set includes common UI patterns like external links, settings, eye toggles, and camera controls.

---

## Component Architecture

### Component Hierarchy

The application follows a hierarchical component structure with clear responsibilities at each level.

```
App.tsx (Root)
├── ThemeProvider (Context)
│   ├── TooltipProvider (Context)
│   │   ├── Toaster (Global notifications)
│   │   └── Router (Route management)
│   │       ├── Home (Main page)
│   │       │   ├── Package3DModelViewer
│   │       │   └── CustomizationPanel
│   │       │       ├── PackageTab
│   │       │       ├── MaterialTab
│   │       │       ├── LabelTab
│   │       │       └── AdvancedControls
│   │       ├── ViewerPopout (Pop-out page)
│   │       │   └── Package3DModelViewer
│   │       └── NotFound (404 page)
```

### Key Components

#### App.tsx

The root component establishes application-wide providers and routing configuration. **ThemeProvider** manages light/dark theme state and provides theme switching functionality. **TooltipProvider** enables tooltip behavior for UI elements. The **Router** component from Wouter defines route mappings and renders the appropriate page component based on the current URL.

#### Home.tsx

The main page component composes the 3D viewer and customization panel side-by-side. The layout uses CSS Grid for responsive positioning, with the 3D viewport occupying the majority of screen space and the customization panel in a fixed-width sidebar. The component does not manage state directly but serves as a composition layer for child components.

#### Package3DModelViewer.tsx

The core 3D rendering component manages the Three.js scene, camera, lighting, and model loading. This component subscribes to multiple Zustand store slices including `currentPackage`, `packageConfig`, `showWrapper`, and `cameraPreset`. When any subscribed state changes, the component re-renders and updates the 3D scene accordingly.

The component uses React Three Fiber's `<Canvas>` element to establish the WebGL rendering context. Inside the canvas, declarative components define scene structure:

- **PerspectiveCamera** with configurable position and field of view
- **OrbitControls** for mouse/touch-based camera manipulation
- **Lighting** including ambient light and directional lights for shadows
- **3D Models** loaded from OBJ files and rendered with PBR materials
- **Helper Objects** like reference surface plane and wrapper meshes

The component employs `useEffect` hooks to handle side effects like model loading, texture generation, and material updates. Cleanup functions dispose of Three.js resources when the component unmounts to prevent memory leaks.

#### CustomizationPanel.tsx

The primary user interface for package configuration provides tabbed navigation between Package, Material, and Label customization options. The component reads current configuration from the Zustand store and dispatches update actions when users interact with controls.

**Package Tab** allows selection of package type from the available options. Clicking a package button triggers the `setCurrentPackage` action, which updates the store and causes the 3D viewer to load the new model.

**Material Tab** provides sliders for adjusting metalness, roughness, and base color. As users drag sliders, the component dispatches `updatePackageConfig` actions with the new material values. The 3D viewer reactively applies these changes to the model's material properties.

**Label Tab** offers text inputs and file uploads for customizing label content. Users can modify product name, description, ingredients, volume, and logo image. The component validates inputs and updates the store, triggering label texture regeneration in the 3D viewer.

**Advanced Controls** section includes toggles for wrapper visibility, reference surface, and the pop-out viewer button. These controls modify view settings in the store rather than package configuration.

#### ViewerPopout.tsx

A specialized page component for the pop-out demo viewer that decodes package configuration from URL parameters and renders a full-screen 3D view without UI controls. The component executes the following sequence on mount:

1. Parse URL query parameters using `URLSearchParams`
2. Extract the base64-encoded configuration string
3. Decode the base64 string and parse as JSON
4. Apply the decoded configuration to the Zustand store
5. Set a ready flag after a brief delay to ensure state propagates
6. Render the Package3DModelViewer component with the applied configuration

The component includes backwards compatibility logic to handle both old URL formats (packageConfig only) and new formats (snapshot with view settings). This ensures existing pop-out URLs continue to function after system updates.

---

## State Management

### Zustand Store Structure

The application maintains a single Zustand store defined in `client/src/store/configStore.ts`. The store interface combines state properties and action functions in a unified object:

```typescript
interface ConfigState {
  // Current state
  currentPackage: PackageType;
  packageConfig: PackageConfig;
  showWrapper: boolean;
  showReferenceSurface: boolean;
  cameraPreset: CameraPreset;
  userPresets: UserPreset[];

  // Actions
  setCurrentPackage: (pkg: PackageType) => void;
  updatePackageConfig: (updates: Partial<PackageConfig>) => void;
  toggleWrapper: () => void;
  toggleReferenceSurface: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  applyTemplate: (config: PackageConfig) => void;
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}
```

### State Subscription Patterns

Components subscribe to specific state slices using selector functions to minimize unnecessary re-renders. For example, the Package3DModelViewer component subscribes to `currentPackage` and `packageConfig`:

```typescript
const currentPackage = useConfigStore((state) => state.currentPackage);
const packageConfig = useConfigStore((state) => state.packageConfig);
```

When either `currentPackage` or `packageConfig` changes, the component re-renders. Changes to other store properties like `userPresets` do not trigger re-renders, improving performance.

### State Mutations

All state mutations occur through action functions defined in the store. This pattern ensures state changes are predictable and traceable. For example, updating material properties:

```typescript
updatePackageConfig: (updates) => set((state) => ({
  packageConfig: { ...state.packageConfig, ...updates }
}))
```

The `set` function provided by Zustand merges the updates into the current state immutably, triggering subscribed components to re-render with the new state.

---

## 3D Rendering Pipeline

### Scene Initialization

When the Package3DModelViewer component mounts, it initializes the Three.js scene through React Three Fiber's `<Canvas>` component. The canvas establishes a WebGL rendering context and begins the render loop at 60 FPS (or the display's refresh rate).

The scene includes several standard elements. **PerspectiveCamera** provides the viewpoint with a 50-degree field of view and near/far clipping planes. **OrbitControls** enable user interaction with the camera through mouse drag (rotation), scroll (zoom), and right-click drag (pan). **Ambient light** provides base illumination to prevent completely black shadows. **Directional lights** simulate sunlight with shadows enabled for depth perception.

### Model Loading

Package models are stored as OBJ files in `client/public/models/`. When the user selects a package type, the component loads the corresponding OBJ file using Three.js's `OBJLoader`. The loading process is asynchronous:

1. Create a new `OBJLoader` instance
2. Call `loader.load()` with the model file path
3. Wait for the model to load (typically 100-500ms depending on file size)
4. Traverse the loaded object to find mesh geometries
5. Apply materials and textures to the meshes
6. Add the model to the scene

The component caches loaded models to avoid redundant loading when switching between package types. When a model is already cached, it is reused immediately without network requests.

### Material Application

Package models use PBR (Physically Based Rendering) materials for realistic appearance. The `MeshStandardMaterial` class in Three.js implements PBR with properties for base color, metalness, roughness, and normal maps.

Material properties are read from the Zustand store and applied to the model's material:

```typescript
material.color.set(packageConfig.baseColor);
material.metalness = packageConfig.metalness;
material.roughness = packageConfig.roughness;
```

When users adjust material sliders in the UI, the store updates and the component reactively applies the new values to the material. Three.js automatically re-renders the scene with the updated material properties.

### Texture Mapping

Label textures are dynamically generated on an HTML canvas and applied to the package model as a texture map. The texture generation process occurs in `client/src/utils/labelTextureGenerator.ts`:

1. Create a 2048x2048 canvas element
2. Draw background color fill
3. Load and draw logo image if provided
4. Render text content (product name, description, ingredients, volume)
5. Apply text styles (font, size, color, alignment)
6. Convert canvas to Three.js texture
7. Apply texture to model's material

The texture is cached and only regenerated when label content changes. This optimization prevents unnecessary canvas operations on every render.

### UV Mapping

UV mapping defines how 2D textures are projected onto 3D geometry. Different package types require different UV mapping strategies. Cylindrical packages like cans and bottles use cylindrical UV mapping implemented in `client/src/utils/cylindricalUVMapping.ts`. This mapping wraps the texture around the cylinder seamlessly.

Flat packages like stick packs use planar UV mapping, projecting the texture onto a flat surface. The UV mapping logic examines the package geometry and applies the appropriate mapping strategy automatically.

---

## Label Generation System

### Canvas-Based Texture Generation

The label generation system creates dynamic textures using the HTML Canvas API. This approach provides flexibility to render arbitrary graphics, text, and images without requiring pre-rendered texture files.

The `generateLabelTexture` function in `labelTextureGenerator.ts` accepts label content and style parameters, then executes a series of canvas drawing operations:

```typescript
function generateLabelTexture(content: LabelContent, styles: TextStyles): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Draw background
  ctx.fillStyle = content.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw logo
  if (content.logoUrl) {
    const img = new Image();
    img.src = content.logoUrl;
    ctx.drawImage(img, ...);
  }

  // Draw text
  ctx.fillStyle = styles.textColor;
  ctx.font = `${styles.fontSize}px ${styles.fontFamily}`;
  ctx.fillText(content.productName, ...);

  // Convert to Three.js texture
  const texture = new CanvasTexture(canvas);
  return texture;
}
```

### Text Rendering

Text rendering on canvas requires careful handling of font loading, line wrapping, and alignment. The system uses the Canvas 2D context's `fillText` method to render text at specified coordinates. Multi-line text is split into individual lines and rendered with appropriate vertical spacing.

Font families are loaded from Google Fonts via a `<link>` tag in the HTML head. The canvas context waits for fonts to load before rendering text to ensure correct appearance.

### Image Handling

Logo images are loaded from URLs (either data URLs for uploaded files or public asset paths). The system creates an `Image` object, sets the `src` property, and waits for the `onload` event before drawing the image to the canvas. This asynchronous loading ensures images are fully loaded before texture generation completes.

Images are scaled and positioned based on label transform properties (offset and scale) defined in the package configuration. This allows users to adjust logo placement and size independently for each package type.

---

## Pop-out Viewer Architecture

### URL-Based State Transfer

The pop-out viewer uses URL parameters to transfer package configuration from the parent window to the pop-out window. This approach avoids complex window communication mechanisms and works reliably across browsers.

When the user clicks the "Pop-out 3D Viewer" button, the application serializes the current configuration to JSON, encodes it as base64, and appends it to the URL as a query parameter:

```typescript
const snapshot = {
  packageConfig,
  showWrapper,
  showReferenceSurface,
};
const configJson = JSON.stringify(snapshot);
const configBase64 = btoa(configJson);
const url = `/viewer-popout?config=${configBase64}`;
window.open(url, '_blank', 'width=1200,height=800');
```

The pop-out window decodes the configuration from the URL and applies it to its own Zustand store instance:

```typescript
const searchParams = new URLSearchParams(window.location.search);
const configParam = searchParams.get('config');
const snapshot = JSON.parse(atob(configParam!));
useConfigStore.setState({
  currentPackage: snapshot.packageConfig.type,
  packageConfig: snapshot.packageConfig,
  showWrapper: snapshot.showWrapper,
});
```

### Window Independence

Each pop-out window maintains its own React application instance and Zustand store. This isolation ensures pop-outs are completely independent of the parent window. Users can open multiple pop-outs with different configurations for side-by-side comparison.

Camera controls in each pop-out are independent, allowing users to view the same package from different angles in multiple windows simultaneously. This capability is particularly useful for presentations where the presenter wants to show multiple views of a package without switching camera angles in a single viewport.

---

## Data Flow

### User Interaction Flow

The typical user interaction follows this data flow:

1. **User Action**: User interacts with a UI control (e.g., adjusts metalness slider)
2. **Event Handler**: Component's event handler function is called
3. **Store Update**: Event handler dispatches an action to the Zustand store
4. **State Change**: Store updates state immutably and notifies subscribers
5. **Component Re-render**: Subscribed components re-render with new state
6. **3D Scene Update**: Package3DModelViewer applies new material properties to the model
7. **Visual Feedback**: Three.js renders the updated scene to the canvas

This unidirectional data flow ensures predictable state management and makes debugging easier by providing a clear audit trail of state changes.

### Configuration Persistence

The application currently stores configuration in memory only. When the page refreshes, all customizations are lost. Future enhancements could add persistence through:

- **LocalStorage**: Save configuration to browser local storage for session persistence
- **URL State**: Encode configuration in URL hash for shareable links
- **Backend API**: Save configurations to a database for cross-device access

---

## Extension Points

### Adding New Package Types

To add a new package type, implement the following steps:

1. **Define Package Type**: Add a new identifier to the `PackageType` union in `configStore.ts`
2. **Create 3D Model**: Export the package geometry as an OBJ file and place in `public/models/`
3. **Configure Defaults**: Add default configuration to `packageConfigs.ts` with material properties and label transforms
4. **Set Camera Defaults**: Define camera position and zoom limits in `cameraConfigs.ts`
5. **Update UI**: Add the new package type to the selection UI in `CustomizationPanel.tsx`

### Custom Material Properties

The material system can be extended to support additional properties like:

- **Transparency**: Add an `opacity` property to `PackageConfig` and apply to material
- **Emissive Color**: Support glowing effects for special materials
- **Normal Maps**: Add texture-based surface detail without additional geometry
- **Environment Maps**: Reflect surrounding environment for realistic glass and metal

### Label Customization

The label generation system can be enhanced with:

- **Custom Fonts**: Allow users to upload custom font files
- **Gradient Backgrounds**: Support linear and radial gradients instead of solid colors
- **Multiple Logos**: Place multiple logo images at different positions
- **QR Codes**: Generate and embed QR codes in labels
- **Barcode Generation**: Add product barcodes to labels

---

## Performance Optimizations

### Render Optimization

The application employs several strategies to maintain 60 FPS rendering:

- **Geometry Instancing**: Reuse mesh geometry across multiple render frames
- **Texture Caching**: Avoid regenerating textures when content hasn't changed
- **Frustum Culling**: Three.js automatically skips rendering objects outside camera view
- **Level of Detail**: Future enhancement to use lower-poly models when zoomed out

### React Optimization

React components use optimization techniques to minimize re-renders:

- **Selective Subscriptions**: Components subscribe only to required state slices
- **Memoization**: Use `React.memo` and `useMemo` for expensive computations
- **Callback Stability**: Use `useCallback` to prevent function recreation on every render

### Asset Loading

Assets are loaded efficiently to reduce initial page load time:

- **Lazy Loading**: Load 3D models only when package type is selected
- **Code Splitting**: Vite automatically splits code into smaller chunks
- **Asset Optimization**: Images and models are compressed for smaller file sizes

---

## Security Considerations

### Input Validation

All user inputs are validated before being applied to the configuration. Text inputs are sanitized to prevent XSS attacks. File uploads are restricted to image formats (PNG, JPEG, SVG) with size limits to prevent abuse.

### Content Security Policy

The application should be deployed with appropriate Content Security Policy headers to mitigate XSS and injection attacks. Recommended CSP directives include restricting script sources to self and trusted CDNs, limiting style sources, and controlling image sources.

---

## Testing Strategy

### Unit Testing

Critical utility functions should be covered by unit tests:

- Label texture generation
- UV mapping calculations
- Configuration validation
- State management actions

### Integration Testing

Integration tests verify component interactions:

- UI controls update Zustand store correctly
- Store changes trigger 3D scene updates
- Pop-out viewer decodes URL parameters correctly

### Visual Regression Testing

Visual regression tests capture screenshots of the 3D viewport and compare against baseline images to detect unintended visual changes.

---

## Future Enhancements

### Planned Features

- **Animation System**: Animate package rotation and camera movements
- **AR Preview**: View packages in augmented reality using WebXR
- **Batch Export**: Generate multiple package variations automatically
- **Collaboration**: Share configurations with team members in real-time
- **Version History**: Track and revert configuration changes

### Technical Improvements

- **WebGL 2.0**: Leverage advanced rendering features
- **Web Workers**: Offload heavy computations to background threads
- **Progressive Web App**: Enable offline functionality and installation
- **Accessibility**: Improve keyboard navigation and screen reader support

---

## Conclusion

The 3D Packaging Configurator demonstrates modern web application architecture with clean separation of concerns, reactive state management, and performant 3D rendering. The codebase is structured for maintainability and extensibility, with clear patterns for adding new features and package types.

For questions or clarifications about the architecture, consult the inline code comments or reach out to the development team.

---

**Maintained by the Development Team**
