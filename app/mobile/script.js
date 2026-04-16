class MobileSensorDashboard {
    constructor() {
        this.isActive = false;
        this.lastShakeTime = 0;
        this.shakeThreshold = 15;
        this.lastAcceleration = { x: 0, y: 0, z: 0 };
        
        this.elements = {
            permissionNotice: document.getElementById('permissionNotice'),
            enableButton: document.getElementById('enableSensors'),
            deviceVisual: document.getElementById('deviceVisual'),
            tiltDirection: document.getElementById('tiltDirection'),
            tiltX: document.getElementById('tiltX'),
            tiltY: document.getElementById('tiltY'),
            shakeIndicator: document.getElementById('shakeIndicator'),
            shakeStatus: document.getElementById('shakeStatus'),
            shakeIntensity: document.getElementById('shakeIntensity'),
            accelX: document.getElementById('accelX'),
            accelY: document.getElementById('accelY'),
            accelZ: document.getElementById('accelZ'),
            accelXValue: document.getElementById('accelXValue'),
            accelYValue: document.getElementById('accelYValue'),
            accelZValue: document.getElementById('accelZValue'),
            compassNeedle: document.querySelector('.needle'),
            headingValue: document.getElementById('headingValue')
        };

        this.init();
    }

    init() {
        this.elements.enableButton.addEventListener('click', () => this.requestPermissions());
        
        // Check if sensors are supported
        if (!this.checkSensorSupport()) {
            this.showUnsupportedMessage();
            return;
        }
    }

    checkSensorSupport() {
        return 'DeviceOrientationEvent' in window && 
               'DeviceMotionEvent' in window;
    }

    showUnsupportedMessage() {
        this.elements.permissionNotice.innerHTML = `
            <p>Din enhed understøtter ikke mobilsensorer</p>
            <p>Prøv at åbne siden på en smartphone eller tablet</p>
        `;
    }

    async requestPermissions() {
        try {
            // Request device motion permission on iOS 13+
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const motionPermission = await DeviceMotionEvent.requestPermission();
                if (motionPermission !== 'granted') {
                    throw new Error('Device motion permission denied');
                }
            }

            // Request device orientation permission on iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const orientationPermission = await DeviceOrientationEvent.requestPermission();
                if (orientationPermission !== 'granted') {
                    throw new Error('Device orientation permission denied');
                }
            }

            this.startSensorTracking();
        } catch (error) {
            console.error('Permission request failed:', error);
            this.showPermissionError();
        }
    }

    showPermissionError() {
        this.elements.permissionNotice.innerHTML = `
            <p>Kunne ikke få adgang til sensorer</p>
            <p>Tjek browserindstillinger og prøv igen</p>
            <button id="retryButton" class="enable-button">PRØV IGEN</button>
        `;
        
        document.getElementById('retryButton').addEventListener('click', () => {
            location.reload();
        });
    }

    startSensorTracking() {
        this.isActive = true;
        this.elements.permissionNotice.classList.add('hidden');

        // Device Orientation (tilt)
        window.addEventListener('deviceorientation', (event) => {
            this.handleOrientation(event);
        });

        // Device Motion (acceleration and shake)
        window.addEventListener('devicemotion', (event) => {
            this.handleMotion(event);
        });

        // Compass (absolute orientation)
        window.addEventListener('deviceorientationabsolute', (event) => {
            this.handleCompass(event);
        });

        // Fallback for browsers without absolute orientation
        if (!('ondeviceorientationabsolute' in window)) {
            window.addEventListener('deviceorientation', (event) => {
                if (event.webkitCompassHeading !== undefined) {
                    this.handleCompass({ alpha: 360 - event.webkitCompassHeading });
                } else if (event.alpha !== null) {
                    this.handleCompass(event);
                }
            });
        }
    }

    handleOrientation(event) {
        const { beta, gamma } = event; // beta: front-back tilt, gamma: left-right tilt
        
        if (beta === null || gamma === null) return;

        // Update device visual rotation
        const rotationX = Math.max(-30, Math.min(30, beta)) * 0.5;
        const rotationY = Math.max(-30, Math.min(30, gamma)) * 0.5;
        
        this.elements.deviceVisual.style.transform = 
            `rotateX(${-rotationX}deg) rotateY(${rotationY}deg)`;

        // Update tilt direction text
        let direction = 'LEVEL';
        if (Math.abs(gamma) > 10 || Math.abs(beta) > 10) {
            const directions = [];
            if (beta > 10) directions.push('FORWARD');
            if (beta < -10) directions.push('BACKWARD');
            if (gamma > 10) directions.push('RIGHT');
            if (gamma < -10) directions.push('LEFT');
            direction = directions.join(' + ');
        }
        
        this.elements.tiltDirection.textContent = direction;
        this.elements.tiltX.textContent = `X: ${Math.round(gamma)}°`;
        this.elements.tiltY.textContent = `Y: ${Math.round(beta)}°`;
    }

    handleMotion(event) {
        const { accelerationIncludingGravity } = event;
        
        if (!accelerationIncludingGravity) return;

        const { x, y, z } = accelerationIncludingGravity;
        
        // Update acceleration bars
        const maxAccel = 20; // m/s²
        const xPercent = Math.min(100, (Math.abs(x) / maxAccel) * 100);
        const yPercent = Math.min(100, (Math.abs(y) / maxAccel) * 100);
        const zPercent = Math.min(100, (Math.abs(z) / maxAccel) * 100);
        
        this.elements.accelX.style.width = `${xPercent}%`;
        this.elements.accelY.style.width = `${yPercent}%`;
        this.elements.accelZ.style.width = `${zPercent}%`;
        
        this.elements.accelXValue.textContent = Math.round(x * 10) / 10;
        this.elements.accelYValue.textContent = Math.round(y * 10) / 10;
        this.elements.accelZValue.textContent = Math.round(z * 10) / 10;

        // Detect shake
        this.detectShake(x, y, z);
    }

    detectShake(x, y, z) {
        const currentTime = Date.now();
        
        // Calculate total acceleration change
        const deltaX = Math.abs(x - this.lastAcceleration.x);
        const deltaY = Math.abs(y - this.lastAcceleration.y);
        const deltaZ = Math.abs(z - this.lastAcceleration.z);
        const totalDelta = deltaX + deltaY + deltaZ;
        
        this.lastAcceleration = { x, y, z };
        
        if (totalDelta > this.shakeThreshold) {
            this.triggerShake(totalDelta);
            this.lastShakeTime = currentTime;
        } else if (currentTime - this.lastShakeTime > 500) {
            this.resetShake();
        }
    }

    triggerShake(intensity) {
        this.elements.shakeIndicator.classList.add('shaking');
        this.elements.shakeStatus.textContent = 'DU RYSTER DIN TELEFON!?!?!?!';
        this.elements.shakeIntensity.textContent = `Intensitet: ${Math.round(intensity)}`;
    }

    resetShake() {
        this.elements.shakeIndicator.classList.remove('shaking');
        this.elements.shakeStatus.textContent = 'STEADY';
        this.elements.shakeIntensity.textContent = '0';
    }

    handleCompass(event) {
        let heading = event.alpha;
        
        if (heading === null || heading === undefined) return;

        // Normalize heading to 0-360
        heading = (360 - heading) % 360;
        
        // Update compass needle
        this.elements.compassNeedle.style.transform = 
            `translateX(-50%) rotate(${heading}deg)`;
        
        // Update heading value
        this.elements.headingValue.textContent = `${Math.round(heading)}°`;
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileSensorDashboard();
});

// Add some fun easter eggs for specific orientations
document.addEventListener('DOMContentLoaded', () => {
    let konamiCode = [];
    const correctSequence = [
        'FORWARD', 'FORWARD', 'BACKWARD', 'BACKWARD',
        'LEFT', 'RIGHT', 'LEFT', 'RIGHT'
    ];
    
    // Listen for tilt direction changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'tiltDirection') {
                const direction = mutation.target.textContent;
                if (direction !== 'LEVEL' && !direction.includes('+')) {
                    konamiCode.push(direction);
                    if (konamiCode.length > correctSequence.length) {
                        konamiCode = konamiCode.slice(-correctSequence.length);
                    }
                    
                    if (konamiCode.length === correctSequence.length &&
                        konamiCode.every((val, i) => val === correctSequence[i])) {
                        // Easter egg activated!
                        document.body.style.background = 
                            'linear-gradient(45deg, #00A58D, #FFD424, #00A58D, #FFD424)';
                        document.body.style.backgroundSize = '400% 400%';
                        document.body.style.animation = 'gradient 2s ease infinite';
                        
                        const style = document.createElement('style');
                        style.textContent = `
                            @keyframes gradient {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                        `;
                        document.head.appendChild(style);
                        
                        setTimeout(() => {
                            document.body.style.background = '';
                            document.body.style.animation = '';
                            style.remove();
                        }, 5000);
                        
                        konamiCode = [];
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        characterData: true 
    });
});