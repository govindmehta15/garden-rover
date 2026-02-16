/**
 * Cartesian Coordinate System for Garden Grid
 * 
 * Uses mathematical (x, y) coordinates with (0, 0) at the center
 * Grid extends equally in all 4 directions from the center
 */

export class CartesianGrid {
    constructor(gridSize = 5) {
        this.gridSize = gridSize;
        this.cells = {}; // Store as { "x,y": { type, moisture, temperature, explored } }
    }

    /**
     * Convert grid size to coordinate range
     * For odd size (e.g., 5): -2 to +2
     * For even size (e.g., 6): -3 to +2 (slightly asymmetric but maintains center)
     */
    getCoordinateRange() {
        const halfSize = Math.floor(this.gridSize / 2);
        const min = -halfSize;
        const max = this.gridSize - halfSize - 1;
        return { min, max };
    }

    /**
     * Create coordinate key for storage
     */
    static coordKey(x, y) {
        return `${x},${y}`;
    }

    /**
     * Parse coordinate key back to {x, y}
     */
    static parseCoordKey(key) {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
    }

    /**
     * Check if coordinate is within grid bounds
     */
    isInBounds(x, y) {
        const { min, max } = this.getCoordinateRange();
        return x >= min && x <= max && y >= min && y <= max;
    }

    /**
     * Get cell at coordinate
     */
    getCell(x, y) {
        const key = CartesianGrid.coordKey(x, y);
        return this.cells[key] || { type: 'empty', moisture: 0, temperature: 20, explored: false };
    }

    /**
     * Set cell at coordinate
     */
    setCell(x, y, data) {
        if (!this.isInBounds(x, y)) {
            console.warn(`Coordinate (${x}, ${y}) is out of bounds for grid size ${this.gridSize}`);
            return;
        }
        const key = CartesianGrid.coordKey(x, y);
        this.cells[key] = { ...this.cells[key], ...data };
    }

    /**
     * Remove cell at coordinate
     */
    removeCell(x, y) {
        const key = CartesianGrid.coordKey(x, y);
        delete this.cells[key];
    }

    /**
     * Resize grid - maintains existing coordinates, adds new cells
     */
    resize(newGridSize) {
        const oldSize = this.gridSize;
        this.gridSize = newGridSize;

        // If shrinking, remove out-of-bounds cells
        if (newGridSize < oldSize) {
            const { min, max } = this.getCoordinateRange();
            Object.keys(this.cells).forEach(key => {
                const { x, y } = CartesianGrid.parseCoordKey(key);
                if (!this.isInBounds(x, y)) {
                    delete this.cells[key];
                }
            });
        }
        // If growing, no action needed - cells naturally extend
    }

    /**
     * Get all cells as array for iteration
     */
    getAllCells() {
        const { min, max } = this.getCoordinateRange();
        const cells = [];

        // Iterate top-to-bottom, left-to-right for consistent ordering
        for (let y = max; y >= min; y--) {
            for (let x = min; x <= max; x++) {
                cells.push({
                    x,
                    y,
                    key: CartesianGrid.coordKey(x, y),
                    ...this.getCell(x, y)
                });
            }
        }

        return cells;
    }

    /**
     * Convert Cartesian (x, y) to 3D world position
     * For Three.js rendering
     */
    toWorldPosition(x, y, cellSize = 2) {
        return {
            x: x * cellSize,
            y: 0, // Ground level
            z: -y * cellSize // Negative because Three.js Z+ is towards camera
        };
    }

    /**
     * Convert 3D world position to Cartesian (x, y)
     */
    fromWorldPosition(worldX, worldZ, cellSize = 2) {
        return {
            x: Math.round(worldX / cellSize),
            y: Math.round(-worldZ / cellSize)
        };
    }

    /**
     * Export grid data as JSON
     */
    export() {
        return {
            gridSize: this.gridSize,
            cells: { ...this.cells }
        };
    }

    /**
     * Import grid data from JSON
     */
    import(data) {
        this.gridSize = data.gridSize;
        this.cells = { ...data.cells };
    }

    /**
     * Clone grid
     */
    clone() {
        const newGrid = new CartesianGrid(this.gridSize);
        newGrid.cells = { ...this.cells };
        return newGrid;
    }
}

/**
 * Migration utilities for converting old index-based grids
 */
export class GridMigration {
    /**
     * Convert old array-based grid to Cartesian
     * Old format: array of cells indexed 0 to gridSize*gridSize-1
     */
    static arrayToCartesian(arrayGrid, gridSize) {
        const grid = new CartesianGrid(gridSize);
        const { min, max } = grid.getCoordinateRange();

        let index = 0;
        // Iterate top-to-bottom, left-to-right (same order as array)
        for (let y = max; y >= min; y--) {
            for (let x = min; x <= max; x++) {
                if (index < arrayGrid.length) {
                    const cell = arrayGrid[index];
                    if (cell && cell.type !== 'empty') {
                        grid.setCell(x, y, cell);
                    }
                }
                index++;
            }
        }

        return grid;
    }

    /**
     * Convert old path array (indices) to Cartesian coordinates
     */
    static pathToCartesian(pathIndices, gridSize) {
        const grid = new CartesianGrid(gridSize);
        const { min, max } = grid.getCoordinateRange();

        return pathIndices.map(index => {
            // Calculate row and column from index
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            // Convert to Cartesian (top-left of grid is (min, max))
            const x = min + col;
            const y = max - row;

            return { x, y };
        });
    }
}

export default CartesianGrid;
