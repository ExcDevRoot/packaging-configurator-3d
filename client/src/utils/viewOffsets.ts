import { LabelTransform, ElementTransform } from '@/store/configStore';

/**
 * View-specific offset configuration
 * 
 * 3D View is the baseline (user controls at 0%, 0%, 1.0x map to these actual positions)
 * 2D View applies automatic offsets to match visual appearance
 */

// 3D View baseline positions (what 0%, 0%, 1.0x actually renders as)
export const VIEW_3D_BASELINE = {
  logo: {
    offsetX: 27,  // 27% horizontal
    offsetY: 2,   // 2% vertical
    scale: 1.10,  // 1.10x scale
  },
  textGroup: {
    offsetX: 27,  // 27% horizontal
    offsetY: 30,  // 30% vertical
    scale: 0.55,  // 0.55x scale
  },
} as const;

// 2D View offset adjustments (applied on top of user controls)
export const VIEW_2D_OFFSETS = {
  logo: {
    offsetX: 0,    // No horizontal offset
    offsetY: -33,  // -33% vertical offset
    scale: 1.75,   // 1.75x scale multiplier
  },
  textGroup: {
    offsetX: 0,    // No horizontal offset
    offsetY: -17,  // -17% vertical offset
    scale: 0.55,   // 0.55x scale multiplier
  },
} as const;

/**
 * Apply view-specific offsets to label transform
 * @param userTransform - Transform values from user controls (0%, 0%, 1.0x = centered)
 * @param viewMode - Current view mode ('2d' or '3d')
 * @returns Actual transform values to use for rendering
 */
export function applyViewOffsets(
  userTransform: LabelTransform,
  viewMode: '2d' | '3d'
): LabelTransform {
  if (viewMode === '3d') {
    // 3D view: Add baseline offsets to user controls
    return ({
      logo: {
        offsetX: userTransform.logo.offsetX + VIEW_3D_BASELINE.logo.offsetX,
        offsetY: userTransform.logo.offsetY + VIEW_3D_BASELINE.logo.offsetY,
        scale: userTransform.logo.scale * VIEW_3D_BASELINE.logo.scale,
      },
      textGroup: {
        offsetX: userTransform.textGroup.offsetX + VIEW_3D_BASELINE.textGroup.offsetX,
        offsetY: userTransform.textGroup.offsetY + VIEW_3D_BASELINE.textGroup.offsetY,
        scale: userTransform.textGroup.scale * VIEW_3D_BASELINE.textGroup.scale,
      },
      backside: {
        offsetX: (userTransform as any).backside.offsetX,
        offsetY: (userTransform as any).backside.offsetY,
        scale: (userTransform as any).backside.scale,
      },
    } as LabelTransform);
  } else {
    // 2D view: Add 2D offsets to user controls
    return ({
      logo: {
        offsetX: userTransform.logo.offsetX + VIEW_2D_OFFSETS.logo.offsetX,
        offsetY: userTransform.logo.offsetY + VIEW_2D_OFFSETS.logo.offsetY,
        scale: userTransform.logo.scale * VIEW_2D_OFFSETS.logo.scale,
      },
      textGroup: {
        offsetX: userTransform.textGroup.offsetX + VIEW_2D_OFFSETS.textGroup.offsetX,
        offsetY: userTransform.textGroup.offsetY + VIEW_2D_OFFSETS.textGroup.offsetY,
        scale: userTransform.textGroup.scale * VIEW_2D_OFFSETS.textGroup.scale,
      },
      backside: {
        offsetX: (userTransform as any).backside.offsetX,
        offsetY: (userTransform as any).backside.offsetY,
        scale: (userTransform as any).backside.scale,
      },
    } as LabelTransform);
  }
}
