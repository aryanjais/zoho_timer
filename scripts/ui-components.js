// UI Components for Zoho Timer
class UIComponents {
    constructor() {
        this.THEMES = {
            LIGHT: 'light',
            DARK: 'dark'
        };
    }

    // Theme management
    getCurrentTheme() {
        return localStorage.getItem('zoho-timer-theme') || this.THEMES.DARK;
    }

    setTheme(theme) {
        localStorage.setItem('zoho-timer-theme', theme);
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
        this.setTheme(newTheme);
        return newTheme;
    }

    getThemeColors(isOvertime) {
        const currentTheme = this.getCurrentTheme();

        if (currentTheme === this.THEMES.LIGHT) {
            // Light theme colors
            const surfaceColor = '#FFFFFF';
            const primaryColor = '#4CAF50';
            const secondaryColor = '#C8E6C9';

            return {
                // backgroundColor: isOvertime
                //     ? `linear-gradient(135deg, ${surfaceColor} 0%, #FFCDD2 100%)`
                //     : `linear-gradient(135deg, ${surfaceColor} 0%, #F5F5F5 100%)`,
                backgroundColor: `linear-gradient(135deg, ${surfaceColor} 0%, #F5F5F5 100%)`,

                primaryColor,
                secondaryColor,
                primaryTextColor: 'rgba(0, 0, 0, 0.87)',
                secondaryTextColor: 'rgba(0, 0, 0, 0.6)',
                shadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
                border: 'rgba(0,0,0,0.12)',
                progressBg: 'rgba(0,0,0,0.08)'
            };
        } else {
            // Dark theme colors - using the provided color palette
            const surfaceColor = '#1E1E1E'; // Card/Container color
            const primaryColor = '#4F9DFF'; // Error for overtime, Accent for normal
            const secondaryColor = '#4CAF50'; // Error variant for overtime, Success for normal

            return {
                backgroundColor: `linear-gradient(135deg, ${surfaceColor} 0%, #2C2C2C 100%)`, // Borders/Dividers color
                primaryColor,
                secondaryColor,
                primaryTextColor: '#FFFFFF', // Primary Text color
                secondaryTextColor: '#B0B0B0', // Secondary Text color
                shadow: '0 4px 12px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.6)',
                border: '#2C2C2C', // Borders/Dividers color
                progressBg: 'rgba(255,255,255,0.08)'
            };
        }
    }

    createThemeToggleButton(colors, currentTheme) {
        const toggleIcon = currentTheme === this.THEMES.DARK ? '☀️' : '🌙';
        return `
            <button id="theme-toggle-btn" 
                    data-action="toggle-theme"
                    style="position: absolute;
                           bottom: 8px;
                           right: 8px;
                           background: ${colors.primaryColor};
                           color: white;
                           border: none;
                           border-radius: 50%;
                           width: 20px;
                           height: 20px;
                           cursor: pointer;
                           font-size: 12px;
                           padding: 0;
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           transition: all 0.3s ease;
                           box-shadow: 0 1px 3px rgba(0,0,0,0.2);"
                    onmouseover="this.style.transform='scale(1.15)'"
                    onmouseout="this.style.transform='scale(1)'"
                    title="Toggle ${currentTheme === this.THEMES.DARK ? 'Light' : 'Dark'} Mode">
                ${toggleIcon}
            </button>
        `;
    }

    createStatusMessage(isOvertime, overtimeMs, remainingMs, colors, formatDuration) {
        if (isOvertime) {
            return `<div style="font-size: 14px; margin-bottom: 6px; font-weight: 500; color: ${colors.secondaryTextColor};">
                ⏰ Overtime: ${formatDuration(overtimeMs)}
            </div>`;
        } else {
            return `<div style="font-size: 14px; margin-bottom: 6px; color: ${colors.secondaryTextColor};">
                ⏳ Remaining: ${formatDuration(remainingMs)}
            </div>`;
        }
    }

    createProgressBar(progressPercentage, colors) {
        return `
            <div style="background: ${colors.progressBg};
                        height: 6px;
                        border-radius: 3px;
                        overflow: hidden;
                        margin-bottom: 8px;">
                <div style="background: ${colors.primaryColor};
                            height: 100%;
                            width: ${progressPercentage}%;
                            transition: width 0.3s ease;
                            border-radius: 3px;
                            box-shadow: 0 0 6px ${colors.primaryColor}60;"></div>
            </div>
        `;
    }

    createSettingsInfo(workHours, timeFormat, colors) {
        // Format work hours to show hours and minutes
        const hours = Math.floor(workHours);
        const minutes = Math.round((workHours - hours) * 60);
        const timeText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        
        return `
            <div style="font-size: 11px; color: ${colors.secondaryTextColor}; margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                ⚙️ Work hours: ${timeText} | Format: ${timeFormat === '12' ? '12h' : '24h'}
            </div>
        `;
    }

    createErrorDisplay(errorMessage) {
        return `
            <div style="color: #ff6b6b; padding: 10px; border-radius: 5px; background: #ffe6e6; margin: 10px 0;">
                ⚠️ Error: ${errorMessage}
            </div>
        `;
    }

    createMainDisplay(data) {
        const {
            isOvertime,
            formattedTime,
            statusMessage,
            progressBar,
            progressPercentage,
            settingsInfo,
            colors,
            themeToggleButton
        } = data;

        return `
            <div style="background: ${colors.backgroundColor};
                        color: ${colors.primaryTextColor};
                        padding: 16px;
                        border-radius: 12px;
                        margin: 10px 0;
                        box-shadow: ${colors.shadow};
                        border: 1px solid ${colors.border};
                        font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
                        position: relative;">
                ${themeToggleButton}
                <div style="font-weight: 500; font-size: 15px; margin-bottom: 8px; color: ${colors.primaryTextColor};">
                    ${isOvertime ? 'Work Complete!' : 'Checkout Time:'} ${formattedTime}
                </div>
                ${statusMessage}
                ${progressBar}
                <div style="font-size: 13px; color: ${colors.secondaryTextColor};">
                    Progress: ${progressPercentage.toFixed(1)}% ${isOvertime ? '(Overtime!)' : 'complete'}
                </div>
                </div>
                `;
            }
            // ${settingsInfo}

    createCheckoutElement() {
        const container = document.querySelector('.zpl_mspchkinout');
        if (!container) {
            throw new Error('Timer container not found');
        }

        const checkoutElement = document.createElement('div');
        checkoutElement.classList.add('enhanced-checkout-timer');
        container.appendChild(checkoutElement);
        return checkoutElement;
    }
}

// Export for use in other files
window.UIComponents = UIComponents; 