import React, { useState } from 'react';
import CartesianGrid from '../utils/cartesianGrid';
import CartesianGridEditor from '../components/CartesianGridEditor';
import CartesianScene3D from '../components/CartesianScene3D';
import cartesianEngine from '../services/cartesianEngine';
import { Play, Pause, RotateCcw, Grid as GridIcon } from 'lucide-react';

/**
 * Demo component showcasing the Cartesian coordinate system
 */
const CartesianDemo = () => {
    const [grid, setGrid] = useState(() => {
        const newGrid = new CartesianGrid(5);
        // Add some demo content
        newGrid.setCell(0, 0, { type: 'plant', moisture: 80, temperature: 22, explored: false });
        newGrid.setCell(1, 1, { type: 'plant', moisture: 65, temperature: 23, explored: false });
        newGrid.setCell(-1, -1, { type: 'obstacle', explored: false });
        return newGrid;
    });

    const [path, setPath] = useState([
        { x: -2, y: -2 },
        { x: -1, y: -1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 }
    ]);

    const [robotPose, setRobotPose] = useState({ x: -4, y: 0, z: 4, theta: 0, velocity: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [view, setView] = useState('2D'); // '2D' or '3D' or 'SPLIT'

    // Simulation loop
    React.useEffect(() => {
        if (!isPlaying || path.length === 0) return;

        cartesianEngine.setGridSize(grid.gridSize);

        const interval = setInterval(() => {
            setRobotPose(prev => {
                const targetCoord = path[currentWaypointIndex];
                if (!targetCoord) {
                    setIsPlaying(false);
                    return prev;
                }

                const newPose = cartesianEngine.updateRobotPose(prev, targetCoord, 1.5);

                if (newPose.arrived) {
                    setCurrentWaypointIndex(i => {
                        const next = i + 1;
                        if (next >= path.length) {
                            setIsPlaying(false);
                            return i;
                        }
                        return next;
                    });
                }

                return newPose;
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [isPlaying, currentWaypointIndex, path, grid.gridSize]);

    const handleStart = () => {
        if (path.length === 0) return;

        const startWorld = grid.toWorldPosition(path[0].x, path[0].y, 2);
        setRobotPose({ x: startWorld.x, y: 0, z: startWorld.z, theta: 0, velocity: 0 });
        setCurrentWaypointIndex(0);
        setIsPlaying(true);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentWaypointIndex(0);
        if (path.length > 0) {
            const startWorld = grid.toWorldPosition(path[0].x, path[0].y, 2);
            setRobotPose({ x: startWorld.x, y: 0, z: startWorld.z, theta: 0, velocity: 0 });
        }
    };

    const renderEditor = () => (
        <CartesianGridEditor
            grid={grid}
            onGridChange={(newGrid) => {
                setGrid(newGrid);
                cartesianEngine.setGridSize(newGrid.gridSize);
            }}
            path={path}
            onPathChange={setPath}
            onSave={() => {
                console.log('Grid Data:', grid.export());
                console.log('Path:', path);
            }}
        />
    );

    const render3D = () => (
        <div className="h-full bg-black">
            <CartesianScene3D
                grid={grid}
                robotPose={robotPose}
                path={path.slice(currentWaypointIndex)}
                targetCoord={path[currentWaypointIndex]}
                isScanning={isPlaying}
                showAxis={true}
                showCoordinateLabels={true}
            />
        </div>
    );

    return (
        <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Cartesian Coordinate System Demo</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Center-Origin Grid • Grid Size: {grid.gridSize}×{grid.gridSize} • Path Waypoints: {path.length}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('2D')}
                        className={`px-4 py-2 rounded font-bold ${view === '2D' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <GridIcon size={16} className="inline mr-2" />
                        2D Editor
                    </button>
                    <button
                        onClick={() => setView('3D')}
                        className={`px-4 py-2 rounded font-bold ${view === '3D' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        3D View
                    </button>
                    <button
                        onClick={() => setView('SPLIT')}
                        className={`px-4 py-2 rounded font-bold ${view === 'SPLIT' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Split View
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {view === '2D' && (
                    <div className="flex-1">
                        {renderEditor()}
                    </div>
                )}

                {view === '3D' && (
                    <div className="flex-1">
                        {render3D()}
                    </div>
                )}

                {view === 'SPLIT' && (
                    <>
                        <div className="flex-1 border-r border-white/10">
                            {renderEditor()}
                        </div>
                        <div className="flex-1">
                            {render3D()}
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-white/10 bg-black flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={handleStart}
                        disabled={path.length === 0}
                        className={`px-6 py-2 rounded font-bold flex items-center gap-2 ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                        {isPlaying ? (
                            <>
                                <Pause size={16} /> Pause
                            </>
                        ) : (
                            <>
                                <Play size={16} /> Start
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                <div className="flex gap-6 text-sm font-mono">
                    <div>
                        <span className="text-gray-400">Waypoint:</span>
                        <span className="ml-2 text-blue-400 font-bold">
                            {currentWaypointIndex + 1}/{path.length}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">Robot Grid Position:</span>
                        <span className="ml-2 text-green-400 font-bold">
                            {robotPose.cartesian ? `(${robotPose.cartesian.x}, ${robotPose.cartesian.y})` : '(?, ?)'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">Robot World Position:</span>
                        <span className="ml-2 text-yellow-400 font-bold">
                            ({robotPose.x.toFixed(2)}, {robotPose.z.toFixed(2)})
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">Velocity:</span>
                        <span className="ml-2 text-purple-400 font-bold">
                            {(robotPose.velocity || 0).toFixed(2)} m/s
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="px-4 py-3 bg-gray-800/50 border-t border-white/10 text-xs text-gray-400">
                <div className="flex justify-between">
                    <div>
                        <span className="font-semibold text-white">Cartesian Benefits:</span>
                        <span className="ml-2">✅ Center (0,0) always stable</span>
                        <span className="ml-4">✅ Resize maintains coordinates</span>
                        <span className="ml-4">✅ Mathematical intuition</span>
                    </div>
                    <div>
                        <span className="text-yellow-400">⭐</span> Yellow = Origin (0,0) |
                        <span className="ml-2 text-pink-400">●</span> Pink = Waypoint |
                        <span className="ml-2 text-green-400">●</span> Green = Plant
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartesianDemo;
