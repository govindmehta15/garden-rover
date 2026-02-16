/**
 * Cartesian Coordinate-based Simulation Engine
 * Uses (x, y) Cartesian coordinates with (0, 0) at center
 */

import CartesianGrid from '../utils/cartesianGrid';

class CartesianSimulationEngine {
    constructor() {
        this.cellSize = 2; // meters per cell
        this.grid = new CartesianGrid(5);

        // Physics constants
        this.maxVelocity = 2.0; // m/s
        this.acceleration = 0.5; // m/s²
        this.angularVelocity = 1.5; // rad/s
        this.arrivalThreshold = 0.3; // meters
    }

    /**
     * Set grid size and maintain existing cell data
     */
    setGridSize(newSize) {
        this.grid.resize(newSize);
    }

    /**
     * Get grid data
     */
    getGrid() {
        return this.grid;
    }

    /**
     * Convert Cartesian (x, y) to 3D world position for rendering
     */
    toWorldPosition(x, y) {
        return this.grid.toWorldPosition(x, y, this.cellSize);
    }

    /**
     * Convert 3D world position to Cartesian (x, y)
     */
    fromWorldPosition(worldX, worldZ) {
        return this.grid.fromWorldPosition(worldX, worldZ, this.cellSize);
    }

    /**
     * A* pathfinding with Cartesian coordinates
     */
    findPath(startCoord, endCoord, obstacles) {
        const { x: startX, y: startY } = startCoord;
        const { x: endX, y: endY } = endCoord;

        // Check bounds
        if (!this.grid.isInBounds(startX, startY) || !this.grid.isInBounds(endX, endY)) {
            console.warn('Path start or end is out of bounds');
            return [];
        }

        const openSet = [{ x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, endX, endY), f: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();

        const key = (x, y) => `${x},${y}`;

        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                const path = [];
                let curr = current;
                while (curr) {
                    path.unshift({ x: curr.x, y: curr.y });
                    curr = cameFrom.get(key(curr.x, curr.y));
                }
                return path;
            }

            closedSet.add(key(current.x, current.y));

            // Check neighbors (4-directional)
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                if (!this.grid.isInBounds(neighbor.x, neighbor.y)) continue;
                if (closedSet.has(key(neighbor.x, neighbor.y))) continue;

                // Check if obstacle
                const cell = this.grid.getCell(neighbor.x, neighbor.y);
                if (obstacles && obstacles.has(key(neighbor.x, neighbor.y))) continue;
                if (cell.type === 'obstacle') continue;

                const g = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y, endX, endY);
                const f = g + h;

                const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (existingNode) {
                    if (g < existingNode.g) {
                        existingNode.g = g;
                        existingNode.f = f;
                        cameFrom.set(key(neighbor.x, neighbor.y), current);
                    }
                } else {
                    openSet.push({ x: neighbor.x, y: neighbor.y, g, h, f });
                    cameFrom.set(key(neighbor.x, neighbor.y), current);
                }
            }
        }

        console.warn('No path found');
        return [];
    }

    /**
     * Manhattan distance heuristic
     */
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /**
     * Update robot pose with physics
     * targetCoord: { x, y } in Cartesian coordinates
     * currentPose: { x, y, z, theta, velocity } in world coordinates
     */
    updateRobotPose(currentPose, targetCoord, speedMultiplier = 1) {
        const targetWorld = this.toWorldPosition(targetCoord.x, targetCoord.y);

        // Current position in world coordinates
        const dx = targetWorld.x - currentPose.x;
        const dz = targetWorld.z - currentPose.z;
        const distanceToTarget = Math.sqrt(dx * dx + dz * dz);

        // Check arrival
        if (distanceToTarget < this.arrivalThreshold) {
            return {
                ...currentPose,
                x: targetWorld.x,
                z: targetWorld.z,
                velocity: 0,
                arrived: true,
                cartesian: targetCoord
            };
        }

        // Calculate desired heading
        const desiredTheta = Math.atan2(dz, dx);
        let thetaDiff = desiredTheta - currentPose.theta;

        // Normalize angle difference
        while (thetaDiff > Math.PI) thetaDiff -= 2 * Math.PI;
        while (thetaDiff < -Math.PI) thetaDiff += 2 * Math.PI;

        // Update orientation
        const maxRotation = this.angularVelocity * speedMultiplier * (1 / 60);
        const newTheta = currentPose.theta + Math.sign(thetaDiff) * Math.min(Math.abs(thetaDiff), maxRotation);

        // Update velocity with acceleration
        const isAligned = Math.abs(thetaDiff) < 0.5;
        let newVelocity = currentPose.velocity;

        if (isAligned) {
            newVelocity = Math.min(newVelocity + this.acceleration * speedMultiplier * (1 / 60), this.maxVelocity * speedMultiplier);
        } else {
            newVelocity = Math.max(newVelocity - this.acceleration * (1 / 60), 0);
        }

        // Update position
        const newX = currentPose.x + Math.cos(newTheta) * newVelocity * (1 / 60);
        const newZ = currentPose.z + Math.sin(newTheta) * newVelocity * (1 / 60);

        return {
            x: newX,
            y: currentPose.y || 0,
            z: newZ,
            theta: newTheta,
            velocity: newVelocity,
            arrived: false,
            cartesian: this.fromWorldPosition(newX, newZ)
        };
    }

    /**
     * Get next waypoint in path
     */
    getNextWaypoint(pathCoords, currentIndex) {
        if (!pathCoords || currentIndex >= pathCoords.length) return null;
        return pathCoords[currentIndex];
    }
}

// Singleton instance
const cartesianEngine = new CartesianSimulationEngine();

export default cartesianEngine;
