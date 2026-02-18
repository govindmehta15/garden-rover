import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Thermometer, Wind, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, unit, trend, trendValue, icon: Icon, color }) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
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
        <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
    </div>
);

const data = [
    { name: 'Mon', moisture: 40, temp: 24 },
    { name: 'Tue', moisture: 30, temp: 13 },
    { name: 'Wed', moisture: 20, temp: 28 },
    { name: 'Thu', moisture: 27, temp: 29 },
    { name: 'Fri', moisture: 18, temp: 28 },
    { name: 'Sat', moisture: 23, temp: 20 },
    { name: 'Sun', moisture: 34, temp: 23 },
];

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Garden Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time monitoring and insights for your smart garden.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
                        Run Diagnostics
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Soil Moisture"
                    value="45"
                    unit="%"
                    trend="down"
                    trendValue="2.5%"
                    icon={Droplets}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Temperature"
                    value="31"
                    unit="°C"
                    trend="up"
                    trendValue="1.2°C"
                    icon={Thermometer}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Humidity"
                    value="60"
                    unit="%"
                    trend="up"
                    trendValue="0.8%"
                    icon={Wind}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Water Tank"
                    value="70"
                    unit="%"
                    trend="down"
                    trendValue="5.0%"
                    icon={Activity}
                    color="bg-cyan-500"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Environmental Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)" />
                                <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Map Preview (Placeholder) */}
                <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garden Map</h3>
                    <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558905540-212901a9f93d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-50 transition-opacity group-hover:opacity-70"></div>
                        <div className="relative z-10 text-center">
                            <p className="text-gray-500 dark:text-white font-medium mb-2">Live View</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                Active Overlay
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
