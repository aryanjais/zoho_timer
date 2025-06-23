// Zoho Timer Settings Management
class SettingsManager {
    constructor() {
        this.form = document.getElementById('settingsForm');
        this.statusDiv = document.getElementById('status');
        this.statusText = document.getElementById('statusText');
        this.refreshBtn = document.getElementById('refreshBtn');
        
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
        
        // Refresh button event listener
        this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        
        // Real-time validation for hours
        document.getElementById('workHours').addEventListener('input', (e) => {
            this.validateWorkHours(e.target.value);
        });
        
        // Real-time validation for minutes
        document.getElementById('workMinutes').addEventListener('input', (e) => {
            this.validateWorkMinutes(e.target.value);
        });
    }
    
    validateWorkHours(value) {
        const input = document.getElementById('workHours');
        const minutesInput = document.getElementById('workMinutes');
        const numValue = parseInt(value);
        
        if (numValue < 0 || numValue > 24) {
            input.setCustomValidity('Work hours must be between 0 and 24');
            input.style.borderColor = '#f44336';
        } else {
            input.setCustomValidity('');
            input.style.borderColor = '';
        }
        
        // Cross-validate with minutes
        this.validateTotalTime();
    }
    
    validateWorkMinutes(value) {
        const input = document.getElementById('workMinutes');
        const numValue = parseInt(value);
        
        if (numValue < 0 || numValue > 59) {
            input.setCustomValidity('Work minutes must be between 0 and 59');
            input.style.borderColor = '#f44336';
        } else {
            input.setCustomValidity('');
            input.style.borderColor = '';
        }
        
        // Cross-validate with hours
        this.validateTotalTime();
    }
    
    validateTotalTime() {
        const hours = parseInt(document.getElementById('workHours').value) || 0;
        const minutes = parseInt(document.getElementById('workMinutes').value) || 0;
        
        if (hours === 0 && minutes === 0) {
            document.getElementById('workHours').setCustomValidity('Please enter at least 1 hour or 1 minute');
            document.getElementById('workMinutes').setCustomValidity('Please enter at least 1 hour or 1 minute');
        } else {
            document.getElementById('workHours').setCustomValidity('');
            document.getElementById('workMinutes').setCustomValidity('');
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const hours = parseInt(formData.get('workHours')) || 0;
        const minutes = parseInt(formData.get('workMinutes')) || 0;
        
        // Validate that at least one value is provided
        if (hours === 0 && minutes === 0) {
            this.showStatus('Please enter at least 1 hour or 1 minute of work time.', 'error');
            return;
        }
        
        // Convert to total hours (decimal)
        const totalWorkHours = hours + (minutes / 60);
        
        const settings = {
            workHours: totalWorkHours,
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
    
    async handleRefresh() {
        try {
            // Disable refresh button during operation
            this.refreshBtn.disabled = true;
            this.refreshBtn.textContent = '🔄 Refreshing...';
            
            // Reload settings from storage
            await this.loadSettings();
            
            // Update status text
            this.updateStatus();
            
            // Notify content script to refresh
            this.notifyContentScriptRefresh();
            
            this.showStatus('UI refreshed successfully!', 'success');
            
        } catch (error) {
            console.error('Error refreshing:', error);
            this.showStatus('Failed to refresh. Please try again.', 'error');
        } finally {
            // Re-enable refresh button
            this.refreshBtn.disabled = false;
            this.refreshBtn.textContent = '🔄 Refresh UI';
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
        // Convert decimal work hours to hours and minutes
        const totalHours = settings.workHours || 8;
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);
        
        document.getElementById('workHours').value = hours;
        document.getElementById('workMinutes').value = minutes;
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
        const workMinutes = document.getElementById('workMinutes').value;
        const timeFormat = document.getElementById('timeFormat').value;
        const refreshInterval = document.getElementById('refreshInterval').value;
        
        const intervalText = this.getIntervalText(refreshInterval);
        const formatText = timeFormat === '12' ? '12-hour' : '24-hour';
        const timeText = workMinutes > 0 ? `${workHours}h ${workMinutes}m` : `${workHours}h`;
        
        this.statusText.textContent = `Work hours: ${timeText} | Format: ${formatText} | Updates: ${intervalText}`;
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
    
    notifyContentScriptRefresh() {
        // Send message to content script to refresh
        chrome.tabs.query({ url: "https://people.zoho.in/*" }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'refreshUI'
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