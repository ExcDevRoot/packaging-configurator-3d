# Option 3: Rotate Model Geometry 90° - Comprehensive Implementation Guide

**Date:** Nov 8, 2025  
**Goal:** Fix pkgtype5 backside element orientation by rotating model geometry to stand upright  
**Rollback Checkpoint:** `dc04dd9a` (verified accessible)

---

## Pre-Implementation Checklist

### ✅ **Rollback Verification**

**Current Checkpoint:** `df8310c` (pkgtype4 fix complete)  
**Rollback Target:** `dc04dd9a` (before current session changes)

**Rollback Command:**
```bash
# Via webdev_rollback_checkpoint tool
webdev_rollback_checkpoint(version_id='dc04dd9a')
```

**Verification Steps:**
1. ✅ Checkpoint `dc04dd9a` exists in git history
2. ✅ Checkpoint is 2 commits behind current HEAD
3. ✅ Rollback tool available and tested
4. ✅ User can manually rollback via Management UI → Dashboard → Checkpoint card → "Rollback" button

**Safety Net:** If Option 3 causes issues, we can rollback to `dc04dd9a` and lose only:
- Current debug logging additions
- pkgtype4 multi-material fix (can be re-applied separately)

---

## Implementation Strategy

### **Incremental Approach (Minimize Risk)**

We'll implement Option 3 in **5 small steps** with testing checkpoints after each step:

1. **Step 1:** Add rotation only (no UV mapping, no scaling)
2. **Step 2:** Add cylindrical UV mapping
3. **Step 3:** Add geometry scaling if needed
4. **Step 4:** Handle Cap and Water meshes separately
5. **Step 5:** Adjust camera angles if needed

**At each step:**
- Test in browser
- If model disappears or breaks → rollback to previous step
- If step succeeds → continue to next step

---

## Step-by-Step Implementation

### **Step 1: Add 90° Rotation Only**

**Goal:** Rotate bottle mesh 90° around X-axis to stand upright

**Location:** `client/src/components/Package3DModelViewer.tsx` (Lines 596-616)

**Current Code:**
```typescript
} else if (currentPackage === 'pkgtype5') {
  // 1L Bottle - mark bottle mesh for wrapper toggle handling
  // DO NOT apply geometry transforms in System 1 (causes model to disappear)
  if (meshName.toLowerCase().includes('bottle')) {
    child.userData.isCanBody = true;
    console.log('[pkgtype5 System 1] Marked bottle mesh for wrapper toggle:', meshName);
  }
  
  // Apply materials using bottleMaterialManager
  const newMaterials = applyBottleMaterials(
    child.material,
    false,  // Always start with wrapper OFF (clear glass)
    packageConfig,
    null,  // No texture in System 1
    meshName,
    'pkgtype5'
  );
  // pkgtype5: Single material per mesh - extract first element (correct)
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
  console.log('[pkgtype5 System 1] Applied base materials for mesh:', meshName, 'Material type:', child.material.type);
}
```

**Modified Code (Step 1):**
```typescript
} else if (currentPackage === 'pkgtype5') {
  // 1L Bottle - mark bottle mesh for wrapper toggle handling
  if (meshName.toLowerCase().includes('bottle')) {
    console.log('[pkgtype5 Step 1] Applying 90° rotation to bottle mesh:', meshName);
    
    // STEP 1: Rotate geometry 90° around X-axis to stand upright
    // Model is laying horizontally (length along Y-axis), rotate to vertical
    child.geometry.rotateX(Math.PI / 2);  // 90° = π/2 radians
    
    console.log('[pkgtype5 Step 1] Rotation applied, checking bounding box...');
    child.geometry.computeBoundingBox();
    const bbox = child.geometry.boundingBox!;
    console.log('[pkgtype5 Step 1] Bounding box after rotation:', {
      min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
      max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
      height: bbox.max.y - bbox.min.y,
      radius: Math.max(bbox.max.x - bbox.min.x, bbox.max.z - bbox.min.z) / 2
    });
    
    child.userData.isCanBody = true;
    console.log('[pkgtype5 Step 1] Bottle mesh rotated and marked');
  } else if (meshName.toLowerCase().includes('cap')) {
    console.log('[pkgtype5 Step 1] Cap mesh detected:', meshName);
    // Cap mesh - apply same rotation
    child.geometry.rotateX(Math.PI / 2);
    console.log('[pkgtype5 Step 1] Cap mesh rotated');
  } else if (meshName.toLowerCase().includes('water')) {
    console.log('[pkgtype5 Step 1] Water mesh detected:', meshName);
    // Water mesh - apply same rotation
    child.geometry.rotateX(Math.PI / 2);
    console.log('[pkgtype5 Step 1] Water mesh rotated');
  }
  
  // Apply materials using bottleMaterialManager
  const newMaterials = applyBottleMaterials(
    child.material,
    false,  // Always start with wrapper OFF (clear glass)
    packageConfig,
    null,  // No texture in System 1
    meshName,
    'pkgtype5'
  );
  // pkgtype5: Single material per mesh - extract first element (correct)
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
  console.log('[pkgtype5 Step 1] Applied base materials for mesh:', meshName, 'Material type:', child.material.type);
}
```

**Expected Outcome:**
- ✅ Bottle model rotates 90° and stands upright
- ✅ Cap and Water meshes also rotate to stay aligned
- ✅ Model remains visible (no disappearance)
- ⚠️ Texture may be distorted (pre-baked UVs don't match new orientation)

**Testing Steps:**
1. Refresh browser
2. Select 1L Bottle
3. Check console logs for rotation confirmation
4. Verify model is visible and upright
5. Check if cap and water are aligned with bottle

**Rollback If:**
- Model disappears completely
- Model is severely distorted (not just texture)
- Console shows geometry errors

---

### **Step 2: Add Cylindrical UV Mapping**

**Goal:** Generate new UV coordinates for rotated bottle

**Prerequisites:** Step 1 successful (model visible and upright)

**Modified Code (Step 2):**
```typescript
} else if (currentPackage === 'pkgtype5') {
  // 1L Bottle - mark bottle mesh for wrapper toggle handling
  if (meshName.toLowerCase().includes('bottle')) {
    console.log('[pkgtype5 Step 2] Applying rotation + UV mapping to bottle mesh:', meshName);
    
    // STEP 1: Rotate geometry 90° around X-axis to stand upright
    child.geometry.rotateX(Math.PI / 2);
    
    // STEP 2: Apply cylindrical UV mapping for rotated bottle
    console.log('[pkgtype5 Step 2] Applying cylindrical UV mapping...');
    applyCylindricalUVMapping(child);
    console.log('[pkgtype5 Step 2] UV mapping applied');
    
    // Debug: Check UV coordinates
    const uvs = child.geometry.attributes.uv;
    if (uvs) {
      console.log('[pkgtype5 Step 2] UV attribute exists:', {
        count: uvs.count,
        itemSize: uvs.itemSize,
        sampleUV: [uvs.getX(0), uvs.getY(0)]
      });
    } else {
      console.error('[pkgtype5 Step 2] UV attribute missing!');
    }
    
    child.userData.isCanBody = true;
    console.log('[pkgtype5 Step 2] Bottle mesh rotated, UV mapped, and marked');
  } else if (meshName.toLowerCase().includes('cap')) {
    console.log('[pkgtype5 Step 2] Cap mesh - rotation only (no UV mapping)');
    child.geometry.rotateX(Math.PI / 2);
  } else if (meshName.toLowerCase().includes('water')) {
    console.log('[pkgtype5 Step 2] Water mesh - rotation only (no UV mapping)');
    child.geometry.rotateX(Math.PI / 2);
  }
  
  // Apply materials using bottleMaterialManager
  const newMaterials = applyBottleMaterials(
    child.material,
    false,  // Always start with wrapper OFF (clear glass)
    packageConfig,
    null,  // No texture in System 1
    meshName,
    'pkgtype5'
  );
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
  console.log('[pkgtype5 Step 2] Applied base materials for mesh:', meshName);
}
```

**Expected Outcome:**
- ✅ Bottle model upright with new UV coordinates
- ✅ Texture wraps correctly around bottle (no distortion)
- ✅ Backside element horizontal slider moves circumferentially (GOAL!)
- ⚠️ Texture may be inside-out (normals pointing inward)

**Testing Steps:**
1. Refresh browser
2. Select 1L Bottle
3. Toggle wrapper ON
4. Check if label texture appears
5. Use backside element horizontal slider
6. Verify slider moves element around bottle (not up/down)

**Rollback If:**
- Model disappears
- Texture is completely missing
- UV mapping errors in console

---

### **Step 3: Add Geometry Scaling (If Needed)**

**Goal:** Flip normals to point outward if texture is inside-out

**Prerequisites:** Step 2 successful (model visible, texture present)

**When to Apply:** Only if texture appears inside-out or inverted

**Modified Code (Step 3):**
```typescript
if (meshName.toLowerCase().includes('bottle')) {
  console.log('[pkgtype5 Step 3] Applying rotation + UV mapping + scaling to bottle mesh:', meshName);
  
  // STEP 1: Rotate geometry 90° around X-axis
  child.geometry.rotateX(Math.PI / 2);
  
  // STEP 2: Apply cylindrical UV mapping
  applyCylindricalUVMapping(child);
  
  // STEP 3: Flip normals to point outward (fixes inside-out texture)
  console.log('[pkgtype5 Step 3] Flipping normals...');
  child.geometry.scale(-1, 1, 1);  // Flip X-axis to invert mesh
  child.geometry.computeVertexNormals();  // Recompute normals
  console.log('[pkgtype5 Step 3] Normals flipped and recomputed');
  
  child.userData.isCanBody = true;
  console.log('[pkgtype5 Step 3] Bottle mesh fully transformed');
}
```

**Expected Outcome:**
- ✅ Texture faces outward (correct orientation)
- ✅ Lighting and reflections work correctly
- ✅ All materials render properly

**Testing Steps:**
1. Refresh browser
2. Select 1L Bottle
3. Rotate camera around bottle
4. Check if texture is visible from all angles
5. Verify lighting looks correct (not inverted)

**Rollback If:**
- Model becomes invisible
- Texture disappears
- Severe rendering artifacts

---

### **Step 4: Fine-Tune Cap and Water Meshes**

**Goal:** Ensure cap and water meshes align correctly with rotated bottle

**Prerequisites:** Step 3 successful (bottle fully working)

**Modified Code (Step 4):**
```typescript
} else if (meshName.toLowerCase().includes('cap')) {
  console.log('[pkgtype5 Step 4] Cap mesh - applying rotation');
  child.geometry.rotateX(Math.PI / 2);
  
  // Check if cap needs additional transforms
  child.geometry.computeBoundingBox();
  const bbox = child.geometry.boundingBox!;
  console.log('[pkgtype5 Step 4] Cap bounding box:', {
    min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
    max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z }
  });
  
  // If cap is misaligned, apply additional transforms here
  // Example: child.geometry.translate(0, offsetY, 0);
  
} else if (meshName.toLowerCase().includes('water')) {
  console.log('[pkgtype5 Step 4] Water mesh - applying rotation');
  child.geometry.rotateX(Math.PI / 2);
  
  // Check if water needs additional transforms
  child.geometry.computeBoundingBox();
  const bbox = child.geometry.boundingBox!;
  console.log('[pkgtype5 Step 4] Water bounding box:', {
    min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
    max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z }
  });
  
  // If water is misaligned, apply additional transforms here
}
```

**Expected Outcome:**
- ✅ Cap sits correctly on top of bottle
- ✅ Water/liquid fills bottle interior correctly
- ✅ All three meshes aligned and proportional

**Testing Steps:**
1. Refresh browser
2. Select 1L Bottle
3. Rotate camera to view from all angles
4. Check cap alignment (should be at top)
5. Check water visibility (should be inside bottle)
6. Toggle wrapper ON/OFF to verify all states

**Rollback If:**
- Cap or water mesh disappears
- Severe misalignment (not fixable with translation)

---

### **Step 5: Adjust Camera Angles (Optional)**

**Goal:** Update default camera positions for rotated bottle

**Prerequisites:** Steps 1-4 successful (all meshes working)

**Location:** `client/src/store/configStore.ts` or camera preset definitions

**Analysis Required:**
1. Test current camera presets (Front, Back, Side, Angle)
2. Determine if rotation changed optimal viewing angles
3. Adjust camera positions if needed

**Example Adjustments:**
```typescript
// If bottle rotation changed camera framing
const pkgtype5CameraPresets = {
  front: { x: 0, y: 5, z: 25 },    // Adjusted for upright bottle
  back: { x: 0, y: 5, z: -25 },
  side: { x: 25, y: 5, z: 0 },
  angle: { x: 18, y: 10, z: 18 }
};
```

**Expected Outcome:**
- ✅ Camera angles frame bottle optimally
- ✅ All preset views show bottle clearly
- ✅ Zoom range appropriate for bottle size

**Testing Steps:**
1. Test all 4 camera presets (Front, Back, Side, Angle)
2. Verify bottle is centered and visible in each view
3. Test zoom in/out range
4. Compare with pkgtype4 camera behavior

---

## Risk Mitigation Strategies

### **Risk 1: Model Disappears After Rotation**

**Symptoms:**
- Blank viewport
- Console shows "Model Loaded: YES" but nothing visible
- No geometry errors in console

**Possible Causes:**
1. Rotation moved model outside camera view frustum
2. Bounding box calculation incorrect after rotation
3. Normals pointing wrong direction (all faces culled)

**Mitigation:**
```typescript
// After rotation, recalculate bounding box and center model
child.geometry.computeBoundingBox();
child.geometry.computeBoundingSphere();

// Check if model is outside camera view
const bbox = child.geometry.boundingBox!;
console.log('[DEBUG] Model bounds:', {
  min: bbox.min,
  max: bbox.max,
  center: bbox.getCenter(new THREE.Vector3())
});

// If needed, translate model back to origin
const center = bbox.getCenter(new THREE.Vector3());
child.geometry.translate(-center.x, -center.y, -center.z);
```

**Rollback Trigger:** If model remains invisible after debugging

---

### **Risk 2: Texture Distortion or Missing**

**Symptoms:**
- Model visible but texture stretched/warped
- Label elements in wrong positions
- Texture appears black or white

**Possible Causes:**
1. UV mapping failed
2. UV coordinates out of 0-1 range
3. Texture not applied to material

**Mitigation:**
```typescript
// Verify UV coordinates are valid
const uvs = child.geometry.attributes.uv;
if (uvs) {
  let minU = Infinity, maxU = -Infinity;
  let minV = Infinity, maxV = -Infinity;
  
  for (let i = 0; i < uvs.count; i++) {
    const u = uvs.getX(i);
    const v = uvs.getY(i);
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }
  
  console.log('[DEBUG] UV range:', { minU, maxU, minV, maxV });
  
  // UVs should be roughly 0-1 range
  if (minU < -0.1 || maxU > 1.1 || minV < -0.1 || maxV > 1.1) {
    console.warn('[DEBUG] UV coordinates out of normal range!');
  }
}
```

**Rollback Trigger:** If UV mapping consistently fails

---

### **Risk 3: Cap/Water Mesh Misalignment**

**Symptoms:**
- Cap floating above/below bottle
- Water mesh not inside bottle
- Meshes rotated at different angles

**Possible Causes:**
1. Meshes have different pivot points
2. Rotation applied inconsistently
3. Model file has pre-applied transforms

**Mitigation:**
```typescript
// Apply same rotation to all meshes
const rotationAngle = Math.PI / 2;

if (meshName.toLowerCase().includes('bottle')) {
  child.geometry.rotateX(rotationAngle);
} else if (meshName.toLowerCase().includes('cap')) {
  child.geometry.rotateX(rotationAngle);
  // If misaligned, add translation
  // child.geometry.translate(0, offsetY, 0);
} else if (meshName.toLowerCase().includes('water')) {
  child.geometry.rotateX(rotationAngle);
  // If misaligned, add translation
  // child.geometry.translate(0, offsetY, 0);
}
```

**Rollback Trigger:** If alignment cannot be fixed with translation

---

## Testing Checklist

After each step, verify:

### **Visual Tests:**
- [ ] Model is visible in viewport
- [ ] Model is upright (cap at top, base at bottom)
- [ ] Model is centered in view
- [ ] All meshes (Bottle, Cap, Water) are present
- [ ] Meshes are aligned correctly
- [ ] Lighting and shadows look correct

### **Texture Tests:**
- [ ] Wrapper ON: Label texture appears
- [ ] Wrapper ON: Logo is visible and positioned correctly
- [ ] Wrapper ON: Text is readable
- [ ] Wrapper ON: Backside element is visible
- [ ] Wrapper OFF: Transparent glass appearance
- [ ] Wrapper OFF: Liquid visible inside

### **Interaction Tests:**
- [ ] Camera rotation works smoothly
- [ ] Camera zoom in/out works
- [ ] All 4 camera presets work (Front, Back, Side, Angle)
- [ ] Wrapper toggle ON/OFF works
- [ ] Logo slider moves logo correctly
- [ ] Text slider moves text correctly
- [ ] **Backside horizontal slider moves element circumferentially (GOAL!)**
- [ ] Backside vertical slider moves element up/down

### **Console Tests:**
- [ ] No geometry errors
- [ ] No material errors
- [ ] No UV mapping errors
- [ ] Bounding box values look reasonable
- [ ] UV coordinates in 0-1 range

---

## Rollback Procedure

### **Method 1: Via Tool (Recommended)**
```typescript
webdev_rollback_checkpoint(
  brief: 'Rollback to dc04dd9a after Option 3 failed',
  version_id: 'dc04dd9a'
)
```

### **Method 2: Via Management UI**
1. Open Management UI (right panel)
2. Click "Dashboard" tab
3. Find checkpoint card for `dc04dd9a`
4. Click "Rollback" button
5. Confirm rollback

### **Method 3: Via Git (Manual)**
```bash
cd /home/ubuntu/packaging-configurator-3d
git reset --hard dc04dd9a
pnpm install  # Reinstall dependencies if needed
```

### **Verification After Rollback:**
1. Refresh browser
2. Select 1L Bottle
3. Verify bright blue test bottle appears (dc04dd9a state)
4. Verify wrapper toggle works
5. Verify pkgtype4 is broken again (expected - we rolled back the fix)

**Note:** After rollback, we can re-apply pkgtype4 fix separately if needed.

---

## Success Criteria

Option 3 is considered **successful** if:

1. ✅ Model is visible and upright
2. ✅ All meshes (Bottle, Cap, Water) aligned correctly
3. ✅ Wrapper ON: Label texture renders correctly
4. ✅ Wrapper OFF: Transparent glass with visible liquid
5. ✅ **Backside horizontal slider moves element circumferentially**
6. ✅ Backside vertical slider moves element up/down
7. ✅ No console errors
8. ✅ Camera presets work correctly
9. ✅ Wrapper toggle works smoothly
10. ✅ pkgtype4 still works (multi-material fix intact)

---

## Estimated Timeline

| Step | Description | Time | Cumulative |
|------|-------------|------|------------|
| Step 1 | Add rotation only | 15 min | 15 min |
| Test 1 | Verify model visible | 5 min | 20 min |
| Step 2 | Add UV mapping | 15 min | 35 min |
| Test 2 | Verify texture renders | 10 min | 45 min |
| Step 3 | Add scaling (if needed) | 10 min | 55 min |
| Test 3 | Verify normals correct | 5 min | 60 min |
| Step 4 | Fine-tune cap/water | 15 min | 75 min |
| Test 4 | Verify alignment | 10 min | 85 min |
| Step 5 | Adjust camera (if needed) | 15 min | 100 min |
| Test 5 | Full regression test | 20 min | 120 min |

**Total Estimated Time:** 2 hours (with testing)  
**Buffer for Issues:** +1 hour (total 3 hours max)

---

## Decision Points

### **After Step 1:**
- ✅ Model visible → Proceed to Step 2
- ❌ Model invisible → **ROLLBACK** to dc04dd9a

### **After Step 2:**
- ✅ Texture renders → Proceed to Step 3 (or skip if normals OK)
- ❌ Texture missing → Debug UV mapping or **ROLLBACK**

### **After Step 3:**
- ✅ Normals correct → Proceed to Step 4
- ❌ Model broken → **ROLLBACK** to dc04dd9a

### **After Step 4:**
- ✅ All meshes aligned → Proceed to Step 5 (optional)
- ❌ Misalignment unfixable → **ROLLBACK** to dc04dd9a

### **After Step 5:**
- ✅ All tests pass → **SUCCESS! Create checkpoint**
- ❌ Critical issues → **ROLLBACK** to dc04dd9a

---

## Post-Implementation

### **If Successful:**
1. Create new checkpoint with descriptive message
2. Update todo.md to mark backside orientation as fixed
3. Remove debug logging (Option 3 from earlier notes)
4. Test pkgtype4 to ensure multi-material fix still works
5. Document final camera angles and transforms

### **If Failed (Rollback Required):**
1. Rollback to dc04dd9a
2. Document failure reasons in analysis doc
3. Consider Option 1 (Runtime UV Mapping) as alternative
4. Re-apply pkgtype4 multi-material fix separately
5. Discuss next steps with user

---

## Conclusion

**Rollback Safety:** ✅ **100% Guaranteed**
- Checkpoint dc04dd9a verified accessible
- Multiple rollback methods available
- Clear rollback procedure documented

**Implementation Safety:** 🟡 **Medium Risk, High Control**
- 5 incremental steps with testing checkpoints
- Clear rollback triggers at each step
- Comprehensive debugging strategies
- Estimated 2-3 hours with buffer

**Recommendation:**
- Proceed with Option 3 using incremental approach
- Stop and rollback at first sign of critical failure
- Have Option 1 (Runtime UV Mapping) ready as backup plan

**Ready to proceed when you give the go-ahead!** 🚀
