// Global theme toggle function - must be defined before timer initialization
let globalTimerInstance = null;
let globalUIInstance = null;

window.zohoTimerToggleTheme = function() {
	if (globalUIInstance && globalTimerInstance) {
		globalUIInstance.toggleTheme();
		globalTimerInstance.updateDisplay();
		console.log('Theme toggled successfully');
	} else {
		console.error('Timer or UI instance not available for theme toggle');
	}
};

// Main Timer Controller for Zoho Timer
const getTimer = function() {
	// Initialize components
	const settingsManager = new SettingsManager();
	const utils = new Utils(settingsManager);
	const ui = new UIComponents();

	// State management
	const state = {
		pollInterval: null,
		refreshInterval: null,
		retryCount: 0,
		checkoutElement: null,
		isInitialized: false,
		settingsLoaded: false
	};

	// Timer controller
	const timer = {
		updateDisplay() {
			try {
				// Ensure settings are loaded before updating display
				if (!state.settingsLoaded) {
					console.log('Settings not loaded yet, skipping display update');
					return;
				}

				const timeData = utils.calculateCheckoutTime();
				const {
					checkoutTime,
					totalWorkedMs,
					workHoursMs,
					isOvertime,
					overtimeMs,
					remainingMs
				} = timeData;

				if (!state.checkoutElement) {
					state.checkoutElement = ui.createCheckoutElement();
				}

				const formattedTime = utils.formatTime(checkoutTime);
				const progressPercentage = utils.calculateProgressPercentage(totalWorkedMs, workHoursMs);
				const colors = ui.getThemeColors(isOvertime);
				const currentTheme = ui.getCurrentTheme();

				// Create UI components
				const statusMessage = ui.createStatusMessage(isOvertime, overtimeMs, remainingMs, colors, utils.formatDuration.bind(utils));
				const themeToggleButton = ui.createThemeToggleButton(colors, currentTheme);
				const progressBar = ui.createProgressBar(progressPercentage, colors);
				const settingsInfo = ui.createSettingsInfo(
					settingsManager.getWorkHours(),
					settingsManager.getTimeFormat(),
					colors
				);

				// Create main display
				const displayData = {
					isOvertime,
					formattedTime,
					statusMessage,
					progressBar,
					progressPercentage,
					settingsInfo,
					colors,
					themeToggleButton
				};

				state.checkoutElement.innerHTML = ui.createMainDisplay(displayData);
				
				// Add event listener to the theme toggle button after it's created
				setTimeout(() => {
					const toggleBtn = state.checkoutElement.querySelector('#theme-toggle-btn');
					if (toggleBtn) {
						toggleBtn.addEventListener('click', (e) => {
							e.preventDefault();
							window.zohoTimerToggleTheme();
						});
					}
				}, 100);
			} catch (error) {
				console.error('Error updating display:', error);
				if (state.checkoutElement) {
					state.checkoutElement.innerHTML = ui.createErrorDisplay(error.message);
				}
			}
		},

		async init() {
			if (state.isInitialized) return;

			try {
				// Load settings before initializing
				await settingsManager.loadSettings();
				state.settingsLoaded = true;

				this.updateDisplay();
				state.isInitialized = true;

				state.refreshInterval = setInterval(() => {
					this.updateDisplay();
				}, settingsManager.getRefreshInterval());

				console.log('Enhanced Zoho Timer initialized successfully with settings:', settingsManager.getConfig());
			} catch (error) {
				console.error('Failed to initialize timer:', error);
			}
		},

		async refreshUI() {
			try {
				console.log('Refreshing UI with current settings...');
				
				// Reload settings
				await settingsManager.loadSettings();
				state.settingsLoaded = true;
				
				// Update display with new settings
				this.updateDisplay();
				
				// Restart refresh interval with new settings
				if (state.refreshInterval) {
					clearInterval(state.refreshInterval);
				}
				
				state.refreshInterval = setInterval(() => {
					this.updateDisplay();
				}, settingsManager.getRefreshInterval());
				
				console.log('UI refreshed successfully with settings:', settingsManager.getConfig());
			} catch (error) {
				console.error('Failed to refresh UI:', error);
			}
		}
	};

	// Store references globally for theme toggle access - AFTER timer is defined
	globalTimerInstance = timer;
	globalUIInstance = ui;

	// Message listener for settings updates and UI refresh
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === 'updateSettings') {
			settingsManager.updateSettings(message.settings);
			
			// Restart timer with new settings if already initialized
			if (state.isInitialized) {
				if (state.refreshInterval) {
					clearInterval(state.refreshInterval);
				}
				timer.init();
			}
			
			sendResponse({ success: true });
		} else if (message.action === 'refreshUI') {
			timer.refreshUI();
			sendResponse({ success: true });
		}
	});

	// Initialize function
	async function initialize() {
		// Load settings first before starting any timer operations
		try {
			await settingsManager.loadSettings();
			state.settingsLoaded = true;
			console.log('Settings loaded successfully:', settingsManager.getConfig());
		} catch (error) {
			console.error('Failed to load settings:', error);
			// Continue with defaults
		}

		const checkForElements = () => {
			state.retryCount++;

			if (state.retryCount > settingsManager.getMaxRetries()) {
				console.error('Max retries reached. Zoho timer elements not found.');
				clearInterval(state.pollInterval);
				return;
			}

			const timerContainer = document.querySelector('.zpl_mspchkinout');
			const timeElements = utils.getTimeElements();

			if (timerContainer && timeElements) {
				clearInterval(state.pollInterval);
				console.log(`Enhanced Zoho Timer found elements after ${state.retryCount} attempts`);

				setTimeout(() => {
					timer.init();
				}, 500);
			}
		};

		state.pollInterval = setInterval(checkForElements, settingsManager.getPollInterval());
		console.log('Enhanced Zoho Timer started with settings:', settingsManager.getConfig());
	}

	// Cleanup on page unload
	window.addEventListener('beforeunload', () => {
		if (state.pollInterval) clearInterval(state.pollInterval);
		if (state.refreshInterval) clearInterval(state.refreshInterval);
	});

	// Start initialization
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initialize);
	} else {
		initialize();
	}
};

// Start the timer
getTimer();