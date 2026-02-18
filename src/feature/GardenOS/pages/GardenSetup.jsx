import React, { useState } from 'react';
import {
    Save,
    Map as MapIcon,
    Sprout,
    Wifi,
    WifiOff,
    RefreshCw,
    Check,
    Thermometer,
    Droplets,
    Calendar,
    Grid
} from 'lucide-react';

// --- Mock Data Constants ---

const SOIL_TYPES = [
    'Loamy',
    'Clay',
    'Sandy',
    'Silt',
    'Peat',
    'Chalky'
];

const IRRIGATION_TYPES = [
    'Drip Irrigation',
    'Sprinkler System',
    'Manual Hose',
    'Smart Mist',
    'Flood (Channel)'
];

const CROP_DATABASE = [
    { id: 'tomato', name: 'Tomato', color: 'bg-red-500', moisture: '60-80%', temp: '20-30°C', days: 90 },
    { id: 'spinach', name: 'Spinach', color: 'bg-green-500', moisture: '50-70%', temp: '15-25°C', days: 45 },
    { id: 'wheat', name: 'Wheat', color: 'bg-yellow-400', moisture: '40-60%', temp: '20-25°C', days: 120 },
    { id: 'rice', name: 'Rice', color: 'bg-amber-100', moisture: '80-100%', temp: '25-35°C', days: 150 },
    { id: 'mustard', name: 'Mustard', color: 'bg-yellow-600', moisture: '45-65%', temp: '10-20°C', days: 95 },
];

const INITIAL_DEVICES = [
    { id: 1, name: 'Main Controller (ESP32)', type: 'controller', status: 'online', battery: '100%' },
    { id: 2, name: 'Soil Sensor Node 1', type: 'sensor', status: 'online', battery: '85%' },
    { id: 3, name: 'DHT22 Air Sensor', type: 'sensor', status: 'offline', battery: '0%' },
    { id: 4, name: 'Water Pump Unit', type: 'actuator', status: 'online', battery: 'AC' },
    { id: 5, name: 'Garden Rover Alpha', type: 'rover', status: 'charging', battery: '45%' },
];

// --- Components ---

const GardenProfileForm = ({ data, onChange }) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-500" />
            Garden Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Garden Name</label>
                <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                    type="text"
                    name="location"
                    value={data.location}
                    onChange={onChange}
                    placeholder="e.g. Backyard, Rooftop"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area Size (sq ft)</label>
                <input
                    type="number"
                    name="size"
                    value={data.size}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soil Type</label>
                <select
                    name="soilType"
                    value={data.soilType}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                    {SOIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Irrigation System</label>
                <select
                    name="irrigationType"
                    value={data.irrigationType}
                    onChange={onChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                    {IRRIGATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>
    </div>
);

const ZoneMapper = ({ zones, onZoneCreate, selectedZoneId, onZoneSelect, grid, onCellClick }) => {
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [newZoneName, setNewZoneName] = useState('');
    const [newZoneCrop, setNewZoneCrop] = useState(CROP_DATABASE[0].id);

    const handleAddZone = () => {
        if (!newZoneName) return;
        const crop = CROP_DATABASE.find(c => c.id === newZoneCrop);
        onZoneCreate({ name: newZoneName, crop });
        setNewZoneName('');
        setIsAddingZone(false);
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col lg:flex-row gap-6">

            {/* Zone List & Controls */}
            <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Grid className="w-5 h-5 text-emerald-500" />
                    Zone Mapping
                </h3>

                <div className="space-y-2">
                    {zones.map(zone => (
                        <div
                            key={zone.id}
                            onClick={() => onZoneSelect(zone.id)}
                            className={`
                p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all
                ${selectedZoneId === zone.id
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                                    : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-300 dark:hover:border-white/20'}
              `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${zone.crop.color}`} />
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{zone.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{zone.crop.name}</p>
                                </div>
                            </div>
                            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                <p>{zone.crop.moisture}</p>
                                <p>{zone.crop.days} days</p>
                            </div>
                        </div>
                    ))}
                </div>

                {isAddingZone ? (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                        <input
                            type="text"
                            placeholder="Zone Name (e.g. North Bed)"
                            value={newZoneName}
                            onChange={(e) => setNewZoneName(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-black text-sm"
                        />
                        <select
                            value={newZoneCrop}
                            onChange={(e) => setNewZoneCrop(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-black text-sm"
                        >
                            {CROP_DATABASE.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddZone}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-md text-sm font-medium"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setIsAddingZone(false)}
                                className="flex-1 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 py-1.5 rounded-md text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingZone(true)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                        + Add New Zone
                    </button>
                )}
            </div>

            {/* Grid Canvas */}
            <div className="flex-1 flex flex-col items-center">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 max-w-[280px] text-center">
                    Select a zone from the list, then click cells to assign them.
                </label>
                <div
                    className="grid grid-cols-6 gap-1 p-2 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                    style={{ width: 'fit-content' }}
                >
                    {grid.map((cellZoneId, index) => {
                        const zone = zones.find(z => z.id === cellZoneId);
                        return (
                            <div
                                key={index}
                                onClick={() => onCellClick(index)}
                                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center text-[10px] text-black/50 font-bold
                  ${zone ? zone.crop.color : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'}
                  ${selectedZoneId && 'hover:scale-105 hover:ring-2 ring-emerald-400'}
                `}
                            >
                                {zone ? zone.name.substring(0, 2).toUpperCase() : ''}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DeviceList = ({ devices, onToggle }) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-500" />
                Connected Devices
            </h3>
            <button
                onClick={onToggle}
                className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-medium"
            >
                <RefreshCw size={12} /> Scan for New
            </button>
        </div>

        <div className="space-y-3">
            {devices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${device.status === 'online' || device.status === 'charging' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                            {device.status === 'online' || device.status === 'charging' ? <Wifi size={16} /> : <WifiOff size={16} />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{device.type} • {device.status}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-white/10 px-2 py-1 rounded">
                            {device.battery}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <SettingsIcon size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Helper Icon for Settings within DeviceList
const SettingsIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);


// --- Main Page Component ---

const GardenSetup = () => {
    // State
    const [profile, setProfile] = useState({
        name: 'My Smart Garden',
        location: '',
        size: '500',
        soilType: 'Loamy',
        irrigationType: 'Drip Irrigation'
    });

    const [zones, setZones] = useState([
        { id: 1, name: 'Zone A', crop: CROP_DATABASE[0] } // Initial Zone
    ]);

    const [selectedZoneId, setSelectedZoneId] = useState(1);
    const [gridMapping, setGridMapping] = useState(Array(36).fill(null).map((_, i) => i < 12 ? 1 : null)); // Pre-fill first two rows with Zone 1
    const [devices, setDevices] = useState(INITIAL_DEVICES);

    // Handlers
    const handleProfileChange = (e) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateZone = (zoneData) => {
        const newZone = {
            id: Date.now(),
            ...zoneData
        };
        setZones(prev => [...prev, newZone]);
        setSelectedZoneId(newZone.id);
    };

    const handleCellClick = (index) => {
        if (!selectedZoneId) return;
        const newGrid = [...gridMapping];
        // Toggle: if already assigned to this zone, clear it. Else assign.
        newGrid[index] = newGrid[index] === selectedZoneId ? null : selectedZoneId;
        setGridMapping(newGrid);
    };

    const handleScanDevices = () => {
        // Mock Scan
        const newDevice = {
            id: Date.now(),
            name: `New Sensor ${Math.floor(Math.random() * 100)}`,
            type: 'sensor',
            status: 'online',
            battery: '100%'
        };
        setDevices(prev => [...prev, newDevice]);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Garden Configuration</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Setup your garden profile, zones, and IoT devices.</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all">
                    <Save size={18} /> Save Configuration
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GardenProfileForm data={profile} onChange={handleProfileChange} />
                <DeviceList devices={devices} onToggle={handleScanDevices} />
            </div>

            <ZoneMapper
                zones={zones}
                onZoneCreate={handleCreateZone}
                selectedZoneId={selectedZoneId}
                onZoneSelect={setSelectedZoneId}
                grid={gridMapping}
                onCellClick={handleCellClick}
            />
        </div>
    );
};

export default GardenSetup;
