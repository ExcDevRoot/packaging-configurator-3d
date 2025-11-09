# Pop-out 3D Viewer - Testing Guide

**Fix Implemented:** Option 1 - Synchronous store update with 50ms delay

**Changes Made:**
- ViewerPopout.tsx: Direct `useConfigStore.setState()` instead of `applyTemplate()`
- Added 50ms delay before rendering Package3DModelViewer
- Added debug console logs to track state changes

---

## 🧪 Testing Instructions

### Test 1: Basic Functionality - 12oz Can

1. Open the app in your browser
2. Verify 12oz can is displayed (default)
3. Open browser console (F12) to see debug logs
4. Click **Advanced Controls** to expand
5. Click **"Pop-out 3D Viewer"** button
6. **Expected Result:**
   - New window opens
   - Shows 12oz can (not stick pack!)
   - Console logs show:
     ```
     [ViewerPopout] Config decoded from URL: can-12oz
     [ViewerPopout] Store BEFORE update: can-12oz
     [ViewerPopout] Store AFTER update: can-12oz
     [ViewerPopout] Setting isReady=true after 50ms delay
     ```

---

### Test 2: Stick Pack Configuration

1. In main window, click **"Stick Pack"** button
2. Verify stick pack model loads
3. Click **Advanced Controls** → **"Pop-out 3D Viewer"**
4. **Expected Result:**
   - New window opens
   - Shows **stick pack** (not 12oz can!)
   - Console logs show:
     ```
     [ViewerPopout] Config decoded from URL: stick-pack
     [ViewerPopout] Store BEFORE update: can-12oz  ← Default before update
     [ViewerPopout] Store AFTER update: stick-pack  ← Fixed!
     ```

---

### Test 3: 750ml Bottle Configuration

1. In main window, click **"750ml Bottle"** button
2. Verify bottle model loads
3. Click **Advanced Controls** → **"Pop-out 3D Viewer"**
4. **Expected Result:**
   - New window opens
   - Shows **750ml bottle** (not 12oz can!)
   - Console logs show `bottle-750ml` in AFTER update

---

### Test 4: Wrapper On/Off State

1. In main window, select any package type
2. Click **Advanced Controls**
3. Toggle **"Show Wrapper"** switch to OFF
4. Click **"Pop-out 3D Viewer"**
5. **Expected Result:**
   - Pop-out shows model **without wrapper/label**
6. Back in main window, toggle wrapper back ON
7. Click **"Pop-out 3D Viewer"** again (opens 2nd window)
8. **Expected Result:**
   - 1st pop-out: Still shows wrapper OFF (snapshot)
   - 2nd pop-out: Shows wrapper ON (new snapshot)

---

### Test 5: Material Changes

1. In main window, go to **Material** tab
2. Adjust **Metalness** slider (e.g., 0.9)
3. Adjust **Roughness** slider (e.g., 0.1)
4. Click **Advanced Controls** → **"Pop-out 3D Viewer"**
5. **Expected Result:**
   - Pop-out reflects material changes (shiny metallic look)
   - Bottom-left info shows: `M: 0.90 / R: 0.10`

---

### Test 6: Multiple Simultaneous Pop-outs

1. Select **12oz can**, open pop-out → Window A
2. Select **stick pack**, open pop-out → Window B
3. Select **750ml bottle**, open pop-out → Window C
4. **Expected Result:**
   - Window A: Shows 12oz can
   - Window B: Shows stick pack
   - Window C: Shows 750ml bottle
   - All windows remain independent (changing one doesn't affect others)

---

### Test 7: Label Text Changes

1. In main window, go to **Label** tab
2. Change **Product Name** to "Test Product"
3. Change **Description** to "Test Description"
4. Click **Advanced Controls** → **"Pop-out 3D Viewer"**
5. **Expected Result:**
   - Pop-out shows updated label text
   - Verify text is readable on 3D model

---

### Test 8: Camera Independence

1. Open a pop-out window
2. In pop-out: Rotate camera to a specific angle
3. In main window: Rotate camera to a different angle
4. **Expected Result:**
   - Pop-out camera stays at its angle (independent)
   - Main window camera moves independently
   - Clicking camera presets in main window doesn't affect pop-out

---

### Test 9: Pop-out Persistence

1. Open a pop-out window with stick pack
2. Close the main browser window/tab
3. **Expected Result:**
   - Pop-out window continues to work
   - Can still rotate/zoom the 3D model
   - Pop-out is truly independent

---

## 🐛 What to Look For (Bug Indicators)

### ❌ **BUG: Always shows 12oz can**
- If pop-out always shows 12oz can regardless of selection
- Console logs show: `Store AFTER update: can-12oz` (not changing)
- **Action:** Increase delay from 50ms to 100ms or 150ms

### ❌ **BUG: Wrapper state not preserved**
- If pop-out always shows wrapper ON even when toggled OFF
- **Action:** Check if `showWrapper` is included in URL config

### ❌ **BUG: Material changes not reflected**
- If pop-out shows default materials instead of customized values
- **Action:** Check console logs for `packageConfig` serialization

### ❌ **BUG: Label text not updating**
- If pop-out shows default "Brix Functional" text instead of custom text
- **Action:** Check if `labelContent` is properly encoded in URL

---

## ✅ Success Criteria

All tests should pass with these results:

- ✅ Pop-out displays correct package type (not always 12oz can)
- ✅ Wrapper on/off state preserved in snapshot
- ✅ Material properties (metalness/roughness) preserved
- ✅ Label text changes reflected in pop-out
- ✅ Multiple pop-outs show different configurations
- ✅ Camera controls work independently in each window
- ✅ Pop-outs persist after closing main window
- ✅ Console logs show correct state transitions

---

## 🔧 Troubleshooting

### If 50ms delay is insufficient:

**Symptom:** Pop-out sometimes shows correct package, sometimes shows 12oz can (inconsistent)

**Fix:** Increase delay in `ViewerPopout.tsx` line 63:

```typescript
// Change from:
setTimeout(() => setIsReady(true), 50);

// To:
setTimeout(() => setIsReady(true), 100);  // or 150ms
```

### If pop-out never works:

**Symptom:** Pop-out always shows 12oz can even with 200ms delay

**Fix:** Implement Option 2 (prop-based config) as backup:

1. Modify `ViewerPopout.tsx` to store decoded config in state
2. Pass config as prop to `Package3DModelViewer`
3. Modify `Package3DModelViewer.tsx` to accept `overrideConfig` prop

(See POPOUT_BUG_ANALYSIS.md for Option 2 implementation details)

---

## 📊 Console Log Reference

**Expected console output when opening pop-out with stick-pack:**

```
[ViewerPopout] Config decoded from URL: stick-pack
[ViewerPopout] Store BEFORE update: can-12oz
[ViewerPopout] Store AFTER update: stick-pack
[ViewerPopout] Setting isReady=true after 50ms delay
[OBJ LOADER] Starting load for package: stick-pack
[OBJ LOADER] Model paths: {obj: "/models/pkgtype3.obj", mtl: null}
[OBJ LOADER] SUCCESS callback triggered for: stick-pack
[3D Model] OBJ loaded successfully for package: stick-pack
```

**Bad output (bug not fixed):**

```
[ViewerPopout] Config decoded from URL: stick-pack
[ViewerPopout] Store BEFORE update: can-12oz
[ViewerPopout] Store AFTER update: can-12oz  ← WRONG! Should be stick-pack
[OBJ LOADER] Starting load for package: can-12oz  ← Loading wrong model
```

---

## 📝 Reporting Results

After testing, please report:

1. **Which tests passed** (Test 1-9)
2. **Which tests failed** (if any)
3. **Console log output** (copy/paste from browser console)
4. **Screenshots** (if pop-out shows wrong package type)
5. **Browser used** (Chrome, Firefox, Safari, Edge)

This will help determine if:
- Fix Option 1 is sufficient (50ms delay works)
- Delay needs adjustment (increase to 100-150ms)
- Option 2 is needed (prop-based config as backup)

---

**Ready to test!** 🚀

Open the app in your browser and work through Tests 1-9. The fix should resolve the "always shows 12oz can" bug.
