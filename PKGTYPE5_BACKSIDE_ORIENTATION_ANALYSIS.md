# PkgType5 Backside Element Orientation Issue Analysis

**Date:** Nov 8, 2025  
**Issue:** Backside element horizontal slider moves element longitudinally (along bottle length) instead of circumferentially (around bottle)

---

## Problem Description

**Observed Behavior:**
- Backside element "horizontal" slider (offsetX) moves the element **longitudinally** (up/down the bottle length)
- This suggests the texture/UV mapping is rotated 90° from expected orientation
- The bottle model appears to be oriented horizontally in 3D space, but texture assumes vertical orientation

**Expected Behavior:**
- Backside element horizontal slider should move element **circumferentially** (around the bottle)
- Vertical slider should move element **longitudinally** (up/down the bottle)

---

## Technical Analysis

### **1. Label Texture Canvas Layout**

From `labelTextureGenerator.ts` (Lines 12-13):
```typescript
width: number = 2048,   // Horizontal dimension
height: number = 1024   // Vertical dimension
```

**Canvas Coordinate System:**
- Width (2048px): Wraps around cylinder circumference (360°)
- Height (1024px): Maps to cylinder height (top to bottom)

---

### **2. Backside Element Positioning Logic**

From `labelTextureGenerator.ts` (Lines 153-165):

```typescript
// === BACKSIDE ELEMENT RENDERING (180° from logo) ===
const backsideOffsetX = (width * backsideTransform.offsetX) / 100;
const backsideOffsetY = (safeZoneHeight * backsideTransform.offsetY) / 100;

// Position 180° opposite from logo (add half canvas width)
const backsideBaseX = width / 2;  // 1024px (180° from logo at 0px)
const backsideCenterX = backsideBaseX + backsideOffsetX - 150;
const backsideCenterY = safeZoneTop + (safeZoneHeight * 0.4) + backsideOffsetY;
```

**Analysis:**
- `offsetX` affects `backsideCenterX` → moves element horizontally on canvas
- `offsetY` affects `backsideCenterY` → moves element vertically on canvas
- Canvas X-axis = circumference (around bottle)
- Canvas Y-axis = height (up/down bottle)

**This is CORRECT for a vertically-oriented bottle!**

---

### **3. UV Mapping for pkgtype5**

**Key Finding:** pkgtype5 does NOT apply cylindrical UV mapping at runtime.

From `Package3DModelViewer.tsx` (Lines 596-616):
```typescript
} else if (currentPackage === 'pkgtype5') {
  // 1L Bottle - mark bottle mesh for wrapper toggle handling
  // DO NOT apply geometry transforms in System 1 (causes model to disappear)
  if (meshName.toLowerCase().includes('bottle')) {
    child.userData.isCanBody = true;
  }
  // ... material application only, NO UV mapping
}
```

**Comparison with pkgtype4 (bottle-750ml):**
```typescript
} else if (currentPackage === 'bottle-750ml') {
  // Apply UV mapping and geometry transforms to glass mesh
  applyCylindricalUVMapping(child);
  child.geometry.scale(-1, 1, 1);
  child.geometry.computeVertexNormals();
}
```

**Conclusion:** pkgtype5 uses **pre-baked UV coordinates** from the OBJ file, while pkgtype4 generates them at runtime.

---

### **4. Cylindrical UV Mapping Coordinate System**

From `cylindricalUVMapping.ts` (Lines 36-45):

```typescript
// Calculate U coordinate (horizontal wrap around cylinder)
// Use atan2 to get angle around Y axis
const angle = Math.atan2(z - center.z, x - center.x);
const u = (angle + Math.PI) / (2 * Math.PI); // Normalize to 0-1

// Calculate V coordinate (vertical position on cylinder)
const vRaw = (y - bbox.min.y) / height; // Normalize cylinder height to 0-1
const v = 0.05 + (vRaw * 0.9); // Map to texture range 0.05-0.95
```

**Key Insight:**
- U coordinate (texture X-axis) = angle around **Y-axis** (vertical axis)
- V coordinate (texture Y-axis) = position along **Y-axis** (height)
- **Assumes bottle is oriented vertically (Y-axis is up)**

---

### **5. Root Cause Hypothesis**

**Hypothesis A: Model Orientation Mismatch (MOST LIKELY)**

**Theory:** The bottle_1l.obj model is oriented **horizontally** (laying on its side), but the pre-baked UV coordinates assume it's **vertical** (standing upright).

**Evidence:**
1. User reports horizontal slider moves element longitudinally (along bottle length)
2. This would happen if:
   - Model's length axis (bottle length) is aligned with world Y-axis
   - UV V-coordinate maps to world Y-axis
   - Therefore, offsetY (vertical slider) affects circumference
   - And offsetX (horizontal slider) affects length

**Visual Representation:**
```
Expected (Vertical Bottle):
  Y-axis (up) = Bottle height = UV V-coordinate = offsetY slider
  XZ-plane (around) = Bottle circumference = UV U-coordinate = offsetX slider

Actual (Horizontal Bottle):
  Y-axis (up) = Bottle LENGTH = UV V-coordinate = offsetY slider ❌
  XZ-plane (around) = Bottle HEIGHT = UV U-coordinate = offsetX slider ❌
```

---

**Hypothesis B: UV Coordinate Rotation**

**Theory:** The pre-baked UV coordinates in bottle_1l.obj are rotated 90° from expected orientation.

**Evidence:**
- Model file was exported from 3ds Max (see bottle_1l.mtl header)
- Export settings may have used different axis conventions
- UV unwrap may have been done with bottle in horizontal orientation

---

**Hypothesis C: Texture Canvas Dimension Swap**

**Theory:** The label texture canvas dimensions (2048×1024) are swapped for pkgtype5.

**Evidence:**
- Less likely, as this would affect all elements (logo, text, backside)
- User only mentions backside element issue

---

## Top 3 Recommendations

### **Recommendation 1: Apply Runtime Cylindrical UV Mapping (Most Reliable)**

**Approach:** Generate UV coordinates at runtime (like pkgtype4) instead of using pre-baked UVs.

**Implementation:**
```typescript
} else if (currentPackage === 'pkgtype5') {
  if (meshName.toLowerCase().includes('bottle')) {
    // Apply cylindrical UV mapping to override pre-baked UVs
    applyCylindricalUVMapping(child);
    
    // Apply geometry transforms if needed (test carefully)
    // child.geometry.scale(-1, 1, 1);
    // child.geometry.computeVertexNormals();
    
    child.userData.isCanBody = true;
  }
  // ... rest of material application
}
```

**Pros:**
- ✅ **Most reliable** - Uses proven UV mapping logic from pkgtype4
- ✅ **Consistent** - Same UV generation for all cylindrical packages
- ✅ **Flexible** - Can adjust UV mapping parameters if needed
- ✅ **No model file changes** - Works with existing bottle_1l.obj

**Cons:**
- ❌ **May require geometry transforms** - Model might need rotation/scaling
- ❌ **Risk of disappearing model** - Comment says "DO NOT apply geometry transforms (causes model to disappear)"
- ❌ **Testing required** - Need to verify all meshes (Bottle, Cap, Water) render correctly

**Complexity:** 🟡 **Medium** (1-2 hours with testing)  
**Risk:** 🟡 **Medium** - Previous attempt caused model to disappear, need careful testing  
**Confidence:** 🟢 **High (85%)** - This is the standard solution for cylindrical UV mapping

---

### **Recommendation 2: Swap offsetX/offsetY Interpretation for Backside Element (Quick Fix)**

**Approach:** Swap the axis mapping for backside element only, treating offsetX as vertical and offsetY as horizontal.

**Implementation:**
```typescript
// In labelTextureGenerator.ts, lines 157-165:

// ORIGINAL:
const backsideOffsetX = (width * backsideTransform.offsetX) / 100;
const backsideOffsetY = (safeZoneHeight * backsideTransform.offsetY) / 100;

// SWAPPED FOR PKGTYPE5:
// Detect if this is for pkgtype5 (pass packageType parameter)
const isHorizontalBottle = packageConfig.type === 'pkgtype5';

const backsideOffsetX = isHorizontalBottle 
  ? (safeZoneHeight * backsideTransform.offsetY) / 100  // Swap: use offsetY for X
  : (width * backsideTransform.offsetX) / 100;

const backsideOffsetY = isHorizontalBottle
  ? (width * backsideTransform.offsetX) / 100  // Swap: use offsetX for Y
  : (safeZoneHeight * backsideTransform.offsetY) / 100;
```

**Pros:**
- ✅ **Quick fix** - Minimal code changes
- ✅ **Low risk** - Only affects backside element positioning
- ✅ **No model changes** - Works with existing pre-baked UVs
- ✅ **No geometry transforms** - Avoids model disappearing issue

**Cons:**
- ❌ **Band-aid solution** - Doesn't fix root cause
- ❌ **Inconsistent** - Backside element uses different coordinate system than logo/text
- ❌ **Confusing for users** - Horizontal slider labeled "Horizontal" but moves vertically
- ❌ **May not fully solve** - If entire UV map is rotated, this only fixes one element

**Complexity:** 🟢 **Low** (30 minutes)  
**Risk:** 🟢 **Very Low** - Isolated change, easy to revert  
**Confidence:** 🟡 **Medium (70%)** - Fixes symptom but not root cause

---

### **Recommendation 3: Rotate Model Geometry 90° at Load Time (Permanent Fix)**

**Approach:** Rotate the entire bottle_1l model 90° around X-axis to make it stand upright, then apply cylindrical UV mapping.

**Implementation:**
```typescript
} else if (currentPackage === 'pkgtype5') {
  if (meshName.toLowerCase().includes('bottle')) {
    // Rotate model 90° to stand upright (was laying on side)
    child.geometry.rotateX(Math.PI / 2);  // 90° rotation around X-axis
    
    // Apply cylindrical UV mapping for vertical bottle
    applyCylindricalUVMapping(child);
    
    // Flip normals if needed
    child.geometry.scale(-1, 1, 1);
    child.geometry.computeVertexNormals();
    
    child.userData.isCanBody = true;
  }
  // ... rest of material application
}
```

**Pros:**
- ✅ **Fixes root cause** - Aligns model orientation with UV expectations
- ✅ **Consistent coordinate system** - All elements (logo, text, backside) work correctly
- ✅ **Standard approach** - Matches pkgtype4 implementation
- ✅ **Future-proof** - Any new elements will work correctly

**Cons:**
- ❌ **High risk** - Geometry transforms previously caused model to disappear
- ❌ **Affects all meshes** - Cap and Water meshes may need separate handling
- ❌ **Complex testing** - Need to verify all materials, lighting, and interactions
- ❌ **May require camera adjustment** - Rotated model may need different camera angles

**Complexity:** 🔴 **High** (2-3 hours with testing)  
**Risk:** 🔴 **High** - Previous attempts caused model disappearance  
**Confidence:** 🟡 **Medium (75%)** - Correct solution but high implementation risk

---

## Comparison Matrix

| Criterion | Rec 1: Runtime UV Mapping | Rec 2: Swap Axes | Rec 3: Rotate Geometry |
|-----------|--------------------------|------------------|------------------------|
| **Fixes Root Cause** | ⭐⭐⭐⭐ Good | ⭐⭐ Poor | ⭐⭐⭐⭐⭐ Excellent |
| **Consistency** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Poor | ⭐⭐⭐⭐⭐ Excellent |
| **Implementation Time** | 🟡 1-2 hours | 🟢 30 minutes | 🔴 2-3 hours |
| **Risk** | 🟡 Medium | 🟢 Very Low | 🔴 High |
| **User Experience** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Excellent |
| **Maintainability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Poor | ⭐⭐⭐⭐⭐ Excellent |
| **Confidence** | 🟢 85% | 🟡 70% | 🟡 75% |

---

## Recommended Action Plan

### **Phase 1: Quick Validation (Recommendation 2)**
**Goal:** Confirm hypothesis with minimal risk

**Steps:**
1. Implement axis swap for backside element only
2. Test if horizontal slider now moves element circumferentially
3. If successful, this confirms the orientation mismatch hypothesis

**Time:** 30 minutes  
**Risk:** Very Low  
**Outcome:** Validates root cause, provides temporary workaround

---

### **Phase 2: Proper Fix (Recommendation 1)**
**Goal:** Implement reliable long-term solution

**Steps:**
1. Apply `applyCylindricalUVMapping()` to pkgtype5 bottle mesh
2. Test without geometry transforms first
3. If model disappears, incrementally add transforms (rotation, scaling)
4. Test all meshes (Bottle, Cap, Water) and wrapper toggle
5. Adjust camera positioning if needed

**Time:** 1-2 hours  
**Risk:** Medium (with careful incremental testing)  
**Outcome:** Consistent UV mapping across all cylindrical packages

---

### **Phase 3: Optional Enhancement (Recommendation 3)**
**Goal:** Achieve perfect model orientation (if Phase 2 doesn't fully resolve)

**Steps:**
1. Only pursue if Recommendation 1 doesn't work
2. Rotate geometry 90° around X-axis
3. Comprehensive testing of all features
4. Camera angle adjustments

**Time:** 2-3 hours  
**Risk:** High  
**Outcome:** Perfect alignment, but significant testing required

---

## Conclusion

**Root Cause (High Confidence - 85%):**
The bottle_1l.obj model is oriented horizontally with pre-baked UV coordinates that assume vertical orientation, causing axis mismatch between texture canvas and 3D model.

**Recommended Path:**
1. **Immediate:** Implement Recommendation 2 (axis swap) to validate hypothesis
2. **Short-term:** Implement Recommendation 1 (runtime UV mapping) for proper fix
3. **Long-term:** Consider Recommendation 3 (geometry rotation) only if needed

**Risk Mitigation:**
- Start with lowest-risk solution (Rec 2) to confirm hypothesis
- Incremental testing for Rec 1 to avoid model disappearance
- Keep Rec 3 as fallback option

---

**Next Steps:**
1. Get user approval for recommended approach
2. Implement Phase 1 (axis swap validation)
3. Report results and proceed to Phase 2 if successful
