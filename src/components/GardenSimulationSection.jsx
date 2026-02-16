import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    LayoutDashboard, Play, Pause, Square, BarChart3, Terminal as TerminalIcon,
    FileText, Library, Edit3, Save, RotateCcw, Settings as SettingsIcon,
    Activity, Download, Zap, Battery, Radar, Gamepad2
} from 'lucide-react';
import GardenLibrary from './GardenLibrary';
import SimulationSetup from './SimulationSetup';
import CartesianScene3D from './CartesianScene3D';
import { getTemplateById } from '../data/gardenTemplates';
import cartesianEngine from '../services/cartesianEngine';
import CartesianGrid, { GridMigration } from '../utils/cartesianGrid';
import WorldCoordinateSystem from '../utils/worldCoordinates';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

const PAGES = {
    LIBRARY: 'LIBRARY',
    SETUP: 'SETUP',
    SIMULATION: 'SIMULATION',
    MANUAL_CONTROL: 'MANUAL_CONTROL',
    ANALYTICS: 'ANALYTICS',
    LOGS: 'LOGS'
};

const GardenSimulationSection = () => {
    // Current active page
    const [currentPage, setCurrentPage] = useState(PAGES.LIBRARY);

    // World System
    const [worldSystem] = useState(() => new WorldCoordinateSystem(5, 60));

    // Garden data (Cartesian)
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [grid, setGrid] = useState(() => new CartesianGrid(5));
    const [customPath, setCustomPath] = useState([]); // Array of {x,y}
    const [isCustomized, setIsCustomized] = useState(false);

    // Robot state (World Coordinates)
    const [robotPose, setRobotPose] = useState({ x: -4, y: 0, z: -4, theta: 0, velocity: 0 });
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [simSpeed, setSimSpeed] = useState(1);

    // Mission tracking
    const [missionStartTime, setMissionStartTime] = useState(null);
    const [plantsScanned, setPlantsScanned] = useState([]); // Array of "x,y" strings
    const [totalDistance, setTotalDistance] = useState(0);

    // Logs
    const [logs, setLogs] = useState([]);
    const lastPosRef = useRef({ x: 0, y: 0, z: 0 });

    const addLog = useCallback((type, msg) => {
        const time = new Date().toISOString().split('T')[1].slice(0, 12);
        setLogs(prev => [{ id: Math.random(), time, type, msg }, ...prev].slice(0, 200));
    }, []);

    // Handle garden selection from library
    const handleSelectGarden = (template) => {
        setSelectedTemplate(template);

        // Convert template array data to Cartesian Grid
        const newGrid = GridMigration.arrayToCartesian(template.cells, template.gridSize);
        setGrid(newGrid);

        // Convert path indices to Cartesian coordinates
        const newPath = GridMigration.pathToCartesian(template.defaultPath, template.gridSize);
        setCustomPath(newPath);

        // Update Engines
        cartesianEngine.setGridSize(template.gridSize);
        worldSystem.setGridSize(template.gridSize);

        setIsCustomized(false);

        // Reset robot to start of default path
        if (newPath.length > 0) {
            const startNode = newPath[0];
            const startWorld = newGrid.toWorldPosition(startNode.x, startNode.y);
            setRobotPose({ x: startWorld.x, y: 0, z: startWorld.z, theta: 0, velocity: 0 });
        }

        addLog('INFO', `Loaded template: ${template.name} (Grid: ${template.gridSize}x${template.gridSize})`);
        setCurrentPage(PAGES.SETUP);
    };

    // Main simulation loop (Cartesian Physics)
    useEffect(() => {
        if (!isPlaying || currentPage !== PAGES.SIMULATION) return;

        const interval = setInterval(() => {
            setRobotPose(prev => {
                if (!customPath || customPath.length === 0) {
                    addLog('SUCCESS', 'Mission complete - No path');
                    setIsPlaying(false);
                    return prev;
                }

                // Get current target waypoint
                const targetCoord = customPath[currentWaypointIndex];
                if (!targetCoord) {
                    setIsPlaying(false);
                    addLog('SUCCESS', 'Mission complete - All waypoints visited');
                    return prev;
                }

                // Update pose with Cartesian Physics
                // Note: cartesianEngine.updateRobotPose expects Cartesian target {x,y}
                // and currentPose in World Coords {x, y, z, theta, velocity}
                const newPose = cartesianEngine.updateRobotPose(prev, targetCoord, simSpeed);

                // Track distance
                const distMoved = Math.sqrt(
                    Math.pow(newPose.x - lastPosRef.current.x, 2) +
                    Math.pow(newPose.z - lastPosRef.current.z, 2)
                );
                if (distMoved > 0.01) {
                    setTotalDistance(d => d + distMoved);
                    lastPosRef.current = { x: newPose.x, y: 0, z: newPose.z };
                }

                // Check if arrived at waypoint
                if (newPose.arrived) {
                    addLog('NAV', `Reached waypoint ${currentWaypointIndex + 1} (${targetCoord.x}, ${targetCoord.y})`);

                    // Check if this is a plant
                    const cell = grid.getCell(targetCoord.x, targetCoord.y);
                    const cellKey = CartesianGrid.coordKey(targetCoord.x, targetCoord.y);

                    if (cell.type === 'plant' && !plantsScanned.includes(cellKey)) {
                        setPlantsScanned(prev => [...prev, cellKey]);
                        addLog('SENSOR', `Scanned Plant at ${targetCoord.x},${targetCoord.y}: Moisture ${cell.moisture}%`);
                    }

                    // Move to next waypoint
                    setCurrentWaypointIndex(idx => {
                        const next = idx + 1;
                        if (next >= customPath.length) {
                            setIsPlaying(false);
                            addLog('SUCCESS', 'Mission Completed!');
                            return idx;
                        }
                        return next;
                    });
                }

                return newPose;
            });
        }, 1000 / 60);

        return () => clearInterval(interval);
    }, [isPlaying, currentPage, customPath, currentWaypointIndex, simSpeed, grid, addLog, plantsScanned]);

    const handleStartMission = () => {
        if (!customPath || customPath.length === 0) {
            addLog('ERROR', 'No path defined. Please set waypoints first.');
            return;
        }

        setIsPlaying(true);
        setCurrentWaypointIndex(0);
        setMissionStartTime(Date.now());
        setPlantsScanned([]);
        setTotalDistance(0);

        // Reset robot to first waypoint
        const startNode = customPath[0];
        const startWorld = grid.toWorldPosition(startNode.x, startNode.y);
        setRobotPose({ x: startWorld.x, y: 0, z: startWorld.z, theta: 0, velocity: 0 });
        lastPosRef.current = { x: startWorld.x, y: 0, z: startWorld.z };

        addLog('INFO', 'Mission started');
        setCurrentPage(PAGES.SIMULATION);
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
            const startNode = customPath[0];
            const startWorld = grid.toWorldPosition(startNode.x, startNode.y);
            setRobotPose({ x: startWorld.x, y: 0, z: startWorld.z, theta: 0, velocity: 0 });
        }
        addLog('INFO', 'Mission reset');
    };

    // Render different pages
    const renderPage = () => {
        switch (currentPage) {
            case PAGES.LIBRARY:
                return (
                    <GardenLibrary
                        onSelectGarden={handleSelectGarden}
                        currentGardenId={selectedTemplate?.id}
                    />
                );

            case PAGES.SETUP:
                return (
                    <SimulationSetup
                        grid={grid}
                        setGrid={setGrid}
                        path={customPath}
                        setPath={(p) => { setCustomPath(p); setIsCustomized(true); }}
                        robotPose={robotPose}
                        setRobotPose={(p) => setRobotPose({ ...robotPose, ...p })}
                        onStart={handleStartMission}
                        worldSystem={worldSystem}
                    />
                );

            case PAGES.SIMULATION:
                return (
                    <div className="h-full relative bg-black">
                        <CartesianScene3D
                            grid={grid}
                            robotPose={robotPose}
                            path={customPath.slice(currentWaypointIndex)}
                            targetCoord={customPath[currentWaypointIndex]}
                            isScanning={isPlaying}
                            showAxis={true}
                            showCoordinateLabels={true}
                        />
                    </div>
                );

            case PAGES.MANUAL_CONTROL:
                return (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Manual Control not yet ported to Cartesian System
                    </div>
                );

            case PAGES.ANALYTICS:
                return renderAnalytics();

            case PAGES.LOGS:
                return renderLogs();

            default:
                return null;
        }
    };

    const renderAnalytics = () => {
        // Calculate stats from Cartesian Grid
        const allCells = grid.getAllCells();
        const plantCount = allCells.filter(c => c.type === 'plant').length;
        const scannedPercent = plantCount > 0 ? Math.round((plantsScanned.length / plantCount) * 100) : 0;
        const avgMoisture = allCells
            .filter(c => c.type === 'plant' && c.moisture)
            .reduce((sum, c) => sum + c.moisture, 0) / Math.max(plantCount, 1);

        // Prepare chart data
        const chartData = allCells
            .filter(c => c.type === 'plant')
            .map(c => ({
                name: `${c.x},${c.y}`,
                moisture: c.moisture || 0,
                fill: c.moisture < 40 ? '#ef4444' : c.moisture < 60 ? '#eab308' : '#22c55e'
            }));

        return (
            <div className="p-6 overflow-y-auto h-full custom-scrollbar">
                <h2 className="text-2xl font-bold mb-6">Mission Analytics</h2>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Plants Scanned</div>
                        <div className="text-3xl font-bold text-green-400">{plantsScanned.length}/{plantCount}</div>
                        <div className="text-xs text-gray-500 mt-1">{scannedPercent}% Complete</div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Distance Traveled</div>
                        <div className="text-3xl font-bold text-blue-400">{totalDistance.toFixed(2)}m</div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Avg Moisture</div>
                        <div className="text-3xl font-bold text-purple-400">{avgMoisture.toFixed(0)}%</div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase mb-1">Mission Time</div>
                        <div className="text-3xl font-bold text-orange-400">
                            {missionStartTime ? ((Date.now() - missionStartTime) / 1000).toFixed(1) : 0}s
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-white/10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Moisture Distribution</h3>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
                                <Bar dataKey="moisture" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderLogs = () => (
        <div className="h-full flex flex-col bg-black/50">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-sm">System Logs</h3>
                <button
                    onClick={() => {
                        const text = logs.map(l => `[${l.time}] [${l.type}] ${l.msg}`).join('\n');
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `mission_log_${Date.now()}.txt`;
                        a.click();
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-2"
                >
                    <Download size={12} /> Export
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 hover:bg-white/5 px-2 py-1 rounded">
                        <span className="text-gray-600">[{log.time}]</span>
                        <span className={`font-bold w-16 ${log.type === 'ERROR' ? 'text-red-500' :
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

    const renderSidebar = () => {
        if (currentPage === PAGES.LIBRARY || currentPage === PAGES.SETUP || currentPage === PAGES.MANUAL_CONTROL) return null;

        return (
            <div className="w-80 bg-gray-900 border-l border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <div className="text-xs text-gray-500 uppercase mb-1">Active Garden</div>
                    <div className="font-bold text-sm">{selectedTemplate?.name || 'None'}</div>
                    {isCustomized && <div className="text-xs text-yellow-400 mt-1">● Modified</div>}
                </div>

                {currentPage === PAGES.SIMULATION && (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-400">Status</div>
                                <div className={`text-sm font-bold ${isPlaying ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {isPlaying ? 'ACTIVE' : 'PAUSED'}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-400">Speed</div>
                                <div className="text-sm font-bold text-blue-400">{robotPose.velocity?.toFixed(2) || 0} m/s</div>
                            </div>
                        </div>

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
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 block mb-2">Simulation Speed: {simSpeed}x</label>
                            <input
                                type="range" min="0.5" max="3" step="0.5"
                                value={simSpeed}
                                onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg border border-white/10 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Waypoint</span>
                                <span className="font-mono text-white">{currentWaypointIndex + 1}/{customPath.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Distance</span>
                                <span className="font-mono text-blue-400">{totalDistance.toFixed(2)}m</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Scanned</span>
                                <span className="font-mono text-green-400">{plantsScanned.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
            {/* Top Navigation */}
            <div className="h-14 border-b border-white/10 bg-gray-900 flex items-center px-6 justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Radar className="text-white" size={18} />
                    </div>
                    <h1 className="font-bold tracking-wider">Garden Rover <span className="text-blue-500">MISSION CONTROL</span></h1>
                </div>

                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 gap-1">
                    <button
                        onClick={() => setCurrentPage(PAGES.LIBRARY)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${currentPage === PAGES.LIBRARY ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Library size={14} /> LIBRARY
                    </button>
                    <button
                        onClick={() => setCurrentPage(PAGES.SETUP)}
                        disabled={!selectedTemplate}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentPage === PAGES.SETUP ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Edit3 size={14} /> SETUP
                    </button>
                    <button
                        onClick={() => setCurrentPage(PAGES.SIMULATION)}
                        disabled={!selectedTemplate}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentPage === PAGES.SIMULATION ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Play size={14} /> SIMULATION
                    </button>
                    <button
                        onClick={() => setCurrentPage(PAGES.MANUAL_CONTROL)}
                        disabled={!selectedTemplate}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentPage === PAGES.MANUAL_CONTROL ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <Gamepad2 size={14} /> MANUAL
                    </button>
                    <button
                        onClick={() => setCurrentPage(PAGES.ANALYTICS)}
                        disabled={!selectedTemplate}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentPage === PAGES.ANALYTICS ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <BarChart3 size={14} /> ANALYTICS
                    </button>
                    <button
                        onClick={() => setCurrentPage(PAGES.LOGS)}
                        disabled={!selectedTemplate}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-30 ${currentPage === PAGES.LOGS ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <TerminalIcon size={14} /> LOGS
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                        <Battery className="text-green-500" size={14} />
                        <span>98%</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 bg-black relative">
                    {renderPage()}
                </div>
                {renderSidebar()}
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
      `}</style>
        </section>
    );
};

export default GardenSimulationSection;
