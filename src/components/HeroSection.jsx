import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Grid as GridIcon } from 'lucide-react';

const HeroSection = () => {
    return (
        <div className="relative min-h-[90vh] flex items-center justify-center bg-gray-50 dark:bg-[#05100a] overflow-hidden pt-10 pb-20 transition-colors duration-500">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ duration: 2 }}
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[120px] dark:opacity-20 opacity-10"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] dark:opacity-20 opacity-10"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-left"
                >
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                        System Online v1.0
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                        Smart Garden <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                            Brain Robot
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
                        Autonomous Soil Monitoring & Intelligent Irrigation. The future of precision agriculture is here, powered by AI-driven robotics.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <motion.a
                            href="#simulation"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] flex items-center justify-center gap-2"
                        >
                            <GridIcon size={20} /> View Simulation
                        </motion.a>

                        <div className="flex gap-4">
                            <motion.a
                                href="#architecture"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <ArrowRight size={20} /> Architecture
                            </motion.a>

                            <motion.a
                                href="#analytics"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-4 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Activity size={20} /> Analytics
                            </motion.a>
                        </div>
                    </div>
                </motion.div>

                {/* Hero Visual - Robot on Grid */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mt-8 lg:mt-0"
                >
                    <div className="relative w-full aspect-square max-w-md mx-auto bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl dark:shadow-emerald-900/10 transition-colors duration-500">
                        {/* Header of the fake interface */}
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/5 pb-4 transition-colors">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="uppercase text-xs tracking-widest text-emerald-600 dark:text-emerald-500/80 font-mono font-bold">
                                AGRO-ROVER LIVE FEED
                            </div>
                        </div>

                        {/* The Grid */}
                        <div className="grid grid-cols-5 grid-rows-5 gap-3 h-[300px] w-[300px] mx-auto relative content-center">
                            {[...Array(25)].map((_, i) => (
                                <div key={i} className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg relative overflow-hidden group transition-colors">
                                    {/* Random "plant" in some cells */}
                                    {[3, 7, 12, 18, 22].includes(i) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-green-500/50 rounded-full blur-[1px]"></div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* The Robot */}
                            <div className="absolute inset-0 pointer-events-none">
                                <motion.div
                                    animate={{
                                        left: ["0%", "20%", "20%", "40%", "40%", "60%", "60%", "80%", "80%", "0%"],
                                        top: ["0%", "0%", "20%", "20%", "40%", "40%", "20%", "20%", "0%", "0%"],
                                    }}
                                    transition={{
                                        duration: 12,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1]
                                    }}
                                    className="absolute w-[20%] h-[20%] flex items-center justify-center z-20"
                                >
                                    <div className="w-[80%] h-[80%] border-2 border-emerald-500 bg-emerald-500/20 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    </div>
                                </motion.div>

                                {/* Path trail */}
                                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-emerald-500" style={{ strokeWidth: 2 }}>
                                    <motion.path
                                        d="M 30 30 L 90 30 L 90 90 L 150 90 L 150 150 L 210 150 L 210 90 L 270 90"
                                        fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 dark:border-white/5 pt-4 transition-colors">
                            <div className="text-center">
                                <div className="text-xs text-gray-400 uppercase font-semibold">Battery</div>
                                <div className="text-emerald-500 font-mono font-bold">98%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-400 uppercase font-semibold">H20 Level</div>
                                <div className="text-blue-500 font-mono font-bold">75%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-400 uppercase font-semibold">Signal</div>
                                <div className="text-yellow-500 font-mono font-bold">Strong</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
