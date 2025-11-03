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
      position: [120, 60, 120],
      target: [0, 0, 0]
    },
    presets: {
      front: {
        position: [0, 0, 180],
        target: [0, 0, 0]
      },
      back: {
        position: [0, 0, -180],
        target: [0, 0, 0]
      },
      side: {
        position: [180, 0, 0],
        target: [0, 0, 0]
      },
      angle: {
        position: [120, 60, 120],
        target: [0, 0, 0]
      }
    }
  },
  'bottle-2oz': {
    initial: {
      position: [15, 10, 15],
      target: [0, 0, 0]
    },
    presets: {
      front: {
        position: [0, 0, 25],
        target: [0, 0, 0]
      },
      back: {
        position: [0, 0, -25],
        target: [0, 0, 0]
      },
      side: {
        position: [25, 0, 0],
        target: [0, 0, 0]
      },
      angle: {
        position: [15, 10, 15],
        target: [0, 0, 0]
      }
    }
  },
  'stick-pack': {
    initial: {
      position: [30, 20, 30],
        target: [0, 0, 0]
    },
    presets: {
      front: {
        position: [0, 0, 40],
        target: [0, 0, 0]
      },
      back: {
        position: [0, 0, -40],
        target: [0, 0, 0]
      },
      side: {
        position: [40, 0, 0],
        target: [0, 0, 0]
      },
      angle: {
        position: [30, 20, 30],
        target: [0, 0, 0]
      }
    }
  },
  'bottle-750ml': {
    initial: {
      position: [40, 25, 40],
      target: [0, 0, 0]
    },
    presets: {
      front: {
        position: [0, 0, 60],
        target: [0, 0, 0]
      },
      back: {
        position: [0, 0, -60],
        target: [0, 0, 0]
      },
      side: {
        position: [60, 0, 0],
        target: [0, 0, 0]
      },
      angle: {
        position: [40, 25, 40],
        target: [0, 0, 0]
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
