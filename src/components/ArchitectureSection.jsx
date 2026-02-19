import React from 'react';
import { motion } from 'framer-motion';
import { Database, Smartphone, Cpu, Settings, Wifi, CircuitBoard, Battery, Radio, Camera, Zap } from 'lucide-react';

const ArchitectureSection = () => {
    const layers = [
        {
            id: 'app',
            label: "User Interface Layer",
            desc: "React Native Mobile App & Web Dashboard",
            details: ["JWT Authentication", "Real-time WebSocket Feeds", "Garden Map Visualization"],
            icon: <Smartphone className="w-6 h-6" />,
            color: "border-blue-500 bg-blue-500/10 text-blue-500",
            darkColor: "dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
        },
        {
            id: 'cloud',
            label: "Cloud Infrastructure",
            desc: "Scalable Backend & Data Processing",
            details: ["Node.js / FastAPI Server", "PostgreSQL Database", "MQTT Broker (Mosquitto)"],
            icon: <Database className="w-6 h-6" />,
            color: "border-purple-500 bg-purple-500/10 text-purple-500",
            darkColor: "dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-400"
        },
        {
            id: 'edge',
            label: "Edge Computing (Rover)",
            desc: "On-board Intelligence & Comms",
            details: ["ESP32-WROOM-32 (WiFi/BLE)", "ESP-CAM Video Stream", "TensorFlow Lite Micro"],
            icon: <Wifi className="w-6 h-6" />,
            color: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
            darkColor: "dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
        },
        {
            id: 'control',
            label: "Real-Time Control",
            desc: "Low-level Hardware Abstraction",
            details: ["Arduino UNO Core", "PID Motor Control", "Sensor Data Fusion"],
            icon: <CircuitBoard className="w-6 h-6" />,
            color: "border-orange-500 bg-orange-500/10 text-orange-500",
            darkColor: "dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
        }
    ];

    const hardwareSpecs = [
        { icon: <Cpu />, label: "Dual Controllers", value: "Arduino + ESP32" },
        { icon: <Settings />, label: "Drive System", value: "4WD w/ Encoders" },
        { icon: <Radio />, label: "Sensors", value: "LiDAR, Ultrasonic, IMU" },
        { icon: <Battery />, label: "Power", value: "12V Li-ion (3S)" },
    ];

    return (
        <section id="architecture" className="py-24 bg-white dark:bg-[#05100a] border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-4">
                        Full Stack <span className="text-emerald-600 dark:text-emerald-400">System Architecture</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        From the React Native mobile app down to the PID motor control loops, every layer is optimized for autonomy.
                    </p>
                </div>

                {/* 4-Layer Stack Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative">
                    {layers.map((layer, i) => (
                        <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`relative z-10 p-6 rounded-2xl border-2 flex flex-col gap-4 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-black group hover:-translate-y-1 ${layer.color.split(' ')[0]} ${layer.darkColor.split(' ')[0]}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${layer.color.split(' ').slice(1).join(' ')} ${layer.darkColor.split(' ').slice(1).join(' ')}`}>
                                {layer.icon}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">{layer.label}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-3">{layer.desc}</p>

                                <ul className="space-y-2">
                                    {layer.details.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}

                    {/* Connecting dashed line (Desktop only) */}
                    <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-200 dark:border-white/10 -z-0"></div>
                </div>

                {/* Real Rover Hardware Gallery & Specs */}
                <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-white/10 overflow-hidden relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                        {/* Left Column: Specs */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold mb-4">
                                <Zap size={14} className="fill-current" />
                                PROTOTYPE V1.0
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                The Real <span className="text-emerald-600 dark:text-emerald-400">Garden Rover</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Built on a robust 4WD chassis, the Smart Garden Rover combines durable mechanics with sophisticated electronics.
                                The dual-controller architecture allows the <strong>ESP32</strong> to handle high-bandwidth tasks like video streaming and cloud sync,
                                while the <strong>Arduino UNO</strong> ensures reliable, real-time motor and sensor control.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {hardwareSpecs.map((spec, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-black/50 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm hover:border-emerald-500/50 transition-colors">
                                        <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                                            {spec.icon}
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{spec.label}</div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{spec.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Photo Gallery */}
                        <div className="relative group">
                            {/* Main Photo Frame */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 transform transition-transform duration-500 group-hover:scale-[1.02]">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                                {/* The Real Rover Image */}
                                <img
                                    src="/rover-assets/real-rover-side.jpg"
                                    alt="Real Smart Garden Rover Prototype"
                                    className="w-full h-auto object-cover"
                                />

                                {/* Overlay Details */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-emerald-400 mb-1">LIVE UNIT</div>
                                            <div className="text-lg font-bold">Autonomous Navigation System</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                            <Camera size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -z-10"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -z-10"></div>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>

            </div>
        </section>
    );
};

export default ArchitectureSection;
