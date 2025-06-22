// Zoho Timer Settings Management
class SettingsManager {
    constructor() {
        this.form = document.getElementById('settingsForm');
        this.statusDiv = document.getElementById('status');
        this.statusText = document.getElementById('statusText');
        
        this.defaultSettings = {
            workHours: 8,
            timeFormat: '12',
            refreshInterval: 30000
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        document.getElementById('workHours').addEventListener('input', (e) => {
            this.validateWorkHours(e.target.value);
        });
    }
    
    validateWorkHours(value) {
        const input = document.getElementById('workHours');
        const numValue = parseFloat(value);
        
        if (numValue < 1 || numValue > 24) {
            input.setCustomValidity('Work hours must be between 1 and 24');
            input.style.borderColor = '#f44336';
        } else {
            input.setCustomValidity('');
            input.style.borderColor = '';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const settings = {
            workHours: parseFloat(formData.get('workHours')),
            timeFormat: formData.get('timeFormat'),
            refreshInterval: parseInt(formData.get('refreshInterval'))
        };
        
        try {
            await this.saveSettings(settings);
            this.showStatus('Settings saved successfully!', 'success');
            
            // Update status text
            this.updateStatus();
            
            // Notify content script about settings change
            this.notifyContentScript(settings);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Failed to save settings. Please try again.', 'error');
        }
    }
    
    async saveSettings(settings) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ 'zoho-timer-settings': settings }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
    
    async loadSettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(['zoho-timer-settings'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    const settings = result['zoho-timer-settings'] || this.defaultSettings;
                    this.populateForm(settings);
                    resolve(settings);
                }
            });
        });
    }
    
    populateForm(settings) {
        document.getElementById('workHours').value = settings.workHours;
        document.getElementById('timeFormat').value = settings.timeFormat;
        document.getElementById('refreshInterval').value = settings.refreshInterval;
    }
    
    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `status ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.statusDiv.className = 'status';
        }, 3000);
    }
    
    updateStatus() {
        const workHours = document.getElementById('workHours').value;
        const timeFormat = document.getElementById('timeFormat').value;
        const refreshInterval = document.getElementById('refreshInterval').value;
        
        const intervalText = this.getIntervalText(refreshInterval);
        const formatText = timeFormat === '12' ? '12-hour' : '24-hour';
        
        this.statusText.textContent = `Work hours: ${workHours}h | Format: ${formatText} | Updates: ${intervalText}`;
    }
    
    getIntervalText(interval) {
        const seconds = interval / 1000;
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            return `${seconds / 60}m`;
        } else {
            return `${seconds / 3600}h`;
        }
    }
    
    notifyContentScript(settings) {
        // Send message to content script to update settings
        chrome.tabs.query({ url: "https://people.zoho.in/*" }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'updateSettings',
                    settings: settings
                }).catch(() => {
                    // Tab might not be ready or content script not loaded
                });
            });
        });
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

// Handle extension icon click to show current status
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a Zoho People page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab.url && currentTab.url.includes('people.zoho.in')) {
            document.getElementById('statusText').textContent = '✅ Active on Zoho People page';
        } else {
            document.getElementById('statusText').textContent = '⚠️ Go to Zoho People to use timer';
        }
    });
});