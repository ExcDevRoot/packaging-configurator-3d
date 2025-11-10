# 3D Packaging Configurator

**Professional 3D Visualization Tool for Package Design and Customization**

A web-based 3D configurator built with React 19, Three.js, and Tailwind CSS that enables real-time visualization and customization of product packaging across multiple package types including bottles, cans, stick packs, and specialty containers.

---

## Features

### Core Capabilities

The 3D Packaging Configurator provides comprehensive package design and visualization capabilities through an intuitive web interface. Users can select from eight different package types, customize materials with adjustable metalness and roughness properties, and modify label content including product names, descriptions, ingredients, and volume information. The system supports dynamic logo placement and backside customization with both image and text content options.

Advanced visualization features include real-time 3D rendering powered by Three.js WebGL, independent camera controls with preset angles (front, back, side, angle), and adjustable label element positioning with offset and scale controls. The wrapper visibility toggle allows users to view packages with or without protective sleeves, while the reference surface display aids in spatial understanding during the design process.

### Developer Demo Mode

The pop-out 3D viewer feature enables developers to open package configurations in separate browser windows for demonstration and comparison purposes. Each pop-out captures a snapshot of the current configuration including package type, materials, labels, wrapper state, and reference surface visibility. Multiple pop-outs can be opened simultaneously to facilitate side-by-side comparisons, with each maintaining independent camera controls and viewing angles.

### Package Types

The configurator supports eight distinct package formats. The **12oz or 16oz Can** (can-12oz) provides standard aluminum beverage can visualization with cylindrical UV mapping for label application. The **2oz Shot** (bottle-2oz) represents small glass bottles suitable for energy shots or sample products. The **Stick Pack** (stick-pack) offers single-serve pouch visualization commonly used for powdered supplements or instant beverages. The **750ml Bottle** (bottle-750ml) displays standard wine or spirits bottle formats with glass material properties.

Specialty formats include **pkgtype5** for alternative bottle designs, **pkgtype6** for custom container shapes, **Gummies Mylar Bag** (pkgtype7) for flexible packaging visualization, and **Gummies Glass Jar** (pkgtype8) for rigid container applications.

---

## Technology Stack

### Frontend Framework

The application is built on **React 19** with TypeScript for type-safe component development. **Wouter** provides lightweight client-side routing without the overhead of React Router. **Zustand** manages global state with minimal boilerplate and excellent TypeScript integration.

### 3D Rendering

**Three.js r170** powers the WebGL-based 3D rendering engine with support for PBR (Physically Based Rendering) materials. **@react-three/fiber** provides React bindings for declarative Three.js scene composition. **@react-three/drei** supplies pre-built helpers for cameras, controls, and common 3D patterns.

### UI Components

**shadcn/ui** delivers accessible, customizable components built on Radix UI primitives. **Tailwind CSS 4** enables utility-first styling with CSS variables for theming. **Lucide React** provides consistent iconography throughout the interface.

### Build Tooling

**Vite 6** offers lightning-fast development server with hot module replacement and optimized production builds. **pnpm** manages dependencies with efficient disk space usage through content-addressable storage.

---

## Project Structure

```
packaging-configurator-3d/
├── client/                    # Frontend application
│   ├── public/               # Static assets
│   │   ├── assets/          # Images, logos, textures
│   │   └── models/          # 3D model files (.obj)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── CustomizationPanel.tsx
│   │   │   ├── Package3DModelViewer.tsx
│   │   │   └── ...
│   │   ├── config/         # Configuration files
│   │   │   ├── cameraConfigs.ts
│   │   │   ├── packageConfigs.ts
│   │   │   └── templates.ts
│   │   ├── contexts/       # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── ViewerPopout.tsx
│   │   │   └── NotFound.tsx
│   │   ├── store/          # Zustand stores
│   │   │   └── configStore.ts
│   │   ├── utils/          # Helper utilities
│   │   │   ├── labelTextureGenerator.ts
│   │   │   ├── cylindricalUVMapping.ts
│   │   │   └── ...
│   │   ├── App.tsx         # Root component with routing
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles and theme
│   ├── index.html          # HTML template
│   ├── package.json        # Dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite build configuration
│   └── tailwind.config.ts  # Tailwind CSS configuration
├── shared/                  # Shared types and constants
│   └── const.ts
├── DEPLOYMENT.md           # Deployment guides
├── ARCHITECTURE.md         # Architecture documentation
├── Dockerfile              # Docker configuration (optional)
└── README.md               # This file
```

---

## Getting Started

### Prerequisites

Before setting up the project, ensure your development environment meets the following requirements. **Node.js 22.x or later** is required for modern JavaScript features and optimal performance. **pnpm 9.x or later** serves as the package manager, offering faster installs and better disk space efficiency compared to npm or yarn. A **modern web browser** with WebGL 2.0 support is essential for 3D rendering, with Chrome, Edge, Firefox, and Safari all providing compatible implementations.

### Installation

Clone the repository or extract the downloaded source code ZIP file to your local development machine. Navigate to the project root directory in your terminal.

Install all project dependencies using pnpm. This command reads the `pnpm-lock.yaml` file to ensure consistent dependency versions across all development environments:

```bash
pnpm install
```

The installation process downloads and links all required packages including React, Three.js, Tailwind CSS, and development tooling. On a typical broadband connection, this step completes in 30-60 seconds.

### Development Server

Start the local development server with hot module replacement enabled:

```bash
pnpm dev
```

The Vite development server launches on `http://localhost:3000` by default. The terminal output displays the exact local and network URLs for accessing the application. Any changes to source files trigger automatic recompilation and browser refresh, enabling rapid iteration during development.

### Production Build

Generate optimized static files for production deployment:

```bash
pnpm build
```

Vite compiles and bundles the application into the `dist/` directory, applying minification, tree-shaking, and code-splitting optimizations. The build process typically completes in 10-20 seconds for this project size. The resulting static files can be served from any web server, CDN, or static hosting platform.

Preview the production build locally before deployment:

```bash
pnpm preview
```

This command serves the contents of the `dist/` directory on `http://localhost:4173`, allowing verification of the production build in a local environment that closely mimics deployment conditions.

---

## Configuration

### Environment Variables

The application supports optional environment variables for customization. Create a `.env` file in the project root to override default values:

```env
# Application Metadata
VITE_APP_TITLE="3D Packaging Configurator"
VITE_APP_LOGO="/assets/logo.png"

# Analytics (optional)
VITE_ANALYTICS_WEBSITE_ID=""
VITE_ANALYTICS_ENDPOINT=""

# Feature Flags (optional)
VITE_ENABLE_TEMPLATES=true
VITE_ENABLE_PRESETS=true
```

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code. Vite injects these values at build time, replacing references with literal values for optimal performance.

### Theme Customization

The application theme is defined in `client/src/index.css` using CSS custom properties. Modify the color palette, typography, spacing, and other design tokens by editing the `:root` and `.dark` selectors:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... additional theme variables */
}
```

Tailwind CSS utility classes automatically reference these CSS variables, ensuring consistent theming throughout the application without manual class updates.

### Package Configuration

Default package settings are defined in `client/src/config/packageConfigs.ts`. Each package type specifies initial material properties, label content, and transform values. Modify these configurations to change the default appearance of packages when first loaded:

```typescript
export const packageConfigs: Record<PackageType, PackageConfig> = {
  'can-12oz': {
    type: 'can-12oz',
    baseColor: '#e0e0e0',
    metalness: 0.9,
    roughness: 0.1,
    // ... additional properties
  },
  // ... other package types
};
```

Camera configurations for each package type are managed in `client/src/config/cameraConfigs.ts`, controlling initial position, zoom limits, and rotation constraints.

---

## Key Components

### Package3DModelViewer

The core 3D rendering component manages Three.js scene composition, camera controls, and model loading. It subscribes to the Zustand configuration store and reactively updates the 3D scene when package type, materials, or label content changes. The component handles OBJ model loading, texture generation, and material application with support for both standard and custom UV mapping strategies.

### CustomizationPanel

The primary user interface for package configuration provides tabbed navigation between Package, Material, and Label customization options. The Advanced Controls section includes the pop-out viewer button, wrapper toggle, and reference surface controls. All user interactions update the Zustand store, triggering reactive updates in the 3D viewer.

### ViewerPopout

A specialized page component for the pop-out demo viewer that decodes package configuration from URL parameters and renders a full-screen 3D view without UI controls. It supports backwards compatibility with older URL formats and applies view settings including wrapper visibility and reference surface state.

### configStore

The Zustand state management store maintains global application state including current package type, package configuration, camera preset, and view settings. It provides actions for updating individual properties, applying templates, and managing user presets. The store architecture ensures type-safe state access throughout the application.

---

## Development Workflow

### Adding New Package Types

To introduce a new package type, follow these steps in sequence. First, add the new package type identifier to the `PackageType` union in `client/src/store/configStore.ts`. Next, create the 3D model file in OBJ format and place it in `client/public/models/` with a descriptive filename. Define default configuration values in `client/src/config/packageConfigs.ts` including material properties and label transforms. Add camera configuration in `client/src/config/cameraConfigs.ts` specifying initial position, target, and zoom limits. Finally, update the package type selector UI in `CustomizationPanel.tsx` to include the new option with appropriate icon and label.

### Modifying 3D Models

Package models are loaded from OBJ files in the `client/public/models/` directory. To replace or update a model, export the new geometry from your 3D modeling software (Blender, Maya, 3ds Max) in Wavefront OBJ format. Ensure the model is centered at the origin (0, 0, 0) and scaled appropriately for the scene. Update the model path reference in `packageConfigs.ts` if the filename changes. Test the new model in the application to verify UV mapping, material application, and label positioning work correctly.

### Customizing Label Generation

The label texture generation system resides in `client/src/utils/labelTextureGenerator.ts`. This module creates dynamic canvas-based textures that are applied to package surfaces. To modify label layouts, edit the canvas drawing logic to adjust text positioning, font sizes, or graphic elements. The texture resolution can be increased for higher quality at the cost of memory usage and rendering performance.

---

## Browser Compatibility

The application requires WebGL 2.0 support for 3D rendering. **Chrome and Edge** provide the best performance and most reliable WebGL implementation, recommended for production use. **Firefox** offers good compatibility with minor performance differences compared to Chromium-based browsers. **Safari** works correctly but may exhibit occasional rendering quirks or slower performance on complex scenes. **Mobile browsers** on iOS and Android support the application with touch-based camera controls, though performance varies significantly based on device GPU capabilities.

---

## Performance Considerations

### Optimization Strategies

The application employs several performance optimizations to maintain smooth 60 FPS rendering. Texture caching prevents redundant canvas operations when label content remains unchanged. Geometry instancing reuses mesh data across multiple render frames. The Three.js renderer uses automatic frustum culling to skip rendering objects outside the camera view. React component memoization with `React.memo` and `useMemo` reduces unnecessary re-renders during state updates.

### Resource Management

3D models and textures consume significant memory. The application loads models on-demand when package types are selected rather than preloading all assets at startup. Texture resolution is balanced between visual quality and memory footprint, with 2048x2048 being the maximum for label textures. Disposing of Three.js resources properly when components unmount prevents memory leaks during extended usage sessions.

---

## Deployment

For detailed deployment instructions covering multiple platforms and hosting environments, refer to the **DEPLOYMENT.md** guide included in this repository. The deployment documentation provides step-by-step instructions for Vercel, Netlify, self-hosted servers, Docker containers, and cloud platforms including AWS, Google Cloud, and Azure.

---

## Architecture

For in-depth technical documentation covering component architecture, state management patterns, 3D rendering pipeline, and extension points, consult the **ARCHITECTURE.md** document. The architecture guide explains design decisions, data flow patterns, and best practices for maintaining and extending the codebase.

---

## Troubleshooting

### Common Issues

**Black screen or blank 3D viewport**: Verify that your browser supports WebGL 2.0 by visiting `https://get.webgl.org/webgl2/`. Check the browser console for JavaScript errors or WebGL context creation failures. Ensure GPU acceleration is enabled in browser settings.

**Models not loading**: Confirm that OBJ files exist in `client/public/models/` and that file paths in `packageConfigs.ts` match exactly including case sensitivity. Check the browser network tab for 404 errors indicating missing model files.

**Labels not appearing**: Inspect the browser console for canvas texture generation errors. Verify that logo image paths in label content are correct and accessible. Check that label background color contrasts sufficiently with text colors for visibility.

**Poor performance or low FPS**: Reduce texture resolution in `labelTextureGenerator.ts` if memory-constrained. Disable anti-aliasing in the Three.js renderer initialization. Close other browser tabs to free up GPU resources. Consider upgrading graphics drivers or using a device with better GPU capabilities.

**Pop-out viewer shows wrong package**: Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R). Verify that the URL parameter contains a valid base64-encoded configuration string. Check browser console logs for decoding errors.

### Development Issues

**TypeScript errors after dependency updates**: Delete `node_modules/` and `pnpm-lock.yaml`, then run `pnpm install` to regenerate the lock file with compatible versions. Verify that TypeScript version in `package.json` matches project requirements.

**Vite build failures**: Ensure Node.js version is 22.x or later. Check for syntax errors in recently modified files. Clear Vite cache with `rm -rf node_modules/.vite` and rebuild.

**Hot module replacement not working**: Restart the development server. Verify that file watchers are not exhausted on Linux systems (increase with `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`).

---

## Contributing

When contributing to this project, maintain consistent code style by following the existing TypeScript and React patterns. Use meaningful variable and function names that clearly convey intent. Add TypeScript type annotations for all function parameters and return values. Write descriptive commit messages explaining the rationale behind changes.

Test all modifications across multiple package types to ensure compatibility. Verify that pop-out viewer functionality remains intact after UI changes. Check browser console for warnings or errors introduced by new code. Run the production build and preview to catch build-time issues before deployment.

---

## License

This project is proprietary software developed for internal use. All rights reserved. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited without explicit written permission.

---

## Support

For technical questions, bug reports, or feature requests, contact your development team lead or submit issues through your organization's internal ticketing system. Include browser version, operating system, and steps to reproduce any reported issues for faster resolution.

---

**Built with ❤️ using React, Three.js, and Tailwind CSS**
