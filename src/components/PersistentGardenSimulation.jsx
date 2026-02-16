import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Play, Pause, Square, RotateCcw, Library, Edit3, Gamepad2,
    Battery, Radar, Download
} from 'lucide-react';
import SimulationLayout from './SimulationLayout';
import GardenScene3D from './GardenScene3D';
import GardenLibrary from './GardenLibrary';
import GardenEditor from './GardenEditor';
import ManualControl from './ManualControl';
import { getTemplateById } from '../data/gardenTemplates';
import simulationEngine from '../services/simulationEngine';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

const MODES = {
    LIBRARY: 'LIBRARY',
    SETUP: 'SETUP',
    SIMULATION: 'SIMULATION',
    MANUAL_CONTROL: 'MANUAL_CONTROL'
};

const PersistentGardenSimulation = () => {
    // Current active mode (affects which component is shown in left panel)
    const [currentMode, setCurrentMode] = useState(MODES.LIBRARY);

    // Garden data
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [gridData, setGridData] = useState([]);
    const [gridSize, setGridSize] = useState(5);
    const [customPath, setCustomPath] = useState([]);
    const [isCustomized, setIsCustomized] = useState(false);

    // Robot state
    const [robotPose, setRobotPose] = useState({ x: -4, y: -4, theta: 0, velocity: 0 });
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1);

    // Mission tracking
    const [missionStartTime, setMissionStartTime] = useState(null);
    const [plantsScanned, setPlantsScanned] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);

    // Logs
    const [logs, setLogs] = useState([]);
    const lastPosRef = useRef({ x: -4, y: -4 });

    const addLog = useCallback((type, msg) => {
        const time = new Date().toISOString().split('T')[1].slice(0, 12);
        setLogs(prev => [{ id: Math.random(), time, type, msg }, ...prev].slice(0, 200));
    }, []);

    // Handle garden selection
    const handleSelectGarden = (template) => {
        setSelectedTemplate(template);
        setGridData([...template.cells]);
        setGridSize(template.gridSize);
        simulationEngine.setGridSize(template.gridSize);
        setCustomPath([...template.defaultPath]);
        setIsCustomized(false);

        const startPos = simulationEngine.getWorldPosition(template.defaultPath[0] || 0);
        setRobotPose({ x: startPos.x, y: startPos.y, theta: 0, velocity: 0 });

        addLog('INFO', `Loaded template: ${template.name}`);
        setCurrentMode(MODES.SETUP);
    };

    // Sync grid size
    useEffect(() => {
        simulationEngine.setGridSize(gridSize);
    }, [gridSize]);

    // Simulation loop
    useEffect(() => {
        if (!isPlaying || currentMode !== MODES.SIMULATION) return;

        const frameRate = 60;
        const interval = setInterval(() => {
            setRobotPose(prev => {
                if (!customPath || customPath.length === 0) {
                    addLog('SUCCESS', 'Mission complete - all waypoints visited');
                    setIsPlaying(false);
                    return prev;
                }

                const targetIdx = customPath[currentWaypointIndex];
                if (targetIdx === undefined) {
                    setIsPlaying(false);
                    return prev;
                }

                const targetPos = simulationEngine.getWorldPosition(targetIdx);
                const newPose = simulationEngine.updateRobotPose(prev, targetPos, simSpeed);

                // Track distance
                const dx = newPose.x - lastPosRef.current.x;
                const dy = newPose.y - lastPosRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                setTotalDistance(d => d + dist);
                lastPosRef.current = { x: newPose.x, y: newPose.y };

                // Check arrival
                if (newPose.arrived) {
                    const cell = gridData[targetIdx];
                    if (cell?.type === 'plant' && !plantsScanned.includes(targetIdx)) {
                        setPlantsScanned(prev => [...prev, targetIdx]);
                        addLog('SENSOR', `Plant scanned at Sector ${targetIdx} | Moisture: ${cell.moisture}%`);
                    }

                    setCurrentWaypointIndex(i => {
                        const next = i + 1;
                        if (next >= customPath.length) {
                            setIsPlaying(false);
                            addLog('SUCCESS', 'Mission complete!');
                            return i;
                        }
                        addLog('NAV', `Waypoint ${next}/${customPath.length} reached`);
                        return next;
                    });
                }

                return newPose;
            });
        }, 1000 / frameRate);

        return () => clearInterval(interval);
    }, [isPlaying, currentMode, currentWaypointIndex, customPath, gridData, simSpeed, plantsScanned, addLog]);

    // Mission controls
    const handleStartMission = () => {
        if (customPath.length === 0) {
            addLog('ERROR', 'No path defined');
            return;
        }

        setIsPlaying(true);
        setCurrentWaypointIndex(0);
        setMissionStartTime(Date.now());
        setPlantsScanned([]);
        setTotalDistance(0);

        const startPos = simulationEngine.getWorldPosition(customPath[0]);
        setRobotPose({ x: startPos.x, y: startPos.y, theta: 0, velocity: 0 });
        lastPosRef.current = { x: startPos.x, y: startPos.y };

        addLog('INFO', 'Mission started');
        setCurrentMode(MODES.SIMULATION);
    };

    const handleStopMission = () => {
        setIsPlaying(false);
        const duration = missionStartTime ? ((Date.now() - missionStartTime) / 1000).toFixed(1) : 0;
        addLog('INFO', `Mission stopped. Duration: ${duration}s, Distance: ${totalDistance.toFixed(2)}m`);
    };

    const handleResetMission = () => {
        setIsPlaying(false);
        setCurrentWaypointIndex(0);
        setPlantsScanned([]);
        setTotalDistance(0);
        if (customPath && customPath.length > 0) {
            const startPos = simulationEngine.getWorldPosition(customPath[0]);
            setRobotPose({ x: startPos.x, y: startPos.y, theta: 0, velocity: 0 });
        }
        addLog('INFO', 'Mission reset');
    };

    // =========================================================================
    // PANEL COMPONENTS - All Remain Mounted
    // =========================================================================

    // LEFT PANEL - Changes based on mode
    const renderLeftPanel = () => {
        switch (currentMode) {
            case MODES.LIBRARY:
                return (
                    <div className="w-full h-full bg-gray-900 p-4 overflow-auto">
                        <GardenLibrary
                            onSelectGarden={handleSelectGarden}
                            currentGardenId={selectedTemplate?.id}
                        />
                    </div>
                );

            case MODES.SETUP:
                return (
                    <div className="w-full h-full bg-gray-900">
                        <GardenEditor
                            gridData={gridData}
                            setGridData={setGridData}
                            customPath={customPath}
                            setCustomPath={setCustomPath}
                            gridSize={gridSize}
                            setGridSize={setGridSize}
                            onSave={() => {
                                setIsCustomized(true);
                                addLog('INFO', 'Garden configuration saved');
                            }}
                        />
                    </div>
                );

            case MODES.SIMULATION:
            case MODES.MANUAL_CONTROL:
                return (
                    <div className="w-full h-full bg-black">
                        <GardenScene3D
                            gridData={gridData}
                            gridSize={gridSize}
                            viewMode="GOD_MODE"
                            robotPose={robotPose}
                            path={currentMode === MODES.SIMULATION ? customPath.slice(currentWaypointIndex) : []}
                            targetIndex={currentMode === MODES.SIMULATION && customPath.length > 0 ? customPath[currentWaypointIndex] : null}
                            manualWaypoints={[]}
                            onCellClick={() => { }}
                            isScanning={isPlaying || currentMode === MODES.MANUAL_CONTROL}
                        />
                    </div>
                );

            default:
                return <div className="w-full h-full bg-gray-900" />;
        }
    };

    // RIGHT TOP PANEL - Analytics Dashboard
    const renderAnalytics = () => (
        <div className="w-full h-full bg-gray-900 p-4 overflow-auto">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Mission Analytics</h2>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase">Waypoints</div>
                        <div className="text-2xl font-bold text-blue-400">{currentWaypointIndex}/{customPath.length}</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase">Distance</div>
                        <div className="text-2xl font-bold text-green-400">{totalDistance.toFixed(2)}m</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <div className="text-xs text-gray-400 uppercase">Plants Scanned</div>
                        <div className="text-2xl font-bold text-purple-400">{plantsScanned.length}</div>
                    </div>
                </div>

                {/* Charts */}
                {plantsScanned.length > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-white/10">
                        <h3 className="text-sm font-bold text-gray-300 mb-3">Plant Health Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={plantsScanned.map(idx => ({
                                name: `P${idx}`,
                                health: gridData[idx]?.moisture || 0
                            }))}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip />
                                <Bar dataKey="health" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );

    // RIGHT BOTTOM PANEL - Manual Control / Serial Monitor
    const renderControlPanel = () => {
        if (currentMode === MODES.MANUAL_CONTROL) {
            return (
                <div className="w-full h-full bg-gray-900">
                    <ManualControl
                        robotPose={robotPose}
                        setRobotPose={setRobotPose}
                        gridData={gridData}
                        gridSize={gridSize}
                        isActive={true}
                        onStop={() => setCurrentMode(MODES.SETUP)}
                    />
                </div>
            );
        }

        // Simulation Controls
        return (
            <div className="w-full h-full bg-gray-900 p-4 overflow-auto">
                <h2 className="text-xl font-bold text-white mb-4">Mission Control</h2>

                <div className="space-y-4">
                    {/* Status */}
                    <div className="bg-gray-800 p-3 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs text-gray-400">Status</div>
                                <div className={`text-lg font-bold ${isPlaying ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {isPlaying ? 'RUNNING' : 'PAUSED'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Speed</div>
                                <div className="text-lg font-bold text-blue-400">{robotPose.velocity?.toFixed(2) || '0.00'} m/s</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    {currentMode === MODES.SIMULATION && (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className={`flex-1 py-3 rounded font-bold flex items-center justify-center gap-2 ${isPlaying ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'
                                        }`}
                                >
                                    {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} fill="currentColor" /> Resume</>}
                                </button>
                                <button
                                    onClick={handleStopMission}
                                    className="px-4 bg-red-600 hover:bg-red-500 rounded"
                                >
                                    <Square size={16} fill="currentColor" />
                                </button>
                            </div>

                            <button
                                onClick={handleResetMission}
                                className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={14} /> Reset Mission
                            </button>

                            <div>
                                <label className="text-xs text-gray-400 block mb-2">Simulation Speed: {simSpeed}x</label>
                                <input
                                    type="range" min="0.5" max="3" step="0.5"
                                    value={simSpeed}
                                    onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // BOTTOM PANEL - Logs
    const renderLogs = () => (
        <div className="w-full h-full bg-gray-900 flex flex-col">
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-sm text-white">System Logs</h3>
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `mission-logs-${Date.now()}.json`;
                        a.click();
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold flex items-center gap-1"
                >
                    <Download size={12} /> Export
                </button>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1 font-mono text-xs bg-black/40">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 py-1 px-2 hover:bg-white/5 rounded">
                        <span className="text-gray-500">[{log.time}]</span>
                        <span className={`font-bold ${log.type === 'ERROR' ? 'text-red-500' :
                            log.type === 'SUCCESS' ? 'text-green-500' :
                                log.type === 'WARNING' ? 'text-yellow-500' :
                                    log.type === 'SENSOR' ? 'text-purple-400' :
                                        log.type === 'NAV' ? 'text-blue-400' :
                                            'text-gray-400'
                            }`}>[{log.type}]</span>
                        <span className="text-gray-300">{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // TOP CONTROLS
    const renderTopControls = () => (
        <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Radar className="text-white" size={18} />
                </div>
                <h1 className="font-bold tracking-wider">Garden Rover <span className="text-blue-500">MISSION CONTROL</span></h1>
            </div>

            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 gap-1">
                <button
                    onClick={() => setCurrentMode(MODES.LIBRARY)}
                    disabled={!selectedTemplate && currentMode !== MODES.LIBRARY}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${currentMode === MODES.LIBRARY ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <Library size={14} /> LIBRARY
                </button>
                <button
                    onClick={() => setCurrentMode(MODES.SETUP)}
                    disabled={!selectedTemplate}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentMode === MODES.SETUP ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <Edit3 size={14} /> SETUP
                </button>
                <button
                    onClick={handleStartMission}
                    disabled={!selectedTemplate || customPath.length === 0}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentMode === MODES.SIMULATION ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <Play size={14} /> SIMULATION
                </button>
                <button
                    onClick={() => setCurrentMode(MODES.MANUAL_CONTROL)}
                    disabled={!selectedTemplate}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentMode === MODES.MANUAL_CONTROL ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                        }`}
                >
                    <Gamepad2 size={14} /> MANUAL
                </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                <div className="flex items-center gap-2">
                    <Battery className="text-green-500" size={14} />
                    <span>98%</span>
                </div>
            </div>
        </div>
    );

    // =========================================================================
    // RENDER WITH PERSISTENT LAYOUT
    // =========================================================================

    return (
        <SimulationLayout
            topControls={renderTopControls()}
            leftPanel={renderLeftPanel()}
            rightTopPanel={renderAnalytics()}
            rightBottomPanel={renderControlPanel()}
            bottomPanel={renderLogs()}
        />
    );
};

export default PersistentGardenSimulation;
