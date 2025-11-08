# PkgType4 (750ml Whiskey Bottle) Material Issue Analysis

**Date:** Nov 8, 2025  
**Issue:** After fresh dev server restart, pkgtype4 shows only glass body - no amber liquid, no metal cap visible. Wrapper toggle has no visible effect.

---

## Observed Symptoms

From the screenshot provided:
1. ✅ **Glass bottle body is visible** - clear/white appearance
2. ❌ **No amber liquid visible inside** - should see bourbon amber color (0x9a5f1a)
3. ❌ **No metal cap visible** - should see shiny metal cap with PBR textures
4. ❌ **Wrapper toggle has no effect** - no visible change between ON/OFF states
5. ✅ **Model loads successfully** - debug overlay shows "Model Loaded: YES"

**Critical Finding:** This is NOT just a wrapper toggle issue - the cap and liquid meshes are either:
- Not being rendered at all (hidden/invisible)
- Not receiving their materials correctly
- Being filtered out during model loading

---

## Code Flow Analysis: Where Cap and Liquid Should Get Materials

### **System 1: Initial Model Load (Lines 641-772)**

#### **Step 1: Mesh Identification (Line 419)**
```typescript
const shouldReceiveLabel = (
  // ... other packages ...
  (currentPackage === 'bottle-750ml' && meshName.includes('whiskey_bottle')) ||
  // ...
);
```
**Analysis:** Only meshes with name containing "whiskey_bottle" receive label texture.  
**Question:** What are the actual mesh names for cap and liquid?

---

#### **Step 2A: Label Mesh Path (Lines 641-663)**
If `shouldReceiveLabel === true` (mesh name includes "whiskey_bottle"):

```typescript
} else if (currentPackage === 'bottle-750ml') {
  // Bottle-750ml has multi-material mesh (glass, metal cap, liquid)
  // Apply UV mapping and geometry transforms to glass mesh
  const materials = Array.isArray(child.material) ? child.material : [child.material];
  const hasGlassMat = materials.some(mat => mat?.name === 'glass_Mat');
  
  if (hasGlassMat) {
    applyCylindricalUVMapping(child);
    child.geometry.scale(-1, 1, 1);
    child.geometry.computeVertexNormals();
    child.userData.isCanBody = true;
  }
  
  // Use unified material manager (System 1: initial load)
  const newMaterials = applyBottleMaterials(
    child.material,
    showWrapper,
    packageConfig,
    labelTextureRef.current  // ⚠️ Use pre-generated texture from ref
  );
  
  // Apply new materials array
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
}
```

**⚠️ CRITICAL ISSUE #1: Missing Parameters**
- No `meshName` parameter passed to `applyBottleMaterials()`
- No `packageType` parameter passed - relies on default `'bottle-750ml'`
- This means `applyBottleMaterials()` cannot identify which mesh it's processing

**Analysis:**
- `applyBottleMaterials()` for pkgtype4 identifies meshes by **material name** (glass_Mat, metal_Mat, liquid_Mat)
- If the mesh has multi-material array, it processes each material by name
- BUT: Line 663 extracts only first element: `newMaterials[0]`
- **This discards metal_Mat and liquid_Mat materials!**

---

#### **Step 2B: Non-Label Mesh Path (Lines 714-772)**
If `shouldReceiveLabel === false` (mesh name does NOT include "whiskey_bottle"):

```typescript
} else {
  // Handle non-label meshes (top, bottom, cap, liquid, etc.)
  
  // Special handling for bottle-750ml cap and liquid
  if (currentPackage === 'bottle-750ml') {
    const textureLoader = new THREE.TextureLoader();
    const basePath = '/models/pkgtype4_textures/Tex_Metal_Rough/';
    
    if (meshName.includes('metal')) {
      // Metal cap with PBR textures
      const baseColorMap = textureLoader.load(basePath + 'metal_Mat_baseColor.png');
      const normalMap = textureLoader.load(basePath + 'metal_Mat_normal.png');
      const metallicMap = textureLoader.load(basePath + 'metal_Mat_metallic.png');
      const roughnessMap = textureLoader.load(basePath + 'metal_Mat_roughness.png');
      
      const material = new THREE.MeshStandardMaterial({
        map: baseColorMap,
        normalMap: normalMap,
        metalnessMap: metallicMap,
        roughnessMap: roughnessMap,
        metalness: 0.9,
        roughness: 0.3,
      });
      child.material = material;
      console.log('[bottle-750ml] Metal cap PBR material applied (initial load)');
    } else if (meshName.includes('liquid')) {
      // Amber liquid with PBR textures
      const baseColorMap = textureLoader.load(basePath + 'liquid_Mat_baseColor.png');
      const normalMap = textureLoader.load(basePath + 'liquid_Mat_normal.png');
      const metallicMap = textureLoader.load(basePath + 'liquid_Mat_metallic.png');
      const roughnessMap = textureLoader.load(basePath + 'liquid_Mat_roughness.png');
      
      const material = new THREE.MeshStandardMaterial({
        map: baseColorMap,
        normalMap: normalMap,
        metalnessMap: metallicMap,
        roughnessMap: roughnessMap,
        metalness: 0.0,
        roughness: 0.1,
        transparent: false,
        opacity: 1.0,
      });
      child.material = material;
      console.log('[bottle-750ml] Amber liquid PBR material applied (initial load)');
    }
  }
}
```

**Analysis:**
- This path handles cap and liquid as **separate meshes** (not multi-material)
- Identifies by mesh name: `meshName.includes('metal')` or `meshName.includes('liquid')`
- Applies PBR textures directly to each mesh
- **This is the CORRECT path for cap and liquid**

---

## Root Cause Hypothesis

### **Hypothesis A: Multi-Material Mesh Structure (MOST LIKELY)**

**Theory:** The bottle-750ml model has ONE mesh with THREE materials (glass, metal, liquid), not three separate meshes.

**Evidence:**
- Line 644: Code checks for multi-material array
- Line 645: Checks if any material is named 'glass_Mat'
- Line 663: Extracts only first material from array

**Problem:**
```typescript
// Line 655-663
const newMaterials = applyBottleMaterials(
  child.material,  // ⚠️ This is [glass_Mat, metal_Mat, liquid_Mat]
  showWrapper,
  packageConfig,
  labelTextureRef.current
);

// Line 663
child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
// ⚠️ Only assigns first material (glass_Mat) - DISCARDS metal_Mat and liquid_Mat!
```

**Expected Behavior:**
- `applyBottleMaterials()` should return array of 3 materials: [glass, metal, liquid]
- Line 663 should assign the FULL array, not just first element

**Current Behavior:**
- `applyBottleMaterials()` returns array of 3 materials
- Line 663 extracts only first element (glass)
- Metal and liquid materials are lost
- Mesh renders with only glass material → no cap/liquid visible

---

### **Hypothesis B: Mesh Name Mismatch**

**Theory:** The actual mesh names in the OBJ file don't match the expected patterns.

**Expected Names:**
- Glass bottle: mesh name includes "whiskey_bottle"
- Metal cap: separate mesh with name including "metal"
- Liquid: separate mesh with name including "liquid"

**Actual Names:** Unknown - need console logs to verify

**Evidence:**
- Line 392-398: Debug logging exists for bottle-750ml but we haven't seen output
- If mesh names don't match patterns, they fall through to default material

---

### **Hypothesis C: Unified Material Manager Breaking Multi-Material**

**Theory:** `applyBottleMaterials()` was designed for pkgtype5 (single material per mesh) and doesn't properly handle pkgtype4 (multi-material mesh).

**Evidence from bottleMaterialManager.ts:**

```typescript
// Lines 106-175: pkgtype4 handling
return materialsArray.map((mat) => {
  const matName = mat?.name || '';
  
  if (matName === 'glass_Mat') {
    // ... return glass material
  } else if (matName === 'metal_Mat') {
    // ... return metal material
  } else if (matName === 'liquid_Mat') {
    // ... return liquid material
  } else {
    return mat;  // Keep original
  }
});
```

**Analysis:**
- Function correctly maps over material array
- Returns array of 3 materials: [glass, metal, liquid]
- **BUT:** Line 663 in Package3DModelViewer.tsx only uses first element!

---

## Common Factors Beyond applyBottleMaterials

### **1. Material Array Assignment Bug (Fixed for pkgtype5, NOT for pkgtype4)**

**5 Locations Where We Fixed Array Assignment:**

| Location | Package Type | Fixed? | Code |
|----------|-------------|--------|------|
| 1. Line 360 | bottle-750ml OR pkgtype5 | ✅ Yes | `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;` |
| 2. Line 595 | pkgtype5 only | ✅ Yes | `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;` |
| 3. Line 663 | bottle-750ml only | ⚠️ **WRONG FIX** | `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;` |
| 4. Line 1035 | bottle-750ml OR pkgtype5 | ✅ Yes | `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;` |
| 5. Line 1084 | bottle-750ml OR pkgtype5 | ✅ Yes | `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;` |

**⚠️ CRITICAL FINDING:**

**Location 3 (Line 663) is the problem!**

For pkgtype5:
- Each mesh has single material
- Extracting `newMaterials[0]` is CORRECT

For pkgtype4:
- Mesh has multi-material array [glass, metal, liquid]
- Extracting `newMaterials[0]` is **WRONG** - should assign full array
- This is why cap and liquid are missing!

---

### **2. Conditional Logic Differences**

**pkgtype5 (Lines 577-596):**
```typescript
} else if (currentPackage === 'pkgtype5') {
  // 1L Bottle - mark bottle mesh for wrapper toggle handling
  if (meshName.toLowerCase().includes('bottle')) {
    child.userData.isCanBody = true;
  }
  
  // Apply materials using bottleMaterialManager
  const newMaterials = applyBottleMaterials(
    child.material,
    false,  // Always start with wrapper OFF (clear glass)
    packageConfig,
    null,  // No texture in System 1
    meshName,  // ✅ Passes meshName
    'pkgtype5'  // ✅ Passes packageType
  );
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
}
```

**pkgtype4 (Lines 641-663):**
```typescript
} else if (currentPackage === 'bottle-750ml') {
  // Bottle-750ml has multi-material mesh (glass, metal cap, liquid)
  const materials = Array.isArray(child.material) ? child.material : [child.material];
  const hasGlassMat = materials.some(mat => mat?.name === 'glass_Mat');
  
  if (hasGlassMat) {
    applyCylindricalUVMapping(child);
    child.geometry.scale(-1, 1, 1);
    child.geometry.computeVertexNormals();
    child.userData.isCanBody = true;
  }
  
  // Use unified material manager (System 1: initial load)
  const newMaterials = applyBottleMaterials(
    child.material,
    showWrapper,
    packageConfig,
    labelTextureRef.current
    // ❌ No meshName parameter
    // ❌ No packageType parameter
  );
  
  // ⚠️ WRONG: Extracts only first material
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
}
```

**Key Differences:**
1. pkgtype5 passes `meshName` and `packageType` → pkgtype4 doesn't
2. pkgtype5 uses single material per mesh → pkgtype4 uses multi-material
3. pkgtype5 extraction is correct → pkgtype4 extraction is wrong

---

### **3. System 2 (Wrapper Toggle) Analysis**

**Lines 1024-1036 (Wrapper ON):**
```typescript
if (currentPackage === 'bottle-750ml' || currentPackage === 'pkgtype5') {
  const newMaterials = applyBottleMaterials(
    child.material,
    true,  // showWrapper = true
    packageConfig,
    labelTexture,
    child.name,  // ✅ Passes meshName
    currentPackage  // ✅ Passes packageType
  );
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
}
```

**Lines 1074-1084 (Wrapper OFF):**
```typescript
if (currentPackage === 'bottle-750ml' || currentPackage === 'pkgtype5') {
  const newMaterials = applyBottleMaterials(
    child.material,
    false,  // showWrapper = false
    packageConfig,
    null,
    child.name,  // ✅ Passes meshName
    currentPackage  // ✅ Passes packageType
  );
  child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;
}
```

**Analysis:**
- System 2 correctly passes `meshName` and `packageType`
- BUT: Still extracts only first material `newMaterials[0]`
- This is correct for pkgtype5 (single material) but wrong for pkgtype4 (multi-material)

---

## Why Wrapper Toggle Doesn't Work for pkgtype4

**Current Behavior:**
1. User toggles wrapper ON → System 2 runs
2. `applyBottleMaterials()` returns [glass_Mat, metal_Mat, liquid_Mat]
3. Line 1035 assigns only `newMaterials[0]` (glass_Mat)
4. Metal and liquid materials are lost
5. No visible change because glass is already visible

**Expected Behavior:**
1. User toggles wrapper ON → System 2 runs
2. `applyBottleMaterials()` returns [glass_Mat, metal_Mat, liquid_Mat]
3. Assign FULL array to `child.material`
4. Glass shows label, metal shows cap, liquid shows amber color
5. Visible change: label appears on glass, cap and liquid remain visible

---

## Summary of Common Factors

### **Factor 1: Material Array Assignment Logic**
**Issue:** All 5 locations extract `newMaterials[0]`, which is correct for single-material meshes (pkgtype5) but wrong for multi-material meshes (pkgtype4).

**Impact:** 🔴 **CRITICAL** - This is the primary cause of missing cap and liquid.

---

### **Factor 2: Missing Parameters in System 1**
**Issue:** Location 3 (Line 655-663) doesn't pass `meshName` or `packageType` to `applyBottleMaterials()`.

**Impact:** 🟡 **MEDIUM** - Function still works because it defaults to 'bottle-750ml' and identifies by material name, not mesh name.

---

### **Factor 3: Unified Material Manager Design**
**Issue:** `applyBottleMaterials()` was designed to handle both single-material (pkgtype5) and multi-material (pkgtype4) meshes, but the calling code doesn't distinguish between them.

**Impact:** 🟡 **MEDIUM** - Function works correctly, but callers misuse it.

---

### **Factor 4: Lack of Multi-Material Awareness**
**Issue:** The material array assignment fix (extracting `[0]`) was applied uniformly without considering multi-material meshes.

**Impact:** 🔴 **CRITICAL** - This broke pkgtype4 while fixing pkgtype5.

---

## Recommended Investigation Steps (No Code Changes)

### **Step 1: Verify Mesh Structure**
**Action:** Check console logs for bottle-750ml mesh names and material counts.

**Expected Output:**
```
[bottle-750ml DEBUG] Found mesh: {
  name: "whiskey_bottle_001",
  nameLower: "whiskey_bottle_001",
  materialCount: 3,
  materialNames: ["glass_Mat", "metal_Mat", "liquid_Mat"],
  type: "Mesh"
}
```

**Questions to Answer:**
1. Is there ONE mesh with 3 materials, or THREE separate meshes?
2. What are the actual mesh names?
3. Do mesh names match the expected patterns?

---

### **Step 2: Verify Material Manager Output**
**Action:** Add console logging to see what `applyBottleMaterials()` returns.

**Expected Output:**
```
[bottleMaterialManager] Returning 3 materials for bottle-750ml:
  [0] glass_Mat: MeshPhysicalMaterial { color: 0xffffff, opacity: 0.3 }
  [1] metal_Mat: MeshStandardMaterial { metalness: 0.9, roughness: 0.3 }
  [2] liquid_Mat: MeshStandardMaterial { color: 0x9a5f1a, opacity: 0.9 }
```

---

### **Step 3: Verify Material Assignment**
**Action:** Add logging after line 663 to see what actually gets assigned.

**Expected Output:**
```
[System 1] bottle-750ml material assignment:
  Before: child.material is array of 3 materials
  After: child.material is single material (glass_Mat only)
  ⚠️ Lost 2 materials: metal_Mat, liquid_Mat
```

---

## Conclusion

**Root Cause (High Confidence - 95%):**

The material array assignment fix we applied to solve pkgtype5's invisible bottle bug has **broken pkgtype4** by discarding the metal cap and liquid materials.

**Specific Issue:**
- Line 663: `child.material = Array.isArray(newMaterials) ? newMaterials[0] : newMaterials;`
- This extracts only the first material (glass) from the 3-material array
- Metal cap and liquid materials are discarded
- Mesh renders with only glass material → no cap/liquid visible

**Why This Happened:**
- pkgtype5 uses single material per mesh → extracting `[0]` is correct
- pkgtype4 uses multi-material mesh → extracting `[0]` is wrong
- We applied the same fix to both without distinguishing mesh structure

**Solution Required:**
- Conditional logic: if multi-material mesh, assign full array; if single material, extract `[0]`
- OR: Separate handling for pkgtype4 and pkgtype5
- OR: Refactor to use separate material managers (Recommendation 1 from previous analysis)

---

**Next Steps:**
1. Confirm mesh structure via console logs
2. Implement conditional material assignment based on mesh structure
3. Test both pkgtype4 and pkgtype5 to ensure both work correctly
