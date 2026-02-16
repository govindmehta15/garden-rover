/**
 * World Coordinate System
 * 
 * Separates logical simulation coordinates from UI rendering coordinates.
 * 
 * Key Principles:
 * - 1 world unit = 1 grid cell
 * - Robot position stored ONLY in world coordinates
 * - UI rendering converts world → screen
 * - Grid resize only affects UI offsets, NOT world coordinates
 */

export class WorldCoordinateSystem {
    constructor(gridSize = 5, cellPixelSize = 60) {
        this.gridSize = gridSize;
        this.cellPixelSize = cellPixelSize; // Pixels per grid cell in UI

        // World bounds (in world units)
        this.updateWorldBounds();
    }

    /**
     * Update world bounds based on grid size
     * Called when grid size changes
     */
    updateWorldBounds() {
        const halfSize = Math.floor(this.gridSize / 2);
        this.worldMinX = -halfSize;
        this.worldMaxX = this.gridSize - halfSize - 1;
        this.worldMinY = -halfSize;
        this.worldMaxY = this.gridSize - halfSize - 1;
    }

    /**
     * Set grid size (affects world bounds only)
     * Does NOT affect existing world coordinates
     */
    setGridSize(newGridSize) {
        this.gridSize = newGridSize;
        this.updateWorldBounds();
    }

    /**
     * Set UI cell size (affects rendering only)
     */
    setCellPixelSize(newCellSize) {
        this.cellPixelSize = newCellSize;
    }

    /**
     * Check if world coordinate is within grid bounds
     */
    isInBounds(worldX, worldY) {
        return worldX >= this.worldMinX &&
            worldX <= this.worldMaxX &&
            worldY >= this.worldMinY &&
            worldY <= this.worldMaxY;
    }

    /**
     * Get grid center offset in pixels for UI rendering
     */
    getCenterOffset(containerWidth, containerHeight) {
        return {
            x: containerWidth / 2,
            y: containerHeight / 2
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     * 
     * World coordinates: logical grid position (e.g., 0, 0 = center)
     * Screen coordinates: pixel position on screen
     * 
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @returns {{x: number, y: number}} Screen coordinates in pixels
     */
    worldToScreen(worldX, worldY, containerWidth, containerHeight) {
        const centerOffset = this.getCenterOffset(containerWidth, containerHeight);

        return {
            x: worldX * this.cellPixelSize + centerOffset.x,
            y: -worldY * this.cellPixelSize + centerOffset.y  // Negative Y because screen Y goes down
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * 
     * @param {number} screenX - Screen X coordinate in pixels
     * @param {number} screenY - Screen Y coordinate in pixels
     * @param {number} containerWidth - Container width in pixels
     * @param {number} containerHeight - Container height in pixels
     * @returns {{x: number, y: number}} World coordinates
     */
    screenToWorld(screenX, screenY, containerWidth, containerHeight) {
        const centerOffset = this.getCenterOffset(containerWidth, containerHeight);

        return {
            x: (screenX - centerOffset.x) / this.cellPixelSize,
            y: -(screenY - centerOffset.y) / this.cellPixelSize  // Negative Y conversion
        };
    }

    /**
     * Snap world coordinates to grid cell center
     * Useful for placing objects on grid
     */
    snapToGrid(worldX, worldY) {
        return {
            x: Math.round(worldX),
            y: Math.round(worldY)
        };
    }

    /**
     * Get cell corners in world coordinates
     */
    getCellBounds(gridX, gridY) {
        return {
            minX: gridX - 0.5,
            maxX: gridX + 0.5,
            minY: gridY - 0.5,
            maxY: gridY + 0.5
        };
    }

    /**
     * Check if world position is within a specific grid cell
     */
    isInCell(worldX, worldY, gridX, gridY) {
        const bounds = this.getCellBounds(gridX, gridY);
        return worldX >= bounds.minX &&
            worldX <= bounds.maxX &&
            worldY >= bounds.minY &&
            worldY <= bounds.maxY;
    }

    /**
     * Get which grid cell a world position is in
     */
    getCell(worldX, worldY) {
        return {
            x: Math.floor(worldX + 0.5),
            y: Math.floor(worldY + 0.5)
        };
    }

    /**
     * Calculate distance between two world coordinates
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate angle from point 1 to point 2 (in radians)
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Export system state
     */
    export() {
        return {
            gridSize: this.gridSize,
            cellPixelSize: this.cellPixelSize,
            worldBounds: {
                minX: this.worldMinX,
                maxX: this.worldMaxX,
                minY: this.worldMinY,
                maxY: this.worldMaxY
            }
        };
    }
}

/**
 * Debug overlay data generator
 */
export class WorldCoordinateDebug {
    constructor(worldSystem) {
        this.worldSystem = worldSystem;
    }

    /**
     * Generate debug info for a robot position
     */
    getRobotDebugInfo(robotWorldX, robotWorldY, containerWidth, containerHeight) {
        const screen = this.worldSystem.worldToScreen(robotWorldX, robotWorldY, containerWidth, containerHeight);
        const cell = this.worldSystem.getCell(robotWorldX, robotWorldY);

        return {
            world: {
                x: robotWorldX.toFixed(3),
                y: robotWorldY.toFixed(3)
            },
            screen: {
                x: screen.x.toFixed(1),
                y: screen.y.toFixed(1)
            },
            cell: {
                x: cell.x,
                y: cell.y
            },
            inBounds: this.worldSystem.isInBounds(robotWorldX, robotWorldY)
        };
    }

    /**
     * Generate debug info for grid system
     */
    getGridDebugInfo(containerWidth, containerHeight) {
        const centerOffset = this.worldSystem.getCenterOffset(containerWidth, containerHeight);
        const state = this.worldSystem.export();

        return {
            gridSize: `${state.gridSize}×${state.gridSize}`,
            cellPixelSize: `${state.cellPixelSize}px`,
            worldBounds: {
                x: `[${state.worldBounds.minX}, ${state.worldBounds.maxX}]`,
                y: `[${state.worldBounds.minY}, ${state.worldBounds.maxY}]`
            },
            centerOffset: {
                x: centerOffset.x.toFixed(0),
                y: centerOffset.y.toFixed(0)
            },
            containerSize: {
                width: containerWidth,
                height: containerHeight
            }
        };
    }
}

export default WorldCoordinateSystem;
