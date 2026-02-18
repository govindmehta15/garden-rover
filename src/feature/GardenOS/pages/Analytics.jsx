import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    ComposedChart,
    Line,
    Legend
} from 'recharts';
import {
    Droplets,
    Thermometer,
    Wind,
    Activity,
    ArrowUp,
    ArrowDown,
    Zap,
    Leaf
} from 'lucide-react';

// --- Mock Data Generators ---

const generateTrendData = () => [
    { day: 'Mon', moisture: 62, temp: 22, growth: 1.2 },
    { day: 'Tue', moisture: 58, temp: 24, growth: 1.4 },
    { day: 'Wed', moisture: 65, temp: 21, growth: 1.3 },
    { day: 'Thu', moisture: 55, temp: 26, growth: 1.6 },
    { day: 'Fri', moisture: 52, temp: 28, growth: 1.8 },
    { day: 'Sat', moisture: 70, temp: 23, growth: 1.5 },
    { day: 'Sun', moisture: 68, temp: 25, growth: 1.7 },
];

const generateWaterUsageData = () => [
    { day: 'Mon', usage: 120, target: 100 },
    { day: 'Tue', usage: 95, target: 100 },
    { day: 'Wed', usage: 110, target: 100 },
    { day: 'Thu', usage: 130, target: 120 },
    { day: 'Fri', usage: 85, target: 90 },
    { day: 'Sat', usage: 90, target: 90 },
    { day: 'Sun', usage: 100, target: 100 },
];

const generateHeatmapData = () => {
    return Array(36).fill(0).map(() => Math.floor(Math.random() * (90 - 30) + 30));
};

// --- Components ---

const MetricCard = ({ title, value, unit, trend, trendValue, icon: Icon, color, subtext }) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {trend === 'up' ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                    {trendValue}
                </span>
            )}
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline mt-1 flex-wrap">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
);

const HeatmapGrid = ({ data }) => (
    <div className="grid grid-cols-6 gap-1 p-2 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 max-w-fit">
        {data.map((val, i) => {
            // Color scale based on moisture value (30-90)
            let bgClass = 'bg-red-200 dark:bg-red-900/50';
            if (val > 40) bgClass = 'bg-orange-200 dark:bg-orange-900/50';
            if (val > 55) bgClass = 'bg-emerald-200 dark:bg-emerald-900/50';
            if (val > 75) bgClass = 'bg-blue-300 dark:bg-blue-800/50';

            return (
                <div
                    key={i}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded text-[10px] flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 ${bgClass}`}
                    title={`Zone ${i + 1}: ${val}% Moisture`}
                >
                    {val}
                </div>
            );
        })}
    </div>
);

const Analytics = () => {
    const trendData = useMemo(() => generateTrendData(), []);
    const waterUsageData = useMemo(() => generateWaterUsageData(), []);
    const heatmapData = useMemo(() => generateHeatmapData(), []);

    // Smart Calculations (Mock Logic)
    const calcDailyWaterReq = () => {
        // Logic: Base (50) + Temp Factor + Growth Factor
        const temp = 31;
        const growthStage = 1.6; // mid-vegetative
        return Math.round(50 + (temp * 1.5) + (growthStage * 20));
    };

    const calcEvaporation = () => {
        // Logic: Temp * 0.2
        return (31 * 0.2).toFixed(1);
    };

    const calcStressIndex = () => {
        // Mock: 2.4 / 10
        return 2.4;
    };

    const predictDryness = () => {
        return "18 hours";
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Deep insights into garden performance and plant health.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Season</option>
                    </select>
                </div>
            </div>

            {/* 1. Real-time Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Avg Moisture" value="62" unit="%" pixel
                    trend="up" trendValue="5%" icon={Droplets} color="bg-blue-500"
                />
                <MetricCard
                    title="Temperature" value="31" unit="°C"
                    trend="up" trendValue="1.2°" icon={Thermometer} color="bg-orange-500"
                />
                <MetricCard
                    title="Humidity" value="60" unit="%"
                    trend="down" trendValue="2%" icon={Wind} color="bg-indigo-500"
                />
                <MetricCard
                    title="Water Usage" value="120" unit="L"
                    trend="up" trendValue="12L" icon={Activity} color="bg-cyan-500"
                    subtext="Total today"
                />
                <MetricCard
                    title="Efficiency" value="94" unit="%"
                    trend="up" trendValue="2%" icon={Zap} color="bg-emerald-500"
                    subtext="Irrigation score"
                />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Moisture Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">7-Day Soil Moisture Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Smart Calculations Card */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-2xl border border-emerald-800 text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                            <BrainIcon className="w-5 h-5 text-emerald-400" />
                            AI Predictions
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm text-emerald-200 mb-1">
                                    <span>Daily Water Req.</span>
                                    <span className="font-bold text-white">{calcDailyWaterReq()}L</span>
                                </div>
                                <div className="w-full bg-emerald-900/50 rounded-full h-2">
                                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm text-emerald-200 mb-1">
                                    <span>Evaporation Rate</span>
                                    <span className="font-bold text-white">{calcEvaporation()} mm/h</span>
                                </div>
                                <div className="w-full bg-emerald-900/50 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-sm text-emerald-200">Plant Stress Index</span>
                                <span className="text-xl font-bold text-yellow-400">{calcStressIndex()}<span className="text-xs text-gray-400">/10</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold mb-2">Insight</p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Soil will reach critical dryness in <span className="text-white font-bold">{predictDryness()}</span>. Recommendation: Schedule irrigation for 05:00 AM.
                        </p>
                    </div>
                </div>
            </div>

            {/* Row 2: Water Usage & Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Weekly Water Usage */}
                <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Water Consumption</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={waterUsageData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="usage" name="Actual Usage" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="target" name="Target Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Temp vs Growth & Heatmap */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Temp vs Growth Rate</h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis yAxisId="left" hide />
                                    <YAxis yAxisId="right" orientation="right" hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="growth" fill="#facc15" stroke="#facc15" fillOpacity={0.2} />
                                    <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Moisture Heatmap</h3>
                        <HeatmapGrid data={heatmapData} />
                        <div className="mt-4 flex gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-200 rounded-full"></div>Dry</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-200 rounded-full"></div>Good</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded-full"></div>Wet</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper Icon
const BrainIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16a4 4 0 0 0 0-8v8Z"></path>
        <path d="M16 12v-2a4 4 0 0 0-8 0v2"></path>
        <path d="M12 3v2"></path>
        <path d="M12 22a2 2 0 0 0 0-4H7.5a2.5 2.5 0 0 1 0-5H20"></path>
        <path d="M12 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export default Analytics;
