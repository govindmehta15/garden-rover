// Simulation Engine Service
// Handles robot movement physics, pathfinding, and state management

class SimulationEngine {
    constructor() {
        this.gridSize = 5;
        this.cellSize = 2;
        this.gridOffset = (5 * this.cellSize) / 2 - (this.cellSize / 2);

        // Physics constants
        this.maxSpeed = 0.15; // units per frame
        this.acceleration = 0.008;
        this.deceleration = 0.012;
        this.rotationSpeed = 0.1;
        this.arrivalThreshold = 0.08;
    }

    // Update grid configuration - call this when grid size changes
    setGridSize(newGridSize) {
        this.gridSize = newGridSize;
        this.gridOffset = (newGridSize * this.cellSize) / 2 - (this.cellSize / 2);
    }

    // Convert grid index to world coordinates
    getWorldPosition(index, gridSize = null) {
        const size = gridSize || this.gridSize;
        const row = Math.floor(index / size);
        const col = index % size;
        const offset = (size * this.cellSize) / 2 - (this.cellSize / 2);
        const x = (col * this.cellSize) - offset;
        const z = (row * this.cellSize) - offset;
        return { x, y: z }; // y is z in 3D
    }

    // Convert world coordinates to grid index
    getGridIndex(x, y, gridSize = null) {
        const size = gridSize || this.gridSize;
        const offset = (size * this.cellSize) / 2 - (this.cellSize / 2);
        const col = Math.round((x + offset) / this.cellSize);
        const row = Math.round((y + offset) / this.cellSize);
        if (row < 0 || row >= size || col < 0 || col >= size) return -1;
        return row * size + col;
    }

    // Get grid coordinates from index
    getGridCoords(index, gridSize = null) {
        const size = gridSize || this.gridSize;
        return {
            row: Math.floor(index / size),
            col: index % size
        };
    }

    // Calculate index from row, col
    getIndex(row, col, gridSize = null) {
        const size = gridSize || this.gridSize;
        if (row < 0 || row >= size || col < 0 || col >= size) return -1;
        return row * size + col;
    }

    // A* Pathfinding with better heuristic
    findPath(startIdx, endIdx, gridData) {
        const openSet = new Set([startIdx]);
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(startIdx, 0);
        fScore.set(startIdx, this.heuristic(startIdx, endIdx));

        while (openSet.size > 0) {
            // Get node with lowest fScore
            let current = null;
            let lowestF = Infinity;
            for (const node of openSet) {
                const f = fScore.get(node) || Infinity;
                if (f < lowestF) {
                    lowestF = f;
                    current = node;
                }
            }

            if (current === endIdx) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(current);
            closedSet.add(current);

            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;

                const cell = gridData[neighbor];
                // Skip obstacles and plants (can't walk through)
                if (cell.type === 'obstacle' || cell.type === 'plant') continue;

                const tentativeG = (gScore.get(current) || 0) + 1;

                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                } else if (tentativeG >= (gScore.get(neighbor) || Infinity)) {
                    continue;
                }

                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeG);
                fScore.set(neighbor, tentativeG + this.heuristic(neighbor, endIdx));
            }
        }

        return []; // No path found
    }

    heuristic(a, b) {
        const aCoords = this.getGridCoords(a);
        const bCoords = this.getGridCoords(b);
        return Math.abs(aCoords.row - bCoords.row) + Math.abs(aCoords.col - bCoords.col);
    }

    getNeighbors(index) {
        const { row, col } = this.getGridCoords(index);
        const neighbors = [];

        // 4-connectivity
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
            const idx = this.getIndex(row + dr, col + dc);
            if (idx !== -1) neighbors.push(idx);
        });

        return neighbors;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            path.unshift(current);
        }
        return path.slice(1); // Remove start position
    }

    // Find nearest accessible cell to a target (for when target is obstacle/plant)
    findNearestAccessible(targetIdx, gridData, currentIdx) {
        const { row, col } = this.getGridCoords(targetIdx);
        const neighbors = [];

        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
            const idx = this.getIndex(row + dr, col + dc);
            if (idx !== -1 && gridData[idx].type === 'empty') {
                const dist = this.heuristic(currentIdx, idx);
                neighbors.push({ idx, dist });
            }
        });

        neighbors.sort((a, b) => a.dist - b.dist);
        return neighbors.length > 0 ? neighbors[0].idx : currentIdx;
    }

    // Realistic robot movement with physics
    updateRobotPose(currentPose, targetPos, deltaTime = 1) {
        const dx = targetPos.x - currentPose.x;
        const dy = targetPos.y - currentPose.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.arrivalThreshold) {
            return {
                x: targetPos.x,
                y: targetPos.y,
                theta: currentPose.theta,
                velocity: 0,
                arrived: true
            };
        }

        // Calculate target angle
        const targetAngle = Math.atan2(dy, dx);

        // Smooth rotation towards target
        let currentAngle = currentPose.theta || 0;
        let angleDiff = targetAngle - currentAngle;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.rotationSpeed * deltaTime);

        // Velocity control with acceleration/deceleration
        const currentVel = currentPose.velocity || 0;
        let newVel = currentVel;

        // Decelerate when close to target or turning sharply
        const shouldDecelerate = distance < 1.0 || Math.abs(angleDiff) > 0.5;

        if (shouldDecelerate) {
            newVel = Math.max(0, currentVel - this.deceleration * deltaTime);
        } else {
            newVel = Math.min(this.maxSpeed, currentVel + this.acceleration * deltaTime);
        }

        // Apply velocity
        const moveX = Math.cos(newAngle) * newVel * deltaTime;
        const moveY = Math.sin(newAngle) * newVel * deltaTime;

        return {
            x: currentPose.x + moveX,
            y: currentPose.y + moveY,
            theta: newAngle,
            velocity: newVel,
            arrived: false
        };
    }

    // Get next waypoint from path queue
    getNextWaypoint(path, currentIdx) {
        if (!path || path.length === 0) return null;

        // Skip waypoints we're already very close to
        let nextIdx = 0;
        const currentPos = this.getWorldPosition(currentIdx);

        for (let i = 0; i < path.length; i++) {
            const wpPos = this.getWorldPosition(path[i]);
            const dist = Math.sqrt(
                Math.pow(wpPos.x - currentPos.x, 2) +
                Math.pow(wpPos.y - currentPos.y, 2)
            );
            if (dist > this.arrivalThreshold) {
                nextIdx = i;
                break;
            }
        }

        return path[nextIdx];
    }
}

export default new SimulationEngine();
