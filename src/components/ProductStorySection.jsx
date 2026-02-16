import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Cpu, Sprout } from 'lucide-react';

const ProductStorySection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-4">
                        Why <span className="text-emerald-600 dark:text-emerald-400">Agro-Rover?</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Traditional gardening relies on guesswork. We rely on data.
                    </p>
                </div>

                <motion.div
                    className="grid md:grid-cols-3 gap-12 text-center"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {/* Problem */}
                    <motion.div variants={itemVariants} className="relative p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-none hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Droplet className="w-8 h-8 text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Problem</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Overwatering kills more plants than underwatering. Human estimation is inconsistent and often leads to root rot or dehydrated crops.
                        </p>
                    </motion.div>

                    {/* Solution */}
                    <motion.div variants={itemVariants} className="relative p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-none hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Cpu className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Solution</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            An autonomous scanning rover that maps every inch of soil. Agro-Rover detects moisture levels at the root, not just the surface.
                        </p>
                    </motion.div>

                    {/* Result */}
                    <motion.div variants={itemVariants} className="relative p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-none hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Result</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            30% less water usage. 50% higher yield. A healthier, self-sustaining garden that thrives with intelligent automation.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default ProductStorySection;
