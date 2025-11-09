# Pop-out Viewer Bug Analysis

**Issue:** Pop-out viewer always displays 12oz can (pkgtype1) regardless of selected package type

**Reported By:** User testing (Nov 9, 2025)

**Severity:** HIGH - Feature is non-functional for its intended purpose

---

## Root Cause Analysis

### Component Rendering Sequence

1. **Pop-out window opens** → New browser window created
2. **ViewerPopout component mounts** → React renders the component tree
3. **Package3DModelViewer mounts** → Child component renders immediately
4. **Package3DModelViewer reads store** → `useConfigStore((state) => state.currentPackage)` (line 24)
5. **Store returns default value** → `"can-12oz"` (Zustand store starts with defaults)
6. **Model loading begins** → OBJ loader starts fetching 12oz can model files
7. **ViewerPopout useEffect runs** → Config decoded from URL parameter
8. **applyTemplate() called** → Store updated with correct package type
9. **Too late!** → Model already loading/loaded with wrong package

### The Race Condition

```
Timeline:
T0: window.open() → New window created
T1: React render → ViewerPopout + Package3DModelViewer mount simultaneously  
T2: Package3DModelViewer reads store → Gets default "can-12oz"
T3: Model loading starts → OBJ loader initiated
T4: ViewerPopout useEffect → Config applied to store
T5: Store updated → currentPackage = "stick-pack" (too late!)
```

**Critical Issue:** Package3DModelViewer renders and starts loading BEFORE ViewerPopout's useEffect has a chance to apply the URL config.

---

## Code Evidence

### ViewerPopout.tsx (Lines 20-71)

```typescript
export default function ViewerPopout() {
  const { packageConfig, applyTemplate } = useConfigStore();
  const [isReady, setIsReady] = useState(false);  // ← Has loading state!

  useEffect(() => {
    // Parse URL and apply config
    applyTemplate(config);
    setIsReady(true);  // ← Sets ready flag
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;  // ← Shows loading screen
  }

  return (
    <div>
      <Package3DModelViewer />  // ← Renders AFTER isReady=true
    </div>
  );
}
```

**Wait... this SHOULD work!** The component has an `isReady` gate that prevents Package3DModelViewer from rendering until after the config is applied.

### Re-examining the Logic

Looking at lines 57-66 more carefully:

```typescript
if (!isReady) {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2"></div>
      <p>Loading configuration...</p>
    </div>
  );
}
```

This loading screen SHOULD display while the useEffect runs. But the user reports the pop-out opens immediately with the 12oz can visible.

**Hypothesis:** The loading screen is so brief (< 1 frame) that it's not visible, OR the Package3DModelViewer is somehow reading stale store values even after applyTemplate() runs.

---

## Possible Causes

### Option A: Zustand Store Initialization Issue

Zustand stores in new windows might not be properly initialized. The store could be:
- Sharing state with parent window (not isolated)
- Starting with cached values
- Not triggering re-renders after `applyTemplate()` updates

### Option B: React Rendering Timing

Even with `isReady` gate, React might be:
- Batching state updates
- Not re-rendering Package3DModelViewer after store update
- Using stale closures in useEffect dependencies

### Option C: Package3DModelViewer Caching

The component might be:
- Caching the `currentPackage` value on first render
- Not re-running model loading logic when store updates
- Using a stale reference in its useEffect dependencies

---

## Recommended Fixes

### Fix Option 1: Force Synchronous Config Application (RECOMMENDED)

**Change:** Apply config BEFORE component mounts using Zustand's `getState()` and `setState()`

```typescript
// ViewerPopout.tsx
export default function ViewerPopout() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const configParam = searchParams.get('config');
    
    if (configParam) {
      try {
        const decoded = atob(configParam);
        const config = JSON.parse(decoded);
        
        // SYNCHRONOUSLY update store before any renders
        useConfigStore.setState({
          currentPackage: config.type,
          packageConfig: config,
        });
        
        // Small delay to ensure store propagates
        setTimeout(() => setIsReady(true), 50);
      } catch (error) {
        console.error('Failed to decode config:', error);
        setIsReady(true);
      }
    } else {
      setIsReady(true);
    }
  }, []);
  
  // ... rest of component
}
```

**Pros:**
- Direct store manipulation ensures config is set before render
- 50ms delay gives Zustand time to propagate changes
- Minimal code changes

**Cons:**
- Uses setTimeout (not ideal)
- Bypasses applyTemplate() migration logic

---

### Fix Option 2: Add Config Prop to Package3DModelViewer

**Change:** Pass config as prop instead of reading from store

```typescript
// ViewerPopout.tsx
<Package3DModelViewer overrideConfig={decodedConfig} />

// Package3DModelViewer.tsx
const Package3DModelViewer = ({ overrideConfig }: { overrideConfig?: PackageConfig }) => {
  const currentPackage = overrideConfig?.type || useConfigStore((state) => state.currentPackage);
  const packageConfig = overrideConfig || useConfigStore((state) => state.packageConfig);
  // ... rest of component
}
```

**Pros:**
- Explicit data flow (easier to debug)
- No timing issues
- Keeps store for other features

**Cons:**
- Requires modifying Package3DModelViewer (large component)
- Breaks store-driven architecture
- More invasive change

---

### Fix Option 3: Use Zustand Persist Middleware

**Change:** Persist store to sessionStorage so pop-out inherits parent state

```typescript
// configStore.ts
export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // ... existing store logic
    }),
    {
      name: 'packaging-config-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

**Pros:**
- Automatic state sharing across windows
- No ViewerPopout changes needed
- Enables live sync if desired

**Cons:**
- Changes store architecture globally
- May affect main app behavior
- Overkill for snapshot feature

---

## Debugging Steps

Before implementing a fix, add console logging to confirm hypothesis:

```typescript
// ViewerPopout.tsx useEffect
console.log('[ViewerPopout] BEFORE applyTemplate:', useConfigStore.getState().currentPackage);
applyTemplate(config);
console.log('[ViewerPopout] AFTER applyTemplate:', useConfigStore.getState().currentPackage);
console.log('[ViewerPopout] Config type from URL:', config.type);

// Package3DModelViewer.tsx (line 24)
const currentPackage = useConfigStore((state) => {
  console.log('[Package3DModelViewer] Reading currentPackage from store:', state.currentPackage);
  return state.currentPackage;
});
```

**Expected Output (if Fix Option 1 works):**
```
[ViewerPopout] BEFORE applyTemplate: can-12oz
[ViewerPopout] AFTER applyTemplate: stick-pack
[ViewerPopout] Config type from URL: stick-pack
[Package3DModelViewer] Reading currentPackage from store: stick-pack
```

**Current Output (bug):**
```
[Package3DModelViewer] Reading currentPackage from store: can-12oz  ← Reads BEFORE useEffect!
[ViewerPopout] BEFORE applyTemplate: can-12oz
[ViewerPopout] AFTER applyTemplate: stick-pack
[ViewerPopout] Config type from URL: stick-pack
```

---

## Recommended Action

**Implement Fix Option 1** with debugging logs:

1. Add console logging to confirm race condition
2. Apply synchronous store update with 50ms delay
3. Test with multiple package types (stick-pack, bottle-750ml, pkgtype7)
4. Verify wrapper on/off states persist correctly
5. Test multiple simultaneous pop-outs

**Estimated Effort:** 15-20 minutes

**Risk:** Low - Changes isolated to ViewerPopout.tsx

---

## Test Plan

After fix implementation:

1. ✅ Open pop-out with 12oz can → Should show 12oz can
2. ✅ Switch to stick-pack, open pop-out → Should show stick-pack
3. ✅ Switch to bottle-750ml, open pop-out → Should show bottle-750ml
4. ✅ Toggle wrapper OFF, open pop-out → Should show wrapper OFF
5. ✅ Change material (metalness/roughness), open pop-out → Should reflect changes
6. ✅ Modify label text, open pop-out → Should show updated text
7. ✅ Open multiple pop-outs with different configs → Each should be independent
8. ✅ Close parent window → Pop-outs should continue working

---

**Status:** Awaiting user approval to proceed with Fix Option 1
