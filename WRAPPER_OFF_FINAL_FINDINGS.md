# 750ml Bottle Wrapper OFF Issue - Final Findings

## Problem Summary
With wrapper OFF, the 750ml whiskey bottle appears all white instead of showing PBR textures (frosted glass, metal cap, amber liquid).

## Investigation Timeline

### Issue 1: Duplicate Material Code ✅ FIXED
**Found**: Duplicate material application blocks were overwriting PBR textures
- Glass body: Lines 634-677 (removed)
- Cap/liquid: Lines 764-815 (removed)

**Fix Applied**: Removed all duplicate blocks

### Issue 2: isCanBody Flag ✅ VERIFIED
**Found**: Glass body mesh correctly has `child.userData.isCanBody = true` set during initial load
- Line 596: Wrapper ON case
- Line 623: Wrapper OFF case

**Status**: Flag is correctly set, not the issue

### Issue 3: Second useEffect Not Triggering ❌ ROOT CAUSE
**Found**: The second useEffect (lines 892-1020) handles wrapper toggle, but appears not to be running

**Evidence**:
1. Added extensive debug logging (lines 970, 977, 983, 985, 989, 995, 997, 1010)
2. Toggled wrapper OFF multiple times
3. **NO console output appears** - suggests useEffect isn't running at all

**Possible Causes**:
1. **useEffect dependency array issue**: The second useEffect depends on `[packageConfig, showWrapper, currentPackage]` - if these aren't changing, it won't run
2. **Initial state problem**: If `showWrapper` starts as `false` (OFF), toggling to OFF doesn't trigger the effect
3. **React rendering issue**: Component might not be re-rendering when state changes
4. **Browser console capture**: The browser tool might not be capturing console.log output correctly

## Current Code State

### First useEffect (Model Loading) - WORKING ✅
Lines 183-890: Loads model and applies initial materials
- **Wrapper ON**: Applies label texture to glass body (lines 573-596)
- **Wrapper OFF**: Loads PBR textures for glass (lines 598-626)
- **Cap**: Loads metal PBR textures (lines 710-730)
- **Liquid**: Loads amber PBR textures (lines 731-754)

### Second useEffect (Wrapper Toggle) - NOT WORKING ❌
Lines 892-1020: Updates materials when wrapper is toggled
- **Wrapper ON** (lines 896-940): Regenerates label texture
- **Wrapper OFF** (lines 942-1000): Should load PBR textures for bottle-750ml (lines 968-1010)
- **Problem**: This useEffect doesn't appear to run when wrapper is toggled

## Recommended Solutions

### Option A: Verify useEffect is Running (DEBUG)
1. Add `alert()` instead of `console.log()` to confirm code execution
2. Check if `showWrapper` state is actually changing in the store
3. Verify second useEffect dependency array is correct

### Option B: Set Default Wrapper to OFF (WORKAROUND)
Since the first useEffect correctly applies PBR textures when wrapper is OFF:
1. Set default `showWrapper: false` in configStore for bottle-750ml
2. This would show PBR textures immediately on load
3. Wrapper toggle would still be broken, but visual result would be correct

### Option C: Move PBR Logic to First useEffect (PERMANENT FIX)
1. Keep all material logic in the first useEffect (model loading)
2. Make the first useEffect depend on `showWrapper` as well
3. This ensures materials are always applied correctly regardless of toggle state

## Next Steps
1. Choose solution approach (A, B, or C)
2. Implement chosen solution
3. Test wrapper toggle functionality
4. Verify PBR textures appear correctly
5. Save checkpoint

## Files Modified
- `/home/ubuntu/packaging-configurator-3d/client/src/components/Package3DModelViewer.tsx`
  - Removed duplicate material code (lines 634-677, 764-815)
  - Added debug logging to second useEffect (lines 970-1010)

## Status
- ✅ Gummies Glass Jar icon fixed
- ✅ Duplicate material code removed
- ❌ Wrapper toggle still not working
- ❌ PBR textures not appearing with wrapper OFF
