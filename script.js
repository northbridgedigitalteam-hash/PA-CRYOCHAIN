// ===== CRYOCHAIN MAIN APPLICATION SCRIPT =====
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('CryoChain cold-chain platform initialized');
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        demoFormEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // Replace with actual Formspree ID
        temperatureUnits: '°C',
        refreshInterval: 30000, // 30 seconds
        mockSensorData: true
    };
    
    // ===== GLOBAL STATE =====
    const AppState = {
        currentTemperature: 4.2,
        currentHumidity: 65,
        shipmentsActive: 24,
        alertsCount: 3,
        userLocation: null
    };
    
    // ===== DOM ELEMENTS =====
    const elements = {
        demoForm: document.getElementById('demoForm'),
        temperatureDisplay: document.getElementById('currentTemp'),
        humidityDisplay: document.getElementById('currentHumidity'),
        shipmentsCount: document.getElementById('shipmentsCount'),
        alertsCount: document.getElementById('alertsCount'),
        lastUpdated: document.getElementById('lastUpdated'),
        riskIndicator: document.getElementById('riskIndicator'),
        sensorDataChart: document.getElementById('sensorChart'),
        alertList: document.getElementById('alertList'),
        contactForm: document.getElementById('contactForm')
    };
    
    // ===== INITIALIZATION =====
    function init() {
        console.log('Initializing CryoChain application...');
        
        // Initialize components
        updateDashboard();
        setupEventListeners();
        startSensorSimulation();
        setupFormValidation();
        
        // Update timestamp
        updateTimestamp();
        
        // Set up periodic updates
        setInterval(updateDashboard, CONFIG.refreshInterval);
        
        // Add smooth scrolling for anchor links
        setupSmoothScrolling();
        
        // Initialize mock data if needed
        if (CONFIG.mockSensorData) {
            initializeMockData();
        }
        
        console.log('CryoChain initialized successfully');
    }
    
    // ===== DASHBOARD FUNCTIONS =====
    function updateDashboard() {
        if (CONFIG.mockSensorData) {
            updateSensorReadings();
        }
        
        updateCounters();
        updateRiskIndicator();
        updateTimestamp();
    }
    
    function updateSensorReadings() {
        // Simulate real sensor data with small fluctuations
        AppState.currentTemperature = simulateValue(4.2, 0.5);
        AppState.currentHumidity = simulateValue(65, 3);
        
        // Update display
        if (elements.temperatureDisplay) {
            elements.temperatureDisplay.textContent = 
                `${AppState.currentTemperature.toFixed(1)}${CONFIG.temperatureUnits}`;
        }
        
        if (elements.humidityDisplay) {
            elements.humidityDisplay.textContent = 
                `${AppState.currentHumidity.toFixed(1)}%`;
        }
    }
    
    function updateCounters() {
        // Simulate changing shipment counts
        if (elements.shipmentsCount) {
            AppState.shipmentsActive = simulateValue(24, 2, true);
            elements.shipmentsCount.textContent = AppState.shipmentsActive;
        }
        
        // Update alerts
        if (elements.alertsCount) {
            elements.alertsCount.textContent = AppState.alertsCount;
        }
    }
    
    function updateRiskIndicator() {
        if (!elements.riskIndicator) return;
        
        // Calculate risk based on temperature and humidity
        let riskLevel = 'low';
        let riskColor = '#10b981'; // Green
        
        if (AppState.currentTemperature > 5 || AppState.currentTemperature < 2) {
            riskLevel = 'medium';
            riskColor = '#f59e0b'; // Amber
        }
        
        if (AppState.currentTemperature > 7 || AppState.currentTemperature < 0) {
            riskLevel = 'high';
            riskColor = '#ef4444'; // Red
        }
        
        if (AppState.currentHumidity > 80) {
            riskLevel = 'high';
            riskColor = '#ef4444';
        }
        
        // Update indicator
        elements.riskIndicator.textContent = riskLevel.toUpperCase();
        elements.riskIndicator.style.color = riskColor;
        elements.riskIndicator.className = `status-indicator status-${riskLevel}`;
    }
    
    function updateTimestamp() {
        if (!elements.lastUpdated) return;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        elements.lastUpdated.textContent = `Last updated: ${timeString}`;
    }
    
    // ===== FORM HANDLING =====
    function setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                if (!validateForm(this)) {
                    event.preventDefault();
                    showFormMessage(this, 'Please fill in all required fields correctly.', 'error');
                } else {
                    // For demo purposes, prevent actual submission
                    event.preventDefault();
                    showFormMessage(this, 'Thank you! Your request has been submitted. We\'ll contact you shortly.', 'success');
                    this.reset();
                    
                    // In production, you would submit to Formspree or backend
                    // submitToFormspree(form);
                }
            });
        });
    }
    
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                highlightFieldError(field, true);
            } else {
                highlightFieldError(field, false);
                
                // Email validation
                if (field.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        highlightFieldError(field, true, 'Please enter a valid email address');
                    }
                }
                
                // Phone validation
                if (field.name === 'phone') {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
                        isValid = false;
                        highlightFieldError(field, true, 'Please enter a valid phone number');
                    }
                }
            }
        });
        
        return isValid;
    }
    
    function highlightFieldError(field, hasError, message = '') {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        if (hasError) {
            formGroup.classList.add('error');
            let errorElement = formGroup.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = message || 'This field is required';
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
        } else {
            formGroup.classList.remove('error');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    function showFormMessage(form, message, type) {
        // Remove existing messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.padding = '1rem';
        messageDiv.style.marginTop = '1rem';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.fontWeight = '500';
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            messageDiv.style.color = '#10b981';
            messageDiv.style.border = '1px solid #10b981';
        } else {
            messageDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            messageDiv.style.color = '#ef4444';
            messageDiv.style.border = '1px solid #ef4444';
        }
        
        // Insert message
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            form.insertBefore(messageDiv, submitButton.nextSibling);
        } else {
            form.appendChild(messageDiv);
        }
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.5s';
                setTimeout(() => messageDiv.remove(), 500);
            }, 5000);
        }
    }
    
    // ===== SENSOR SIMULATION =====
    function startSensorSimulation() {
        console.log('Starting sensor simulation...');
        
        // Simulate periodic alerts
        setInterval(() => {
            // Random chance of generating an alert
            if (Math.random() < 0.1) { // 10% chance every interval
                generateRandomAlert();
            }
        }, 60000); // Check every minute
    }
    
    function generateRandomAlert() {
        const alerts = [
            { type: 'temperature', message: 'Temperature fluctuation detected in shipment #SC-4821', severity: 'medium' },
            { type: 'humidity', message: 'High humidity warning in container CTN-5678', severity: 'low' },
            { type: 'delay', message: 'Shipment delayed at customs - estimated 4 hour delay', severity: 'high' },
            { type: 'equipment', message: 'Reefer unit maintenance due for container #RV-3345', severity: 'medium' }
        ];
        
        const alert = alerts[Math.floor(Math.random() * alerts.length)];
        
        // Update alert count
        AppState.alertsCount++;
        if (elements.alertsCount) {
            elements.alertsCount.textContent = AppState.alertsCount;
        }
        
        // Show notification
        showNotification(alert.message, alert.severity);
    }
    
    function showNotification(message, severity) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-cont
 
