/**
 * Camera configurations for each package type
 * Each package has an initial position and 4 preset angles (front, back, side, angle)
 */

export interface CameraPosition {
  position: [number, number, number]; // [x, y, z]
  target: [number, number, number];   // [x, y, z] - what the camera looks at
}

export interface PackageCameraConfig {
  initial: CameraPosition;
  presets: {
    front: CameraPosition;
    back: CameraPosition;
    side: CameraPosition;
    angle: CameraPosition;
  };
}

export type CameraPreset = 'front' | 'back' | 'side' | 'angle';

export const CAMERA_CONFIGS: Record<string, PackageCameraConfig> = {
  'can-12oz': {
    initial: {
      position: [18.62, 7.68, 80.74],
      target: [0.00, 0.00, 0.00]
    },
    presets: {
      front: {
        position: [8.61, 2.54, 52.28],
        target: [-4.03, -1.39, 0.50]
      },
      back: {
        position: [-3.97, -0.09, -40.37],
        target: [-6.36, 1.23, 9.55]
      },
      side: {
        position: [49.92, 0.62, 25.00],
        target: [2.57, -0.06, 8.93]
      },
      angle: {
        position: [33.24, 20.92, 56.92],
        target: [-5.65, -9.82, 15.46]
      }
    }
  },
  'bottle-2oz': {
    initial: {
      position: [31.80, 6.99, 37.94],
      target: [0.00, 0.00, 0.00]
    },
    presets: {
      front: {
        position: [0.24, 4.28, 49.12],
        target: [0.24, 2.60, -0.85]
      },
      back: {
        position: [5.13, 12.30, -51.15],
        target: [1.16, 7.64, -1.52]
      },
      side: {
        position: [51.12, 7.92, 0.55],
        target: [1.16, 7.64, -1.52]
      },
      angle: {
        position: [42.47, 24.11, 23.36],
        target: [1.22, 6.27, 1.44]
      }
    }
  },
  'stick-pack': {
    initial: {
      position: [32.16, 17.04, 34.28],
      target: [0.00, 0.00, 0.00]
    },
    presets: {
      front: {
        position: [0.05, 49.92, 2.79],
        target: [0.00, 0.00, 0.00]
      },
      back: {
        position: [0.15, -48.07, 13.77],
        target: [0.00, 0.00, 0.00]
      },
      side: {
        position: [3.34, 2.85, 49.81],
        target: [0.00, 0.00, 0.00]
      },
      angle: {
        position: [37.72, 26.22, 19.74],
        target: [0.00, 0.00, 0.00]
      }
    }
  },
  'bottle-750ml': {
    initial: {
      position: [13.07, 7.39, 18.24],
      target: [-0.27, 0.73, -0.10]
    },
    presets: {
      front: {
        position: [2.25, 8.98, 10.70],
        target: [0.11, 3.97, 1.00]
      },
      back: {
        position: [2.25, 8.98, -10.70],
        target: [0.11, 3.97, 1.00]
      },
      side: {
        position: [17.59, 10.56, 5.20],
        target: [0.11, 3.97, 1.00]
      },
      angle: {
        position: [21.18, 9.91, 6.87],
        target: [0.11, 7.37, -0.60]
      }
    }
  }
};

/**
 * Get camera configuration for a specific package type
 */
export function getCameraConfig(packageType: string): PackageCameraConfig {
  return CAMERA_CONFIGS[packageType] || CAMERA_CONFIGS['can-12oz'];
}

/**
 * Get camera position for a specific package type and preset
 */
export function getCameraPresetPosition(
  packageType: string,
  preset: CameraPreset
): CameraPosition {
  const config = getCameraConfig(packageType);
  return config.presets[preset];
}

/**
 * Get initial camera position for a specific package type
 */
export function getInitialCameraPosition(packageType: string): CameraPosition {
  const config = getCameraConfig(packageType);
  return config.initial;
}
