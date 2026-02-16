# World Coordinate System Implementation

## Overview

The world coordinate system **separates simulation logic from UI rendering**. This ensures that robot positions and physical simulations remain stable regardless of UI changes, grid resizing, or viewport adjustments.

## Core Principle

```
Simulation Layer (World Coordinates) ≠ UI Layer (Screen Coordinates)
```

### Key Concepts

**World Coordinates**:
- Logical simulation coordinates
- 1 world unit = 1 grid cell
- Independent of UI rendering
- Robot position stored ONLY in world coordinates
- Never changes due to UI resize or zoom

**Screen Coordinates**:
- UI pixel coordinates
- Calculated from world coordinates
- Changes based on zoom, pan, resize
- Only for rendering, never for simulation logic

## Data Separation

### ❌ OLD APPROACH (Tightly Coupled)

```javascript
// Robot position mixed with UI concerns
const robotX = screenX / cellSize - gridOffset;  // BAD!
const robotY = screenY / cellSize - gridOffset;  // BAD!

// Grid resize breaks everything
function resizeGrid(newSize) {
  // Recalculate robot position?? 😱
  robotX = ???
  robotY = ???
}
```

**Problems**:
- Robot position drifts on grid resize
- Coordinate misalignment
- Difficult debugging
- Simulation tied to UI

### ✅ NEW APPROACH (Separated Layers)

```javascript
// Robot position ONLY in world coordinates
let robotWorldX = 2.5;  // 2.5 world units
let robotWorldY = 1.3;  // 1.3 world units

// UI conversion (one-way: world → screen)
const screenX = robotWorldX * cellPixelSize + centerOffsetX;
const screenY = robotWorldY * cellPixelSize + centerOffsetY;

// Grid resize: world coordinates UNCHANGED
function resizeGrid(newSize) {
  worldSystem.setGridSize(newSize);  // Updates bounds only
  // robotWorldX and robotWorldY remain UNCHANGED! ✅
}
```

**Benefits**:
- ✅ Robot position stable on resize
- ✅ No coordinate drift
- ✅ Simulation independent of UI
- ✅ Easy debugging

## World Coordinate System API

### WorldCoordinateSystem Class

**Location**: `/src/utils/worldCoordinates.js`

```javascript
import WorldCoordinateSystem from '../utils/worldCoordinates';

const worldSystem = new WorldCoordinateSystem(
  5,   // gridSize (5×5)
  60   // cellPixelSize (60px per cell in UI)
);
```

### Core Methods

#### 1. World → Screen Conversion

```javascript
const screen = worldSystem.worldToScreen(
  2.5,    // worldX
  1.3,    // worldY
  800,    // containerWidth (px)
  600     // containerHeight (px)
);

console.log(screen);
// { x: 550, y: 322 }  // Screen coordinates in pixels
```

**Formula**:
```
screenX = worldX × cellPixelSize + centerOffsetX
screenY = -worldY × cellPixelSize + centerOffsetY

where:
  centerOffsetX = containerWidth / 2
  centerOffsetY = containerHeight / 2
```

Note: Y is negative because screen Y goes down, world Y goes up.

#### 2. Screen → World Conversion

```javascript
const world = worldSystem.screenToWorld(
  550,  // screenX (pixels)
  322,  // screenY (pixels)
  800,  // containerWidth (px)
  600   // containerHeight (px)
);

console.log(world);
// { x: 2.5, y: 1.3 }  // World coordinates
```

#### 3. Grid Cell Queries

```javascript
// Which cell is a world position in?
const cell = worldSystem.getCell(2.7, 1.3);
// { x: 3, y: 1 }

// Is world position in bounds?
const inBounds = worldSystem.isInBounds(2.5, 1.3);
// true

// Snap to grid cell center
const snapped = worldSystem.snapToGrid(2.7, 1.3);
// { x: 3, y: 1 }
```

#### 4. Distance & Angle

```javascript
// Distance between two world positions
const dist = worldSystem.distance(0, 0, 3, 4);
// 5.0

// Angle from point 1 to point 2
const angle = worldSystem.angle(0, 0, 1, 1);
// 0.785 (radians, = 45°)
```

### Grid Resize Behavior

```javascript
const worldSystem = new WorldCoordinateSystem(5, 60);

// Robot at world position (0, 0)
let robotWorldX = 0;
let robotWorldY = 0;

// Resize grid to 10×10
worldSystem.setGridSize(10);

// Robot world position UNCHANGED!
console.log(robotWorldX, robotWorldY);
// 0, 0  ✅ Still at center!

// Only UI rendering changes
// Old: (-2, -2) to (2, 2)
// New: (-5, -5) to (4, 4)
```

## Debug Overlay

### CoordinateDebugOverlay Component

**Location**: `/src/components/CoordinateDebugOverlay.jsx`

Displays real-time coordinate information for debugging.

```jsx
import CoordinateDebugOverlay from './components/CoordinateDebugOverlay';
import { WorldCoordinateDebug } from '../utils/worldCoordinates';

const debugHelper = new WorldCoordinateDebug(worldSystem);

const robotDebugInfo = debugHelper.getRobotDebugInfo(
  robotWorldX,
  robotWorldY,
  containerWidth,
  containerHeight
);

const gridDebugInfo = debugHelper.getGridDebugInfo(
  containerWidth,
  containerHeight
);

<CoordinateDebugOverlay
  robotDebugInfo={robotDebugInfo}
  gridDebugInfo={gridDebugInfo}
  visible={true}
  position="bottom-left"
/>
```

**Shows**:
- World coordinates: `(2.500, 1.300)`
- Screen coordinates: `(550.0, 322.0)px`
- Grid cell: `[3, 1]`
- In bounds: `✓ YES`
- Grid size, cell size, world bounds
- Container size, center offset

### Visual Markers

#### GridOriginMarker

Displays (0,0) origin with crosshair:

```jsx
import { GridOriginMarker } from './components/CoordinateDebugOverlay';

<GridOriginMarker
  worldSystem={worldSystem}
  containerWidth={800}
  containerHeight={600}
/>
```

#### RobotPositionMarker

Shows robot position with coordinates:

```jsx
import { RobotPositionMarker } from './components/CoordinateDebugOverlay';

<RobotPositionMarker
  worldSystem={worldSystem}
  robotWorldX={2.5}
  robotWorldY={1.3}
  containerWidth={800}
  containerHeight={600}
  showLabel={true}
/>
```

## Integration Example

### Complete Robot Simulation

```javascript
import React, { useState, useEffect } from 'react';
import WorldCoordinateSystem from '../utils/worldCoordinates';

function RobotSimulation() {
  const [worldSystem] = useState(() => new WorldCoordinateSystem(5, 60));
  
  // Robot position ONLY in world coordinates
  const [robotWorldX, setRobotWorldX] = useState(0);
  const [robotWorldY, setRobotWorldY] = useState(0);
  
  // Target in world coordinates
  const targetWorldX = 3;
  const targetWorldY = 2;

  // Simulation loop (uses ONLY world coordinates)
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotWorldX(prevX => {
        const dx = targetWorldX - prevX;
        const speed = 0.02; // world units per frame
        
        if (Math.abs(dx) < speed) return targetWorldX;
        return prevX + Math.sign(dx) * speed;
      });
      
      setRobotWorldY(prevY => {
        const dy = targetWorldY - prevY;
        const speed = 0.02;
        
        if (Math.abs(dy) < speed) return targetWorldY;
        return prevY + Math.sign(dy) * speed;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [targetWorldX, targetWorldY ]);

  // Convert for rendering
  const containerWidth = 800;
  const containerHeight = 600;
  const screenPos = worldSystem.worldToScreen(
    robotWorldX,
    robotWorldY,
    containerWidth,
    containerHeight
  );

  return (
    <div style={{ width: containerWidth, height: containerHeight, position: 'relative' }}>
      {/* Robot rendered at screen position */}
      <div
        style={{
          position: 'absolute',
          left: screenPos.x,
          top: screenPos.y,
          width: 20,
          height: 20,
          background: 'green',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Debug info */}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'black', color: 'white', padding: 10 }}>
        World: ({robotWorldX.toFixed(3)}, {robotWorldY.toFixed(3)})<br />
        Screen: ({screenPos.x.toFixed(1)}, {screenPos.y.toFixed(1)})
      </div>
    </div>
  );
}
```

### Grid Resize Example

```javascript
function GridWithResize() {
  const [worldSystem] = useState(() => new WorldCoordinateSystem(5, 60));
  const [gridSize, setGridSize] = useState(5);
  const [robotWorldX] = useState(2);
  const [robotWorldY] = useState(1);

  const handleResize = (newSize) => {
    setGridSize(newSize);
    worldSystem.setGridSize(newSize);
    // Robot world coordinates UNCHANGED!
  };

  return (
    <div>
      <button onClick={() => handleResize(gridSize + 1)}>
        Increase Grid Size
      </button>
      
      <p>Grid Size: {gridSize}×{gridSize}</p>
      <p>Robot World Position: ({robotWorldX}, {robotWorldY}) ← NEVER CHANGES</p>
      
      {/* Robot renders at correct screen position regardless of grid size */}
    </div>
  );
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Application Layer                  │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │ Simulation   │      │   UI Rendering   │ │
│  │  (World)     │      │    (Screen)      │ │
│  └──────┬───────┘      └────────▲─────────┘ │
│         │                       │           │
│         │  Robot World Pos      │  Convert  │
│         │  (2.5, 1.3)           │  for      │
│         │                       │  Display  │
│         ▼                       │           │
│  ┌──────────────────────────────┴─────────┐ │
│  │    WorldCoordinateSystem               │ │
│  │                                        │ │
│  │  worldToScreen(2.5, 1.3, w, h)        │ │
│  │  → { x: 550, y: 322 }                 │ │
│  └────────────────────────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
```

## Benefits Summary

| Aspect | Without World Coords | With World Coords |
|--------|---------------------|-------------------|
| **Coordinate Storage** | Mixed with UI | Pure world units |
| **Grid Resize** | Position drifts 😱 | Position stable ✅ |
| **Zoom/Pan** | Breaks simulation | No effect ✅ |
| **Debugging** | Confusing | Clear separation ✅ |
| **Simulation Logic** | UI-dependent | UI-independent ✅ |
| **Physical Accuracy** | Compromised | Accurate ✅ |

## File Reference

### New Files

| File | Purpose |
|------|---------|
| `/src/utils/worldCoordinates.js` | World coordinate system class |
| `/src/components/CoordinateDebugOverlay.jsx` | Debug UI components |
| `/src/components/WorldCoordinateDemo.jsx` | Interactive demonstration |

### Integration Points

Components that should use world coordinates:

- ✅ Robot physics simulation
- ✅ Path planning algorithms
- ✅ Collision detection
- ✅ Sensor simulation
- ✅ Distance/angle calculations

Components that use screen coordinates:

- ✅ Mouse click handlers (convert to world)
- ✅ Canvas rendering (convert from world)
- ✅ Visual markers and overlays

## Best Practices

### DO ✅

```javascript
// Store position in world coordinates
const [robotWorldX, setRobotWorldX] = useState(2.5);

// Physics in world coordinates
const newX = robotWorldX + velocity * deltaTime;

// Convert for rendering
const screenPos = worldSystem.worldToScreen(robotWorldX, robotWorldY, w, h);
```

### DON'T ❌

```javascript
// Don't store screen coordinates for simulation
const [robotScreenX, setRobotScreenX] = useState(550);  // BAD!

// Don't mix coordinate systems
const newX = robotScreenX / cellSize + robotWorldX;  // VERY BAD!

// Don't modify world coordinates on UI changes
function handleResize() {
  robotWorldX = robotWorldX * newScale;  // NEVER DO THIS!
}
```

## Testing Coordinate Stability

```javascript
function testCoordinateStability() {
  const worldSystem = new WorldCoordinateSystem(5, 60);
  
  // Robot at center
  let robotWorldX = 0;
  let robotWorldY = 0;
  
  // Get screen position (800×600 container)
  const screen1 = worldSystem.worldToScreen(robotWorldX, robotWorldY, 800, 600);
  console.log('Before resize:', screen1);
  // { x: 400, y: 300 }  ← Center of 800×600
  
  // Resize grid
  worldSystem.setGridSize(10);
  
  // Robot world position UNCHANGED
  console.log('Robot world pos:', robotWorldX, robotWorldY);
  // 0, 0  ✅ Still at world origin!
  
  // Screen position also unchanged (same container)
  const screen2 = worldSystem.worldToScreen(robotWorldX, robotWorldY, 800, 600);
  console.log('After resize:', screen2);
  // { x: 400, y: 300 }  ✅ Still at screen center!
}
```

## Summary

The world coordinate system provides:

✅ **Simulation Integrity**: Physics calculations independent of UI  
✅ **Coordinate Stability**: No drift on grid resize or viewport changes  
✅ **Clear Separation**: Simulation layer separate from rendering layer  
✅ **Easier Debugging**: Debug overlays show both coordinate systems  
✅ **Mathematical Precision**: Calculations in logical world units  
✅ **UI Flexibility**: Change UI without affecting simulation  

**Key Principle**: Simulation uses world coordinates exclusively. UI converts world → screen for rendering only.
