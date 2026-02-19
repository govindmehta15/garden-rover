import React, { useState } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProductStorySection from './ProductStorySection';
import FeaturesOverview from './FeaturesOverview';
import GardenSimulationSection from './GardenSimulationSection';
import PersistentGardenSimulation from './PersistentGardenSimulation';
import CartesianDemo from './CartesianDemo';
import WorldCoordinateDemo from './WorldCoordinateDemo';
import ArchitectureSection from './ArchitectureSection';
import Footer from './Footer';

import RealRoverSimulation from './RealRoverSimulation';

const LandingPage = () => {
    // Toggle between traditional scrollable layout and persistent multi-panel layout
    const [usePersistentLayout, setUsePersistentLayout] = useState(false);
    const [showCartesianDemo, setShowCartesianDemo] = useState(false);
    const [showRealRover, setShowRealRover] = useState(false);

    if (showRealRover) {
        return (
            <>
                <RealRoverSimulation />
                <button
                    onClick={() => setShowRealRover(false)}
                    className="fixed top-4 right-4 z-[100] px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-xl border border-white/20 backdrop-blur flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Exit Simulator
                </button>
            </>
        );
    }

    return (
        <>
            {showCartesianDemo ? (
                // World Coordinate System Demo (Full Screen)
                <WorldCoordinateDemo />
            ) : usePersistentLayout ? (
                // Persistent Multi-Panel Layout (Full Screen)
                <PersistentGardenSimulation />
            ) : (
                // Traditional Scrollable Layout
                <div className="min-h-screen bg-gray-50 dark:bg-[#05100a] text-gray-900 dark:text-white font-sans selection:bg-emerald-500/30 transition-colors duration-300 scroll-smooth">
                    <Navbar />

                    {/* Layout Toggle Buttons */}
                    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                        <button
                            onClick={() => setShowRealRover(true)}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-full shadow-xl border-2 border-white/20 backdrop-blur flex items-center gap-2 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Real Rover Sim
                        </button>
                        <button
                            onClick={() => setUsePersistentLayout(true)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-full shadow-xl border-2 border-white/20 backdrop-blur flex items-center gap-2 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                            </svg>
                            Multi-Panel Mode
                        </button>
                        <button
                            onClick={() => setShowCartesianDemo(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full shadow-xl border-2 border-white/20 backdrop-blur flex items-center gap-2 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 4 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            World Coordinate Demo
                        </button>
                    </div>

                    <main className="relative">
                        <HeroSection />
                        <ProductStorySection />
                        <FeaturesOverview />
                        <GardenSimulationSection />
                        <ArchitectureSection />
                    </main>
                    <Footer />
                </div>
            )}

            {/* Exit Persistent Mode Button */}
            {usePersistentLayout && (
                <button
                    onClick={() => setUsePersistentLayout(false)}
                    className="fixed top-4 left-4 z-[100] px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-xl border border-white/20 backdrop-blur flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Exit Multi-Panel
                </button>
            )}

            {/* Exit Cartesian Demo Button */}
            {showCartesianDemo && (
                <button
                    onClick={() => setShowCartesianDemo(false)}
                    className="fixed top-4 left-4 z-[100] px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-xl border border-white/20 backdrop-blur flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Exit Demo
                </button>
            )}
        </>
    );
};

export default LandingPage;
