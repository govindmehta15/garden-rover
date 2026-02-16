import React, { useState, useEffect } from 'react';
import {
    Sprout, Mountain, Eraser, Navigation, Grid as GridIcon,
    Plus, Minus, Save, RotateCcw, Droplets, ThermometerSun,
    Target, MousePointer2, Trash2, Copy, Download, Upload
} from 'lucide-react';

const GardenEditor = ({
    gridData,
    setGridData,
    customPath,
    setCustomPath,
    gridSize,
    setGridSize,
    onSave
}) => {
    const [activeTool, setActiveTool] = useState('PLANT'); // PLANT | OBSTACLE | ERASE | WAYPOINT
    const [selectedCell, setSelectedCell] = useState(null);
    const [plantSettings, setPlantSettings] = useState({
        moisture: 50,
        temp: 24,
        plantType: 'generic'
    });

    const plantTypes = [
        'tomato', 'lettuce', 'pepper', 'cucumber', 'basil',
        'mint', 'strawberry', 'spinach', 'kale', 'parsley',
        'herbs', 'microgreens', 'experimental'
    ];

    // Ensure grid matches size
    useEffect(() => {
        const requiredCells = gridSize * gridSize;
        if (gridData.length !== requiredCells) {
            const newGrid = Array.from({ length: requiredCells }, (_, i) => {
                if (i < gridData.length) return gridData[i];
                return { id: i, type: 'empty', moisture: null, temp: null };
            });
            setGridData(newGrid);
        }
    }, [gridSize, gridData.length, setGridData]);

    const handleCellClick = (index) => {
        const newGrid = [...gridData];

        if (activeTool === 'PLANT') {
            newGrid[index] = {
                ...newGrid[index],
                type: 'plant',
                moisture: plantSettings.moisture,
                temp: plantSettings.temp,
                plantType: plantSettings.plantType
            };
        } else if (activeTool === 'OBSTACLE') {
            newGrid[index] = { ...newGrid[index], type: 'obstacle', moisture: null, temp: null };
        } else if (activeTool === 'ERASE') {
            newGrid[index] = { ...newGrid[index], type: 'empty', moisture: null, temp: null };
            setCustomPath(prev => prev.filter(wp => wp !== index));
        } else if (activeTool === 'WAYPOINT') {
            if (customPath.includes(index)) {
                setCustomPath(prev => prev.filter(wp => wp !== index));
            } else {
                setCustomPath(prev => [...prev, index]);
            }
            return; // Don't update grid
        }

        setGridData(newGrid);
        setSelectedCell(index);
    };

    const stats = {
        plants: gridData.filter(c => c.type === 'plant').length,
        obstacles: gridData.filter(c => c.type === 'obstacle').length,
        waypoints: customPath.length,
        empty: gridData.filter(c => c.type === 'empty').length
    };

    const clearAll = () => {
        if (window.confirm('Clear entire grid?')) {
            setGridData(Array.from({ length: gridSize * gridSize }, (_, i) => ({
                id: i, type: 'empty', moisture: null, temp: null
            })));
            setCustomPath([]);
        }
    };

    const exportConfig = () => {
        const config = {
            gridSize,
            gridData,
            customPath,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `garden_config_${Date.now()}.json`;
        a.click();
    };

    const importConfig = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    setGridSize(config.gridSize);
                    setGridData(config.gridData);
                    setCustomPath(config.customPath || []);
                } catch (err) {
                    alert('Invalid config file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <div className="h-full flex">
            {/* Left Toolbar */}
            <div className="w-64 bg-gray-900 border-r border-white/10 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Grid Size</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setGridSize(Math.max(5, gridSize - 1))}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded"
                        >
                            <Minus size={16} />
                        </button>
                        <div className="flex-1 text-center">
                            <div className="text-2xl font-bold">{gridSize}x{gridSize}</div>
                            <div className="text-xs text-gray-500">{gridSize * gridSize} cells</div>
                        </div>
                        <button
                            onClick={() => setGridSize(Math.min(25, gridSize + 1))}
                            disabled={gridSize >= 25}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-30"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Max: 25x25 (625 cells)
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setActiveTool('PLANT')}
                            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${activeTool === 'PLANT'
                                    ? 'bg-green-600 text-white ring-2 ring-green-400'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Sprout size={20} />
                            <span className="text-xs font-bold">PLANT</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('OBSTACLE')}
                            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${activeTool === 'OBSTACLE'
                                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Mountain size={20} />
                            <span className="text-xs font-bold">ROCK</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('WAYPOINT')}
                            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${activeTool === 'WAYPOINT'
                                    ? 'bg-pink-600 text-white ring-2 ring-pink-400'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Navigation size={20} />
                            <span className="text-xs font-bold">PATH</span>
                        </button>
                        <button
                            onClick={() => setActiveTool('ERASE')}
                            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${activeTool === 'ERASE'
                                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Eraser size={20} />
                            <span className="text-xs font-bold">ERASE</span>
                        </button>
                    </div>
                </div>

                {activeTool === 'PLANT' && (
                    <div className="border-t border-white/10 pt-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Plant Settings</h3>

                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Type</label>
                            <select
                                value={plantSettings.plantType}
                                onChange={(e) => setPlantSettings({ ...plantSettings, plantType: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                            >
                                {plantTypes.map(type => (
                                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                <Droplets size={12} /> Moisture: {plantSettings.moisture}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={plantSettings.moisture}
                                onChange={(e) => setPlantSettings({ ...plantSettings, moisture: parseInt(e.target.value) })}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                <ThermometerSun size={12} /> Temperature: {plantSettings.temp}°C
                            </label>
                            <input
                                type="range"
                                min="15"
                                max="35"
                                value={plantSettings.temp}
                                onChange={(e) => setPlantSettings({ ...plantSettings, temp: parseInt(e.target.value) })}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>
                )}

                <div className="border-t border-white/10 pt-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                            <div className="text-gray-400">Plants</div>
                            <div className="text-lg font-bold text-green-400">{stats.plants}</div>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-2">
                            <div className="text-gray-400">Obstacles</div>
                            <div className="text-lg font-bold text-orange-400">{stats.obstacles}</div>
                        </div>
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded p-2">
                            <div className="text-gray-400">Waypoints</div>
                            <div className="text-lg font-bold text-pink-400">{stats.waypoints}</div>
                        </div>
                        <div className="bg-gray-500/10 border border-gray-500/20 rounded p-2">
                            <div className="text-gray-400">Empty</div>
                            <div className="text-lg font-bold text-gray-400">{stats.empty}</div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                    <button
                        onClick={exportConfig}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Download size={14} /> Export Config
                    </button>
                    <button
                        onClick={importConfig}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Upload size={14} /> Import Config
                    </button>
                    <button
                        onClick={clearAll}
                        className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} /> Clear All
                    </button>
                </div>
            </div>

            {/* Grid Preview */}
            <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-950 to-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold">Grid Editor</h3>
                            <p className="text-xs text-gray-400">Click cells to apply active tool</p>
                        </div>
                        <div className="text-xs text-gray-500">
                            Selected: {selectedCell !== null ? `Cell ${selectedCell}` : 'None'}
                        </div>
                    </div>

                    <div
                        className="grid gap-1 bg-gray-800/30 p-4 rounded-xl border border-white/10"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            maxWidth: '700px'
                        }}
                    >
                        {gridData.map((cell, i) => {
                            const isWaypoint = customPath.includes(i);
                            const waypointNum = isWaypoint ? customPath.indexOf(i) + 1 : null;

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleCellClick(i)}
                                    className={`
                                        aspect-square rounded border-2 transition-all relative group
                                        ${cell.type === 'plant' ? 'bg-green-600 border-green-500' : ''}
                                        ${cell.type === 'obstacle' ? 'bg-orange-600 border-orange-500' : ''}
                                        ${cell.type === 'empty' ? 'bg-gray-700 border-gray-600 hover:border-gray-500' : ''}
                                        ${isWaypoint ? 'ring-2 ring-pink-400 ring-offset-1 ring-offset-gray-900' : ''}
                                        ${selectedCell === i ? 'ring-2 ring-blue-400' : ''}
                                    `}
                                >
                                    {cell.type === 'plant' && (
                                        <Sprout size={gridSize > 15 ? 12 : 16} className="absolute inset-0 m-auto" />
                                    )}
                                    {cell.type === 'obstacle' && (
                                        <Mountain size={gridSize > 15 ? 12 : 16} className="absolute inset-0 m-auto" />
                                    )}
                                    {isWaypoint && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                                            {waypointNum}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 text-xs text-gray-500 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <strong className="text-blue-400">Quick Tips:</strong>
                        <ul className="mt-2 space-y-1">
                            <li>• Use larger grids (up to 25x25) for complex scenarios</li>
                            <li>• Waypoints define robot navigation order</li>
                            <li>• Export/Import to save your configurations</li>
                            <li>• Plant settings apply to next placed plants</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GardenEditor;
