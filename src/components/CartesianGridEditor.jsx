import React, { useState } from 'react';
import { Droplet, Mountain, Sprout, Eraser, Grid as GridIcon, Save, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import CartesianGrid from '../utils/cartesianGrid';

const TOOLS = {
    PLANT: 'plant',
    OBSTACLE: 'obstacle',
    WAYPOINT: 'waypoint',
    ERASE: 'erase'
};

const CartesianGridEditor = ({
    grid,           // CartesianGrid instance
    onGridChange,   // Callback when grid changes
    path,           // Array of {x, y} coordinates
    onPathChange,   // Callback when path changes
    onSave
}) => {
    const [selectedTool, setSelectedTool] = useState(TOOLS.PLANT);
    const [showCoordinates, setShowCoordinates] = useState(true);
    const [hoverCell, setHoverCell] = useState(null);

    const { min, max } = grid.getCoordinateRange();
    const actualGridSize = max - min + 1;

    const handleCellClick = (x, y) => {
        const newGrid = grid.clone();

        switch (selectedTool) {
            case TOOLS.PLANT:
                newGrid.setCell(x, y, {
                    type: 'plant',
                    moisture: Math.floor(Math.random() * 50) + 50,
                    temperature: Math.floor(Math.random() * 10) + 20,
                    explored: false
                });
                break;

            case TOOLS.OBSTACLE:
                newGrid.setCell(x, y, {
                    type: 'obstacle',
                    explored: false
                });
                break;

            case TOOLS.WAYPOINT:
                const exists = path.some(p => p.x === x && p.y === y);
                if (exists) {
                    onPathChange(path.filter(p => !(p.x === x && p.y === y)));
                } else {
                    onPathChange([...path, { x, y }]);
                }
                break;

            case TOOLS.ERASE:
                newGrid.removeCell(x, y);
                // Also remove from path if present
                onPathChange(path.filter(p => !(p.x === x && p.y === y)));
                break;
        }

        if (selectedTool !== TOOLS.WAYPOINT) {
            onGridChange(newGrid);
        }
    };

    const handleResize = (delta) => {
        const newSize = Math.max(5, Math.min(25, actualGridSize + delta));
        const newGrid = grid.clone();
        newGrid.resize(newSize);
        onGridChange(newGrid);
    };

    const getCellColor = (x, y) => {
        const cell = grid.getCell(x, y);
        const isWaypoint = path.some(p => p.x === x && p.y === y);

        if (isWaypoint) return 'bg-pink-500/40 border-pink-500';

        switch (cell.type) {
            case 'plant':
                const health = cell.moisture || 50;
                if (health < 40) return 'bg-red-500/40 border-red-500';
                if (health < 70) return 'bg-yellow-500/40 border-yellow-500';
                return 'bg-green-500/40 border-green-500';
            case 'obstacle':
                return 'bg-gray-600/60 border-gray-500';
            default:
                return 'bg-gray-800/20 border-gray-700/30';
        }
    };

    const getCellIcon = (x, y) => {
        const cell = grid.getCell(x, y);
        const isWaypoint = path.some(p => p.x === x && p.y === y);

        if (isWaypoint) {
            const index = path.findIndex(p => p.x === x && p.y === y);
            return <span className="text-pink-400 font-bold text-xs">{index + 1}</span>;
        }

        switch (cell.type) {
            case 'plant':
                return <Sprout size={16} className="text-green-400" />;
            case 'obstacle':
                return <Mountain size={16} className="text-gray-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Cartesian Grid Editor</h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Center Origin (0,0) • Grid Size: {actualGridSize}×{actualGridSize} • Range: ({min},{min}) to ({max},{max})
                    </p>
                </div>

                {/* Grid Size Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleResize(-1)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                        disabled={actualGridSize <= 5}
                    >
                        <Minus size={16} />
                    </button>
                    <span className="px-3 py-1 bg-gray-800 rounded font-mono text-sm">
                        {actualGridSize}×{actualGridSize}
                    </span>
                    <button
                        onClick={() => handleResize(+1)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                        disabled={actualGridSize >= 25}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Tools Bar */}
            <div className="p-3 border-b border-white/10 flex gap-3 items-center bg-gray-800/50">
                <button
                    onClick={() => setSelectedTool(TOOLS.PLANT)}
                    className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-all ${selectedTool === TOOLS.PLANT
                        ? 'bg-green-600 text-white shadow-lg shadow-green-900/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Sprout size={16} /> Plant
                </button>

                <button
                    onClick={() => setSelectedTool(TOOLS.OBSTACLE)}
                    className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-all ${selectedTool === TOOLS.OBSTACLE
                        ? 'bg-gray-600 text-white shadow-lg shadow-gray-900/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Mountain size={16} /> Obstacle
                </button>

                <button
                    onClick={() => setSelectedTool(TOOLS.WAYPOINT)}
                    className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-all ${selectedTool === TOOLS.WAYPOINT
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <GridIcon size={16} /> Waypoint
                </button>

                <button
                    onClick={() => setSelectedTool(TOOLS.ERASE)}
                    className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-all ${selectedTool === TOOLS.ERASE
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Eraser size={16} /> Erase
                </button>

                <div className="h-6 w-px bg-white/20 mx-2" />

                <button
                    onClick={() => setShowCoordinates(!showCoordinates)}
                    className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-all ${showCoordinates
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    title={showCoordinates ? "Hide Coordinates" : "Show Coordinates"}
                >
                    {showCoordinates ? <Eye size={16} /> : <EyeOff size={16} />}
                    Coords
                </button>

                <div className="flex-1" />

                <button
                    onClick={onSave}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-bold flex items-center gap-2"
                >
                    <Save size={16} /> Save
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                <div className="min-w-fit">
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${actualGridSize}, minmax(60px, 1fr))`,
                            gridTemplateRows: `repeat(${actualGridSize}, 60px)`
                        }}
                    >
                        {/* Iterate top-to-bottom, left-to-right */}
                        {Array.from({ length: actualGridSize }, (_, row) => {
                            const y = max - row; // Top row is max Y
                            return Array.from({ length: actualGridSize }, (_, col) => {
                                const x = min + col; // Left column is min X
                                const key = CartesianGrid.coordKey(x, y);

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleCellClick(x, y)}
                                        onMouseEnter={() => setHoverCell({ x, y })}
                                        onMouseLeave={() => setHoverCell(null)}
                                        className={`relative border-2 rounded transition-all hover:scale-105 hover:shadow-xl ${getCellColor(x, y)} ${hoverCell?.x === x && hoverCell?.y === y ? 'ring-2 ring-white' : ''
                                            } ${x === 0 && y === 0 ? 'ring-4 ring-yellow-500' : ''}`}
                                    >
                                        {/* Coordinate Label */}
                                        {showCoordinates && (
                                            <div className="absolute top-0.5 left-1 text-[8px] font-mono text-gray-400 pointer-events-none">
                                                {x},{y}
                                            </div>
                                        )}

                                        {/* Center Origin Marker */}
                                        {x === 0 && y === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />
                                            </div>
                                        )}

                                        {/* Cell Content */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {getCellIcon(x, y)}
                                        </div>

                                        {/* Hover Info */}
                                        {hoverCell?.x === x && hoverCell?.y === y && (
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                                ({x}, {y})
                                            </div>
                                        )}
                                    </button>
                                );
                            });
                        })}
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            <div className="p-3 border-t border-white/10 bg-gray-800/50 text-xs text-gray-400 flex justify-between">
                <div>
                    <span className="font-semibold text-white">Path Waypoints:</span> {path.length} coordinates |
                    <span className="ml-2 font-semibold text-white">Objects:</span> {Object.keys(grid.cells).length} placed
                </div>
                <div>
                    <span className="text-yellow-400">⬤</span> Center (0,0) |
                    Coordinate System: Cartesian
                </div>
            </div>
        </div>
    );
};

export default CartesianGridEditor;
