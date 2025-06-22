// Settings Manager for Zoho Timer
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            workHours: 8,
            timeFormat: '12',
            refreshInterval: 30000
        };
        
        this.CONFIG = {
            WORK_HOURS: 8,
            POLL_INTERVAL: 1000,
            MAX_RETRIES: 60,
            TIME_FORMAT: '12',
            REFRESH_INTERVAL: 30000
        };
    }

    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['zoho-timer-settings'], (result) => {
                if (chrome.runtime.lastError) {
                    console.warn('Failed to load settings, using defaults:', chrome.runtime.lastError);
                    resolve(this.CONFIG);
                } else {
                    const userSettings = result['zoho-timer-settings'];
                    if (userSettings) {
                        // Update CONFIG with user settings
                        this.CONFIG.WORK_HOURS = userSettings.workHours || this.CONFIG.WORK_HOURS;
                        this.CONFIG.TIME_FORMAT = userSettings.timeFormat || this.CONFIG.TIME_FORMAT;
                        this.CONFIG.REFRESH_INTERVAL = userSettings.refreshInterval || this.CONFIG.REFRESH_INTERVAL;
                        console.log('Loaded user settings:', this.CONFIG);
                    } else {
                        console.log('No saved settings found, using defaults:', this.CONFIG);
                    }
                    resolve(this.CONFIG);
                }
            });
        });
    }

    updateSettings(newSettings) {
        // Update CONFIG with new settings
        this.CONFIG.WORK_HOURS = newSettings.workHours || this.CONFIG.WORK_HOURS;
        this.CONFIG.TIME_FORMAT = newSettings.timeFormat || this.CONFIG.TIME_FORMAT;
        this.CONFIG.REFRESH_INTERVAL = newSettings.refreshInterval || this.CONFIG.REFRESH_INTERVAL;
        
        console.log('Settings updated:', this.CONFIG);
        return this.CONFIG;
    }

    getConfig() {
        return this.CONFIG;
    }

    getWorkHours() {
        return this.CONFIG.WORK_HOURS;
    }

    getTimeFormat() {
        return this.CONFIG.TIME_FORMAT;
    }

    getRefreshInterval() {
        return this.CONFIG.REFRESH_INTERVAL;
    }

    getPollInterval() {
        return this.CONFIG.POLL_INTERVAL;
    }

    getMaxRetries() {
        return this.CONFIG.MAX_RETRIES;
    }
}

// Export for use in other files
window.SettingsManager = SettingsManager; 