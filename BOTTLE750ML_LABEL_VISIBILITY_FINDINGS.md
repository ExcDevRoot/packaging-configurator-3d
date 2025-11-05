# 750ml Bottle Label Visibility Investigation - Findings Report

## Problem Summary
With wrapper ON, the 750ml whiskey bottle shows NO label elements (no logo, no text). The bottle renders as plain white/frosted glass with metal cap, but the label texture is not visible.

## Visual Confirmation
- ✅ Bottle model loads and renders correctly
- ✅ Wrapper toggle is ON (blue, enabled)
- ❌ NO label visible on bottle surface (should show "Brix" logo and "Brix Functional" text like 12oz can)
- ✅ 12oz can shows label correctly for comparison

## Code Investigation Findings

### Issue 1: Duplicate UV Mapping and Geometry Flip ❌ CRITICAL BUG
**Location**: Package3DModelViewer.tsx, bottle-750ml glass body handling

**Problem**: UV mapping and geometry flip are applied **TWICE**:
1. **First application** (lines 576-580): Inside `if (showWrapper)` block
2. **Second application** (lines 628-632): AFTER the if/else block, outside it

```typescript
// Line 576-580: First application (inside if block)
applyCylindricalUVMapping(child);
child.geometry.scale(-1, 1, 1);
child.geometry.computeVertexNormals();

// Line 628-632: Second application (DUPLICATE, outside if/else)
applyCylindricalUVMapping(child);
child.geometry.scale(-1, 1, 1);
child.geometry.computeVertexNormals();
```

**Impact**: 
- Geometry flip applied twice = **cancels out** (flips back to original orientation)
- UV mapping applied twice = **corrupts UVs** (maps twice, second overwrites first)
- This breaks both label texture mapping AND PBR texture mapping

**Root Cause**: Same as the duplicate material code we removed earlier - leftover code from pkgtype9 implementation that wasn't properly cleaned up during the swap.

---

### Issue 2: Label Texture Set to Null ⚠️ DESIGN ISSUE
**Location**: Package3DModelViewer.tsx, line 588

**Code**:
```typescript
map: null, // Texture will be applied asynchronously after generation
```

**Problem**: The label texture is initially set to `null` with a comment saying it will be applied asynchronously by the second useEffect. However:
1. The second useEffect may not be running (as we discovered in wrapper OFF investigation)
2. Even if it runs, the corrupted UVs from Issue #1 would prevent proper texture display

---

### Issue 3: Glass Transparency May Hide Label 🤔 POSSIBLE ISSUE
**Location**: Package3DModelViewer.tsx, line 590

**Code**:
```typescript
opacity: 0.4, // Semi-transparent glass to show label
```

**Problem**: The glass material is 40% transparent. If the label texture is white (default background), it would be very faint against the white/frosted glass. This might make the label nearly invisible even if it's technically being applied.

**Note**: This is less likely to be the primary issue since the 12oz can shows labels clearly, but could be a contributing factor.

---

### Issue 4: Second useEffect Not Triggering ❌ CONFIRMED FROM WRAPPER OFF INVESTIGATION
**Location**: Package3DModelViewer.tsx, lines 892-940

**Problem**: The second useEffect that generates and applies label textures doesn't appear to run when wrapper is toggled. Evidence:
1. Added extensive debug logging in previous investigation
2. NO console output when wrapper is toggled
3. This affects both wrapper ON (label not appearing) and wrapper OFF (PBR not appearing)

**Possible Causes**:
- useEffect dependency array issue
- React rendering/state update issue
- Initial state problem (if wrapper starts ON, toggling to ON doesn't trigger)

---

## Root Cause Analysis

**Primary Root Cause**: **Duplicate UV mapping and geometry flip** (Issue #1)
- The UV coordinates are corrupted by being applied twice
- Even if the label texture is generated correctly, it can't map properly to corrupted UVs
- This explains why BOTH label (wrapper ON) and PBR textures (wrapper OFF) don't appear

**Secondary Root Cause**: **Second useEffect not triggering** (Issue #4)
- Even if UVs were correct, the label texture isn't being applied because the second useEffect doesn't run
- This is the same issue affecting wrapper OFF (PBR textures not appearing)

**Contributing Factors**:
- Glass transparency (Issue #3) may make label faint even if it were applied correctly
- Initial null texture (Issue #2) means label won't show until second useEffect runs

---

## Recommended Fix (Priority Order)

### Fix #1: Remove Duplicate UV Mapping and Geometry Flip (CRITICAL)
**Action**: Remove lines 627-632 (duplicate code after if/else block)

**Rationale**: This is the most critical fix. The duplicate application corrupts the UVs and cancels out the geometry flip, breaking all texture mapping.

**Code to Remove**:
```typescript
// Lines 627-632 - DELETE THESE
// Generate cylindrical UV mapping for bottle body
applyCylindricalUVMapping(child);

// Flip normals to point outward (fixes inside-out texture)
child.geometry.scale(-1, 1, 1); // Flip X axis to invert mesh
child.geometry.computeVertexNormals(); // Recompute normals
```

---

### Fix #2: Debug Second useEffect Not Triggering (HIGH PRIORITY)
**Action**: Add `alert()` instead of `console.log()` to confirm if second useEffect runs

**Rationale**: We need to confirm whether the second useEffect is running at all. If it's not, we need to fix the trigger mechanism.

**Test Code**:
```typescript
// Line 896 - Add alert before texture generation
if (showWrapper) {
  alert('[DEBUG] Second useEffect running - generating label texture');
  // ... rest of code
}
```

---

### Fix #3: Consider Reducing Glass Transparency (OPTIONAL)
**Action**: Increase opacity from 0.4 to 0.7-0.8 for better label visibility

**Rationale**: Once UVs are fixed and texture is applied, higher opacity will make the label more visible through the glass.

**Code Change**:
```typescript
// Line 590
opacity: 0.7, // Increased from 0.4 for better label visibility
```

---

### Fix #4: Apply Texture Immediately in First useEffect (ALTERNATIVE APPROACH)
**Action**: Instead of setting `map: null` and waiting for second useEffect, generate and apply texture immediately in first useEffect

**Rationale**: This would bypass the second useEffect trigger issue entirely. Similar to how other package types handle textures.

**Implementation**: Move label texture generation from second useEffect into the first useEffect's wrapper ON block.

---

## Comparison with Working Package Types

### 12oz Can (WORKING)
- UV mapping applied once ✅
- Geometry flip applied once ✅
- Label texture generated in second useEffect ✅
- Second useEffect triggers correctly ✅

### 750ml Bottle (BROKEN)
- UV mapping applied **TWICE** ❌
- Geometry flip applied **TWICE** ❌
- Label texture set to null, waiting for second useEffect ⚠️
- Second useEffect may not trigger ❌

---

## Testing Plan

1. **Test Fix #1** (Remove duplicate UV/geometry code):
   - Remove lines 627-632
   - Reload page and select 750ml bottle
   - Check if label appears (may still not work due to Issue #4)

2. **Test Fix #2** (Debug second useEffect):
   - Add alert() to confirm execution
   - Toggle wrapper ON/OFF
   - Verify alert appears

3. **Test Fix #3** (Increase opacity):
   - Change opacity to 0.7
   - Check if label is more visible

4. **Test Fix #4** (Immediate texture application):
   - Move texture generation to first useEffect
   - Verify label appears on initial load

---

## Files Affected
- `/home/ubuntu/packaging-configurator-3d/client/src/components/Package3DModelViewer.tsx`
  - Lines 627-632: Duplicate UV mapping and geometry flip (DELETE)
  - Line 590: Glass opacity (ADJUST if needed)
  - Lines 582-596: Wrapper ON material setup (MAY NEED TEXTURE GENERATION)
  - Lines 892-940: Second useEffect (MAY NEED DEBUGGING)

---

## Status
- ✅ Investigation complete
- ✅ Root causes identified
- ✅ Fixes prioritized
- ⏳ Awaiting user decision on which fixes to implement
