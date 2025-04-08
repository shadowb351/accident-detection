document.addEventListener('DOMContentLoaded', () => {
    // Toggle protection status
    const toggleBtn = document.querySelector('.toggle-btn');
    toggleBtn.addEventListener('click', () => {
        const statusIndicator = document.querySelector('.status-indicator');
        const isActive = statusIndicator.classList.contains('active');
        
        if (isActive) {
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i><span>Inactive</span>';
            toggleBtn.textContent = 'Activate';
            
            // In a real app, you would deactivate the sensors
            if (window.sensorManager) {
                window.sensorManager.stopAllSensors();
            }
            
            showNotification('Protection Deactivated', 'Your accident detection is now inactive.');
        } else {
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i><span>Active</span>';
            toggleBtn.textContent = 'Deactivate';
            
            // In a real app, you would activate the sensors
            if (window.sensorManager) {
                window.sensorManager.initAllSensors();
            }
            
            showNotification('Protection Activated', 'Your accident detection is now active.');
        }
    });
    
    // Test alert button
    const testAlertBtn = document.querySelector('.action-btn.test-alert');
    testAlertBtn.addEventListener('click', () => {
        triggerEmergency('test');
    });
    
    // Manual alert button
    const manualAlertBtn = document.querySelector('.action-btn.manual-alert');
    manualAlertBtn.addEventListener('click', () => {
        triggerEmergency('manual');
    });
    
    // Share location button
    const shareLocationBtn = document.querySelector('.action-btn.share-location');
    shareLocationBtn.addEventListener('click', async () => {
        try {
            const location = await window.emergencyService.getCurrentLocation();
            showNotification('Location Shared', `Your location (${location.latitude}, ${location.longitude}) has been shared with your emergency contacts.`);
        } catch (error) {
            showNotification('Error', 'Could not share location. Please enable location services.');
        }
    });
    
    // Check sensors button
    const checkSensorsBtn = document.querySelector('.action-btn.check-sensors');
    checkSensorsBtn.addEventListener('click', () => {
        // In a real app, you would run sensor diagnostics
        showNotification('Sensor Check', 'Running diagnostics on all sensors...');
        
        setTimeout(() => {
            showNotification('Sensor Status', 'All sensors are functioning properly.');
        }, 2000);
    });
    
    // View all alerts button
    const viewAllAlertsBtn = document.querySelector('.view-all-btn');
    viewAllAlertsBtn.addEventListener('click', () => {
        // In a real app, this would navigate to an alerts page
        showNotification('Alerts', 'Showing all historical alerts.');
    });
    
    // Add contact button
    const addContactBtn = document.querySelector('.add-contact-btn');
    addContactBtn.addEventListener('click', () => {
        // In a real app, this would open a form to add a new contact
        showNotification('Add Contact', 'Feature coming soon!');
    });
    
    // Contact buttons
    const contactBtns = document.querySelectorAll('.contact-btn');
    contactBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // In a real app, this would initiate a call
            showNotification('Calling', 'This would initiate a phone call in a real app.');
        });
    });
});

function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}

function triggerEmergency(type) {
    // In a real app, this would use the emergency service
    console.log(`Triggering ${type} emergency`);
    
    if (type === 'test') {
        showNotification('Test Alert', 'This is a test emergency alert. No actual emergency services will be contacted.');
    } else {
        showNotification('Emergency Alert', 'Emergency services have been notified with your location.');
    }
}