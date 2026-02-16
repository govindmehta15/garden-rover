import React, { useState } from 'react';
import {
    Eye, EyeOff, LayoutGrid, BarChart3, Terminal as TerminalIcon,
    Maximize2, Minimize2
} from 'lucide-react';

/**
 * Persistent Multi-Panel Layout Component
 * All panels remain mounted - only visibility is toggled
 */
const SimulationLayout = ({
    leftPanel,      // 3D Scene / Grid Editor
    rightTopPanel,  // Dashboard / Analytics
    rightBottomPanel, // Serial Monitor / Controls
    bottomPanel,    // Logs / Metrics
    topControls     // Navigation and controls
}) => {
    // Visibility toggles - components stay mounted
    const [panels, setPanels] = useState({
        leftPanel: true,
        rightTop: true,
        rightBottom: true,
        bottom: true
    });

    // Panel size states
    const [sizes, setSizes] = useState({
        leftWidth: 60, // percentage
        rightTopHeight: 50, // percentage of right panel
        bottomHeight: 25 // percentage of total height
    });

    const togglePanel = (panel) => {
        setPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
    };

    return (
        <div className="h-screen w-full flex flex-col bg-gray-900">
            {/* Top Controls Bar */}
            <div className="h-auto flex-shrink-0 border-b border-white/10 bg-black">
                {topControls}
            </div>

            {/* Main Content Area - CSS Grid Layout */}
            <div
                className="flex-1 grid overflow-hidden"
                style={{
                    gridTemplateColumns: panels.leftPanel
                        ? `${sizes.leftWidth}% ${100 - sizes.leftWidth}%`
                        : '0% 100%',
                    gridTemplateRows: panels.bottom
                        ? `${100 - sizes.bottomHeight}% ${sizes.bottomHeight}%`
                        : '100% 0%',
                    transition: 'grid-template-columns 0.3s ease, grid-template-rows 0.3s ease'
                }}
            >
                {/* Left Panel - 3D Scene / Grid Editor */}
                <div
                    className="relative overflow-hidden border-r border-white/10"
                    style={{
                        gridColumn: '1',
                        gridRow: '1 / 3',
                        opacity: panels.leftPanel ? 1 : 0,
                        visibility: panels.leftPanel ? 'visible' : 'hidden',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {/* Always mounted */}
                    {leftPanel}

                    {/* Panel Toggle */}
                    <button
                        onClick={() => togglePanel('leftPanel')}
                        className="absolute top-2 right-2 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-lg border border-white/20 backdrop-blur"
                        title={panels.leftPanel ? "Hide 3D View" : "Show 3D View"}
                    >
                        {panels.leftPanel ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {/* Right Panel Container */}
                <div
                    className="flex flex-col overflow-hidden"
                    style={{ gridColumn: '2', gridRow: '1' }}
                >
                    {/* Right Top - Dashboard / Analytics */}
                    <div
                        className="border-b border-white/10 relative overflow-hidden"
                        style={{
                            height: panels.rightTop ? `${sizes.rightTopHeight}%` : '0%',
                            opacity: panels.rightTop ? 1 : 0,
                            visibility: panels.rightTop ? 'visible' : 'hidden',
                            transition: 'height 0.3s ease, opacity 0.3s ease'
                        }}
                    >
                        {/* Always mounted */}
                        {rightTopPanel}

                        {/* Panel Toggle */}
                        <button
                            onClick={() => togglePanel('rightTop')}
                            className="absolute top-2 right-2 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-lg border border-white/20 backdrop-blur"
                            title={panels.rightTop ? "Hide Dashboard" : "Show Dashboard"}
                        >
                            {panels.rightTop ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>

                    {/* Right Bottom - Serial Monitor / Controls */}
                    <div
                        className="flex-1 relative overflow-hidden"
                        style={{
                            opacity: panels.rightBottom ? 1 : 0,
                            visibility: panels.rightBottom ? 'visible' : 'hidden',
                            transition: 'opacity 0.3s ease'
                        }}
                    >
                        {/* Always mounted */}
                        {rightBottomPanel}

                        {/* Panel Toggle */}
                        <button
                            onClick={() => togglePanel('rightBottom')}
                            className="absolute top-2 right-2 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-lg border border-white/20 backdrop-blur"
                            title={panels.rightBottom ? "Hide Monitor" : "Show Monitor"}
                        >
                            {panels.rightBottom ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Bottom Panel - Logs / Metrics */}
                <div
                    className="border-t border-white/10 relative overflow-hidden"
                    style={{
                        gridColumn: '2',
                        gridRow: '2',
                        opacity: panels.bottom ? 1 : 0,
                        visibility: panels.bottom ? 'visible' : 'hidden',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    {/* Always mounted */}
                    {bottomPanel}

                    {/* Panel Toggle */}
                    <button
                        onClick={() => togglePanel('bottom')}
                        className="absolute top-2 right-2 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-lg border border-white/20 backdrop-blur"
                        title={panels.bottom ? "Hide Logs" : "Show Logs"}
                    >
                        {panels.bottom ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            {/* View Toggles Bar (Optional - floating controls) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                <div className="flex gap-2 bg-black/80 backdrop-blur rounded-full px-4 py-2 border border-white/20 shadow-xl">
                    <button
                        onClick={() => togglePanel('leftPanel')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${panels.leftPanel
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <LayoutGrid size={14} className="inline mr-1" />
                        3D View
                    </button>
                    <button
                        onClick={() => togglePanel('rightTop')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${panels.rightTop
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <BarChart3 size={14} className="inline mr-1" />
                        Analytics
                    </button>
                    <button
                        onClick={() => togglePanel('rightBottom')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${panels.rightBottom
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <TerminalIcon size={14} className="inline mr-1" />
                        Monitor
                    </button>
                    <button
                        onClick={() => togglePanel('bottom')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${panels.bottom
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                    >
                        <TerminalIcon size={14} className="inline mr-1" />
                        Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimulationLayout;
