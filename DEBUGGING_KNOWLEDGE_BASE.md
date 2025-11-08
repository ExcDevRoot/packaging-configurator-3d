# Debugging Knowledge Base - 3D Packaging Configurator

## Critical Pattern: Material Array Assignment Bug

### Problem Signature
**Symptoms:**
- 3D model loads successfully (console shows "OBJ loaded successfully")
- Model has correct mesh count (console shows "Object children count: N")
- Materials are being created (console shows material properties)
- **BUT: Model is invisible in viewport**
- Material property changes (metalness, roughness) have no effect
- Color changes have no effect

### Root Cause
**Material manager functions return arrays, but assignment expects single material:**

```typescript
// ❌ WRONG - Assigns array to material property
const newMaterials = applyBottleMaterials(...);
child.material = newMaterials;  // newMaterials is [Material], not Material

// ✅ CORRECT - Extracts first element from array
const newMaterials = applyBottleMaterials(...);
child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
```

### Why This Happens
Three.js mesh materials can be:
- Single material: `THREE.Material`
- Material array: `THREE.Material[]` (for multi-material meshes)

Our material manager functions return `[material]` (array) for consistency, but when assigning to a single-material mesh, we must extract the first element.

### Detection Method
1. **Check console logs:**
   - ✅ Model loading successful
   - ✅ Materials being created with correct properties
   - ✅ Mesh traversal happening
   - ❌ Model not visible

2. **Test with solid color:**
   - Change material color to bright, contrasting color (e.g., `#0088ff` bright blue)
   - If still invisible → material assignment issue
   - If visible → color/texture/transparency issue

3. **Inspect material assignment:**
   - Search codebase for `child.material = newMaterials`
   - Check if `newMaterials` is array or single material
   - Verify proper extraction if array

### Solution Pattern
**Find all material assignments:**
```bash
grep -n "child.material = .*newMaterials" client/src/**/*.tsx
```

**Fix each occurrence:**
```typescript
// Before
child.material = newMaterials;

// After
child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
```

**Add debug logging:**
```typescript
child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
console.log(`[DEBUG] Applied material to ${child.name}, type: ${child.material.type}`);
```

### Prevention
1. **Consistent return types:** Document whether functions return `Material` or `Material[]`
2. **Type safety:** Use TypeScript to enforce correct types
3. **Helper function:** Create wrapper for safe assignment:

```typescript
function assignMaterial(mesh: THREE.Mesh, materials: THREE.Material | THREE.Material[]) {
  mesh.material = Array.isArray(materials) ? materials[0] : materials;
}
```

4. **Code review checklist:** Always check material assignments when adding new package types

---

## Debugging Workflow for Invisible 3D Models

### Phase 1: Confirm Model Loading
```
✅ Check: [OBJ LOADER] SUCCESS callback triggered
✅ Check: [3D Model] OBJ loaded successfully
✅ Check: [3D Model] Object children count: N (N > 0)
```
**If fails:** Model file path, OBJ syntax, or loader configuration issue

### Phase 2: Confirm Material Creation
```
✅ Check: [materialManager] Processing mesh: {meshName}
✅ Check: [materialManager] Material created: {properties}
```
**If fails:** Material manager not being called, or crashing silently

### Phase 3: Confirm Material Assignment
```
✅ Check: [System 1/2] Applied materials to mesh: {meshName}
✅ Check: Material type: MeshStandardMaterial (or expected type)
```
**If fails:** Assignment logic issue (likely array vs single material)

### Phase 4: Test Visibility
**Method A: Change background color**
- Dark background → white material should be visible
- Light background → dark material should be visible

**Method B: Use test color**
- Apply bright, contrasting color (e.g., `#0088ff`)
- If visible → original color was blending into background
- If invisible → material not being applied

**Method C: Check material properties**
- `transparent: true` + `opacity: 0` → invisible by design
- `visible: false` → mesh hidden
- `side: THREE.BackSide` → only visible from inside

### Phase 5: Isolate Issue
**Test wrapper toggle:**
- If one state works, other doesn't → state-specific material issue
- If neither works → model loading or assignment issue

**Test other package types:**
- If other packages work → package-specific material logic issue
- If all fail → global material system issue

---

## Common Pitfalls

### 1. White Material on White Background
**Symptom:** Model loads but appears invisible  
**Solution:** Change background color or material color to create contrast

### 2. Transparency Making Model Invisible
**Symptom:** Model invisible, console shows `opacity: 0.3` or lower  
**Solution:** Increase opacity to 0.5+ or set `transparent: false`

### 3. Material Array Assignment
**Symptom:** Model invisible, materials created but not applied  
**Solution:** Extract first element from array before assignment

### 4. Texture Not Rendering
**Symptom:** Model visible but texture/label not showing  
**Solution:** Check `material.map` is set, texture is loaded, UV mapping is correct

### 5. Mesh Normals Inverted
**Symptom:** Model visible from inside, invisible from outside  
**Solution:** Flip geometry scale or recompute normals

---

## Scaling Considerations

### When Adding New Package Types
1. **Copy working pattern** from existing package (e.g., bottle-750ml)
2. **Test wrapper toggle** immediately after basic rendering works
3. **Verify material assignment** uses array extraction pattern
4. **Add debug logging** for material type and properties
5. **Test with contrasting colors** before implementing textures

### When Adding New Materials
1. **Document return type** (Material vs Material[])
2. **Use consistent patterns** across all material functions
3. **Test with simple colors** before complex textures
4. **Verify transparency settings** don't make model invisible

### When Scaling to Multiple Brands/Products
1. **Centralize material logic** in material manager utilities
2. **Use configuration objects** instead of hardcoded values
3. **Implement material presets** for common combinations
4. **Add material validation** to catch issues early

---

## Quick Reference Checklist

**Model Not Visible?**
- [ ] Check console for model loading success
- [ ] Check console for material creation logs
- [ ] Search for `child.material = newMaterials` assignments
- [ ] Verify array extraction: `Array.isArray(newMaterials) ? newMaterials[0] : newMaterials`
- [ ] Test with bright contrasting color (e.g., `#0088ff`)
- [ ] Check background color creates contrast
- [ ] Verify `opacity` is > 0.5 if `transparent: true`
- [ ] Test wrapper toggle (both ON and OFF states)
- [ ] Compare with working package type

**Material Changes Not Applying?**
- [ ] Verify material assignment is correct (not array)
- [ ] Check if `material.needsUpdate = true` is needed
- [ ] Confirm material is being applied to correct mesh
- [ ] Test if mesh has `userData.isCanBody` or equivalent flag

**Wrapper Toggle Not Working?**
- [ ] Check if both wrapper ON and OFF materials are defined
- [ ] Verify System 2 useEffect has correct dependencies
- [ ] Confirm material assignment happens in both states
- [ ] Test if texture pre-generation is blocking (Option 2 issue)

---

## Lessons Learned - PkgType5 (1L Bottle) Case Study

### Timeline
1. **Initial Issue:** Bottle invisible with wrapper ON and OFF
2. **First Hypothesis:** White material on white background → Changed background to dark gray
3. **Second Hypothesis:** Transparency too low → Increased opacity, changed to MeshStandardMaterial
4. **Third Hypothesis:** Advanced material properties → Removed transmission, IOR, clearcoat
5. **Fourth Hypothesis:** Geometry transforms breaking model → Removed UV mapping, scale flip
6. **Rollback:** Reverted to checkpoint `dae6416f` to known state
7. **Breakthrough:** User reported material sliders had no effect → Indicated material not applied
8. **Root Cause Found:** Material array assignment bug in 5 locations
9. **Solution:** Extract first element from array before assignment
10. **Verification:** Test color (bright blue) confirmed material rendering

### Key Insight
**User feedback was critical:** "With wrapper ON I've changed the material and it didn't become visible" → This revealed the material wasn't being applied at all, not just invisible due to color/transparency.

### What Worked
- ✅ Systematic debugging with console logs
- ✅ Testing with contrasting colors
- ✅ Rollback to known good state
- ✅ Listening to user observations
- ✅ Searching codebase for pattern (`child.material = newMaterials`)

### What Didn't Work
- ❌ Changing material properties (color, opacity, transparency)
- ❌ Simplifying material type (MeshPhysicalMaterial → MeshStandardMaterial)
- ❌ Removing geometry transforms
- ❌ Changing background color

### Takeaway
**Material assignment bugs are silent failures.** The material is created successfully, logs show correct properties, but the mesh doesn't receive it. Always verify the assignment itself, not just the material creation.

---

## Future Improvements

### 1. Type-Safe Material Assignment
```typescript
// Create helper function with proper typing
function assignMeshMaterial(
  mesh: THREE.Mesh,
  materials: THREE.Material | THREE.Material[]
): void {
  mesh.material = Array.isArray(materials) ? materials[0] : materials;
  console.log(`[Material] Assigned ${mesh.material.type} to ${mesh.name}`);
}
```

### 2. Material Validation
```typescript
// Add validation after assignment
function validateMaterial(mesh: THREE.Mesh): boolean {
  if (!mesh.material) {
    console.error(`[Material] No material assigned to ${mesh.name}`);
    return false;
  }
  if (Array.isArray(mesh.material)) {
    console.error(`[Material] Array assigned to ${mesh.name}, expected single material`);
    return false;
  }
  return true;
}
```

### 3. Debug Mode
```typescript
// Add debug flag to enable detailed logging
const DEBUG_MATERIALS = true;

if (DEBUG_MATERIALS) {
  console.log(`[Material Debug] ${mesh.name}:`, {
    type: mesh.material.type,
    color: mesh.material.color?.getHexString(),
    opacity: mesh.material.opacity,
    transparent: mesh.material.transparent,
    visible: mesh.visible
  });
}
```

### 4. Automated Testing
```typescript
// Test material assignment for all package types
describe('Material Assignment', () => {
  it('should assign single material, not array', () => {
    const mesh = createTestMesh();
    const materials = applyBottleMaterials(...);
    assignMeshMaterial(mesh, materials);
    expect(Array.isArray(mesh.material)).toBe(false);
    expect(mesh.material.type).toBe('MeshStandardMaterial');
  });
});
```

---

**Document Version:** 1.0  
**Last Updated:** Nov 7, 2025  
**Contributors:** Manus AI + User Partnership 🤝
