// Utility functions for Zoho Timer
class Utils {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }

    getTimeElements() {
        try {
            const container = document.querySelector('.zpl_mspchkinout');
            const timeSpans = container?.querySelector('.zpl_mstimer-count')?.querySelectorAll('span');

            return timeSpans?.length >= 3 ? timeSpans : null;
        } catch (error) {
            console.error('Error getting time elements:', error);
            return null;
        }
    }

    parseTimeValue(value) {
        const parsed = parseInt(value) || 0;
        return isNaN(parsed) ? 0 : parsed;
    }

    formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeFormat = this.settingsManager.getTimeFormat();

        if (timeFormat === '24') {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
            const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
    }

    formatDuration(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    calculateCheckoutTime() {
        const timeElements = this.getTimeElements();

        if (!timeElements) {
            throw new Error('Unable to find time elements');
        }

        const hours = this.parseTimeValue(timeElements[0].textContent);
        const minutes = this.parseTimeValue(timeElements[1].textContent);
        const seconds = this.parseTimeValue(timeElements[2].textContent);

        const totalWorkedMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
        const workHoursMs = this.settingsManager.getWorkHours() * 60 * 60 * 1000;

        const checkoutTime = new Date();
        checkoutTime.setTime(Date.now() - totalWorkedMs + workHoursMs);

        // Calculate overtime
        const isOvertime = totalWorkedMs > workHoursMs;
        const overtimeMs = isOvertime ? totalWorkedMs - workHoursMs : 0;
        const remainingMs = isOvertime ? 0 : workHoursMs - totalWorkedMs;

        return {
            checkoutTime,
            totalWorkedMs,
            workHoursMs,
            isOvertime,
            overtimeMs,
            remainingMs,
            workedHours: hours,
            workedMinutes: minutes,
            workedSeconds: seconds
        };
    }

    calculateProgressPercentage(totalWorkedMs, workHoursMs) {
        return Math.min(100, (totalWorkedMs / workHoursMs) * 100);
    }
}

// Export for use in other files
window.Utils = Utils; 