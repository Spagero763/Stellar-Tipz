import { useState, useEffect } from 'react';

export interface Settings {
    tipNotifications: boolean;
    leaderboardNotifications: boolean;
    systemNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'es' | 'fr';
    currency: 'USD' | 'EUR' | 'XLM';
    publicProfile: boolean;
    showOnLeaderboard: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    tipNotifications: true,
    leaderboardNotifications: true,
    systemNotifications: true,
    theme: 'auto',
    language: 'en',
    currency: 'USD',
    publicProfile: true,
    showOnLeaderboard: true,
};

const STORAGE_KEY = 'tipz_settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateSettings = (updates: Partial<Settings>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to reset settings:', error);
        }
    };

    return {
        settings,
        updateSettings,
        resetSettings,
        isLoading,
    };
};

export default useSettings;
