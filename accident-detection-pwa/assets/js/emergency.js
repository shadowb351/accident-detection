// This would handle communication with backend services in a real app
// For this demo, we'll simulate the functionality

class EmergencyService {
    constructor() {
        this.apiBaseUrl = 'https://api.rescueguard.example.com'; // Replace with real API
        this.userProfile = this.getUserProfile();
    }
    
    getUserProfile() {
        // In a real app, this would come from your backend or local storage
        return {
            id: 'user123',
            name: 'John Doe',
            bloodType: 'O+',
            medicalConditions: ['Asthma', 'No known allergies'],
            emergencyContacts: [
                { name: 'Jane Doe', phone: '+1234567890', relation: 'Spouse' },
                { name: 'Mike Smith', phone: '+1987654321', relation: 'Friend' }
            ]
        };
    }
    
    async sendEmergencyAlert(location, type = 'real') {
        // In a real app, this would send to your backend
        console.log(`Sending ${type} emergency alert from ${location.latitude}, ${location.longitude}`);
        
        const payload = {
            userId: this.userProfile.id,
            location,
            profile: this.userProfile,
            timestamp: new Date().toISOString(),
            isTest: type === 'test'
        };
        
        try {
            // Simulate API call
            const response = await this.simulateApiCall(payload);
            return response;
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            throw error;
        }
    }
    
    simulateApiCall(payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Emergency services notified',
                    dispatchId: 'dispatch-' + Math.random().toString(36).substr(2, 9),
                    estimatedArrival: Math.floor(Math.random() * 15) + 5 // 5-20 minutes
                });
            }, 1500);
        });
    }
    
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }
}

// Initialize emergency service
window.emergencyService = new EmergencyService();