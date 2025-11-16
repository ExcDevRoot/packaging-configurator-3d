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
  sceneColors: {
    background: string;        // Hex color for scene background (e.g., '#cce6ff')
    referenceSurface: string;  // Hex color for reference ground plane (e.g., '#6c8093')
  };
}

export type CameraPreset = 'front' | 'back' | 'side' | 'angle';

export const CAMERA_CONFIGS: Record<string, PackageCameraConfig> = {
  'can-12oz': {
    initial: {
      position: [1.20, 0.60, 3.50],
      target: [0.00, 0.00, 0.00]
    },
    distanceLimits: {
      min: 2,
      max: 20
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
    },
    presets: {
      front: {
        position: [0.00, 0.30, 2.80],
        target: [0.00, 0.00, 0.00]
      },
      back: {
        position: [0.00, 0.30, -2.80],
        target: [0.00, 0.00, 0.00]
      },
      side: {
        position: [2.80, 0.30, 0.00],
        target: [0.00, 0.00, 0.00]
      },
      angle: {
        position: [1.20, 0.60, 3.50],
        target: [0.00, 0.00, 0.00]
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
      max: 50
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
      min: 20,
      max: 140
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
      max: 200
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
      position: [0, -8.45, 50.34],
      target: [-2.35, -14.27, 1.85]
    },
    distanceLimits: {
      min: 30,
      max: 160
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
    },
    presets: {
      front: {
        position: [19.63, -13.08, 45.51],
        target: [-2.35, -14.27, 1.85]
      },
      back: {
        position: [-34.45, -17.25, -40],
        target: [1, -14.15, -3.31]
      },
      side: {
        position: [-37.82, -17.35, 26.27],
        target: [1, -14.15, -3.31]
      },
      angle: {
        position: [48.75, 15.83, 11.95],
        target: [1, -14.15, -3.31]
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
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
      max: 80
    },
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
    sceneColors: {
      background: '#cce6ff',
      referenceSurface: '#6c8093'
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
