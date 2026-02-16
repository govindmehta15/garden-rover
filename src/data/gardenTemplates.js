// Garden Templates Library
// Each template represents a realistic garden scenario

export const GARDEN_TEMPLATES = {
    SMALL_HOME_GARDEN: {
        id: 'small_home',
        name: 'Small Home Garden',
        description: 'Perfect for residential automation testing',
        gridSize: 5,
        thumbnail: '🏡',
        difficulty: 'Beginner',
        cells: [
            { id: 0, type: 'empty' },
            { id: 1, type: 'plant', moisture: 45, plantType: 'tomato', temp: 24 },
            { id: 2, type: 'empty' },
            { id: 3, type: 'plant', moisture: 65, plantType: 'lettuce', temp: 22 },
            { id: 4, type: 'empty' },

            { id: 5, type: 'plant', moisture: 35, plantType: 'pepper', temp: 26 },
            { id: 6, type: 'empty' },
            { id: 7, type: 'obstacle' },
            { id: 8, type: 'empty' },
            { id: 9, type: 'plant', moisture: 55, plantType: 'basil', temp: 25 },

            { id: 10, type: 'empty' },
            { id: 11, type: 'plant', moisture: 25, plantType: 'tomato', temp: 27 },
            { id: 12, type: 'empty' },
            { id: 13, type: 'plant', moisture: 70, plantType: 'cucumber', temp: 23 },
            { id: 14, type: 'empty' },

            { id: 15, type: 'plant', moisture: 40, plantType: 'spinach', temp: 21 },
            { id: 16, type: 'empty' },
            { id: 17, type: 'empty' },
            { id: 18, type: 'obstacle' },
            { id: 19, type: 'plant', moisture: 50, plantType: 'mint', temp: 24 },

            { id: 20, type: 'empty' },
            { id: 21, type: 'plant', moisture: 30, plantType: 'parsley', temp: 22 },
            { id: 22, type: 'empty' },
            { id: 23, type: 'plant', moisture: 60, plantType: 'kale', temp: 23 },
            { id: 24, type: 'empty' }
        ],
        defaultPath: [0, 1, 6, 11, 16, 21, 22, 23]
    },

    COMMERCIAL_GREENHOUSE: {
        id: 'commercial',
        name: 'Commercial Greenhouse',
        description: 'High-density commercial operation',
        gridSize: 5,
        thumbnail: '🏭',
        difficulty: 'Advanced',
        cells: [
            { id: 0, type: 'empty' },
            { id: 1, type: 'plant', moisture: 55, plantType: 'strawberry', temp: 23 },
            { id: 2, type: 'plant', moisture: 48, plantType: 'strawberry', temp: 24 },
            { id: 3, type: 'plant', moisture: 62, plantType: 'strawberry', temp: 22 },
            { id: 4, type: 'empty' },

            { id: 5, type: 'empty' },
            { id: 6, type: 'obstacle' },
            { id: 7, type: 'empty' },
            { id: 8, type: 'obstacle' },
            { id: 9, type: 'empty' },

            { id: 10, type: 'plant', moisture: 28, plantType: 'tomato', temp: 28 },
            { id: 11, type: 'plant', moisture: 35, plantType: 'tomato', temp: 27 },
            { id: 12, type: 'empty' },
            { id: 13, type: 'plant', moisture: 45, plantType: 'tomato', temp: 26 },
            { id: 14, type: 'plant', moisture: 52, plantType: 'tomato', temp: 25 },

            { id: 15, type: 'empty' },
            { id: 16, type: 'obstacle' },
            { id: 17, type: 'empty' },
            { id: 18, type: 'obstacle' },
            { id: 19, type: 'empty' },

            { id: 20, type: 'plant', moisture: 41, plantType: 'pepper', temp: 25 },
            { id: 21, type: 'plant', moisture: 38, plantType: 'pepper', temp: 26 },
            { id: 22, type: 'plant', moisture: 55, plantType: 'pepper', temp: 24 },
            { id: 23, type: 'plant', moisture: 60, plantType: 'pepper', temp: 23 },
            { id: 24, type: 'empty' }
        ],
        defaultPath: [0, 5, 10, 15, 20, 21, 22, 23, 24, 19, 14, 9, 4, 3, 2, 1]
    },

    RESEARCH_LAB: {
        id: 'research',
        name: 'Research Laboratory',
        description: 'Precision agriculture research setup',
        gridSize: 5,
        thumbnail: '🔬',
        difficulty: 'Expert',
        cells: [
            { id: 0, type: 'empty' },
            { id: 1, type: 'empty' },
            { id: 2, type: 'plant', moisture: 75, plantType: 'experimental_A', temp: 20 },
            { id: 3, type: 'empty' },
            { id: 4, type: 'empty' },

            { id: 5, type: 'empty' },
            { id: 6, type: 'plant', moisture: 22, plantType: 'experimental_B', temp: 30 },
            { id: 7, type: 'obstacle' },
            { id: 8, type: 'plant', moisture: 80, plantType: 'experimental_C', temp: 18 },
            { id: 9, type: 'empty' },

            { id: 10, type: 'plant', moisture: 15, plantType: 'drought_test', temp: 32 },
            { id: 11, type: 'empty' },
            { id: 12, type: 'obstacle' },
            { id: 13, type: 'empty' },
            { id: 14, type: 'plant', moisture: 95, plantType: 'hydro_test', temp: 21 },

            { id: 15, type: 'empty' },
            { id: 16, type: 'plant', moisture: 50, plantType: 'control_A', temp: 24 },
            { id: 17, type: 'obstacle' },
            { id: 18, type: 'plant', moisture: 50, plantType: 'control_B', temp: 24 },
            { id: 19, type: 'empty' },

            { id: 20, type: 'empty' },
            { id: 21, type: 'empty' },
            { id: 22, type: 'plant', moisture: 42, plantType: 'experimental_D', temp: 26 },
            { id: 23, type: 'empty' },
            { id: 24, type: 'empty' }
        ],
        defaultPath: [0, 1, 2, 7, 12, 17, 22, 23, 24, 19, 14, 9, 4]
    },

    OBSTACLE_COURSE: {
        id: 'obstacle_course',
        name: 'Navigation Challenge',
        description: 'Test pathfinding algorithms',
        gridSize: 5,
        thumbnail: '🚧',
        difficulty: 'Intermediate',
        cells: [
            { id: 0, type: 'empty' },
            { id: 1, type: 'obstacle' },
            { id: 2, type: 'plant', moisture: 33, plantType: 'test_plant', temp: 24 },
            { id: 3, type: 'obstacle' },
            { id: 4, type: 'empty' },

            { id: 5, type: 'empty' },
            { id: 6, type: 'empty' },
            { id: 7, type: 'obstacle' },
            { id: 8, type: 'empty' },
            { id: 9, type: 'plant', moisture: 58, plantType: 'test_plant', temp: 23 },

            { id: 10, type: 'obstacle' },
            { id: 11, type: 'plant', moisture: 41, plantType: 'test_plant', temp: 25 },
            { id: 12, type: 'empty' },
            { id: 13, type: 'obstacle' },
            { id: 14, type: 'empty' },

            { id: 15, type: 'plant', moisture: 27, plantType: 'test_plant', temp: 26 },
            { id: 16, type: 'empty' },
            { id: 17, type: 'obstacle' },
            { id: 18, type: 'empty' },
            { id: 19, type: 'empty' },

            { id: 20, type: 'empty' },
            { id: 21, type: 'obstacle' },
            { id: 22, type: 'plant', moisture: 65, plantType: 'test_plant', temp: 22 },
            { id: 23, type: 'obstacle' },
            { id: 24, type: 'empty' }
        ],
        defaultPath: [0, 5, 6, 11, 16, 15, 20, 19, 14, 9, 4]
    },

    VERTICAL_FARM: {
        id: 'vertical',
        name: 'Vertical Farm Layout',
        description: 'High-efficiency vertical farming',
        gridSize: 5,
        thumbnail: '🌆',
        difficulty: 'Intermediate',
        cells: [
            { id: 0, type: 'plant', moisture: 68, plantType: 'lettuce_tier1', temp: 21 },
            { id: 1, type: 'plant', moisture: 72, plantType: 'lettuce_tier1', temp: 21 },
            { id: 2, type: 'empty' },
            { id: 3, type: 'plant', moisture: 65, plantType: 'lettuce_tier1', temp: 22 },
            { id: 4, type: 'plant', moisture: 70, plantType: 'lettuce_tier1', temp: 21 },

            { id: 5, type: 'empty' },
            { id: 6, type: 'empty' },
            { id: 7, type: 'obstacle' },
            { id: 8, type: 'empty' },
            { id: 9, type: 'empty' },

            { id: 10, type: 'plant', moisture: 44, plantType: 'herbs_tier2', temp: 23 },
            { id: 11, type: 'plant', moisture: 48, plantType: 'herbs_tier2', temp: 23 },
            { id: 12, type: 'empty' },
            { id: 13, type: 'plant', moisture: 52, plantType: 'herbs_tier2', temp: 22 },
            { id: 14, type: 'plant', moisture: 46, plantType: 'herbs_tier2', temp: 23 },

            { id: 15, type: 'empty' },
            { id: 16, type: 'empty' },
            { id: 17, type: 'obstacle' },
            { id: 18, type: 'empty' },
            { id: 19, type: 'empty' },

            { id: 20, type: 'plant', moisture: 38, plantType: 'microgreens', temp: 20 },
            { id: 21, type: 'plant', moisture: 42, plantType: 'microgreens', temp: 20 },
            { id: 22, type: 'empty' },
            { id: 23, type: 'plant', moisture: 40, plantType: 'microgreens', temp: 21 },
            { id: 24, type: 'plant', moisture: 36, plantType: 'microgreens', temp: 20 }
        ],
        defaultPath: [2, 1, 0, 5, 10, 15, 20, 21, 22, 23, 24, 19, 14, 9, 4, 3]
    }
};

export const getTemplateById = (id) => {
    return Object.values(GARDEN_TEMPLATES).find(t => t.id === id);
};

export const getAllTemplates = () => {
    return Object.values(GARDEN_TEMPLATES);
};
