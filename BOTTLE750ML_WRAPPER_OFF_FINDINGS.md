# 750ml Bottle Wrapper OFF Issue - Findings Report

## Summary
The 750ml whiskey bottle appears all white when wrapper is toggled OFF, instead of showing PBR textures (amber liquid, detailed metal cap, frosted glass with texture details).

## Root Causes Identified

### 1. Duplicate Material Application Code (FIXED ✅)
**Location**: Package3DModelViewer.tsx, first useEffect (model loading)
- Lines 634-677: Duplicate glass body material code
- Lines 720-771: Duplicate cap and liquid material code

**Status**: Removed via sed commands

### 2. Missing Wrapper Toggle Handler (PARTIALLY FIXED ⚠️)
**Location**: Package3DModelViewer.tsx, second useEffect (material updates)
- Lines 892-987: Handles wrapper toggle for existing packages
- Line 945: Only processes meshes with `child.userData.isCanBody === true`
- bottle-750ml cap and liquid meshes don't have this flag

**Fix Applied**: Added bottle-750ml PBR texture loading (lines 968-989)
- Loads glass PBR textures when wrapper is OFF
- Sets transparency, metalness, roughness for glass

**Current Issue**: Textures still not appearing - bottle remains all white

## Why PBR Textures Aren't Showing

### Hypothesis 1: Mesh Flag Issue
The second useEffect only processes meshes with `child.userData.isCanBody === true`. For bottle-750ml:
- Glass body: Has `isCanBody = true` ✅
- Cap: No flag ❌
- Liquid: No flag ❌

**Problem**: The code I added (lines 968-989) should work for the glass body, but it's not being triggered.

### Hypothesis 2: Texture Path Issue
The texture paths might be incorrect:
```typescript
const basePath = '/models/bottle750ml_textures/';
const baseColorMap = textureLoader.load(basePath + 'glass_Mat_baseColor.png');
```

**Actual files**:
- `/home/ubuntu/packaging-configurator-3d/client/public/models/bottle750ml_textures/glass_Mat_baseColor.png`

Paths look correct.

### Hypothesis 3: Material Override
The wrapper ON logic might be overriding the wrapper OFF textures. The second useEffect structure:
```typescript
if (showWrapper) {
  // Apply label texture
} else {
  // Apply PBR textures (bottle-750ml code here)
}
```

This should work correctly.

### Hypothesis 4: Initial Load Issue
The first useEffect (model loading) sets up materials with PBR textures. The second useEffect (wrapper toggle) should update them. But:
- First useEffect runs once on package change
- Second useEffect runs when `showWrapper` changes
- Maybe the glass body material from first useEffect is being overridden?

## Next Steps to Debug

1. **Check Console Logs**: Look for `[bottle-750ml] Applied glass PBR textures (wrapper OFF)` message
2. **Verify Mesh Flags**: Check if glass body mesh actually has `isCanBody = true`
3. **Test Texture Loading**: Add error handlers to texture loading
4. **Simplify Material**: Try applying just a solid color first to verify the code path works

## Recommended Fix

The issue is likely that the glass body mesh doesn't have `child.userData.isCanBody = true` set during initial load. Need to check the first useEffect where this flag is set.

**Action**: Search for where `isCanBody` is set in the first useEffect and ensure it's applied to the bottle-750ml glass body mesh.
