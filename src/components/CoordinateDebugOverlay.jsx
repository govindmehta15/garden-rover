import React from 'react';
import { Info, Target, Grid, Maximize2 } from 'lucide-react';

/**
 * Debug Overlay Component
 * Displays world and screen coordinates for debugging
 */
const CoordinateDebugOverlay = ({
    robotDebugInfo,
    gridDebugInfo,
    visible = true,
    position = 'bottom-left' // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}) => {
    if (!visible) return null;

    const positionClasses = {
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4'
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
            <div className="bg-black/90 backdrop-blur-md border border-emerald-500/50 rounded-lg shadow-2xl p-3 font-mono text-xs space-y-2 max-w-sm">
                {/* Header */}
                <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/30 pb-2">
                    <Info size={14} />
                    <span>COORDINATE DEBUG</span>
                </div>

                {/* Robot Coordinates */}
                {robotDebugInfo && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold">
                            <Target size={12} />
                            <span>Robot Position</span>
                        </div>
                        <div className="pl-5 space-y-0.5">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">World:</span>
                                <span className="text-green-300 font-bold">
                                    ({robotDebugInfo.world.x}, {robotDebugInfo.world.y})
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Screen:</span>
                                <span className="text-yellow-300">
                                    ({robotDebugInfo.screen.x}, {robotDebugInfo.screen.y})px
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Grid Cell:</span>
                                <span className="text-purple-300">
                                    [{robotDebugInfo.cell.x}, {robotDebugInfo.cell.y}]
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">In Bounds:</span>
                                <span className={robotDebugInfo.inBounds ? 'text-green-400' : 'text-red-400'}>
                                    {robotDebugInfo.inBounds ? '✓ YES' : '✗ NO'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid System */}
                {gridDebugInfo && (
                    <div className="space-y-1 border-t border-white/10 pt-2">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold">
                            <Grid size={12} />
                            <span>Grid System</span>
                        </div>
                        <div className="pl-5 space-y-0.5">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Size:</span>
                                <span className="text-cyan-300">{gridDebugInfo.gridSize}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Cell Size:</span>
                                <span className="text-cyan-300">{gridDebugInfo.cellPixelSize}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">World X:</span>
                                <span className="text-cyan-300">{gridDebugInfo.worldBounds.x}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">World Y:</span>
                                <span className="text-cyan-300">{gridDebugInfo.worldBounds.y}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Container Info */}
                {gridDebugInfo && (
                    <div className="space-y-1 border-t border-white/10 pt-2">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold">
                            <Maximize2 size={12} />
                            <span>View Container</span>
                        </div>
                        <div className="pl-5 space-y-0.5">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Size:</span>
                                <span className="text-orange-300">
                                    {gridDebugInfo.containerSize.width}×{gridDebugInfo.containerSize.height}px
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-400">Center:</span>
                                <span className="text-orange-300">
                                    ({gridDebugInfo.centerOffset.x}, {gridDebugInfo.centerOffset.y})px
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="border-t border-white/10 pt-2 text-[10px] text-gray-500">
                    <div className="space-y-0.5">
                        <div>• World: Logical simulation coordinates</div>
                        <div>• Screen: UI pixel coordinates</div>
                        <div>• Grid Cell: Discrete grid position</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Grid Origin Marker Component
 * Visual marker for (0,0) origin in the grid
 */
export const GridOriginMarker = ({ worldSystem, containerWidth, containerHeight }) => {
    const screenPos = worldSystem.worldToScreen(0, 0, containerWidth, containerHeight);

    return (
        <div
            className="absolute pointer-events-none z-40"
            style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Crosshair */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute w-px h-8 bg-yellow-500/60 left-1/2 top-0 transform -translate-x-1/2 -translate-y-full" />
                <div className="absolute w-px h-8 bg-yellow-500/60 left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full" />

                {/* Horizontal line */}
                <div className="absolute h-px w-8 bg-yellow-500/60 top-1/2 left-0 transform -translate-y-1/2 -translate-x-full" />
                <div className="absolute h-px w-8 bg-yellow-500/60 top-1/2 right-0 transform -translate-y-1/2 translate-x-full" />

                {/* Center dot */}
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50 border-2 border-black" />

                {/* Label */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-yellow-400 text-xs font-bold whitespace-nowrap shadow-lg">
                    ORIGIN (0,0)
                </div>
            </div>
        </div>
    );
};

/**
 * Robot Position Marker Component
 * Shows robot position with coordinates
 */
export const RobotPositionMarker = ({
    worldSystem,
    robotWorldX,
    robotWorldY,
    containerWidth,
    containerHeight,
    showLabel = true
}) => {
    const screenPos = worldSystem.worldToScreen(robotWorldX, robotWorldY, containerWidth, containerHeight);

    return (
        <div
            className="absolute pointer-events-none z-30"
            style={{
                left: `${screenPos.x}px`,
                top: `${screenPos.y}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Robot indicator */}
            <div className="relative">
                {/* Pulsing ring */}
                <div className="absolute inset-0 w-8 h-8 bg-green-500/30 rounded-full animate-ping" style={{ left: '-1rem', top: '-1rem' }} />

                {/* Robot dot */}
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50 border-2 border-white -translate-x-2 -translate-y-2" />

                {/* Coordinate label */}
                {showLabel && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-900/90 px-2 py-0.5 rounded text-green-200 text-[10px] font-mono whitespace-nowrap shadow-lg">
                        ({robotWorldX.toFixed(2)}, {robotWorldY.toFixed(2)})
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoordinateDebugOverlay;
