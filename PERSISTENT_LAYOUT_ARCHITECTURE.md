# Persistent Multi-Panel Layout Architecture

## Overview

This implementation provides a **persistent multi-panel layout** where all components remain **mounted at all times**. Instead of conditional rendering that unmounts components, we use **visibility toggles** via CSS to show/hide panels.

## Architecture

```
App (Toggle between layouts)
├── Traditional Scrollable Layout (Original)
│   └── GardenSimulationSection (Page-based navigation)
│
└── Persistent Multi-Panel Layout ⭐ NEW
    └── PersistentGardenSimulation
        └── SimulationLayout
            ├── Top Controls (Navigation Bar)
            ├── Left Panel (3D Scene / Grid Editor)
            ├── Right Top Panel (Analytics Dashboard)
            ├── Right Bottom Panel (Control Panel / Serial Monitor)
            └── Bottom Panel (Logs / Metrics)
```

## Key Components

### 1. `SimulationLayout.jsx`
**Purpose**: Generic reusable layout container that manages panel visibility

**Features**:
- ✅ CSS Grid-based layout
- ✅ All panels remain mounted (no unmounting)
- ✅ Visibility controlled via CSS (`opacity`, `visibility`)
- ✅ Smooth transitions (0.3s ease)
- ✅ Individual panel toggles
- ✅ Floating control bar for quick access
- ✅ Resizable panel sizes (via state)

**Props**:
- `topControls`: Navigation and mode controls
- `leftPanel`: Main 3D visualization or editor
- `rightTopPanel`: Analytics dashboard
- `rightBottomPanel`: Control panel or serial monitor
- `bottomPanel`: System logs

### 2. `PersistentGardenSimulation.jsx`
**Purpose**: Simulation-specific implementation using SimulationLayout

**Features**:
- ✅ All panels always rendered (never unmounted)
- ✅ Mode switching (LIBRARY, SETUP, SIMULATION, MANUAL_CONTROL)
- ✅ Each panel updates content but stays mounted
- ✅ Shared state across all panels
- ✅ Real-time synchronization

**Panels**:
1. **Left Panel**: Changes content based on mode
   - LIBRARY → GardenLibrary component
   - SETUP → GardenEditor component
   - SIMULATION/MANUAL → GardenScene3D component

2. **Right Top Panel**: Analytics Dashboard (always active)
   - Mission metrics
   - Charts and graphs
   - Plant health distribution

3. **Right Bottom Panel**: Control Panel
   - MANUAL_CONTROL mode → ManualControl component
   - Other modes → Mission controls and status

4. **Bottom Panel**: System Logs (always active)
   - Real-time log streaming
   - Export functionality

### 3. `App.jsx` (Modified, not rewritten)
**Changes**:
- Added `useState` for layout toggle
- Conditional rendering between layouts
- Added "Multi-Panel Mode" button (floating)
- Added "Exit Multi-Panel" button (when in persistent mode)

**NO changes to**:
- Original component structure
- Existing sections (Hero, Features, etc.)
- Footer, Navbar, or other components

## Benefits

### 1. **All Components Remain Mounted**
```javascript
// ❌ OLD WAY - Components get unmounted
{currentPage === 'ANALYTICS' && <Analytics />}
{currentPage === 'LOGS' && <Logs />}

// ✅ NEW WAY - Components stay mounted
<div style={{ 
    opacity: showAnalytics ? 1 : 0,
    visibility: showAnalytics ? 'visible' : 'hidden'
}}>
    <Analytics /> {/* Always mounted */}
</div>
```

### 2. **Persistent State**
- Component state is preserved when switching panels
- No re-initialization on panel toggle
- Smooth data continuity

### 3. **Performance**
- No mounting/unmounting overhead
- Faster panel switching
- Better memory usage (components initialize once)

### 4. **Simultaneous Visibility**
- View 3D scene + analytics + logs at the same time
- Real-time updates across all panels
- Better debugging experience

## Usage

### Activate Persistent Mode

1. **From Traditional Layout**:
   - Click the **"Multi-Panel Mode"** button (bottom-right)
   - App switches to full-screen persistent layout

2. **Exit Persistent Mode**:
   - Click **"Exit Multi-Panel"** button (top-left)
   - Returns to traditional scrollable layout

### Panel Visibility Toggles

**Method 1: Floating Control Bar** (bottom center)
- Click any button to toggle corresponding panel
- Green = visible, Gray = hidden

**Method 2: Individual Panel Buttons** (top-right of each panel)
- Eye icon = hide/show
- Minimize = collapse
- Maximize = expand

## Technical Implementation

### CSS Grid Layout
```javascript
gridTemplateColumns: panels.leftPanel 
    ? `${sizes.leftWidth}% ${100 - sizes.leftWidth}%` 
    : '0% 100%'
```

### Visibility Control
```javascript
style={{ 
    opacity: panels.leftPanel ? 1 : 0,
    visibility: panels.leftPanel ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease'
}}
```

### Panel State Management
```javascript
const [panels, setPanels] = useState({
    leftPanel: true,
    rightTop: true,
    rightBottom: true,
    bottom: true
});
```

## Future Enhancements

### 1. **Resizable Panels**
Add drag handles to dynamically resize panels:
```javascript
const [sizes, setSizes] = useState({
    leftWidth: 60,       // percentage
    rightTopHeight: 50,  // percentage
    bottomHeight: 25     // percentage
});
```

### 2. **Panel Persistence**
Save panel configuration to localStorage:
```javascript
useEffect(() => {
    localStorage.setItem('panelConfig', JSON.stringify(panels));
}, [panels]);
```

### 3. **Keyboard Shortcuts**
```javascript
// Ctrl+1 = Toggle Left Panel
// Ctrl+2 = Toggle Analytics
// Ctrl+3 = Toggle Monitor
// Ctrl+4 = Toggle Logs
```

### 4. **Panel Layouts**
Predefined layouts users can switch between:
- **Default**: All panels visible
- **Focus**: Only left panel + logs
- **Analysis**: Analytics + logs maximized
- **Developer**: Monitor + logs maximized

## Testing

### Verify Panel Persistence

1. **Start Mission**:
   - Click Multi-Panel Mode
   - Select a garden template
   - Go to SETUP and create path
   - Start SIMULATION

2. **Toggle Panels**:
   - Hide analytics → Component should stay mounted
   - Hide logs → Logs continue updating in background
   - Show analytics → Should see all accumulated data

3. **Switch Modes**:
   - Switch between SIMULATION and MANUAL_CONTROL
   - Analytics should continue showing live data
   - Logs should accumulate across mode switches

## Comparison

| Feature | Traditional Layout | Persistent Layout |
|---------|-------------------|-------------------|
| Navigation | Tab-based (replaces content) | Mode-based (changes left panel) |
| Component Mounting | Conditional (mount/unmount) | Always mounted |
| State Persistence | Lost on tab change | Always preserved |
| Multi-view | One section at a time | All panels simultaneously |
| Performance | Mount/unmount overhead | Faster (no remounting) |
| Use Case | Landing page, marketing | Development, debugging, power users |

## File Structure

```
src/
├── components/
│   ├── SimulationLayout.jsx          ⭐ NEW - Generic layout container
│   ├── PersistentGardenSimulation.jsx ⭐ NEW - Simulation with persistent layout
│   ├── GardenSimulationSection.jsx   (Original - unchanged)
│   ├── GardenScene3D.jsx
│   ├── GardenEditor.jsx
│   ├── ManualControl.jsx
│   └── ...
├── App.jsx                            ⭐ MODIFIED - Added layout toggle
└── ...
```

## Migration Path

Users can **gradually adopt** the new layout:

1. **Phase 1**: Keep both layouts (current implementation)
   - Users can toggle between layouts
   - Test persistent layout without commitment

2. **Phase 2**: Make persistent layout default
   ```javascript
   const [usePersistentLayout, setUsePersistentLayout] = useState(true);
   ```

3. **Phase 3**: Remove traditional layout (optional)
   - Delete GardenSimulationSection (page-based)
   - Keep only PersistentGardenSimulation

## Summary

✅ **All panels remain mounted** - No unmounting  
✅ **Visibility toggles** - CSS-based show/hide  
✅ **Smooth transitions** - Professional UX  
✅ **Simultaneous views** - View everything at once  
✅ **Persistent state** - Data preserved across toggles  
✅ **Backward compatible** - Original layout still works  
✅ **No App rewrite** - Minimal changes to App.jsx  

This architecture ensures maximum flexibility, performance, and user experience while maintaining code quality and maintainability.
