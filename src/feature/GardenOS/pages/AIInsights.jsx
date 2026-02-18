import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    ReferenceLine
} from 'recharts';
import {
    Brain,
    AlertTriangle,
    CloudRain,
    Sun,
    TrendingDown,
    TrendingUp,
    Droplets,
    Sprout,
    Thermometer,
    ShieldCheck,
    Zap,
    Leaf
} from 'lucide-react';

// --- Mock Data ---

const FORECAST_DATA = [
    { time: 'Now', moisture: 62, limit: 40 },
    { time: '+4h', moisture: 60, limit: 40 },
    { time: '+8h', moisture: 58, limit: 40 },
    { time: '+12h', moisture: 55, limit: 40 },
    { time: '+16h', moisture: 52, limit: 40 },
    { time: '+20h', moisture: 48, limit: 40 },
    { time: '+24h', moisture: 45, limit: 40 },
    { time: '+28h', moisture: 42, limit: 40 },
    { time: '+32h', moisture: 39, limit: 40 }, // Critical drop
    { time: '+36h', moisture: 36, limit: 40 },
    { time: '+40h', moisture: 34, limit: 40 },
    { time: '+44h', moisture: 32, limit: 40 },
    { time: '+48h', moisture: 30, limit: 40 },
];

const TANK_DEPLETION_DATA = [
    { day: 'Today', level: 70 },
    { day: '+1d', level: 65 },
    { day: '+2d', level: 58 },
    { day: '+3d', level: 50 },
    { day: '+4d', level: 42 },
    { day: '+5d', level: 35 },
    { day: '+6d', level: 25 },
];

const INSIGHTS = [
    {
        id: 1,
        type: 'warning',
        icon: AlertTriangle,
        title: 'Moisture Drop Alert',
        message: 'Zone 2 moisture dropping faster than expected due to high evaporation.',
        action: 'Check irrigation emitters.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
    },
    {
        id: 2,
        type: 'info',
        icon: Thermometer,
        title: 'Heat Wave Predicted',
        message: 'Temperatures reaching 35°C in 2 days. Reduce watering frequency to avoid evaporation loss.',
        action: 'Schedule evening watering.',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20'
    },
    {
        id: 3,
        type: 'danger',
        icon: Sprout,
        title: 'Fungal Risk Detected',
        message: 'High humidity (85%) + Warm nights increase fungal risk in Zone 4 (Spinach).',
        action: 'Apply organic fungicide.',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20'
    },
    {
        id: 4,
        type: 'success',
        icon: Leaf,
        title: 'Harvest Readiness',
        message: 'Zone 1 (Tomatoes) showing optimal color index. Estimated peak flavor in 8 days.',
        action: 'Prepare for harvest.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
    }
];

// --- Components ---

const RiskMeter = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${color.replace('text-', 'bg-').replace('500', '500/10')} ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <p className={`text-xl font-bold ${color}`}>{value}%</p>
            </div>
        </div>

        {/* Circular Progress (Mock using CSS conic-gradient) */}
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(${color.includes('red') ? '#ef4444' : color.includes('amber') ? '#f59e0b' : color.includes('blue') ? '#3b82f6' : '#10b981'} ${value}%, transparent 0)`
                }}
            />
            <div className="absolute inset-1 bg-white dark:bg-[#0a0a0a] rounded-full" />
        </div>
    </div>
);

const InsightCard = ({ data }) => (
    <div className={`p-5 rounded-2xl border ${data.bg} ${data.border} flex items-start gap-4 transition-all hover:scale-[1.01]`}>
        <div className={`mt-1 p-2 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm ${data.color}`}>
            <data.icon size={20} />
        </div>
        <div className="flex-1">
            <h3 className={`font-bold text-sm mb-1 ${data.color}`}>{data.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{data.message}</p>
            {data.action && (
                <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 rounded bg-white/50 dark:bg-black/20 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10">
                        Recommendation
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{data.action}</span>
                </div>
            )}
        </div>
    </div>
);

const WeatherEngine = ({ rainChance }) => (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Zap size={24} className="text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Weather Adaptive Engine</h3>
                    <p className="text-indigo-100 text-sm">Real-time irrigation optimization active</p>
                </div>
            </div>

            <div className="flex items-center gap-8 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-center">
                    <p className="text-xs text-indigo-200 mb-1">Rain Forecast</p>
                    <div className="flex items-center justify-center gap-1 font-bold">
                        <CloudRain size={16} /> {rainChance}%
                    </div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                    <p className="text-xs text-indigo-200 mb-1">Action Taken</p>
                    <p className="font-bold text-emerald-300">
                        {rainChance > 60 ? '- Irrigation Paused' : 'Standard Scale'}
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const AIInsights = () => {
    const rainForecast = 65; // Mock > 60%

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-8 h-8 text-purple-600" />
                        AI Intelligence
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Predictive analysis and automated decision making.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 animate-pulse">
                    • System Online
                </div>
            </div>

            {/* 1. Weather Engine Status */}
            <WeatherEngine rainChance={rainForecast} />

            {/* 2. Risk Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <RiskMeter title="Disease Risk" value="12" color="text-emerald-500" icon={ShieldCheck} />
                <RiskMeter title="Drought Risk" value="45" color="text-amber-500" icon={Sun} />
                <RiskMeter title="Overwatering" value="8" color="text-blue-500" icon={Droplets} />
                <RiskMeter title="Nutrient Loss" value="28" color="text-red-500" icon={TrendingDown} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3. Prediction Graphs */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Soil Moisture Forecast */}
                    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Soil Moisture Forecast (48h)</h3>
                            <span className="text-xs text-gray-500 border border-gray-200 dark:border-white/10 px-2 py-1 rounded">
                                Confidence: 94%
                            </span>
                        </div>

                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FORECAST_DATA}>
                                    <defs>
                                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#8b5cf6" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} minTickGap={30} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[20, 80]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                                    />
                                    <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Critical Limit', fill: '#ef4444', fontSize: 10 }} />
                                    <Area type="monotone" dataKey="moisture" stroke="#8b5cf6" strokeWidth={3} fillUrl="url(#forecastGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tank Depletion & Growth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Water Tank Depletion</h3>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={TANK_DEPLETION_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none' }} />
                                        <Line type="monotone" dataKey="level" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Crop Growth Stage</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Tomatoes', progress: 85, color: 'bg-red-500' },
                                    { name: 'Spinach', progress: 40, color: 'bg-green-500' },
                                    { name: 'Wheat', progress: 65, color: 'bg-yellow-400' }
                                ].map(crop => (
                                    <div key={crop.name}>
                                        <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-300">
                                            <span>{crop.name}</span>
                                            <span>{crop.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${crop.color}`}
                                                style={{ width: `${crop.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* 4. Insight Cards Feed */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Insights</h3>
                    {INSIGHTS.map(insight => (
                        <InsightCard key={insight.id} data={insight} />
                    ))}
                    <button className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        View Past Insights
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AIInsights;
