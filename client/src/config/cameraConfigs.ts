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
  distanceLimits: {
    min: number;
    max: number;
  };
}

export type CameraPreset = 'front' | 'back' | 'side' | 'angle';

export const CAMERA_CONFIGS: Record<string, PackageCameraConfig> = {
  'can-12oz': {
    initial: {
      position: [18.62, 7.68, 80.74],
      target: [0.00, 0.00, 0.00]
    },
    distanceLimits: {
      min: 50,
      max: 300
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
      position: [16.20, 8.09, 17.56],
      target: [0.00, 0.00, 0.00]
    },
    distanceLimits: {
      min: 5,
      max: 80
    },
    presets: {
      front: {
        position: [-0.89, 2.01, 25.13],
        target: [0.00, 0.00, 0.00]
      },
      back: {
        position: [-0.78, 1.48, -25.17],
        target: [0.00, 0.00, 0.00]
      },
      side: {
        position: [24.86, 3.51, 2.48],
        target: [0.00, 0.00, 0.00]
      },
      angle: {
        position: [17.17, 13.72, 12.10],
        target: [0.00, 0.00, 0.00]
      }
    }
  },
  'stick-pack': {
    initial: {
      position: [9.73, 44.33, 21.33],
      target: [0.00, 0.00, 0.00]
    },
    distanceLimits: {
      min: 50,
      max: 300
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
    distanceLimits: {
      min: 15,
      max: 300
    },
    presets: {
      front: {
        position: [0, 2, 29],
        target: [0.11, 3.97, 1.00]
      },
      back: {
        position: [-2, 3, -29],
        target: [0.11, 3.97, 1.00]
      },
      side: {
        position: [29, 4, 0],
        target: [0.11, 3.97, 1.00]
      },
      angle: {
        position: [19.6, 9.5, 20.7],
        target: [0.11, 7.37, -0.60]
      }
    }
  },
  'pkgtype5': {
    initial: {
      position: [0, 25, 80],
      target: [0, 15, 0]
    },
    distanceLimits: {
      min: 30,
      max: 200
    },
    presets: {
      front: {
        position: [0, 18, 75],
        target: [0, 15, 0]
      },
      back: {
        position: [0, 18, -75],
        target: [0, 15, 0]
      },
      side: {
        position: [75, 18, 0],
        target: [0, 15, 0]
      },
      angle: {
        position: [50, 35, 50],
        target: [0, 15, 0]
      }
    }
  },
  'pkgtype6': {
    initial: {
      position: [515.83, 284.23, 517.73],
      target: [0.00, 0.00, 0.00]
    },
    distanceLimits: {
      min: 150,
      max: 600
    },
    presets: {
      front: {
        position: [12.95, 129.98, 585.61],
        target: [0.00, 0.00, 0.00]
      },
      back: {
        position: [23.69, 142.31, -588.44],
        target: [0.00, 0.00, 0.00]
      },
      side: {
        position: [588.94, 118.96, 5.67],
        target: [0.00, 0.00, 0.00]
      },
      angle: {
        position: [-227.85, 193.76, 522.88],
        target: [0.00, 0.00, 0.00]
      }
    }
  },
  'pkgtype7': {
    initial: {
      position: [10.00, 20.00, 36.31],
      target: [0.00, 6.05, 0.00]
    },
    distanceLimits: {
      min: 15,
      max: 100
    },
    presets: {
      front: {
        position: [0.00, 6.05, 36.31],
        target: [0.00, 6.05, 0.00]
      },
      back: {
        position: [0.00, 6.05, -36.31],
        target: [0.00, 6.05, 0.00]
      },
      side: {
        position: [36.31, 6.05, 0.00],
        target: [0.00, 6.05, 0.00]
      },
      angle: {
        position: [25.00, 25.00, 25.00],
        target: [0.00, 6.05, 0.00]
      }
    }
  },
  'pkgtype8': {
    initial: {
      position: [10.00, 15.00, 30.00],
      target: [0.00, 4.28, 0.00]
    },
    distanceLimits: {
      min: 12,
      max: 80
    },
    presets: {
      front: {
        position: [0.00, 4.28, 30.00],
        target: [0.00, 4.28, 0.00]
      },
      back: {
        position: [0.00, 4.28, -30.00],
        target: [0.00, 4.28, 0.00]
      },
      side: {
        position: [30.00, 4.28, 0.00],
        target: [0.00, 4.28, 0.00]
      },
      angle: {
        position: [21.00, 21.00, 21.00],
        target: [0.00, 4.28, 0.00]
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
