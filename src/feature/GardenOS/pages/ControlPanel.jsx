import React, { useState, useEffect, useRef } from 'react';
import {
    Power,
    Droplets,
    Clock,
    Settings,
    AlertOctagon,
    Activity,
    Battery,
    Wifi,
    Navigation,
    Target,
    Thermometer,
    PauseCircle,
    PlayCircle,
    RotateCcw,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    MapPin
} from 'lucide-react';

// --- Mock Data ---

const ZONES = [
    { id: 1, name: 'Zone 1 (Tomatoes)' },
    { id: 2, name: 'Zone 2 (Spinach)' },
    { id: 3, name: 'Zone 3 (Wheat)' },
    { id: 4, name: 'Zone 4 (Rice)' },
];

const INITIAL_LOGS = [
    { id: 1, time: '10:42 AM', type: 'info', message: 'System performed auto-diagnostic check.' },
    { id: 2, time: '09:15 AM', type: 'success', message: 'Scheduled irrigation completed for Zone 1.' },
    { id: 3, time: '08:30 AM', type: 'warning', message: 'Rover battery below 30% - returning to dock.' },
];

// --- Components ---

const StatusLight = ({ active, color = 'bg-emerald-500' }) => (
    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${active ? `${color} shadow-[0_0_8px_rgba(16,185,129,0.6)]` : 'bg-gray-300 dark:bg-gray-700'}`} />
);

const ActivityLog = ({ logs }) => (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={18} /> System Activity
            </h3>
            <span className="text-xs font-mono text-gray-500">LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] font-mono text-sm">
            {logs.map(log => (
                <div key={log.id} className="flex gap-3">
                    <span className="text-gray-400 shrink-0">[{log.time}]</span>
                    <span className={`${log.type === 'error' ? 'text-red-500' :
                            log.type === 'warning' ? 'text-amber-500' :
                                log.type === 'success' ? 'text-emerald-500' :
                                    'text-blue-400'
                        }`}>
                        {log.type.toUpperCase()}:
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{log.message}</span>
                </div>
            ))}
        </div>
    </div>
);

const ControlPanel = () => {
    // State
    const [pumpActive, setPumpActive] = useState(false);
    const [selectedZone, setSelectedZone] = useState(1);
    const [duration, setDuration] = useState(15);
    const [autoWatering, setAutoWatering] = useState(true);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [roverPos, setRoverPos] = useState({ x: 50, y: 50 }); // % coordinates
    const [emergencyStop, setEmergencyStop] = useState(false);

    // Handlers
    const addLog = (type, message) => {
        const newLog = {
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            message
        };
        setLogs(prev => [newLog, ...prev.slice(0, 9)]);
    };

    const togglePump = () => {
        if (emergencyStop) return;
        const newState = !pumpActive;
        setPumpActive(newState);
        addLog(newState ? 'success' : 'info', `Main Pump ${newState ? 'ACTIVATED' : 'DEACTIVATED'} for Zone ${selectedZone}`);
    };

    const handleRoverMove = (dx, dy) => {
        if (emergencyStop) return;
        setRoverPos(prev => ({
            x: Math.max(0, Math.min(100, prev.x + dx)),
            y: Math.max(0, Math.min(100, prev.y + dy))
        }));
        addLog('info', `Rover moved manually to grid [${Math.round(roverPos.x)}, ${Math.round(roverPos.y)}]`);
    };

    const triggerEmergencyStop = () => {
        setEmergencyStop(!emergencyStop);
        setPumpActive(false);
        addLog('error', !emergencyStop ? 'EMERGENCY STOP TRIGGERED - ALL SYSTEMS HALTED' : 'Systems Reset - Emergency Stop Cleared');
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">

            {/* Header & Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-8 h-8 text-emerald-600" />
                        Mission Control
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manual override and system configuration.</p>
                </div>

                <div className="flex items-center gap-2">
                    {emergencyStop && (
                        <div className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg animate-pulse flex items-center gap-2">
                            <AlertOctagon size={20} /> EMERGENCY STOP ACTIVE
                        </div>
                    )}
                    <button
                        onClick={triggerEmergencyStop}
                        className={`px-6 py-2 rounded-lg font-bold border-2 transition-all ${emergencyStop
                                ? 'border-gray-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                            }`}
                    >
                        {emergencyStop ? 'RESET SYSTEM' : 'EMERGENCY STOP'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Irrigation & Automation */}
                <div className="space-y-6">

                    {/* Irrigation Control */}
                    <div className={`bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border ${pumpActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-gray-200 dark:border-white/10'} transition-all`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Droplets className="text-blue-500" /> Irrigation
                            </h3>
                            <div className="flex items-center gap-2 text-sm font-bold">
                                STATUS:
                                <span className={pumpActive ? 'text-blue-500' : 'text-gray-400'}>{pumpActive ? 'FLOWING' : 'IDLE'}</span>
                                <StatusLight active={pumpActive} color="bg-blue-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Select Zone</label>
                                <select
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(Number(e.target.value))}
                                    disabled={pumpActive || emergencyStop}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block flex justify-between">
                                    <span>Duration</span>
                                    <span>{duration} min</span>
                                </label>
                                <input
                                    type="range"
                                    min="1" max="60"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    disabled={pumpActive || emergencyStop}
                                    className="w-full accent-blue-500"
                                />
                            </div>

                            <button
                                onClick={togglePump}
                                disabled={emergencyStop}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${pumpActive
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    } ${emergencyStop ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Power size={20} /> {pumpActive ? 'STOP PUMP' : 'START WATERING'}
                            </button>
                        </div>
                    </div>

                    {/* Automation Rules */}
                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="text-purple-500" /> Automation
                            </h3>
                            <div
                                onClick={() => !emergencyStop && setAutoWatering(!autoWatering)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${autoWatering ? 'bg-purple-600' : 'bg-gray-300 dark:bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoWatering ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className={`space-y-3 ${!autoWatering ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                <span className="text-gray-600 dark:text-gray-300">Moisture Threshold</span>
                                <input type="number" defaultValue={40} className="w-16 bg-transparent text-right font-mono font-bold outline-none border-b border-gray-300 focus:border-purple-500" />
                                <span className="text-gray-400 ml-1">%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                                <span className="text-gray-600 dark:text-gray-300">Scheduled Time</span>
                                <input type="time" defaultValue="06:00" className="bg-transparent font-mono outline-none" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Column 2: Rover Control */}
                <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Navigation className="text-orange-500" /> Rover Alpha
                        </h3>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-mono flex items-center gap-1">
                                <Battery size={12} /> 45%
                            </span>
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-mono flex items-center gap-1">
                                <Wifi size={12} /> LINKED
                            </span>
                        </div>
                    </div>

                    {/* Mini Map */}
                    <div className="flex-1 bg-gray-900 rounded-xl relative overflow-hidden mb-6 min-h-[200px] border border-gray-700 shadow-inner group">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {/* Rover Dot */}
                        <div
                            className="absolute w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-[0_0_10px_orange] transition-all duration-300 z-10"
                            style={{ left: `${roverPos.x}%`, top: `${roverPos.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-50"></div>
                        </div>

                        {/* Target Marker (Mock) */}
                        <Target className="absolute text-emerald-500/50 w-6 h-6" style={{ left: '70%', top: '30%' }} />
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* D-Pad */}
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10"></div>
                            <button
                                onClick={() => handleRoverMove(0, -10)}
                                disabled={emergencyStop}
                                className="absolute top-1 left-1/2 -translate-x-1/2 p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                            ><ArrowUp size={24} /></button>
                            <button
                                onClick={() => handleRoverMove(0, 10)}
                                disabled={emergencyStop}
                                className="absolute bottom-1 left-1/2 -translate-x-1/2 p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                            ><ArrowDown size={24} /></button>
                            <button
                                onClick={() => handleRoverMove(-10, 0)}
                                disabled={emergencyStop}
                                className="absolute left-1 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                            ><ArrowLeft size={24} /></button>
                            <button
                                onClick={() => handleRoverMove(10, 0)}
                                disabled={emergencyStop}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition-colors"
                            ><ArrowRight size={24} /></button>
                            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 justify-center">
                            <button
                                disabled={emergencyStop}
                                onClick={() => addLog('info', 'Rover Auto-Scan Initiated')}
                                className="py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <MapPin size={16} /> Auto-Scan
                            </button>
                            <button
                                disabled={emergencyStop}
                                onClick={() => addLog('success', 'Soil Sample Collected at current position')}
                                className="py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Target size={16} /> Sample Soil
                            </button>
                            <button
                                disabled={emergencyStop}
                                onClick={() => { setRoverPos({ x: 50, y: 50 }); addLog('warning', 'Return to Base command sent'); }}
                                className="py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} /> Return Base
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 3: Logistics & Safety */}
                <div className="space-y-6">
                    <ActivityLog logs={logs} />

                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 mt-auto">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">System Checks</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Sensor Array</span>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded font-bold">OPTIMAL</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Water Tank Level</span>
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs rounded font-bold">LOW (25%)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Network Latency</span>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded font-bold">24ms</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ControlPanel;
