import React, { useState, useEffect } from 'react';
import { Server, Database, Activity, Terminal, Cloud } from 'lucide-react';
import realRoverService from '../../services/realRoverService';

const CloudServerDashboard = () => {
    const [cloudState, setCloudState] = useState(realRoverService.state$.value.cloud);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const subState = realRoverService.state$.subscribe(s => setCloudState(s.cloud));
        const subLogs = realRoverService.logs$.subscribe(l => setLogs(l));

        return () => {
            subState.unsubscribe();
            subLogs.unsubscribe();
        };
    }, []);

    return (
        <div className="h-full bg-[#0a0f1c] border-r border-white/10 flex flex-col font-mono text-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#0d1221] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Cloud className="text-blue-500" size={20} />
                    <h2 className="text-lg font-bold text-white">AWS Backend</h2>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-green-500 font-bold">US-EAST-1: ACTIVE</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* MQTT Broker Status */}
                <div className="p-4 rounded-lg bg-[#111827] border border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-purple-400">
                        <Activity size={16} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">MQTT Broker</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 border-b border-white/5 pb-1">
                            <span>CLIENTS</span>
                            <span>TOPICS</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <ul className="text-xs text-green-400 space-y-1">
                                {cloudState.mqttBroker.clients.length === 0 && <li className="text-gray-600 italic">No clients connected</li>}
                                {cloudState.mqttBroker.clients.map(c => (
                                    <li key={c} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {c}
                                    </li>
                                ))}
                            </ul>
                            <div className="text-right space-y-1">
                                {Object.entries(cloudState.mqttBroker.topics).map(([topic, payload]) => (
                                    <div key={topic} className="text-xs">
                                        <span className="text-gray-500">{topic}: </span>
                                        <span className="text-blue-300 font-mono">
                                            {payload ? JSON.stringify(payload).slice(0, 20) + '...' : 'null'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Metrics */}
                <div className="p-4 rounded-lg bg-[#111827] border border-white/5">
                    <div className="flex items-center gap-2 mb-3 text-orange-400">
                        <Database size={16} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">PostgreSQL DB</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-3 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px] uppercase">Telemetry Logs</div>
                            <div className="text-2xl font-bold text-white">{cloudState.db.logs.length}</div>
                        </div>
                        <div className="bg-black/40 p-3 rounded border border-white/5">
                            <div className="text-gray-500 text-[10px] uppercase">API Requests</div>
                            <div className="text-2xl font-bold text-white">{logs.filter(l => l.source === 'APP').length}</div>
                        </div>
                    </div>
                </div>

                {/* System Logs */}
                <div className="flex-1 min-h-[200px] bg-black p-3 rounded-lg border border-white/10 font-mono text-xs overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-white/10 pb-2">
                        <Terminal size={12} />
                        <span className="font-bold">SERVER LOGS</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-2 opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-gray-600 select-none">[{log.time}]</span>
                                <span className={`font-bold w-12 ${log.source === 'ERROR' ? 'text-red-500' :
                                        log.source === 'APP' ? 'text-blue-400' :
                                            log.source === 'MQTT' ? 'text-purple-400' :
                                                log.source === 'ESP32' ? 'text-green-400' :
                                                    log.source === 'ARDUINO' ? 'text-yellow-400' :
                                                        'text-gray-400'
                                    }`}>{log.source}</span>
                                <span className="text-gray-300 break-all">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CloudServerDashboard;
