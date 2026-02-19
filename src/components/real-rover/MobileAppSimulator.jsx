import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Play, Settings, Activity, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Map, CheckCircle, Smartphone } from 'lucide-react';
import realRoverService from '../../services/realRoverService';
import GardenScene3D from '../GardenScene3D';

const MobileAppSimulator = () => {
    const [state, setState] = useState(realRoverService.state$.value.app);
    const [roverState, setRoverState] = useState(realRoverService.state$.value.rover);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const sub = realRoverService.state$.subscribe(s => {
            setState(s.app);
            setRoverState(s.rover);
        });
        return () => sub.unsubscribe();
    }, []);

    const handleConnect = () => {
        realRoverService.connectApp();
    };

    const handleJoystick = (x, y) => {
        realRoverService.sendJoystickCommand(x, y);
    };

    const handleStartMission = () => {
        realRoverService.startMission();
    };

    const handleSaveConfig = () => {
        realRoverService.saveConfiguration({
            gardenBoundary: { w: 10, h: 10 },
            plantCoordinates: [{ id: 'p1', x: 2, y: 3, type: 'Tomato' }],
            homeCoordinate: { x: 0, y: 0 },
            obstacles: [{ x: 5, y: 5 }],
            testInterval: 12
        });
    };

    // Dummy grid data for the mini-map visualization
    const miniMapGrid = Array(25).fill({ type: 'empty' });
    miniMapGrid[13] = { type: 'plant', health: 85 }; // Middle plant

    return (
        <div className="h-full bg-gray-900 border-r border-white/10 flex flex-col items-center py-8 relative">

            {/* Phone Frame - Premium Look */}
            <div className="w-[320px] h-[650px] bg-[#000000] rounded-[3.5rem] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden relative ring-4 ring-gray-800">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50 flex justify-center items-center">
                    <div className="w-16 h-4 bg-[#0a0a0a] rounded-full flex gap-2 items-center justify-center">
                        <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="absolute top-2 w-full px-7 flex justify-between items-center text-[10px] text-white z-40 font-medium tracking-wide">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <Wifi size={12} />
                        <Battery size={12} />
                    </div>
                </div>

                {/* App Content - Glassmorphism & Gradients */}
                <div className="w-full h-full bg-slate-950 flex flex-col relative text-white bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

                    {/* App Header */}
                    <div className="relative z-10 px-6 pt-12 pb-4 flex justify-between items-end border-b border-white/5">
                        <div>
                            <div className="text-xs text-emerald-400 font-bold tracking-wider mb-1">WELCOME HOME</div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">GardenOS</h2>
                        </div>
                        <button
                            onClick={() => realRoverService.updateState(s => ({ ...s, app: { ...s.app, activeTab: state.activeTab === 'CONFIG' ? 'DASHBOARD' : 'CONFIG' } }))}
                            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/10"
                        >
                            <Settings size={20} className="text-white" />
                        </button>
                    </div>

                    {/* Main Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 relative z-10 scrollbar-hide">

                        {!state.connected ? (
                            /* Disconnected State */
                            <div className="h-full flex flex-col justify-center items-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-pulse mb-6 ring-1 ring-emerald-500/30">
                                    <Wifi size={32} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Connect Rover</h3>
                                <p className="text-gray-400 text-center text-sm mb-8 px-4">Ensure your Garden Rover is powered on and within WiFi range.</p>
                                <button
                                    onClick={handleConnect}
                                    className="w-full py-4 bg-[#23ba78] hover:bg-[#1a9e63] text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Connect Now
                                </button>
                            </div>
                        ) : state.activeTab === 'CONFIG' ? (
                            /* Configuration View */
                            <div className="space-y-4 animation-fade-in">
                                <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10">
                                    <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                        <Map size={18} className="text-emerald-400" /> Garden Mapping
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-3 bg-black/20 rounded-xl">
                                            <span className="text-gray-400">Boundary</span>
                                            <span className="font-mono text-emerald-400">10m x 10m</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-black/20 rounded-xl">
                                            <span className="text-gray-400">Target</span>
                                            <span className="font-mono text-emerald-400">Tomato (2,3)</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-black/20 rounded-xl">
                                            <span className="text-gray-400">Interval</span>
                                            <span className="font-mono text-emerald-400">12 Hours</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveConfig}
                                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold mt-4 shadow-lg shadow-emerald-900/20"
                                    >
                                        {state.config.configured ? 'Update Map' : 'Sync & Save'}
                                    </button>
                                </div>
                            </div>
                        ) : state.activeTab === 'REPORT' && state.report ? (
                            /* Report View */
                            <div className="space-y-4 pt-10 text-center">
                                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-4">
                                    <CheckCircle size={48} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Mission Complete</h2>
                                <p className="text-emerald-400 font-medium">Plant #1 Successfully Watered</p>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <div className="text-gray-400 text-xs mb-1">Usage</div>
                                        <div className="text-xl font-bold">{state.report.waterUsed}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <div className="text-gray-400 text-xs mb-1">Health</div>
                                        <div className="text-xl font-bold text-emerald-400">{state.report.health}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => realRoverService.updateState(s => ({ ...s, app: { ...s.app, activeTab: 'DASHBOARD' } }))}
                                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold text-sm mt-8 border border-white/10"
                                >
                                    Return to Home
                                </button>
                            </div>
                        ) : (
                            /* Dashboard View */
                            <div className="space-y-5 pb-24">

                                {/* Status Card */}
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                    <span className="text-xs font-bold text-emerald-400 tracking-wider">SYSTEM ONLINE</span>
                                    <span className={`ml-auto text-xs font-bold px-2 py-1 rounded bg-white/10 ${roverState.mission.status !== 'IDLE' ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`}>
                                        {roverState.mission.status}
                                    </span>
                                </div>

                                {/* Main Action Button */}
                                <button
                                    onClick={handleStartMission}
                                    disabled={roverState.mission.status !== 'IDLE' || !state.config.configured}
                                    className={`w-full py-6 rounded-3xl font-bold shadow-xl flex flex-col items-center gap-2 transition-all relative overflow-hidden group ${roverState.mission.status === 'IDLE' && state.config.configured
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-emerald-500/20'
                                            : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-3xl"></div>
                                    <Play size={24} fill="currentColor" className="relative z-10" />
                                    <span className="relative z-10">{roverState.mission.status === 'IDLE' ? 'START MISSION' : 'RUNNING...'}</span>
                                </button>

                                {/* Sensor Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Moisture */}
                                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <Activity size={16} className="text-blue-400" />
                                            <span className="text-[10px] text-gray-400">MOISTURE</span>
                                        </div>
                                        <div className="text-2xl font-bold">{roverState.arduino.sensors.moisture}</div>
                                        <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{ width: `${roverState.arduino.sensors.moisture / 10}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Battery */}
                                    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <Battery size={16} className="text-emerald-400" />
                                            <span className="text-[10px] text-gray-400">BATTERY</span>
                                        </div>
                                        <div className="text-2xl font-bold">{roverState.arduino.sensors.battery.toFixed(1)}V</div>
                                        <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Control (Hidden by default, reveal on hover/click) */}
                                <div className="pt-2">
                                    <div className="text-xs text-center text-gray-500 mb-2">MANUAL OVERRIDE</div>
                                    <div className="bg-black/40 p-4 rounded-3xl border border-white/5 mx-auto w-48 h-48 relative">
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-2">
                                            <div></div>
                                            <button onMouseDown={() => handleJoystick(0, 1)} onMouseUp={() => handleJoystick(0, 0)} className="bg-white/10 rounded-lg hover:bg-emerald-500/50 flex items-center justify-center transition-colors"><ArrowUp size={20} /></button>
                                            <div></div>
                                            <button onMouseDown={() => handleJoystick(-1, 0)} onMouseUp={() => handleJoystick(0, 0)} className="bg-white/10 rounded-lg hover:bg-emerald-500/50 flex items-center justify-center transition-colors"><ArrowLeft size={20} /></button>
                                            <div className="flex items-center justify-center"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div></div>
                                            <button onMouseDown={() => handleJoystick(1, 0)} onMouseUp={() => handleJoystick(0, 0)} className="bg-white/10 rounded-lg hover:bg-emerald-500/50 flex items-center justify-center transition-colors"><ArrowRight size={20} /></button>
                                            <div></div>
                                            <button onMouseDown={() => handleJoystick(0, -1)} onMouseUp={() => handleJoystick(0, 0)} className="bg-white/10 rounded-lg hover:bg-emerald-500/50 flex items-center justify-center transition-colors"><ArrowDown size={20} /></button>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                    </div>

                    {/* LIVE FEED - Bottom Right Picture-in-Picture */}
                    {state.connected && state.activeTab === 'DASHBOARD' && (
                        <div className="absolute bottom-6 right-6 z-20 w-28 h-28 bg-black rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden shadow-black/50">
                            <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-bold text-white shadow-black drop-shadow-md">LIVE</span>
                            </div>

                            {/* Embedded 3D View (Simulating Camera Feed) */}
                            <div className="w-full h-full opacity-90 pointer-events-none">
                                <GardenScene3D
                                    gridData={miniMapGrid}
                                    gridSize={5}
                                    robotPose={{ x: 0, y: 0, theta: 0 }} // Static for demo visual or could link to state
                                    isScanning={false}
                                    onCellClick={() => { }}
                                />
                            </div>

                            {/* Scanlines Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
                        </div>
                    )}

                    {/* Bottom Nav Bar Effect */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/20 rounded-full z-20"></div>
                </div>
            </div>
        </div>
    );
};

export default MobileAppSimulator;
