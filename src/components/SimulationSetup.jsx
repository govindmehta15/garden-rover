import React, { useState, useRef, useEffect } from 'react';
import CartesianGridEditor from './CartesianGridEditor';
import CartesianScene3D from './CartesianScene3D';
import { GridOriginMarker, RobotPositionMarker } from './CoordinateDebugOverlay';
import WorldCoordinateSystem from '../utils/worldCoordinates';
import { Play, Grid as GridIcon, Box, Split } from 'lucide-react';

const SimulationSetup = ({
    grid,
    setGrid,
    path,
    setPath,
    robotPose,
    setRobotPose,
    onStart,
    worldSystem
}) => {
    const [view, setView] = useState('SPLIT'); // '2D' | '3D' | 'SPLIT'
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

    // Handle grid resize
    const handleGridChange = (newGrid) => {
        setGrid(newGrid);
        if (worldSystem) {
            worldSystem.setGridSize(newGrid.gridSize);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Simulation Setup</h2>
                    <p className="text-sm text-gray-400">Design your world and place the robot</p>
                </div>

                <div className="flex gap-2">
                    <div className="flex bg-gray-800 rounded-lg p-1 mr-4">
                        <button
                            onClick={() => setView('2D')}
                            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${view === '2D' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <GridIcon size={14} /> 2D
                        </button>
                        <button
                            onClick={() => setView('3D')}
                            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${view === '3D' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Box size={14} /> 3D
                        </button>
                        <button
                            onClick={() => setView('SPLIT')}
                            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 ${view === 'SPLIT' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Split size={14} /> Split
                        </button>
                    </div>

                    <button
                        onClick={onStart}
                        disabled={path.length === 0}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play size={16} /> Start Simulation
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
                {/* 2D View */}
                {(view === '2D' || view === 'SPLIT') && (
                    <div className={`relative ${view === 'SPLIT' ? 'flex-1 border-r border-white/10' : 'w-full h-full'}`}>
                        <CartesianGridEditor
                            grid={grid}
                            onGridChange={handleGridChange}
                            path={path}
                            onPathChange={setPath}
                            onSave={() => console.log('Saved')}
                        />
                        {/* Robot Marker Overlay */}
                        {worldSystem && (
                            <>
                                <GridOriginMarker
                                    worldSystem={worldSystem}
                                    containerWidth={view === 'SPLIT' ? containerSize.width / 2 : containerSize.width}
                                    containerHeight={containerSize.height}
                                />
                                <RobotPositionMarker
                                    worldSystem={worldSystem}
                                    robotWorldX={robotPose.x}
                                    robotWorldY={robotPose.z} // Note: robotPose.z is used as Y in 2D top-down view
                                    containerWidth={view === 'SPLIT' ? containerSize.width / 2 : containerSize.width}
                                    containerHeight={containerSize.height}
                                    showLabel={true}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* 3D View */}
                {(view === '3D' || view === 'SPLIT') && (
                    <div className={`${view === 'SPLIT' ? 'flex-1' : 'w-full h-full'} bg-black`}>
                        <CartesianScene3D
                            grid={grid}
                            robotPose={robotPose}
                            path={path}
                            targetCoord={null}
                            isScanning={false}
                            showAxis={true}
                            showCoordinateLabels={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimulationSetup;
