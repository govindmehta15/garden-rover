import React, { useState } from 'react';
import { Grid, CheckCircle2, ChevronRight, Star, Clock, BarChart3 } from 'lucide-react';
import { getAllTemplates } from '../data/gardenTemplates';

const GardenLibrary = ({ onSelectGarden, currentGardenId }) => {
    const templates = getAllTemplates();
    const [hoveredId, setHoveredId] = useState(null);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'Advanced': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'Expert': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Garden Scenario Library</h2>
                <p className="text-sm text-gray-400">Select a pre-configured garden template to begin your simulation</p>
            </div>

            <div className="grid gap-4">
                {templates.map((template) => {
                    const isSelected = template.id === currentGardenId;
                    const isHovered = template.id === hoveredId;
                    const plantCount = template.cells.filter(c => c.type === 'plant').length;
                    const obstacleCount = template.cells.filter(c => c.type === 'obstacle').length;

                    return (
                        <div
                            key={template.id}
                            onClick={() => onSelectGarden(template)}
                            onMouseEnter={() => setHoveredId(template.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                ${isSelected
                                    ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                                }
              `}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                                    <CheckCircle2 size={18} className="text-white" />
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`
                  w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0 transition-transform
                  ${isHovered ? 'scale-110' : 'scale-100'}
                  ${isSelected ? 'bg-blue-500/20' : 'bg-gray-700/50'}
                `}>
                                    {template.thumbnail}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                                            <p className="text-sm text-gray-400">{template.description}</p>
                                        </div>
                                        <ChevronRight
                                            size={20}
                                            className={`text-gray-500 transition-transform ${isHovered ? 'translate-x-1' : ''}`}
                                        />
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getDifficultyColor(template.difficulty)}`}>
                                            <Star size={10} className="inline mr-1" />
                                            {template.difficulty}
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Grid size={12} />
                                            <span>{template.gridSize}x{template.gridSize}</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span>{plantCount} Plants</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-orange-400">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            <span>{obstacleCount} Obstacles</span>
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-purple-400">
                                            <Clock size={12} />
                                            <span>~{template.defaultPath.length * 2}s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div className={`absolute inset-0 rounded-xl border-2 border-blue-400/0 transition-all pointer-events-none ${isHovered && !isSelected ? 'border-blue-400/30' : ''}`}></div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-start gap-3">
                    <BarChart3 size={20} className="text-blue-400 mt-1 shrink-0" />
                    <div className="text-sm text-gray-400">
                        <p className="font-semibold text-white mb-1">Pro Tip</p>
                        <p>Each garden template comes with a pre-optimized navigation path. You can customize plants, obstacles, and waypoints after selection.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GardenLibrary;
