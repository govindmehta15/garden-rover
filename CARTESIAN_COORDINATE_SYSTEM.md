# Cartesian Coordinate System Implementation

## Overview

The garden grid now uses a **mathematical Cartesian coordinate system** with `(0, 0)` at the center. This ensures **coordinate stability** when resizing the grid.

## Coordinate System

### Center-Origin Grid

```
For 5×5 Grid:
(-2,2)  (-1,2)  (0,2)  (1,2)  (2,2)
(-2,1)  (-1,1)  (0,1)  (1,1)  (2,1)
(-2,0)  (-1,0)  (0,0)  (1,0)  (2,0)    ← Center Row
(-2,-1) (-1,-1) (0,-1) (1,-1) (2,-1)
(-2,-2) (-1,-2) (0,-2) (1,-2) (2,-2)
  ↑
Center Column
```

### Coordinate Ranges

| Grid Size | Min X,Y | Max X,Y | Total Cells |
|-----------|---------|---------|-------------|
| 5×5       | -2      | +2      | 25          |
| 7×7       | -3      | +3      | 49          |
| 10×10     | -5      | +4      | 100         |
| 15×15     | -7      | +7      | 225         |
| 25×25     | -12     | +12     | 625         |

**Formula**: For grid size `n`:
- `min = -floor(n/2)`
- `max = n - floor(n/2) - 1`

## Data Structure

### Grid Storage

**Old Format** (Array-based):
```javascript
gridData = [
  { type: 'plant', moisture: 75 },  // Index 0
  { type: 'empty', moisture: 0 },   // Index 1
  // ... 23 more cells
]
```

**New Format** (Object-based):
```javascript
grid.cells = {
  "0,0": { type: 'plant', moisture: 75, temperature: 22, explored: false },
  "1,2": { type: 'obstacle', explored: false },
  "-2,-1": { type: 'plant', moisture: 60, temperature: 24, explored: true }
}
```

### Robot Position

**Old Format**:
```javascript
robotPose = { x: -4, y: -4, theta: 0 } // World coordinates only
```

**New Format**:
```javascript
robotPose = {
  x: 0,        // World X (meters)
  y: 0,        // World Y (height)
  z: 0,        // World Z (meters) 
  theta: 0,    // Orientation (radians)
  velocity: 0, // Speed (m/s)
  cartesian: { x: 0, y: 0 }  // Grid coordinates
}
```

### Path

**Old Format** (Array indices):
```javascript
path = [0, 1, 6, 7, 12]  // Cell indices
```

**New Format** (Coordinates):
```javascript
path = [
  { x: -2, y: 2 },
  { x: -1, y: 2 },
  { x: -2, y: 1 },
  { x: -1, y: 1 },
  { x: 0, y: 0 }
]
```

## Key Classes

### CartesianGrid

**Location**: `/src/utils/cartesianGrid.js`

**Purpose**: Manages grid data with Cartesian coordinates

**Key Methods**:
```javascript
const grid = new CartesianGrid(5);

// Get/Set cells
grid.setCell(0, 0, { type: 'plant', moisture: 75 });
const cell = grid.getCell(0, 0);

// Coordinate utilities
const { min, max } = grid.getCoordinateRange();  // { min: -2, max: 2 }
const isValid = grid.isInBounds(3, 3);           // false

// Resize (maintains existing coordinates!)
grid.resize(10);  // Expands to 10×10, existing cells stay at same coords

// Export/Import
const data = grid.export();  // Save to JSON
grid.import(data);           // Load from JSON

// Coordinate conversion
const worldPos = grid.toWorldPosition(0, 0);     // { x: 0, y: 0, z: 0 }
const gridCoord = grid.fromWorldPosition(4, -4); // { x: 2, y: 2 }
```

### CartesianSimulationEngine

**Location**: `/src/services/cartesianEngine.js`

**Purpose**: Physics simulation and pathfinding with Cartesian coordinates

**Key Methods**:
```javascript
import cartesianEngine from '../services/cartesianEngine';

// Set grid
cartesianEngine.setGridSize(10);

// Pathfinding
const path = cartesianEngine.findPath(
  { x: -2, y: 2 },  // Start
  { x: 3, y: -1 },  // End
  obstacleSet       // Set of "x,y" keys
);
// Returns: [{ x: -2, y: 2 }, { x: -1, y: 2 }, ..., { x: 3, y: -1 }]

// Robot movement
const newPose = cartesianEngine.updateRobotPose(
  currentPose,
  { x: 1, y: 1 },  // Target coordinate
  1.5              // Speed multiplier
);
```

## Components

### CartesianGridEditor

**Location**: `/src/components/CartesianGridEditor.jsx`

**Features**:
- ✅ Center-origin (0,0) marked with yellow dot
- ✅ Coordinate overlay (toggle with "Coords" button)
- ✅ Grid resize maintains existing coordinates
- ✅ Tools: Plant, Obstacle, Waypoint, Erase
- ✅ Visual coordinate display on hover
- ✅ Path waypoints numbered in pink

**Usage**:
```jsx
import CartesianGrid from '../utils/cartesianGrid';
import CartesianGridEditor from '../components/CartesianGridEditor';

const [grid, setGrid] = useState(new CartesianGrid(5));
const [path, setPath] = useState([]);

<CartesianGridEditor
  grid={grid}
  onGridChange={setGrid}
  path={path}
  onPathChange={setPath}
  onSave={() => console.log(grid.export())}
/>
```

### CartesianScene3D

**Location**: `/src/components/CartesianScene3D.jsx`

**Features**:
- ✅ 3D rendering with Cartesian coordinate axis
- ✅ Red axis = +X, Blue axis = -Y
- ✅ Yellow sphere at origin (0,0)
- ✅ Optional coordinate labels on grid cells
- ✅ Path visualization
- ✅ Robot position tracking

**Usage**:
```jsx
<CartesianScene3D
  grid={cartesianGrid}
  robotPose={{ x: 0, y: 0, z: 0, theta: 0 }}
  path={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
  targetCoord={{ x: 1, y: 1 }}
  showAxis={true}
  showCoordinateLabels={true}
  isScanning={true}
/>
```

## Coordinate Stability

### Problem (Old System)

```javascript
// 5×5 Grid - Plant at index 12 (center)
gridData[12] = { type: 'plant' };

// Resize to 7×7
// Plant is STILL at index 12 but now that's NOT the center!
// Index 12 is now top-left area 😱
```

### Solution (New System)

```javascript
// 5×5 Grid - Plant at (0, 0) center
grid.setCell(0, 0, { type: 'plant' });

// Resize to 7×7
grid.resize(7);

// Plant is STILL at (0, 0) which is STILL the center! ✅
// Coordinates are STABLE!
```

## Migration from Old System

### Converting Existing Templates

Use the `GridMigration` utility:

```javascript
import { GridMigration } from '../utils/cartesianGrid';

// Old template
const oldTemplate = {
  gridSize: 5,
  cells: [/* 25 cells array */],
  defaultPath: [0, 1, 6, 7, 12]
};

// Convert to Cartesian
const newGrid = GridMigration.arrayToCartesian(oldTemplate.cells, oldTemplate.gridSize);
const newPath = GridMigration.pathToCartesian(oldTemplate.defaultPath, oldTemplate.gridSize);

console.log(newGrid.export());
// {
//   gridSize: 5,
//   cells: {
//     "-2,2": { type: 'plant', ... },
//     "0,0": { type: 'obstacle', ... }
//   }
// }

console.log(newPath);
// [{ x: -2, y: 2 }, { x: -1, y: 2 }, ...]
```

## Coordinate Conversion Reference

### Grid → World (for 3D Rendering)

```javascript
// Cartesian (0, 0) → World (0, 0, 0)
// Cartesian (1, 0) → World (2, 0, 0)   [+X direction]
// Cartesian (0, 1) → World (0, 0, -2)  [+Y is -Z in Three.js]
// Cartesian (-1, 0) → World (-2, 0, 0) [-X direction]

const cellSize = 2; // meters
const world = {
  x: gridX * cellSize,
  y: 0,
  z: -gridY * cellSize  // Note the negative!
};
```

### World → Grid (for Click Detection)

```javascript
const grid = {
  x: Math.round(worldX / cellSize),
  y: Math.round(-worldZ / cellSize)  // Note the negative!
};
```

## Examples

### Example 1: Resizing Grid

```javascript
const grid = new CartesianGrid(5);

// Add plants
grid.setCell(0, 0, { type: 'plant', moisture: 80 });   // Center
grid.setCell(2, 2, { type: 'plant', moisture: 60 });   // Top-right
grid.setCell(-2, -2, { type: 'plant', moisture: 70 }); // Bottom-left

console.log(grid.getCoordinateRange());
// { min: -2, max: 2 }

// Resize to 10×10
grid.resize(10);

console.log(grid.getCoordinateRange());
// { min: -5, max: 4 }

// Plants are still at same coordinates!
console.log(grid.getCell(0, 0));    // { type: 'plant', moisture: 80 } ✅
console.log(grid.getCell(2, 2));    // { type: 'plant', moisture: 60 } ✅
console.log(grid.getCell(-2, -2));  // { type: 'plant', moisture: 70 } ✅
```

### Example 2: Pathfinding

```javascript
import cartesianEngine from '../services/cartesianEngine';

const grid = new CartesianGrid(5);
grid.setCell(0, 0, { type: 'obstacle' });

const path = cartesianEngine.findPath(
  { x: -2, y: -2 },  // Bottom-left
  { x: 2, y: 2 },    // Top-right
  new Set(['0,0'])   // Obstacles
);

console.log(path);
// [
//   { x: -2, y: -2 },
//   { x: -1, y: -2 },
//   { x: 0, y: -2 },
//   { x: 1, y: -1 },
//   { x: 2, y: 0 },
//   { x: 2, y: 1 },
//   { x: 2, y: 2 }
// ]
// Path avoids (0, 0)!
```

### Example 3: Robot Movement

```javascript
let robotPose = { x: 0, y: 0, z: 0, theta: 0, velocity: 0 };
const targetCoord = { x: 2, y: 2 };

// Simulation loop
setInterval(() => {
  robotPose = cartesianEngine.updateRobotPose(
    robotPose,
    targetCoord,
    1.0  // Normal speed
  );

  console.log(robotPose);
  // { x: 0.033, y: 0, z: -0.033, theta: 0.785, velocity: 1.2, cartesian: { x: 0, y: 0 } }
  // ...
  // { x: 3.99, y: 0, z: -3.99, theta: 0.785, velocity: 2.0, arrived: true, cartesian: { x: 2, y: 2 } }
}, 1000 / 60);
```

## Benefits

| Feature | Old System (Index) | New System (Cartesian) |
|---------|-------------------|------------------------|
| Center Reference | Changes on resize | Always (0,0) |
| Coordinate Stability | ❌ Shifts on resize | ✅ Stable on resize |
| Mathematical Operations | Complex conversions | Direct arithmetic |
| Debugging | Hard to visualize | Intuitive |
| Expandability | Requires full rebuild | Add cells in any direction |
| UI Display | Need manual mapping | Natural coordinate display |

## Visual Guide

### Coordinate Display Options

**Editor with Coordinates Shown**:
```
┌─────┬─────┬─────┬─────┬─────┐
│-2,2 │-1,2 │ 0,2 │ 1,2 │ 2,2 │
├─────┼─────┼─────┼─────┼─────┤
│-2,1 │-1,1 │ 0,1 │ 1,1 │ 2,1 │
├─────┼─────┼─────┼─────┼─────┤
│-2,0 │-1,0 │⭐0,0│ 1,0 │ 2,0 │ ← ⭐ = Origin
├─────┼─────┼─────┼─────┼─────┤
│-2,-1│-1,-1│0,-1 │1,-1 │2,-1 │
├─────┼─────┼─────┊─────┼─────┤
│-2,-2│-1,-2│0,-2 │1,-2 │2,-2 │
└─────┴─────┴─────┴─────┴─────┘
```

**3D Scene with Axis**:
```
       +Y (Blue)
        │
        │
        └────── +X (Red)
       /
      /
    ⭐ Origin (0,0)
```

## File Reference

### New Files Created

| File | Purpose |
|------|---------|
| `/src/utils/cartesianGrid.js` | Core grid class |
| `/src/services/cartesianEngine.js` | Physics & pathfinding |
| `/src/components/CartesianGridEditor.jsx` | 2D editor UI |
| `/src/components/CartesianScene3D.jsx` | 3D visualization |

### Files to Update (Migration)

| File | Changes Needed |
|------|----------------|
| `GardenSimulationSection.jsx` | Use CartesianGrid instead of array |
| `PersistentGardenSimulation.jsx` | Use CartesianGrid |
| `gardenTemplates.js` | Convert to Cartesian format |

## Summary

The Cartesian coordinate system provides:

✅ **Stable Coordinates**: (0,0) always at center  
✅ **Intuitive Math**: Direct x,y arithmetic  
✅ **Resize Safety**: Existing objects stay at same coordinates  
✅ **Visual Clarity**: Coordinates match mathematical intuition  
✅ **Debugging Ease**: Easy to understand and troubleshoot  
✅ **Scalability**: Grid can grow in any direction  

**Migration**: Use `GridMigration` utilities to convert existing data.
