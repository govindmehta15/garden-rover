import React, { useState, useEffect } from 'react';
import { Cpu, CircuitBoard, Wifi, Zap, Activity, Droplets, MoveIcon, Waves } from 'lucide-react';
import realRoverService from '../../services/realRoverService';

const RoverHardwareView = () => {
    const [rover, setRover] = useState(realRoverService.state$.value.rover);

    useEffect(() => {
        const sub = realRoverService.state$.subscribe(s => setRover(s.rover));
        return () => sub.unsubscribe();
    }, []);

    return (
        <div className="h-full bg-[#1a1a1a] flex flex-col font-mono text-sm">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#252525] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-yellow-600 flex items-center justify-center text-black font-bold border-2 border-yellow-400">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Hardware Monitor</h2>
                        <div className="text-xs text-gray-400">Physical Unit ID: RVR-001</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">Battery Voltage</div>
                    <div className="text-xl font-bold text-green-400">{rover.arduino.sensors.battery.toFixed(2)}V</div>
                </div>
            </div>

            {/* Main Content - Split into ESP32 and Arduino */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* ESP32 Module */}
                <div className="bg-[#2a2a2a] rounded-lg border border-gray-700 overflow-hidden">
                    <div className="px-4 py-2 bg-[#333] border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Wifi size={14} className="text-blue-400" />
                            ESP32-WROOM-32 (Comms)
                        </div>
                        <div className={`w-2 h-2 rounded-full ${rover.esp32.wifiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <div className="text-gray-500 mb-1">NETWORK_STATUS</div>
                            <div className={`font-bold ${rover.esp32.wifiConnected ? 'text-green-400' : 'text-red-400'}`}>
                                {rover.esp32.wifiConnected ? 'CONNECTED' : 'DISCONNECTED'}
                            </div>
                            <div className="text-gray-600 mt-1">IP: {rover.esp32.ipAddress}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">MQTT_CLIENT</div>
                            <div className={`font-bold ${rover.esp32.mqttConnected ? 'text-blue-400' : 'text-gray-500'}`}>
                                {rover.esp32.mqttConnected ? 'SUBSCRIBED' : 'OFFLINE'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arduino Module */}
                <div className="bg-[#2a2a2a] rounded-lg border border-gray-700 overflow-hidden">
                    <div className="px-4 py-2 bg-[#333] border-b border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <CircuitBoard size={14} className="text-yellow-400" />
                            Arduino UNO (Control)
                        </div>
                        <div className="text-xs text-yellow-500 animate-pulse">Running loop()...</div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Actuators */}
                        <div>
                            <div className="text-xs text-gray-500 mb-2 uppercase">Actuators & Relays</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`p-3 rounded border border-white/5 flex items-center justify-between ${rover.arduino.actuators.waterPump ? 'bg-blue-900/40 border-blue-500' : 'bg-black'}`}>
                                    <div className="flex items-center gap-2">
                                        <Droplets size={14} className={rover.arduino.actuators.waterPump ? 'text-blue-400' : 'text-gray-500'} />
                                        <span className="text-xs font-bold text-gray-300">Water Pump</span>
                                    </div>
                                    <span className={`text-xs font-bold ${rover.arduino.actuators.waterPump ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`}>
                                        {rover.arduino.actuators.waterPump ? 'ACTIVE' : 'OFF'}
                                    </span>
                                </div>

                                <div className={`p-3 rounded border border-white/5 flex items-center justify-between ${rover.arduino.actuators.servoArmAngle > 10 ? 'bg-purple-900/40 border-purple-500' : 'bg-black'}`}>
                                    <div className="flex items-center gap-2">
                                        <MoveIcon size={14} className={rover.arduino.actuators.servoArmAngle > 10 ? 'text-purple-400' : 'text-gray-500'} />
                                        <span className="text-xs font-bold text-gray-300">Servo Arm</span>
                                    </div>
                                    <span className="text-xs font-bold text-purple-400">
                                        {rover.arduino.actuators.servoArmAngle}°
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Motor PWM Visualizer */}
                        <div>
                            <div className="text-xs text-gray-500 mb-2 uppercase">L298N Motors (PWM)</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black p-2 rounded border border-white/5">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Left Front</span>
                                        <span>{rover.arduino.motors.fl}</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 transition-all duration-100" style={{ width: `${Math.abs(rover.arduino.motors.fl) / 255 * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-black p-2 rounded border border-white/5">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Right Front</span>
                                        <span>{rover.arduino.motors.fr}</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 transition-all duration-100" style={{ width: `${Math.abs(rover.arduino.motors.fr) / 255 * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sensor Raw Values */}
                        <div>
                            <div className="text-xs text-gray-500 mb-2 uppercase">Sensor Inputs</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-black p-2 rounded text-center border border-white/5">
                                    <div className="text-[10px] text-gray-400">ULTRASONIC</div>
                                    <div className="text-lg font-bold text-white">{rover.arduino.sensors.ultrasonic.toFixed(0)}cm</div>
                                </div>
                                <div className="bg-black p-2 rounded text-center border border-white/5">
                                    <div className="text-[10px] text-gray-400">MOISTURE</div>
                                    <div className="text-lg font-bold text-blue-400">{rover.arduino.sensors.moisture}</div>
                                </div>
                                <div className="bg-black p-2 rounded text-center border border-white/5">
                                    <div className="text-[10px] text-gray-400">FLOW (L/m)</div>
                                    <div className={`text-lg font-bold ${rover.arduino.sensors.flowRate > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                                        {rover.arduino.sensors.flowRate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connection Lines (Visual Decor) */}
                <div className="flex justify-center items-center gap-2 opacity-30">
                    <div className="w-1 h-12 bg-gray-500"></div>
                    <div className="text-[10px] text-gray-400 rotate-90">UART</div>
                </div>
            </div>
        </div>
    );
};

export default RoverHardwareView;
