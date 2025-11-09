# Wrapper State Preservation - Evaluation & Recommendations

## 📋 Issue Summary

**Current Behavior:**
- Pop-out viewer always shows wrapper ON, regardless of parent window's wrapper toggle state
- User expects: If wrapper is OFF in parent, pop-out should also show wrapper OFF

**Root Cause:**
- `showWrapper` is stored in ConfigState but NOT in PackageConfig interface
- Only PackageConfig is serialized to URL (line 156 in CustomizationPanel.tsx)
- ViewerPopout receives PackageConfig but not view settings like `showWrapper`

---

## 🔍 Technical Analysis

### Current Architecture

**ConfigState Structure** (configStore.ts):
```typescript
interface ConfigState {
  currentPackage: PackageType;
  packageConfig: PackageConfig;          // ← Serialized to URL
  cameraPreset: string;
  showReferenceSurface: boolean;         // ← NOT serialized
  showWrapper: boolean;                  // ← NOT serialized
  // ...
}
```

**PackageConfig Structure** (configStore.ts lines 42-51):
```typescript
export interface PackageConfig {
  type: PackageType;
  baseColor: string;
  metalness: number;
  roughness: number;
  labelContent: LabelContent;
  labelTransform: LabelTransform;
  textStyles: TextStyles;
  labelBackgroundColor: string;
  // NO showWrapper property!
}
```

**Current Serialization** (CustomizationPanel.tsx line 156):
```typescript
const configJson = JSON.stringify(packageConfig);  // Only PackageConfig
```

---

## ✅ Recommended Solution

### **Option 1: Extend URL Serialization (Recommended)**

**Approach:** Serialize both `packageConfig` AND view settings (`showWrapper`, `showReferenceSurface`) to URL.

**Implementation:**
1. Create a snapshot object that includes both config and view settings
2. Serialize the snapshot to URL
3. ViewerPopout decodes and applies both config and view settings

**Pros:**
- ✅ Clean separation of concerns (PackageConfig remains unchanged)
- ✅ Easy to extend (can add `showReferenceSurface` later)
- ✅ Minimal changes (only 3 files)
- ✅ No breaking changes to existing code

**Cons:**
- ❌ Slightly larger URL (negligible - adds ~30 bytes)

**Code Changes:**

**File 1: CustomizationPanel.tsx** (line 155-157)
```typescript
// BEFORE:
const configJson = JSON.stringify(packageConfig);

// AFTER:
const snapshot = {
  packageConfig,
  showWrapper,
  showReferenceSurface,  // Optional: include if desired
};
const configJson = JSON.stringify(snapshot);
```

**File 2: ViewerPopout.tsx** (line 34-88)
```typescript
// BEFORE:
const config = JSON.parse(atob(configParam));
console.log('[ViewerPopout] Decoded config:', config);

// AFTER:
const snapshot = JSON.parse(atob(configParam));
console.log('[ViewerPopout] Decoded snapshot:', snapshot);

// Handle both old format (just config) and new format (snapshot)
const config = snapshot.packageConfig || snapshot;  // Backwards compatible
const showWrapper = snapshot.showWrapper !== undefined ? snapshot.showWrapper : true;  // Default to true
const showReferenceSurface = snapshot.showReferenceSurface !== undefined ? snapshot.showReferenceSurface : false;

// Apply wrapper state
useConfigStore.setState({
  currentPackage: config.type,
  packageConfig: config,
  showWrapper,           // ← NEW
  showReferenceSurface,  // ← NEW (optional)
});
```

**Estimated Effort:** 15 minutes  
**Risk:** Low (backwards compatible with old URLs)

---

### **Option 2: Add showWrapper to PackageConfig**

**Approach:** Move `showWrapper` from ConfigState into PackageConfig interface.

**Pros:**
- ✅ Wrapper state becomes part of package configuration
- ✅ Automatically serialized with config

**Cons:**
- ❌ Conceptually incorrect (`showWrapper` is a view setting, not package property)
- ❌ More invasive changes (affects all code that uses PackageConfig)
- ❌ Breaks separation of concerns
- ❌ Would need migration for existing presets

**Estimated Effort:** 30-45 minutes  
**Risk:** Medium (requires careful refactoring)

**Verdict:** NOT RECOMMENDED

---

### **Option 3: Separate Query Parameter**

**Approach:** Pass `showWrapper` as a separate URL parameter.

**Example URL:**
```
/viewer-popout?config=eyJ0eXBlIjoi...&showWrapper=false&showReferenceSurface=false
```

**Pros:**
- ✅ Clean URL structure
- ✅ Easy to read/debug

**Cons:**
- ❌ More complex URL parsing
- ❌ Two sources of truth (config + query params)
- ❌ Harder to maintain consistency

**Estimated Effort:** 20 minutes  
**Risk:** Low

**Verdict:** Acceptable alternative, but Option 1 is cleaner

---

## 🎯 Final Recommendation

**Implement Option 1: Extend URL Serialization**

**Why:**
- Minimal code changes (2 files, ~10 lines)
- Backwards compatible with existing URLs
- Clean architecture (view settings grouped together)
- Easy to extend for future view settings
- Low risk, high confidence

**Implementation Steps:**
1. Update CustomizationPanel.tsx to serialize snapshot object
2. Update ViewerPopout.tsx to decode snapshot and apply view settings
3. Test with wrapper ON and OFF
4. Test backwards compatibility with old URLs (if any exist)
5. Create checkpoint

**Expected Result:**
- Pop-out with wrapper OFF in parent → Pop-out shows wrapper OFF
- Pop-out with wrapper ON in parent → Pop-out shows wrapper ON
- Multiple pop-outs maintain independent wrapper states

---

## 📝 Additional Considerations

### **Should Reference Surface also be preserved?**

Currently, `showReferenceSurface` is also a view setting that's not being captured. 

**Recommendation:** Include it in the snapshot for consistency, even if it's less critical than wrapper state.

### **Backwards Compatibility**

Old URLs (if any exist) will still work because the code checks:
```typescript
const config = snapshot.packageConfig || snapshot;  // Falls back to old format
```

---

## ✅ Ready to Implement

**Awaiting user approval to proceed with Option 1.**

Estimated time: 15 minutes  
Confidence: 95%  
Risk: Low
