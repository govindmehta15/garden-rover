import React, { useState, useRef, useEffect } from 'react';
import CartesianGrid from '../utils/cartesianGrid';
import WorldCoordinateSystem, { WorldCoordinateDebug } from '../utils/worldCoordinates';
import CartesianGridEditor from '../components/CartesianGridEditor';
import CartesianScene3D from '../components/CartesianScene3D';
import CoordinateDebugOverlay, { GridOriginMarker, RobotPositionMarker } from '../components/CoordinateDebugOverlay';
import cartesianEngine from '../services/cartesianEngine';
import { Play, Pause, RotateCcw, Grid as GridIcon, Bug } from 'lucide-react';

/**
 * World Coordinate Demo
 * Demonstrates separation of simulation (world) coordinates from UI (screen) coordinates
 */
const WorldCoordinateDemo = () => {
    // World coordinate system (1 world unit = 1 grid cell)
    const [worldSystem] = useState(() => new WorldCoordinateSystem(5, 60));
    const [debugHelper] = useState(() => new WorldCoordinateDebug(worldSystem));

    // Grid (logical data)
    const [grid, setGrid] = useState(() => {
        const newGrid = new CartesianGrid(5);
        newGrid.setCell(0, 0, { type: 'plant', moisture: 80, temperature: 22, explored: false });
        newGrid.setCell(1, 1, { type: 'plant', moisture: 65, temperature: 23, explored: false });
        newGrid.setCell(-1, -1, { type: 'obstacle', explored: false });
        return newGrid;
    });

    // Path (in grid coordinates)
    const [path, setPath] = useState([
        { x: -2, y: -2 },
        { x: -1, y: -1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 }
    ]);

    // Robot position (ONLY in world coordinates)
    const [robotWorldX, setRobotWorldX] = useState(-2);
    const [robotWorldY, setRobotWorldY] = useState(-2);
    const [robotVelocity, setRobotVelocity] = useState(0);
    const [robotTheta, setRobotTheta] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [view, setView] = useState('SPLIT');
    const [showDebug, setShowDebug] = useState(true);
    const [showOriginMarker, setShowOriginMarker] = useState(true);

    // Container dimensions for coordinate conversion
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    const containerRef = useRef(null);

    // Update container size on resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [view]);

    // Simulation loop (uses ONLY world coordinates)
    useEffect(() => {
        if (!isPlaying || path.length === 0) return;

        const targetCell = path[currentWaypointIndex];
        if (!targetCell) return;

        const interval = setInterval(() => {
            setRobotWorldX(prevX => {
                setRobotWorldY(prevY => {
                    // Calculate movement in world coordinates
                    const dx = targetCell.x - prevX;
                    const dy = targetCell.y - prevY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Arrived at waypoint
                    if (distance < 0.1) {
                        setCurrentWaypointIndex(i => {
                            const next = i + 1;
                            if (next >= path.length) {
                                setIsPlaying(false);
                                return i;
                            }
                            return next;
                        });
                        setRobotVelocity(0);
                        return prevY;
                    }

                    // Calculate angle to target
                    const targetTheta = Math.atan2(dy, dx);
                    setRobotTheta(targetTheta);

                    // Update velocity
                    const speed = 0.02; // world units per frame
                    setRobotVelocity(speed * 60); // Convert to units/second

                    // Move in world coordinates
                    const newY = prevY + (dy / distance) * speed;
                    return newY;
                });

                const dx = targetCell.x - prevX;
                const dy = targetCell.y - prevY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 0.1) return prevX;

                const speed = 0.02;
                const newX = prevX + (dx / distance) * speed;
                return newX;
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [isPlaying, currentWaypointIndex, path]);

    // Handle grid resize (UI only, world coordinates unchanged!)
    const handleGridResize = (newGrid) => {
        setGrid(newGrid);
        worldSystem.setGridSize(newGrid.gridSize);
        cartesianEngine.setGridSize(newGrid.gridSize);
        // Note: Robot world coordinates remain UNCHANGED
    };

    const handleStart = () => {
        if (path.length === 0) return;

        // Set robot to start position in WORLD coordinates
        setRobotWorldX(path[0].x);
        setRobotWorldY(path[0].y);
        setRobotVelocity(0);
        setCurrentWaypointIndex(0);
        setIsPlaying(true);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentWaypointIndex(0);
        setRobotVelocity(0);
        if (path.length > 0) {
            setRobotWorldX(path[0].x);
            setRobotWorldY(path[0].y);
        }
    };

    // Generate debug info
    const robotDebugInfo = debugHelper.getRobotDebugInfo(
        robotWorldX,
        robotWorldY,
        containerSize.width,
        containerSize.height
    );

    const gridDebugInfo = debugHelper.getGridDebugInfo(
        containerSize.width,
        containerSize.height
    );

    return (
        <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">World Coordinate System Demo</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Separated Simulation & UI Layers • 1 World Unit = 1 Grid Cell • Grid: {grid.gridSize}×{grid.gridSize}
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

                    <div className="h-8 w-px bg-white/20 mx-1" />

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${showDebug ? 'bg-emerald-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <Bug size={16} />
                        Debug
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
                {view === '2D' && (
                    <div className="flex-1 relative">
                        <CartesianGridEditor
                            grid={grid}
                            onGridChange={handleGridResize}
                            path={path}
                            onPathChange={setPath}
                            onSave={() => {
                                console.log('Grid Data:', grid.export());
                                console.log('Path:', path);
                                console.log('Robot World Position:', { x: robotWorldX, y: robotWorldY });
                            }}
                        />
                        {showOriginMarker && (
                            <GridOriginMarker
                                worldSystem={worldSystem}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                            />
                        )}
                        <RobotPositionMarker
                            worldSystem={worldSystem}
                            robotWorldX={robotWorldX}
                            robotWorldY={robotWorldY}
                            containerWidth={containerSize.width}
                            containerHeight={containerSize.height}
                            showLabel={true}
                        />
                    </div>
                )}

                {view === '3D' && (
                    <div className="flex-1 bg-black">
                        <CartesianScene3D
                            grid={grid}
                            robotPose={{
                                x: robotWorldX * 2,
                                y: 0,
                                z: -robotWorldY * 2,
                                theta: robotTheta
                            }}
                            path={path.slice(currentWaypointIndex)}
                            targetCoord={path[currentWaypointIndex]}
                            isScanning={isPlaying}
                            showAxis={true}
                            showCoordinateLabels={true}
                        />
                    </div>
                )}

                {view === 'SPLIT' && (
                    <>
                        <div className="flex-1 border-r border-white/10 relative">
                            <CartesianGridEditor
                                grid={grid}
                                onGridChange={handleGridResize}
                                path={path}
                                onPathChange={setPath}
                                onSave={() => console.log('Saved')}
                            />
                            {showOriginMarker && (
                                <GridOriginMarker
                                    worldSystem={worldSystem}
                                    containerWidth={containerSize.width / 2}
                                    containerHeight={containerSize.height}
                                />
                            )}
                            <RobotPositionMarker
                                worldSystem={worldSystem}
                                robotWorldX={robotWorldX}
                                robotWorldY={robotWorldY}
                                containerWidth={containerSize.width / 2}
                                containerHeight={containerSize.height}
                                showLabel={true}
                            />
                        </div>
                        <div className="flex-1 bg-black">
                            <CartesianScene3D
                                grid={grid}
                                robotPose={{
                                    x: robotWorldX * 2,
                                    y: 0,
                                    z: -robotWorldY * 2,
                                    theta: robotTheta
                                }}
                                path={path.slice(currentWaypointIndex)}
                                targetCoord={path[currentWaypointIndex]}
                                isScanning={isPlaying}
                                showAxis={true}
                                showCoordinateLabels={false}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Debug Overlay */}
            <CoordinateDebugOverlay
                robotDebugInfo={robotDebugInfo}
                gridDebugInfo={gridDebugInfo}
                visible={showDebug}
                position="bottom-left"
            />

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
                        <span className="text-gray-400">World Position:</span>
                        <span className="ml-2 text-green-400 font-bold">
                            ({robotWorldX.toFixed(3)}, {robotWorldY.toFixed(3)})
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">Grid Cell:</span>
                        <span className="ml-2 text-yellow-400 font-bold">
                            [{Math.round(robotWorldX)}, {Math.round(robotWorldY)}]
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400">Velocity:</span>
                        <span className="ml-2 text-purple-400 font-bold">
                            {robotVelocity.toFixed(2)} u/s
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="px-4 py-3 bg-gray-800/50 border-t border-white/10 text-xs text-gray-400">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-white">World Coordinate Benefits:</span>
                        <span className="ml-2">✅ Simulation independent of UI</span>
                        <span className="ml-4">✅ No drift on resize</span>
                        <span className="ml-4">✅ 1 world unit = 1 grid cell</span>
                        <span className="ml-4">✅ Robot position stable</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOriginMarker}
                                onChange={(e) => setShowOriginMarker(e.target.checked)}
                                className="rounded"
                            />
                            <span>Show Origin Marker</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorldCoordinateDemo;
