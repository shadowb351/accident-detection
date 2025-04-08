class SensorManager {
    constructor() {
        this.sensors = {
            motion: {
                active: false,
                sensor: null,
                lastReading: null,
                threshold: 15, // Adjust based on testing
                consecutiveTriggers: 0,
                requiredTriggers: 3
            },
            sound: {
                active: false,
                context: null,
                analyser: null,
                microphone: null,
                threshold: 0.8, // Adjust based on testing
                consecutiveTriggers: 0,
                requiredTriggers: 5
            },
            voice: {
                active: false,
                recognition: null,
                keywords: ['help', 'emergency', 'accident', 'hurt', 'pain']
            }
        };
        
        this.emergencyCooldown = false;
        
        // Bind methods
        this.initAllSensors = this.initAllSensors.bind(this);
        this.stopAllSensors = this.stopAllSensors.bind(this);
        this.handleMotion = this.handleMotion.bind(this);
        this.handleSound = this.handleSound.bind(this);
        this.handleVoiceCommand = this.handleVoiceCommand.bind(this);
        this.checkForEmergency = this.checkForEmergency.bind(this);
    }
    
    initAllSensors() {
        this.initMotionSensor();
        this.initSoundSensor();
        this.initVoiceRecognition();
        
        // Update UI
        document.getElementById('soundStatus').textContent = 'Active';
        document.getElementById('motionStatus').textContent = 'Active';
    }
    
    stopAllSensors() {
        if (this.sensors.motion.sensor) {
            this.sensors.motion.sensor.stop();
            this.sensors.motion.active = false;
        }
        
        if (this.sensors.sound.microphone) {
            this.sensors.sound.microphone.disconnect();
            this.sensors.sound.active = false;
        }
        
        if (this.sensors.voice.recognition) {
            this.sensors.voice.recognition.stop();
            this.sensors.voice.active = false;
        }
        
        // Update UI
        document.getElementById('soundStatus').textContent = 'Inactive';
        document.getElementById('motionStatus').textContent = 'Inactive';
    }
    
    initMotionSensor() {
        if (!window.DeviceMotionEvent) {
            console.warn('Device motion not supported');
            document.getElementById('motionStatus').textContent = 'Unavailable';
            return;
        }
        
        this.sensors.motion.active = true;
        
        window.addEventListener('devicemotion', this.handleMotion);
    }
    
    handleMotion(event) {
        if (!this.sensors.motion.active || this.emergencyCooldown) return;
        
        const acceleration = event.accelerationIncludingGravity;
        const totalAcceleration = Math.sqrt(
            Math.pow(acceleration.x, 2) + 
            Math.pow(acceleration.y, 2) + 
            Math.pow(acceleration.z, 2)
        );
        
        // Simple detection - check if acceleration exceeds threshold
        if (totalAcceleration > this.sensors.motion.threshold) {
            this.sensors.motion.consecutiveTriggers++;
            
            if (this.sensors.motion.consecutiveTriggers >= this.sensors.motion.requiredTriggers) {
                this.checkForEmergency('motion');
                this.sensors.motion.consecutiveTriggers = 0;
            }
        } else {
            // Reset if no recent trigger
            this.sensors.motion.consecutiveTriggers = Math.max(0, this.sensors.motion.consecutiveTriggers - 1);
        }
        
        this.sensors.motion.lastReading = totalAcceleration;
    }
    
    initSoundSensor() {
        if (!navigator.mediaDevices || !window.AudioContext) {
            console.warn('Audio API not supported');
            document.getElementById('soundStatus').textContent = 'Unavailable';
            return;
        }
        
        this.sensors.sound.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sensors.sound.analyser = this.sensors.sound.context.createAnalyser();
        this.sensors.sound.analyser.fftSize = 256;
        
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                this.sensors.sound.microphone = this.sensors.sound.context.createMediaStreamSource(stream);
                this.sensors.sound.microphone.connect(this.sensors.sound.analyser);
                this.sensors.sound.active = true;
                
                // Start analyzing sound
                this.analyzeSound();
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                document.getElementById('soundStatus').textContent = 'Blocked';
            });
    }
    
    analyzeSound() {
        if (!this.sensors.sound.active || this.emergencyCooldown) return;
        
        const bufferLength = this.sensors.sound.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.sensors.sound.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = average / 255; // Normalize to 0-1
        
        // Check for loud sound
        if (normalized > this.sensors.sound.threshold) {
            this.sensors.sound.consecutiveTriggers++;
            
            if (this.sensors.sound.consecutiveTriggers >= this.sensors.sound.requiredTriggers) {
                this.checkForEmergency('sound');
                this.sensors.sound.consecutiveTriggers = 0;
            }
        } else {
            // Reset if no recent trigger
            this.sensors.sound.consecutiveTriggers = Math.max(0, this.sensors.sound.consecutiveTriggers - 1);
        }
        
        // Continue analyzing
        requestAnimationFrame(() => this.analyzeSound());
    }
    
    initVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        
        this.sensors.voice.recognition = new webkitSpeechRecognition();
        this.sensors.voice.recognition.continuous = true;
        this.sensors.voice.recognition.interimResults = true;
        this.sensors.voice.recognition.lang = 'en-US';
        
        this.sensors.voice.recognition.onresult = (event) => {
            if (!this.sensors.voice.active || this.emergencyCooldown) return;
            
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Check for emergency keywords
            const textToCheck = finalTranscript || interimTranscript;
            if (textToCheck) {
                const lowerText = textToCheck.toLowerCase();
                if (this.sensors.voice.keywords.some(keyword => lowerText.includes(keyword))) {
                    // Check voice stress (simple version - just check volume)
                    this.checkForEmergency('voice');
                }
            }
        };
        
        this.sensors.voice.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
        };
        
        this.sensors.voice.recognition.start();
        this.sensors.voice.active = true;
    }
    
    checkForEmergency(source) {
        if (this.emergencyCooldown) return;
        
        console.log(`Emergency detected by ${source}`);
        
        // In a real app, you would combine signals from multiple sensors
        // For this demo, we'll trigger on any single sensor
        
        // Check if protection is activated
        if (localStorage.getItem('protectionActivated') !== 'true') return;
        
        // Trigger emergency
        triggerEmergency('sensor');
        
        // Set cooldown to prevent multiple triggers
        this.emergencyCooldown = true;
        setTimeout(() => {
            this.emergencyCooldown = false;
        }, 30000); // 30 second cooldown
    }
}

// Initialize sensor manager
window.sensorManager = new SensorManager();