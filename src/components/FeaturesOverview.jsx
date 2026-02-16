import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Grid, Cpu, Activity, Database, Sparkles } from 'lucide-react';

const FeatureCard = ({ title, description, icon, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.5)' }}
        className="p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl transition-all shadow-md dark:shadow-none hover:shadow-xl group"
    >
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
);

const FeaturesOverview = () => {
    const features = [
        {
            title: "Autonomous Navigation",
            description: "Precision movement across garden plots using advanced pathfinding algorithms and obstacle avoidance.",
            icon: <Compass size={28} />
        },
        {
            title: "Soil Mapping Grid",
            description: "Digital twin technology creates a real-time moisture and temperature map of your entire garden.",
            icon: <Grid size={28} />
        },
        {
            title: "Intelligent Watering",
            description: "Targeted irrigation logic that delivers water only where needed, minimizing waste.",
            icon: <Cpu size={28} />
        },
        {
            title: "Data Analytics",
            description: "Comprehensive dashboard tracking plant health trends, growth cycles, and environmental stats.",
            icon: <Activity size={28} />
        },
        {
            title: "Cloud Storage",
            description: "Secure historical logs allow you to rewind and see how your garden has evolved over seasons.",
            icon: <Database size={28} />
        },
        {
            title: "Future AI Expansion",
            description: "Ready for computer vision upgrades to detect pests, weeds, and harvest readiness.",
            icon: <Sparkles size={28} />
        },
    ];

    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-black transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-4">
                        <span className="text-emerald-600 dark:text-emerald-400">Integrated</span> Capabilities
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Everything your garden needs, automated in one intelligent rover.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} index={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesOverview;
