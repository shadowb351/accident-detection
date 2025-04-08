// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if the user has already activated the protection
    const isActivated = localStorage.getItem('protectionActivated') === 'true';
    
    if (isActivated) {
        document.getElementById('activateBtn').textContent = 'Deactivate Protection';
        document.getElementById('activateBtn').classList.add('active');
    }
    
    // Activate/Deactivate protection
    document.getElementById('activateBtn').addEventListener('click', () => {
        const isActivated = localStorage.getItem('protectionActivated') === 'true';
        
        if (isActivated) {
            localStorage.setItem('protectionActivated', 'false');
            document.getElementById('activateBtn').textContent = 'Activate Protection';
            document.getElementById('activateBtn').classList.remove('active');
            document.getElementById('emergencyStatus').textContent = 'Inactive';
            document.getElementById('emergencyStatus').style.color = 'var(--gray)';
            
            // Stop all sensors
            if (window.sensorManager) {
                window.sensorManager.stopAllSensors();
            }
            
            showNotification('Protection Deactivated', 'Your accident detection is now inactive.');
        } else {
            localStorage.setItem('protectionActivated', 'true');
            document.getElementById('activateBtn').textContent = 'Deactivate Protection';
            document.getElementById('activateBtn').classList.add('active');
            document.getElementById('emergencyStatus').textContent = 'Active';
            document.getElementById('emergencyStatus').style.color = 'var(--success-color)';
            
            // Initialize sensors
            if (window.sensorManager) {
                window.sensorManager.initAllSensors();
            }
            
            showNotification('Protection Activated', 'Your accident detection is now active.');
        }
    });
    
    // Manual emergency button
    document.getElementById('emergencyBtn').addEventListener('click', () => {
        triggerEmergency('manual');
    });
    
    // Test emergency button
    document.getElementById('testEmergencyBtn').addEventListener('click', () => {
        triggerEmergency('test');
    });
    
    // Cancel emergency button
    document.getElementById('cancelEmergencyBtn').addEventListener('click', () => {
        cancelEmergency();
    });
    
    // Check if protection should be active on page load
    if (localStorage.getItem('protectionActivated') === 'true') {
        if (window.sensorManager) {
            window.sensorManager.initAllSensors();
        }
        document.getElementById('emergencyStatus').textContent = 'Active';
        document.getElementById('emergencyStatus').style.color = 'var(--success-color)';
    }
});

// Show notification
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

// Trigger emergency
function triggerEmergency(type) {
    const modal = document.getElementById('emergencyModal');
    const countdownElement = document.getElementById('countdown');
    let seconds = 10;
    
    modal.style.display = 'flex';
    
    const countdown = setInterval(() => {
        seconds--;
        countdownElement.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(countdown);
            modal.style.display = 'none';
            sendEmergencyAlert(type);
        }
    }, 1000);
    
    // Store the countdown interval so we can clear it if canceled
    window.emergencyCountdown = countdown;
}

// Cancel emergency
function cancelEmergency() {
    clearInterval(window.emergencyCountdown);
    document.getElementById('emergencyModal').style.display = 'none';
    showNotification('Emergency Canceled', 'The emergency alert was canceled.');
}

// Send emergency alert
function sendEmergencyAlert(type) {
    const isTest = type === 'test';
    const statusElement = document.getElementById('emergencyStatus');
    
    statusElement.textContent = 'Emergency!';
    statusElement.style.color = 'var(--danger-color)';
    
    // In a real app, this would send data to your backend
    console.log(`Sending ${isTest ? 'TEST ' : ''}emergency alert...`);
    
    // Simulate API call
    setTimeout(() => {
        if (isTest) {
            showNotification('Test Alert Sent', 'Emergency services were notified (test mode).');
            statusElement.textContent = 'Active';
            statusElement.style.color = 'var(--success-color)';
        } else {
            showNotification('Emergency Alert Sent', 'Help is on the way!');
            // In a real app, you would keep the status as emergency until resolved
        }
    }, 2000);
}