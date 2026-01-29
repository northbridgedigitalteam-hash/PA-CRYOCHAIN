// ===== CRYOCHAIN VESSEL TRACKING DASHBOARD =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚢 CryoChain Vessel Tracking initialized');
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        mapCenter: [20, 60],
        mapZoom: 3,
        updateInterval: 3000, // 3 seconds for vessel updates
        simulationSpeed: 5,
        marineTrafficDemo: true
    };
    
    // ===== GLOBAL VARIABLES =====
    let map = null;
    let vessels = [];
    let vesselMarkers = [];
    let routes = [];
    let tempChart = null;
    let simulationRunning = true;
    
    // ===== MARINE TRAFFIC VESSEL DATA (Demo) =====
    const demoVessels = [
        {
            id: 'maersk-honam',
            name: 'MAERSK HONAM',
            mmsi: '477542100',
            imo: '9756897',
            type: 'Container Ship',
            status: 'delayed',
            position: { lat: 12.567, lng: 45.678 },
            course: 245,
            speed: 18.5,
            destination: 'ROTTERDAM',
            origin: 'SINGAPORE',
            eta: '2024-02-03T20:00:00',
            originalEta: '2024-02-02T08:00:00',
            delay: 36,
            delayReason: 'weather',
            agentNotes: [
                {
                    time: '2024-01-29T14:30:00',
                    agent: 'Port Agent - Singapore',
                    message: 'Storm system in South China Sea. Captain reducing speed to 12 knots for safety.',
                    type: 'weather'
                },
                {
                    time: '2024-01-30T09:00:00',
                    agent: 'Port Agent - Singapore',
                    message: 'Diverted 50NM south. Additional 24-hour delay expected.',
                    type: 'route'
                }
            ],
            containers: [
                { id: 'MSCU1234567', temp: 2.8, product: 'Fresh Berries' },
                { id: 'CMAU9876543', temp: -18.5, product: 'Atlantic Salmon' }
            ]
        },
        {
            id: 'msc-gulsun',
            name: 'MSC GÜLSUN',
            mmsi: '477542200',
            imo: '9854321',
            type: 'Container Ship',
            status: 'ontime',
            position: { lat: 23.456, lng: 56.789 },
            course: 180,
            speed: 22.3,
            destination: 'LONG BEACH',
            origin: 'SHANGHAI',
            eta: '2024-02-05T14:00:00',
            originalEta: '2024-02-05T14:00:00',
            delay: 0,
            containers: [
                { id: 'TEMU1234567', temp: 4.2, product: 'Electronics' }
            ]
        },
        {
            id: 'cma-marco',
            name: 'CMA CGM MARCO POLO',
            mmsi: '477542300',
            imo: '9456789',
            type: 'Container Ship',
            status: 'delayed',
            position: { lat: 51.962, lng: 4.178 },
            course: 0,
            speed: 0,
            destination: 'COLOMBO',
            origin: 'ROTTERDAM',
            eta: '2024-02-01T16:00:00',
            originalEta: '2024-01-31T10:00:00',
            delay: 30,
            delayReason: 'port-congestion',
            agentNotes: [
                {
                    time: '2024-01-30T11:00:00',
                    agent: 'Port Agent - Rotterdam',
                    message: 'Port congestion - 20 vessels in queue. Expected waiting time: 24 hours.',
                    type: 'port'
                }
            ]
        },
        {
            id: 'ever-given',
            name: 'EVER GIVEN',
            mmsi: '477542400',
            imo: '9811000',
            type: 'Container Ship',
            status: 'ontime',
            position: { lat: 30.123, lng: 32.456 },
            course: 90,
            speed: 15.8,
            destination: 'SINGAPORE',
            origin: 'PORT SAID',
            eta: '2024-02-10T12:00:00',
            originalEta: '2024-02-10T12:00:00',
            delay: 0
        },
        {
            id: 'cosco-shipping',
            name: 'COSCO SHIPPING',
            mmsi: '477542500',
            imo: '9654321',
            type: 'Container Ship',
            status: 'ontime',
            position: { lat: -33.456, lng: 151.789 },
            course: 135,
            speed: 20.1,
            destination: 'AUCKLAND',
            origin: 'SYDNEY',
            eta: '2024-02-04T08:00:00',
            originalEta: '2024-02-04T08:00:00',
            delay: 0
        }
    ];
    
    // ===== INITIALIZATION =====
    async function initDashboard() {
        console.log('🌊 Initializing vessel tracking dashboard...');
        
        // Initialize components
        initMap();
        initVessels();
        setupEventListeners();
        startRealTimeUpdates();
        initTemperatureChart();
        updateClock();
        
        console.log('✅ Dashboard ready with', vessels.length, 'vessels tracking');
    }
    
    // ===== MAP INITIALIZATION =====
    function initMap() {
        // Initialize Leaflet map with dark theme for ocean view
        map = L.map('vesselMap').setView(CONFIG.mapCenter, CONFIG.mapZoom);
        
        // Add dark ocean tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap, CryoChain, Marine Traffic',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Add ocean depth layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Ocean Basemap',
            maxZoom: 10,
            opacity: 0.3
        }).addTo(map);
        
        // Add scale control
        L.control.scale({ imperial: true }).addTo(map);
    }
    
    // ===== VESSEL INITIALIZATION =====
    function initVessels() {
        vessels = [...demoVessels];
        
        // Create vessel markers
        vessels.forEach(vessel => {
            createVesselMarker(vessel);
            
            // Create route if vessel is moving
            if (vessel.speed > 0) {
                createVesselRoute(vessel);
            }
        });
        
        // Update stats
        updateVesselStats();
        
        // Center map on all vessels
        fitMapToVessels();
    }
    
    function createVesselMarker(vessel) {
        // Custom vessel icon based on status
        const iconClass = `vessel-icon ${vessel.status}`;
        
        const vesselIcon = L.divIcon({
            className: 'vessel-marker',
            html: `
                <div class="${iconClass}" title="${vessel.name}">
                    <i class="fas fa-ship"></i>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        const marker = L.marker([vessel.position.lat, vessel.position.lng], {
            icon: vesselIcon
        }).addTo(map);
        
        // Add popup with vessel info
        const popupContent = createVesselPopup(vessel);
        marker.bindPopup(popupContent);
        
        // Add click handler for delay details
        marker.on('click', function() {
            if (vessel.status === 'delayed') {
                showDelayDetails(vessel);
            }
        });
        
        vesselMarkers.push({ vessel, marker });
        
        return marker;
    }
    
    function createVesselPopup(vessel) {
        const delayInfo = vessel.delay > 0 ? 
            `<div class="popup-delay">
                <i class="fas fa-clock"></i>
                <strong>Delay:</strong> ${vessel.delay} hours
                ${vessel.delayReason ? `<br><small>(${formatDelayReason(vessel.delayReason)})</small>` : ''}
            </div>` : '';
        
        return `
            <div class="vessel-popup">
                <h4>${vessel.name}</h4>
                <div class="popup-details">
                    <div><strong>MMSI:</strong> ${vessel.mmsi}</div>
                    <div><strong>IMO:</strong> ${vessel.imo}</div>
                    <div><strong>Position:</strong> ${vessel.position.lat.toFixed(3)}°, ${vessel.position.lng.toFixed(3)}°</div>
                    <div><strong>Speed:</strong> ${vessel.speed} knots</div>
                    <div><strong>Course:</strong> ${vessel.course}°</div>
                    <div><strong>Destination:</strong> ${vessel.destination}</div>
                    <div><strong>ETA:</strong> ${formatDate(vessel.eta)}</div>
                    ${delayInfo}
                </div>
                ${vessel.agentNotes && vessel.agentNotes.length > 0 ? 
                    `<div class="popup-notes">
                        <i class="fas fa-sticky-note"></i>
                        <strong>Agent Notes:</strong> ${vessel.agentNotes.length} available
                    </div>` : ''}
                <button onclick="trackVessel('${vessel.id}')" class="popup-button">
                    <i class="fas fa-satellite"></i> Track Vessel
                </button>
            </div>
        `;
    }
    
    function createVesselRoute(vessel) {
        // Create a simulated route from origin to destination
        const routePoints = generateRoutePoints(vessel);
        
        const route = L.polyline(routePoints, {
            color: getVesselColor(vessel.status),
            weight: 2,
            opacity: 0.7,
            dashArray: '10, 10',
            className: 'route-path'
        }).addTo(map);
        
        routes.push({ vessel, route });
        
        // Add animated vessel along the route
        if (vessel.speed > 0) {
            animateVesselAlongRoute(vessel, routePoints);
        }
    }
    
    function generateRoutePoints(vessel) {
        // Simplified route generation - in reality would use actual coordinates
        const points = [];
        const steps = 20;
        
        // Start at current position
        points.push([vessel.position.lat, vessel.position.lng]);
        
        // Generate points along the course
        for (let i = 1; i <= steps; i++) {
            const lat = vessel.position.lat + (Math.sin(vessel.course * Math.PI / 180) * i * 0.5);
            const lng = vessel.position.lng + (Math.cos(vessel.course * Math.PI / 180) * i * 0.5);
            points.push([lat, lng]);
        }
        
        return points;
    }
    
    function animateVesselAlongRoute(vessel, routePoints) {
        let currentPoint = 0;
        
        const animation = setInterval(() => {
            if (!simulationRunning) {
                clearInterval(animation);
                return;
            }
            
            const marker = vesselMarkers.find(m => m.vessel.id === vessel.id);
            if (marker && currentPoint < routePoints.length - 1) {
                currentPoint++;
                const newPos = routePoints[currentPoint];
                marker.marker.setLatLng(newPos);
                
                // Update vessel position
                vessel.position.lat = newPos[0];
                vessel.position.lng = newPos[1];
            }
        }, 1000 / CONFIG.simulationSpeed);
    }
    
    // ===== REAL-TIME UPDATES =====
    function startRealTimeUpdates() {
        // Update vessel positions
        setInterval(() => {
            if (simulationRunning) {
                updateVesselPositions();
                updateAISStatus();
            }
        }, CONFIG.updateInterval);
        
        // Update clock every second
        setInterval(updateClock, 1000);
        
        // Update temperature readings
        setInterval(updateTemperatureReadings, 5000);
    }
    
    function updateVesselPositions() {
        vessels.forEach(vessel => {
            if (vessel.speed > 0) {
                // Simulate movement
                const latDelta = (Math.random() - 0.5) * 0.01 * CONFIG.simulationSpeed;
                const lngDelta = (Math.random() - 0.5) * 0.01 * CONFIG.simulationSpeed;
                
                vessel.position.lat += latDelta;
                vessel.position.lng += lngDelta;
                
                // Update marker position
                const marker = vesselMarkers.find(m => m.vessel.id === vessel.id);
                if (marker) {
                    marker.marker.setLatLng([vessel.position.lat, vessel.position.lng]);
                }
            }
        });
    }
    
    function updateAISStatus() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.getElementById('aisUpdate').textContent = 
            `AIS Updated: ${timeString}`;
    }
    
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
        
        document.getElementById('currentTime').textContent = timeString;
    }
    
    // ===== TEMPERATURE CHART =====
    function initTemperatureChart() {
        const ctx = document.getElementById('tempChart').getContext('2d');
        
        tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
                datasets: [{
                    label: 'Reefer Container Temperature',
                    data: [2.8, 2.5, 2.7, 2.9, 3.1, 2.8, 2.8],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Temperature Limit (Max)',
                    data: [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Temperature Limit (Min)',
                    data: [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
                    borderColor: '#3b82f6',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '24-Hour Temperature Trend',
                        color: '#1e293b'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        min: 0,
                        max: 5
                    }
                }
            }
        });
    }
    
    function updateTemperatureReadings() {
        // Simulate temperature fluctuations
        const tempCards = document.querySelectorAll('.temp-card');
        tempCards.forEach(card => {
            if (Math.random() > 0.7) {
                const tempValue = card.querySelector('.temp-value');
                const currentTemp = parseFloat(tempValue.textContent);
                const fluctuation = (Math.random() - 0.5) * 0.2;
                const newTemp = Math.max(-25, Math.min(10, currentTemp + fluctuation));
                
                tempValue.textContent = `${newTemp.toFixed(1)}°C`;
                
                // Check for alerts
                if (newTemp > 3 || newTemp < -20) {
                    card.classList.add('alert');
                    card.classList.remove('normal');
                } else {
                    card.classList.add('normal');
                    card.classList.remove('alert');
                }
            }
        });
    }
    
    // ===== VESSEL STATS =====
    function updateVesselStats() {
        const active = vessels.length;
        const inTransit = vessels.filter(v => v.speed > 0).length;
        const delayed = vessels.filter(v => v.delay > 0).length;
        const etaToday = vessels.filter(v => {
            const eta = new Date(v.eta);
            const today = new Date();
            return eta.toDateString() === today.toDateString();
        }).length;
        
        document.getElementById('activeVessels').textContent = active;
        document.getElementById('inTransit').textContent = inTransit;
        document.getElementById('delayedVessels').textContent = delayed;
        document.getElementById('etaToday').textContent = etaToday;
    }
    
    // ===== DELAY DETAILS =====
    function showDelayDetails(vessel) {
        const modal = document.getElementById('delayModal');
        const modalBody = document.getElementById('delayModalBody');
        
        let notesHtml = '';
        if (vessel.agentNotes && vessel.agentNotes.length > 0) {
            notesHtml = `
                <div class="agent-notes-section">
                    <h4><i class="fas fa-sticky-note"></i> Agent Notes</h4>
                    ${vessel.agentNotes.map(note => `
                        <div class="note-card">
                            <div class="note-header">
                                <strong>${note.agent}</strong>
                                <span class="note-time">${formatDate(note.time)}</span>
                            </div>
                            <div class="note-content">${note.message}</div>
                            <div class="note-type">${formatNoteType(note.type)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        modalBody.innerHTML = `
            <div class="delay-modal-content">
                <div class="vessel-header">
                    <h3>${vessel.name}</h3>
                    <div class="delay-summary">
                        <div class="delay-item">
                            <span class="label">Total Delay:</span>
                            <span class="value">${vessel.delay} hours</span>
                        </div>
                        <div class="delay-item">
                            <span class="label">Original ETA:</span>
                            <span class="value">${formatDate(vessel.originalEta)}</span>
                        </div>
                        <div class="delay-item">
                            <span class="label">Revised ETA:</span>
                            <span class="value highlight">${formatDate(vessel.eta)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="delay-reason-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Delay Reason</h4>
                    <p>${getDelayDescription(vessel.delayReason)}</p>
                </div>
                
                ${notesHtml}
                
                <div class="impact-section">
                    <h4><i class="fas fa-chart-line"></i> Business Impact</h4>
                    <div class="impact-grid">
                        <div class="impact-item">
                            <div class="impact-label">Storage Costs</div>
                            <div class="impact-value">+$${vessel.delay * 350}</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Product Shelf Life</div>
                            <div class="impact-value">-${vessel.delay} hours</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Customer SLA</div>
                            <div class="impact-value">At Risk</div>
                        </div>
                        <div class="impact-item">
                            <div class="impact-label">Penalty Risk</div>
                            <div class="impact-value">$${vessel.delay * 500}</div>
                        </div>
                    </div>
                </div>
                
                <div class="actions-section">
                    <button class="btn btn-primary" onclick="contactAgent('${vessel.id}')">
                        <i class="fas fa-headset"></i> Contact Agent
                    </button>
                    <button class="btn btn-secondary" onclick="downloadDelayReport('${vessel.id}')">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Speed control slider
        const speedSlider = document.getElementById('speedControl');
        speedSlider.addEventListener('input', function() {
            CONFIG.simulationSpeed = parseInt(this.value);
            document.querySelector('.speed-labels span:nth-child(2)').textContent = 
                this.value === '5' ? 'Real-time' : 'Speed: ' + this.value;
        });
        
        // Map control buttons
        document.querySelectorAll('.btn-map-control').forEach(btn => {
            btn.addEventListener('click', function() {
                const layer = this.dataset.layer;
                
                // Update active state
                document.querySelectorAll('.btn-map-control').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                // Handle layer visibility
                handleMapLayer(layer);
            });
        });
        
        // Refresh map
        document.getElementById('refreshMap').addEventListener('click', () => {
            fitMapToVessels();
            showToast('🗺️ Map refreshed', 'success');
        });
        
        // View all temperature
        document.getElementById('viewAllTemp').addEventListener('click', () => {
            showToast('🌡️ Opening temperature dashboard...', 'info');
        });
        
        // Add note button
        document.getElementById('addNote').addEventListener('click', () => {
            showAddNoteModal();
        });
        
        // Download documents
        document.getElementById('downloadDocs').addEventListener('click', () => {
            downloadAllDocuments();
        });
        
        // Quick actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', function() {
                const action = this.dataset.action;
                handleQuickAction(action);
            });
        });
        
        // Modal close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('delayModal').classList.remove('active');
        });
        
        document.getElementById('closeMarineModal')?.addEventListener('click', () => {
            document.getElementById('marineTrafficModal').classList.remove('active');
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Delay info hover
        document.querySelectorAll('.delay-info').forEach(info => {
            info.addEventListener('click', function() {
                const vesselId = this.closest('.vessel-card').dataset.vessel;
                const vessel = vessels.find(v => v.id === vesselId);
                if (vessel) showDelayDetails(vessel);
            });
        });
        
        // Tooltip hover
        document.querySelectorAll('[onmouseover]').forEach(element => {
            const tooltipId = element.getAttribute('onmouseover').match(/'([^']+)'/)[1];
            element.addEventListener('mouseenter', () => showTooltip(tooltipId, element));
            element.addEventListener('mouseleave', hideTooltip);
        });
    }
    
    function handleMapLayer(layer) {
        // Hide all layers
        vesselMarkers.forEach(({ marker }) => map.removeLayer(marker));
        routes.forEach(({ route }) => map.removeLayer(route));
        
        // Show selected layer
        if (layer === 'vessels' || layer === 'all') {
            vesselMarkers.forEach(({ marker }) => marker.addTo(map));
        }
        
        if (layer === 'routes' || layer === 'all') {
            routes.forEach(({ route }) => route.addTo(map));
        }
        
        if (layer === 'ports') {
            // Add port markers (simplified)
            addPortMarkers();
        }
    }
    
    function addPortMarkers() {
        const ports = [
            { name: 'Singapore', lat: 1.283, lng: 103.833 },
            { name: 'Rotterdam', lat: 51.917, lng: 4.483 },
            { name: 'Shanghai', lat: 31.233, lng: 121.483 },
            { name: 'Long Beach', lat: 33.767, lng: -118.217 }
        ];
        
        ports.forEach(port => {
            L.marker([port.lat, port.lng], {
                icon: L.divIcon({
                    className: 'port-marker',
                    html: `<div class="port-icon"><i class="fas fa-anchor"></i></div>`,
                    iconSize: [30, 30]
                })
            })
            .bindPopup(`<strong>${port.name}</strong><br>Major Port`)
            .addTo(map);
        });
    }
    
    function fitMapToVessels() {
        if (vessels.length > 0) {
            const bounds = L.latLngBounds(vessels.map(v => [v.position.lat, v.position.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // ===== HELPER FUNCTIONS =====
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function formatDelayReason(reason) {
        const reasons = {
            'weather': 'Weather Conditions',
            'port-congestion': 'Port Congestion',
            'mechanical': 'Mechanical Issue',
            'labor': 'Labor Dispute',
            'customs': 'Customs Delay'
        };
        return reasons[reason] || 'Operational Delay';
    }
    
    function formatNoteType(type) {
        const types = {
            'weather': 'Weather Update',
            'route': 'Route Change',
            'port': 'Port Update',
            'customs': 'Customs'
        };
        return types[type] || 'General Update';
    }
    
    function getDelayDescription(reason) {
        const descriptions = {
            'weather': 'Severe weather conditions in the South China Sea have forced the vessel to reduce speed and alter course for safety. Expected to clear the storm system within 24 hours.',
            'port-congestion': 'Heavy port congestion at Rotterdam with 20+ vessels in queue. Port authorities are working to clear backlog, but delays are expected.',
            'mechanical': 'Minor mechanical issue detected. Vessel operating at reduced speed while repairs are conducted.',
            'labor': 'Port labor strike affecting operations. Negotiations underway with expected resolution within 48 hours.'
        };
        return descriptions[reason] || 'Operational delay encountered. Agent has been notified and is monitoring the situation.';
    }
    
    function getVesselColor(status) {
        const colors = {
            'delayed': '#f59e0b',
            'ontime': '#10b981',
            'at-port': '#8b5cf6',
            'default': '#3b82f6'
        };
        return colors[status] || colors.default;
    }
    
    // ===== UI FUNCTIONS =====
    function showTooltip(tooltipId, element) {
        const tooltip = document.getElementById(tooltipId);
        if (tooltip) {
            const rect = element.getBoundingClientRect();
            tooltip.style.display = 'block';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        }
    }
    
    function hideTooltip() {
        document.querySelectorAll('.tooltip').forEach(tooltip => {
            tooltip.style.display = 'none';
        });
    }
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideLeft 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    function showAddNoteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-sticky-note"></i> Add Agent Note</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Select Vessel</label>
                        <select id="noteVessel">
                            ${vessels.filter(v => v.delay > 0).map(v => 
                                `<option value="${v.id}">${v.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Note Type</label>
                        <select id="noteType">
                            <option value="weather">Weather Update</option>
                            <option value="port">Port Update</option>
                            <option value="route">Route Change</option>
                            <option value="customs">Customs</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Note</label>
                        <textarea id="noteContent" rows="4" placeholder="Enter agent note..."></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="submitAgentNote()">
                        <i class="fas fa-paper-plane"></i> Submit Note
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    function downloadAllDocuments() {
        showToast('📄 Preparing documents package...', 'info');
        
        setTimeout(() => {
            const data = {
                timestamp: new Date().toISOString(),
                vessels: vessels.length,
                documents: 24,
                size: '4.2 MB'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vessel-documents-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('✅ Documents downloaded successfully!', 'success');
        }, 2000);
    }
    
    function handleQuickAction(action) {
        switch (action) {
            case 'track-vessel':
                prompt('Enter Vessel Name or MMSI:', '').then(value => {
                    if (value) showToast(`Tracking vessel: ${value}`, 'info');
                });
                break;
                
            case 'marine-traffic':
                document.getElementById('marineTrafficModal').classList.add('active');
                break;
                
            case 'delay-report':
                generateDelayReport();
                break;
                
            case 'agent-contact':
                showToast('📞 Connecting to port agent...', 'info');
                break;
                
            case 'weather-check':
                showToast('🌤️ Checking weather routing...', 'info');
                break;
                
            case 'export':
                exportVesselData();
                break;
        }
    }
    
    function generateDelayReport() {
        showToast('📊 Generating delay analysis report...', 'info');
        
        const delayedVessels = vessels.filter(v => v.delay > 0);
        const totalDelay = delayedVessels.reduce((sum, v) => sum + v.delay, 0);
        const avgDelay = totalDelay / delayedVessels.length;
        
        const report = `
            CRYOCHAIN DELAY ANALYSIS REPORT
            ===============================
            Generated: ${new Date().toLocaleDateString()}
            
            SUMMARY:
            ----------
            Total Vessels: ${vessels.length}
            Delayed Vessels: ${delayedVessels.length}
            Total Delay Hours: ${totalDelay}
            Average Delay: ${avgDelay.toFixed(1)} hours
            
            DELAYED VESSELS:
            ----------
            ${delayedVessels.map(v => `
            • ${v.name}
              Delay: ${v.delay} hours
              Reason: ${formatDelayReason(v.delayReason)}
              Impact: $${v.delay * 500} estimated cost
            `).join('\n')}
            
            RECOMMENDATIONS:
            ----------
            1. Review weather routing for affected vessels
            2. Contact port agents for priority berthing
            3. Update customers on revised ETAs
            4. Monitor reefer temperatures during delays
            
            This report generated by CryoChain Intelligence Platform.
        `;
        
        setTimeout(() => {
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `delay-report-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('✅ Delay report generated!', 'success');
        }, 3000);
    }
    
    function exportVesselData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalVessels: vessels.length,
            vessels: vessels.map(v => ({
                name: v.name,
                mmsi: v.mmsi,
                status: v.status,
                position: v.position,
                speed: v.speed,
                delay: v.delay,
                eta: v.eta
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vessel-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('📤 Vessel data exported!', 'success');
    }
    
    // ===== GLOBAL FUNCTIONS =====
    window.trackVessel = function(vesselId) {
        const vessel = vessels.find(v => v.id === vesselId);
        if (vessel) {
            map.setView([vessel.position.lat, vessel.position.lng], 8);
            const marker = vesselMarkers.find(m => m.vessel.id === vesselId);
            if (marker) marker.marker.openPopup();
            showToast(`📍 Centered on ${vessel.name}`, 'success');
        }
    };
    
    window.contactAgent = function(vesselId) {
        const vessel = vessels.find(v => v.id === vesselId);
        if (vessel) {
            showToast(`📞 Calling agent for ${vessel.name}...`, 'info');
            // In real app, this would initiate a call or open chat
        }
    };
    
    window.downloadDelayReport = function(vesselId) {
        const vessel = vessels.find(v => v.id === vesselId);
        if (vessel) {
            const report = `
                VESSEL DELAY REPORT: ${vessel.name}
                ===============================
                Date: ${new Date().toLocaleDateString()}
                
                VESSEL DETAILS:
                -------------
                Name: ${vessel.name}
                MMSI: ${vessel.mmsi}
                IMO: ${vessel.imo}
                
                DELAY INFORMATION:
                -------------
                Delay Reason: ${formatDelayReason(vessel.delayReason)}
                Total Delay: ${vessel.delay} hours
                Original ETA: ${formatDate(vessel.originalEta)}
                Revised ETA: ${formatDate(vessel.eta)}
                
                AGENT NOTES:
                -------------
                ${vessel.agentNotes ? vessel.agentNotes.map(n => 
                    `• ${formatDate(n.time)} - ${n.agent}: ${n.message}`
                ).join('\n') : 'No agent notes available.'}
                
                IMPACT ASSESSMENT:
                -------------
                • Storage Costs: $${vessel.delay * 350}
                • Potential Penalties: $${vessel.delay * 500}
                • Customer Impact: High
                • Shelf Life Reduction: ${vessel.delay} hours
                
                RECOMMENDED ACTIONS:
                -------------
                1. Monitor temperature closely
                2. Update all stakeholders
                3. Review insurance coverage
                4. Prepare for port arrival
            `;
            
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${vessel.name}-delay-report.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast(`✅ Report for ${vessel.name} downloaded`, 'success');
        }
    };
    
    window.submitAgentNote = function() {
        const vesselId = document.getElementById('noteVessel').value;
        const noteType = document.getElementById('noteType').value;
        const noteContent = document.getElementById('noteContent').value;
        
        if (!noteContent.trim()) {
            showToast('Please enter a note', 'warning');
            return;
        }
        
        const vessel = vessels.find(v => v.id === vesselId);
        if (vessel) {
            if (!vessel.agentNotes) vessel.agentNotes = [];
            vessel.agentNotes.push({
                time: new Date().toISOString(),
                agent: 'Your Team',
                message: noteContent,
                type: noteType
            });
            
            showToast('✅ Note added successfully', 'success');
            document.querySelector('.modal').remove();
            
            // Refresh delay details if open
            if (document.getElementById('delayModal').classList.contains('active')) {
                showDelayDetails(vessel);
            }
        }
    };
    
    // Initialize dashboard
    initDashboard();
});
