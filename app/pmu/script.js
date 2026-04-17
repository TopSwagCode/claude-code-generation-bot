// PMU Interactive Prototype JavaScript
// Follows Energinet brand guidelines and modern web standards

(function() {
    'use strict';

    // Constants
    const COLORS = {
        primaryGreen: '#00A58D',
        primaryDarkGreen: '#008A8B',
        primaryDarkBlueGreen: '#09505D',
        secondaryYellow: '#FFD424',
        surface: '#ffffff',
        background: '#f5faf9'
    };

    // State management
    const state = {
        phasor: {
            magnitude: 1.0,
            phase: 0,
            frequency: 50.0
        },
        measurements: {
            voltage: 230.5,
            current: 1.23,
            frequency: 50.01
        },
        animationFrameId: null
    };

    // DOM elements
    const elements = {};

    // Initialize application
    function init() {
        cacheDOMElements();
        setupEventListeners();
        initializePhasorCanvas();
        startMeasurementUpdates();
        setupScrollAnimations();
    }

    // Cache DOM elements for performance
    function cacheDOMElements() {
        elements.navToggle = document.querySelector('.nav-toggle');
        elements.navMenu = document.querySelector('.nav-menu');
        elements.ctaButton = document.querySelector('.cta-button');
        elements.voltageValue = document.getElementById('voltage-value');
        elements.currentValue = document.getElementById('current-value');
        elements.frequencyValue = document.getElementById('frequency-value');
        elements.timestamp = document.getElementById('timestamp');
        
        // Phasor controls
        elements.magnitudeSlider = document.getElementById('magnitude-slider');
        elements.phaseSlider = document.getElementById('phase-slider');
        elements.frequencySlider = document.getElementById('frequency-slider');
        elements.magnitudeDisplay = document.getElementById('magnitude-display');
        elements.phaseDisplay = document.getElementById('phase-display');
        elements.frequencyDisplay = document.getElementById('frequency-display');
        elements.phasorCanvas = document.getElementById('phasor-canvas');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Mobile navigation
        if (elements.navToggle && elements.navMenu) {
            elements.navToggle.addEventListener('click', toggleMobileNav);
        }

        // CTA button scroll
        if (elements.ctaButton) {
            elements.ctaButton.addEventListener('click', handleCTAClick);
        }

        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', handleSmoothScroll);
        });

        // Phasor controls
        if (elements.magnitudeSlider) {
            elements.magnitudeSlider.addEventListener('input', updatePhasorMagnitude);
        }
        if (elements.phaseSlider) {
            elements.phaseSlider.addEventListener('input', updatePhasorPhase);
        }
        if (elements.frequencySlider) {
            elements.frequencySlider.addEventListener('input', updatePhasorFrequency);
        }

        // Window events
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        // Accessibility
        document.addEventListener('keydown', handleKeyNavigation);
    }

    // Mobile navigation toggle
    function toggleMobileNav() {
        if (elements.navMenu) {
            const isActive = elements.navMenu.classList.contains('active');
            elements.navMenu.classList.toggle('active');
            elements.navToggle.setAttribute('aria-expanded', !isActive);
            
            // Animate hamburger icon
            const spans = elements.navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (!isActive) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        }
    }

    // Handle CTA button click
    function handleCTAClick() {
        const targetId = elements.ctaButton.getAttribute('data-scroll-to');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Smooth scroll for navigation links
    function handleSmoothScroll(event) {
        const href = event.target.getAttribute('href');
        if (href && href.startsWith('#')) {
            event.preventDefault();
            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile nav if open
                if (elements.navMenu && elements.navMenu.classList.contains('active')) {
                    toggleMobileNav();
                }
            }
        }
    }

    // Initialize phasor canvas
    function initializePhasorCanvas() {
        if (!elements.phasorCanvas) return;
        
        const canvas = elements.phasorCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for retina displays
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        drawPhasor();
        
        // Start animation loop
        animatePhasor();
    }

    // Draw phasor diagram
    function drawPhasor() {
        if (!elements.phasorCanvas) return;
        
        const canvas = elements.phasorCanvas;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / (2 * (window.devicePixelRatio || 1));
        const centerY = canvas.height / (2 * (window.devicePixelRatio || 1));
        const radius = Math.min(centerX, centerY) - 30;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw coordinate system
        ctx.strokeStyle = COLORS.background;
        ctx.lineWidth = 1;
        
        // Draw circles
        for (let r = radius * 0.25; r <= radius; r += radius * 0.25) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.stroke();
        
        // Draw phasor vector
        const phasorLength = radius * state.phasor.magnitude * 0.8;
        const angleRad = (state.phasor.phase - 90) * Math.PI / 180; // Adjust for standard position
        const endX = centerX + phasorLength * Math.cos(angleRad);
        const endY = centerY + phasorLength * Math.sin(angleRad);
        
        // Phasor line
        ctx.strokeStyle = COLORS.primaryGreen;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrowhead
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angleRad - arrowAngle),
            endY - arrowLength * Math.sin(angleRad - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angleRad + arrowAngle),
            endY - arrowLength * Math.sin(angleRad + arrowAngle)
        );
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = COLORS.primaryDarkBlueGreen;
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        // Magnitude and phase labels
        const labelX = centerX + (phasorLength / 2) * Math.cos(angleRad);
        const labelY = centerY + (phasorLength / 2) * Math.sin(angleRad) - 10;
        ctx.fillText(`${state.phasor.magnitude.toFixed(1)} ∠ ${state.phasor.phase}°`, labelX, labelY);
        
        // Frequency label
        ctx.textAlign = 'left';
        ctx.fillText(`Frekvens: ${state.phasor.frequency.toFixed(2)} Hz`, 10, 25);
    }

    // Animate phasor rotation based on frequency
    function animatePhasor() {
        const frequencyDeviation = state.phasor.frequency - 50.0;
        const rotationSpeed = frequencyDeviation * 0.1; // Adjust rotation speed based on frequency
        
        // Only rotate if frequency is different from nominal
        if (Math.abs(frequencyDeviation) > 0.01) {
            state.phasor.phase = (state.phasor.phase + rotationSpeed) % 360;
            if (elements.phaseSlider) {
                elements.phaseSlider.value = state.phasor.phase;
                elements.phaseDisplay.textContent = `${Math.round(state.phasor.phase)}°`;
            }
        }
        
        drawPhasor();
        
        state.animationFrameId = requestAnimationFrame(animatePhasor);
    }

    // Update phasor magnitude
    function updatePhasorMagnitude(event) {
        state.phasor.magnitude = parseFloat(event.target.value);
        elements.magnitudeDisplay.textContent = state.phasor.magnitude.toFixed(1);
    }

    // Update phasor phase
    function updatePhasorPhase(event) {
        state.phasor.phase = parseFloat(event.target.value);
        elements.phaseDisplay.textContent = `${Math.round(state.phasor.phase)}°`;
    }

    // Update phasor frequency
    function updatePhasorFrequency(event) {
        state.phasor.frequency = parseFloat(event.target.value);
        elements.frequencyDisplay.textContent = `${state.phasor.frequency.toFixed(2)} Hz`;
    }

    // Start measurement updates simulation
    function startMeasurementUpdates() {
        if (!elements.voltageValue) return;
        
        setInterval(() => {
            // Simulate realistic measurement variations
            state.measurements.voltage = 230.5 + (Math.random() - 0.5) * 2;
            state.measurements.current = 1.23 + (Math.random() - 0.5) * 0.1;
            state.measurements.frequency = 50.01 + (Math.random() - 0.5) * 0.05;
            
            // Update display
            elements.voltageValue.textContent = state.measurements.voltage.toFixed(1);
            elements.currentValue.textContent = state.measurements.current.toFixed(2);
            elements.frequencyValue.textContent = state.measurements.frequency.toFixed(2);
            
            // Update timestamp
            const now = new Date();
            const timestamp = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0') + '.' +
                String(now.getMilliseconds()).padStart(3, '0');
            
            if (elements.timestamp) {
                elements.timestamp.textContent = timestamp;
            }
        }, 20); // 50 Hz update rate
    }

    // Setup scroll animations
    function setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections for animations
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });

        // Observe cards for staggered animations
        document.querySelectorAll('.application-card, .process-step').forEach((card, index) => {
            card.style.setProperty('--animation-delay', `${index * 0.1}s`);
            observer.observe(card);
        });
    }

    // Handle window resize
    function handleResize() {
        if (elements.phasorCanvas) {
            initializePhasorCanvas();
        }
    }

    // Handle scroll events
    function handleScroll() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    }

    // Keyboard navigation
    function handleKeyNavigation(event) {
        // ESC key closes mobile navigation
        if (event.key === 'Escape' && elements.navMenu.classList.contains('active')) {
            toggleMobileNav();
        }
        
        // Enter key activates focused elements
        if (event.key === 'Enter' && document.activeElement.classList.contains('cta-button')) {
            handleCTAClick();
        }
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Error handling
    function handleError(error, context) {
        console.error(`PMU Prototype Error (${context}):`, error);
        
        // Graceful fallback for critical features
        if (context === 'phasor-canvas' && elements.phasorCanvas) {
            elements.phasorCanvas.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = '<p style="text-align: center; color: #ce3e33;">Phasor diagram kunne ikke indlæses</p>';
            elements.phasorCanvas.parentNode.appendChild(fallback);
        }
    }

    // Cleanup function
    function cleanup() {
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
        }
    }

    // Performance monitoring
    function logPerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            console.log(`PMU Prototype loaded in ${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Log performance after load
    window.addEventListener('load', logPerformance);

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Export for testing purposes
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            init,
            state,
            COLORS,
            drawPhasor,
            updatePhasorMagnitude,
            updatePhasorPhase,
            updatePhasorFrequency
        };
    }

})();