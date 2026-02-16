import React, { useState, useEffect, useCallback } from 'react';
import {
    Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    RotateCw, RotateCcw, Square, Zap, Navigation as Nav,
    Info, Keyboard, MousePointer
} from 'lucide-react';

const ManualControl = ({
    robotPose,
    setRobotPose,
    gridData,
    gridSize,
    isActive,
    onStop
}) => {
    const [controlMode, setControlMode] = useState('KEYBOARD'); // KEYBOARD | JOYSTICK
    const [moveSpeed, setMoveSpeed] = useState(0.1);
    const [rotSpeed, setRotSpeed] = useState(0.05);
    const [isMoving, setIsMoving] = useState({ forward: false, back: false, left: false, right: false });

    const cellSize = 2;
    const gridOffset = (gridSize * cellSize) / 2 - (cellSize / 2);

    // Collision detection
    const checkCollision = (newX, newY) => {
        // Convert world position to grid index
        const col = Math.round((newX + gridOffset) / cellSize);
        const row = Math.round((newY + gridOffset) / cellSize);

        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return true;

        const index = row * gridSize + col;
        const cell = gridData[index];

        return cell && (cell.type === 'obstacle' || cell.type === 'plant');
    };

    // Movement functions
    const moveForward = useCallback(() => {
        setRobotPose(prev => {
            const newX = prev.x + Math.cos(prev.theta) * moveSpeed;
            const newY = prev.y + Math.sin(prev.theta) * moveSpeed;

            if (checkCollision(newX, newY)) return prev;

            return { ...prev, x: newX, y: newY, velocity: moveSpeed };
        });
    }, [moveSpeed]);

    const moveBackward = useCallback(() => {
        setRobotPose(prev => {
            const newX = prev.x - Math.cos(prev.theta) * moveSpeed * 0.7;
            const newY = prev.y - Math.sin(prev.theta) * moveSpeed * 0.7;

            if (checkCollision(newX, newY)) return prev;

            return { ...prev, x: newX, y: newY, velocity: -moveSpeed * 0.7 };
        });
    }, [moveSpeed]);

    const turnLeft = useCallback(() => {
        setRobotPose(prev => ({ ...prev, theta: prev.theta + rotSpeed }));
    }, [rotSpeed]);

    const turnRight = useCallback(() => {
        setRobotPose(prev => ({ ...prev, theta: prev.theta - rotSpeed }));
    }, [rotSpeed]);

    const stopMovement = useCallback(() => {
        setRobotPose(prev => ({ ...prev, velocity: 0 }));
    }, []);

    // Keyboard controls
    useEffect(() => {
        if (!isActive || controlMode !== 'KEYBOARD') return;

        const handleKeyDown = (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    e.preventDefault();
                    setIsMoving(m => ({ ...m, forward: true }));
                    break;
                case 's':
                case 'arrowdown':
                    e.preventDefault();
                    setIsMoving(m => ({ ...m, back: true }));
                    break;
                case 'a':
                case 'arrowleft':
                    e.preventDefault();
                    setIsMoving(m => ({ ...m, left: true }));
                    break;
                case 'd':
                case 'arrowright':
                    e.preventDefault();
                    setIsMoving(m => ({ ...m, right: true }));
                    break;
                case ' ':
                    e.preventDefault();
                    stopMovement();
                    break;
            }
        };

        const handleKeyUp = (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    setIsMoving(m => ({ ...m, forward: false }));
                    break;
                case 's':
                case 'arrowdown':
                    setIsMoving(m => ({ ...m, back: false }));
                    break;
                case 'a':
                case 'arrowleft':
                    setIsMoving(m => ({ ...m, left: false }));
                    break;
                case 'd':
                case 'arrowright':
                    setIsMoving(m => ({ ...m, right: false }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isActive, controlMode, stopMovement]);

    // Apply continuous movement
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            if (isMoving.forward) moveForward();
            if (isMoving.back) moveBackward();
            if (isMoving.left) turnLeft();
            if (isMoving.right) turnRight();
        }, 50);

        return () => clearInterval(interval);
    }, [isActive, isMoving, moveForward, moveBackward, turnLeft, turnRight]);

    return (
        <div className="h-full flex flex-col bg-gray-900">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Gamepad2 className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">Manual Control</h3>
                            <p className="text-xs text-gray-400">Direct robot operation</p>
                        </div>
                    </div>
                    <button
                        onClick={onStop}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold text-sm flex items-center gap-2"
                    >
                        <Square size={14} fill="currentColor" /> Stop
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setControlMode('KEYBOARD')}
                        className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 text-sm font-bold transition-all ${controlMode === 'KEYBOARD'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <Keyboard size={16} /> Keyboard
                    </button>
                    <button
                        onClick={() => setControlMode('JOYSTICK')}
                        className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 text-sm font-bold transition-all ${controlMode === 'JOYSTICK'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <MousePointer size={16} /> On-Screen
                    </button>
                </div>
            </div>

            {/* Control Interface */}
            <div className="flex-1 p-6 overflow-y-auto">
                {/* Robot Status */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gray-800 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Position X</div>
                        <div className="text-lg font-mono font-bold text-blue-400">{robotPose.x.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Position Y</div>
                        <div className="text-lg font-mono font-bold text-blue-400">{robotPose.y.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Angle</div>
                        <div className="text-lg font-mono font-bold text-purple-400">
                            {((robotPose.theta * 180 / Math.PI) % 360).toFixed(0)}°
                        </div>
                    </div>
                </div>

                {controlMode === 'KEYBOARD' && (
                    <div className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Info size={16} className="text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">Keyboard Controls</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-800 rounded border border-white/20 font-mono text-xs">W</kbd>
                                    <span className="text-gray-400">Move Forward</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-800 rounded border border-white/20 font-mono text-xs">S</kbd>
                                    <span className="text-gray-400">Move Back</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-800 rounded border border-white/20 font-mono text-xs">A</kbd>
                                    <span className="text-gray-400">Turn Left</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-800 rounded border border-white/20 font-mono text-xs">D</kbd>
                                    <span className="text-gray-400">Turn Right</span>
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <kbd className="px-2 py-1 bg-gray-800 rounded border border-white/20 font-mono text-xs">SPACE</kbd>
                                    <span className="text-gray-400">Stop</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 text-xs">
                            <div className={`px-3 py-2 rounded ${isMoving.forward ? 'bg-green-600' : 'bg-gray-800'}`}>
                                ↑ Forward
                            </div>
                            <div className={`px-3 py-2 rounded ${isMoving.back ? 'bg-green-600' : 'bg-gray-800'}`}>
                                ↓ Back
                            </div>
                            <div className={`px-3 py-2 rounded ${isMoving.left ? 'bg-green-600' : 'bg-gray-800'}`}>
                                ← Left
                            </div>
                            <div className={`px-3 py-2 rounded ${isMoving.right ? 'bg-green-600' : 'bg-gray-800'}`}>
                                → Right
                            </div>
                        </div>
                    </div>
                )}

                {controlMode === 'JOYSTICK' && (
                    <div className="space-y-6">
                        {/* Virtual Joystick */}
                        <div className="flex justify-center items-center gap-8">
                            {/* D-Pad */}
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                                        <div></div>
                                        <button
                                            onMouseDown={moveForward}
                                            onMouseUp={stopMovement}
                                            onTouchStart={moveForward}
                                            onTouchEnd={stopMovement}
                                            className="bg-gray-700 hover:bg-blue-600 active:bg-blue-500 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <ArrowUp size={24} />
                                        </button>
                                        <div></div>
                                        <button
                                            onMouseDown={turnLeft}
                                            onMouseUp={stopMovement}
                                            onTouchStart={turnLeft}
                                            onTouchEnd={stopMovement}
                                            className="bg-gray-700 hover:bg-purple-600 active:bg-purple-500 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <ArrowLeft size={24} />
                                        </button>
                                        <div className="bg-gray-800 rounded-lg flex items-center justify-center">
                                            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                        </div>
                                        <button
                                            onMouseDown={turnRight}
                                            onMouseUp={stopMovement}
                                            onTouchStart={turnRight}
                                            onTouchEnd={stopMovement}
                                            className="bg-gray-700 hover:bg-purple-600 active:bg-purple-500 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <ArrowRight size={24} />
                                        </button>
                                        <div></div>
                                        <button
                                            onMouseDown={moveBackward}
                                            onMouseUp={stopMovement}
                                            onTouchStart={moveBackward}
                                            onTouchEnd={stopMovement}
                                            className="bg-gray-700 hover:bg-blue-600 active:bg-blue-500 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <ArrowDown size={24} />
                                        </button>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={stopMovement}
                            className="w-full py-4 bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Square size={20} fill="currentColor" /> EMERGENCY STOP
                        </button>
                    </div>
                )}

                {/* Settings */}
                <div className="mt-6 space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <label className="text-xs text-gray-400 flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2">
                                <Zap size={14} /> Move Speed
                            </span>
                            <span className="font-mono text-white">{moveSpeed.toFixed(2)}</span>
                        </label>
                        <input
                            type="range"
                            min="0.05"
                            max="0.3"
                            step="0.05"
                            value={moveSpeed}
                            onChange={(e) => setMoveSpeed(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <label className="text-xs text-gray-400 flex items-center justify-between mb-2">
                            <span className="flex items-center gap-2">
                                <RotateCw size={14} /> Rotation Speed
                            </span>
                            <span className="font-mono text-white">{rotSpeed.toFixed(2)}</span>
                        </label>
                        <input
                            type="range"
                            min="0.02"
                            max="0.1"
                            step="0.01"
                            value={rotSpeed}
                            onChange={(e) => setRotSpeed(parseFloat(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualControl;
