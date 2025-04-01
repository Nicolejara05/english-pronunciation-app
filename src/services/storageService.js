const STORAGE_KEYS = {
    USER_PROGRESS: 'user_progress',
    THEME_PREFERENCE: 'theme_preference',
    ACHIEVEMENTS: 'achievements',
    STATISTICS: 'statistics'
};

export const storageService = {
    saveProgress: (progress) => {
        localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
    },

    getProgress: () => {
        const progress = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
        return progress ? JSON.parse(progress) : null;
    },

    saveThemePreference: (isDarkMode) => {
        localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, JSON.stringify(isDarkMode));
    },

    getThemePreference: () => {
        const preference = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        return preference ? JSON.parse(preference) : false;
    },

    saveAchievements: (achievements) => {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    },

    getAchievements: () => {
        const achievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        return achievements ? JSON.parse(achievements) : [];
    },

    saveStatistics: (statistics) => {
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(statistics));
    },

    getStatistics: () => {
        const statistics = localStorage.getItem(STORAGE_KEYS.STATISTICS);
        return statistics ? JSON.parse(statistics) : {
            totalPracticeTime: 0,
            wordsPracticed: 0,
            correctPronunciations: 0,
            incorrectPronunciations: 0,
            dailyStreaks: 0,
            lastPracticeDate: null
        };
    }
}; 