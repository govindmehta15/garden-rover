import React from 'react';
import { motion } from 'framer-motion';
import { Database, Smartphone, Cpu, Settings } from 'lucide-react';

const ArchitectureSection = () => {
    const layers = [
        {
            id: 'app',
            label: "Mobile App Layer",
            desc: "React Native Interface for real-time control and monitoring.",
            icon: <Smartphone className="w-6 h-6" />,
            color: "border-blue-500 bg-blue-500/10 text-blue-500",
            darkColor: "dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
        },
        {
            id: 'cloud',
            label: "Cloud Layer",
            desc: "AWS / Firebase backend for historical data storage and fleet management.",
            icon: <Database className="w-6 h-6" />,
            color: "border-purple-500 bg-purple-500/10 text-purple-500",
            darkColor: "dark:border-purple-500 dark:bg-purple-500/10 dark:text-purple-400"
        },
        {
            id: 'intel',
            label: "Intelligence Layer",
            desc: "Edge AI processing for plant disease detection and path planning.",
            icon: <Cpu className="w-6 h-6" />,
            color: "border-emerald-500 bg-emerald-500/10 text-emerald-500",
            darkColor: "dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
        },
        {
            id: 'hw',
            label: "Hardware Layer",
            desc: "ESP32 Microcontrollers, LiDAR, Moisture Sensors, & Robotic Arm.",
            icon: <Settings className="w-6 h-6" />,
            color: "border-orange-500 bg-orange-500/10 text-orange-500",
            darkColor: "dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
        }
    ];

    return (
        <section id="architecture" className="py-24 bg-white dark:bg-[#05100a] border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-16">
                    Full Stack <span className="text-emerald-600 dark:text-emerald-400">Architecture</span>
                </h2>

                <div className="flex flex-col items-center justify-center gap-4 relative max-w-2xl mx-auto">
                    {layers.map((layer, i) => (
                        <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.2, duration: 0.5, type: "spring" }}
                            className={`relative z-10 w-full p-6 rounded-2xl border-2 flex items-center gap-6 text-left shadow-lg hover:shadow-xl transition-all bg-white dark:bg-black ${layer.color.split(' ')[0]} ${layer.darkColor.split(' ')[0]}`}
                        >
                            <div className={`p-4 rounded-xl ${layer.color.split(' ').slice(1).join(' ')} ${layer.darkColor.split(' ').slice(1).join(' ')}`}>
                                {layer.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{layer.label}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{layer.desc}</p>
                            </div>

                            {/* Connector Line */}
                            {i !== layers.length - 1 && (
                                <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-gray-300 dark:bg-white/20 -z-10"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ArchitectureSection;
