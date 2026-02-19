import React, { useEffect } from 'react';
import MobileAppSimulator from './real-rover/MobileAppSimulator';
import CloudServerDashboard from './real-rover/CloudServerDashboard';
import RoverHardwareView from './real-rover/RoverHardwareView';
import realRoverService from '../services/realRoverService';

const RealRoverSimulation = () => {
    // Start simulation on mount
    useEffect(() => {
        realRoverService.start();
        return () => realRoverService.stop();
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Title Bar */}
            <div className="h-12 bg-gradient-to-r from-gray-900 to-black border-b border-white/10 flex items-center justify-between px-6">
                <h1 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    REAL ROVER <span className="text-gray-500">FULL STACK SIMULATOR</span>
                </h1>
                <div className="text-xs text-gray-500 font-mono">
                    System Time: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* 1. Mobile App (Left) */}
                <div className="col-span-3 border-r border-white/10 relative z-10">
                    <MobileAppSimulator />
                </div>

                {/* 2. Cloud Server (Middle) */}
                <div className="col-span-5 border-r border-white/10 bg-[#0a0f1c]">
                    <CloudServerDashboard />
                </div>

                {/* 3. Hardware View (Right) */}
                <div className="col-span-4 bg-[#1a1a1a]">
                    <RoverHardwareView />
                </div>
            </div>

            {/* Architecture Overlay Labels (Floating) */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
                <div className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold backdrop-blur">
                    HTTPS / WebSocket
                </div>
                <div className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded text-xs font-bold backdrop-blur">
                    MQTT / TCP
                </div>
            </div>
        </div>
    );
};

export default RealRoverSimulation;
