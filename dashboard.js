// ===== CRYOCHAIN DASHBOARD SCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CryoChain Dashboard initialized');
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        mapCenter: [20, 0],
        mapZoom: 2,
        updateInterval: 5000, // 5 seconds for real-time feel
        demoMode: true,
        carriers: ['Maersk', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd', 'DHL', 'UPS', 'FedEx']
    };
    
    // ===== GLOBAL VARIABLES =====
    let map = null;
    let shipments = [];
    let markers = [];
    let mapLayers = {
        shipments: L.layerGroup(),
        temperature: L.layerGroup(),
        routes: L.layerGroup()
    };
    let tempChart = null;
    
    // ===== INITIALIZATION =====
    async function initDashboard() {
        console.log('📊 Initializing dashboard...');
        
        // Check authentication
        checkAuth();
        
        // Initialize components
        initMap();
        await loadDemoData();
        setupEventListeners();
        startRealTimeUpdates();
        startContainerAnimations();
        
        // Update UI
        updateLastUpdatedTime();
        
        console.log('✅ Dashboard ready with', shipments.length, 'active shipments');
    }
    
    // ===== AUTHENTICATION CHECK =====
    function checkAuth() {
        const isAuthenticated = localStorage.getItem('cryochain_auth') === 'true' || true; // Demo mode
        if (!isAuthenticated) {
            window.location.href = 'index.html';
        }
    }
    
    // ===== MAP INITIALIZATION =====
    function initMap() {
        // Initialize Leaflet map
        map = L.map('trackingMap').setView(CONFIG.mapCenter, CONFIG.mapZoom);
        
        // Add tile layer (free tiles from CartoDB)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        // Add scale control
        L.control.scale({ imperial: false }).addTo(map);
        
        // Add layers to map
        Object.values(mapLayers).forEach(layer => layer.addTo(map));
    }
    
    // ===== DEMO DATA LOADING =====
    async function loadDemoData() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample shipment data with realistic locations
        shipments = [
            {
                id: 'SC-2024-4821',
                product: 'Fresh Blueberries',
                productType: 'fruits',
                origin: { 
                    name: 'Santiago, Chile', 
                    lat: -33.4489, 
                    lng: -70.6693, 
                    flag: '🇨🇱',
                    code: 'SCL'
                },
                destination: { 
                    name: 'Amsterdam, Netherlands', 
                    lat: 52.3676, 
                    lng: 4.9041, 
                    flag: '🇳🇱',
                    code: 'AMS'
                },
                currentLocation: { 
                    name: 'Atlantic Ocean', 
                    lat: getRandomLat(-20, 10), 
                    lng: getRandomLng(-40, -20), 
                    flag: '🌊',
                    code: 'ATL'
                },
                carrier: 'Maersk',
                containerId: 'MSCU1234567',
                temperature: { 
                    current: 2.8, 
                    min: 2.0, 
                    max: 3.5, 
                    unit: '°C', 
                    status: 'normal',
                    history: generateTempHistory(2.0, 3.5)
                },
                humidity: { current: 75, min: 70, max: 80 },
                status: 'in-transit',
                progress: 65,
                atd: '2024-01-15',
                eta: '2024-02-05',
                nextPort: 'Rotterdam, NL',
                documents: {
                    billOfLading: { status: 'complete', date: '2024-01-14' },
                    certificateOfOrigin: { status: 'complete', date: '2024-01-14' },
                    phytosanitary: { status: 'pending', date: null },
                    healthCertificate: { status: 'complete', date: '2024-01-15' },
                    commercialInvoice: { status: 'complete', date: '2024-01-14' }
                },
                alerts: [],
                lastUpdated: new Date().toISOString(),
                history: generateActivityHistory('SC-2024-4821')
            },
            {
                id: 'SC-2024-5123',
                product: 'Atlantic Salmon',
                productType: 'seafood',
                origin: { 
                    name: 'Oslo, Norway', 
                    lat: 59.9139, 
                    lng: 10.7522, 
                    flag: '🇳🇴',
                    code: 'OSL'
                },
                destination: { 
                    name: 'Tokyo, Japan', 
                    lat: 35.6762, 
                    lng: 139.6503, 
                    flag: '🇯🇵',
                    code: 'NRT'
                },
                currentLocation: { 
                    name: 'Suez Canal', 
                    lat: 30.5852, 
                    lng: 32.2654, 
                    flag: '🇪🇬',
                    code: 'SUZ'
                },
                carrier: 'MSC',
                containerId: 'MSCU7654321',
                temperature: { 
                    current: -21.5, 
                    min: -25, 
                    max: -18, 
                    unit: '°C', 
                    status: 'alert',
                    history: generateTempHistory(-25, -18, true)
                },
                humidity: { current: 85, min: 80, max: 90 },
                status: 'delayed',
                progress: 40,
                atd: '2024-01-20',
                eta: '2024-02-15',
                nextPort: 'Singapore, SG',
                documents: {
                    billOfLading: { status: 'complete', date: '2024-01-19' },
                    certificateOfOrigin: { status: 'complete', date: '2024-01-19' },
                    phytosanitary: { status: 'complete', date: '2024-01-19' },
                    healthCertificate: { status: 'missing', date: null },
                    commercialInvoice: { status: 'pending', date: null }
                },
                alerts: ['Temperature fluctuation detected', 'Customs delay expected'],
                lastUpdated: new Date().toISOString(),
                history: generateActivityHistory('SC-2024-5123')
            },
            {
                id: 'SC-2024-4987',
                product: 'COVID-19 Vaccines',
                productType: 'pharma',
                origin: { 
                    name: 'Basel, Switzerland', 
                    lat: 47.5596, 
                    lng: 7.5886, 
                    flag: '🇨🇭',
                    code: 'BSL'
                },
                destination: { 
                    name: 'Singapore', 
                    lat: 1.3521, 
                    lng: 103.8198, 
                    flag: '🇸🇬',
                    code: 'SIN'
                },
                currentLocation: { 
                    name: 'Dubai Airport', 
                    lat: 25.2532, 
                    lng: 55.3657, 
                    flag: '🇦🇪',
                    code: 'DXB'
                },
                carrier: 'DHL',
                containerId: 'DHL12345678',
                temperature: { 
                    current: 4.8, 
                    min: 2, 
                    max: 8, 
                    unit: '°C', 
                    status: 'warning',
                    history: generateTempHistory(2, 8)
                },
                humidity: { current: 65, min: 60, max: 70 },
                status: 'in-transit',
                progress: 75,
                atd: '2024-01-18',
                eta: '2024-01-25',
                nextPort: 'Bangkok, TH',
                documents: {
                    billOfLading: { status: 'complete', date: '2024-01-17' },
                    certificateOfOrigin: { status: 'complete', date: '2024-01-17' },
                    phytosanitary: { status: 'complete', date: '2024-01-17' },
                    healthCertificate: { status: 'complete', date: '2024-01-17' },
                    commercialInvoice: { status: 'complete', date: '2024-01-17' }
                },
                alerts: ['Approaching upper temp limit'],
                lastUpdated: new Date().toISOString(),
                history: generateActivityHistory('SC-2024-4987')
            },
            // Add more sample shipments...
            {
                id: 'SC-2024-5109',
                product: 'Hass Avocados',
                productType: 'fruits',
                origin: { 
                    name: 'Mexico City, Mexico', 
                    lat: 19.4326, 
                    lng: -99.1332, 
                    flag: '🇲🇽',
                    code: 'MEX'
                },
                destination: { 
                    name: 'London, UK', 
                    lat: 51.5074, 
                    lng: -0.1278, 
                    flag: '🇬🇧',
                    code: 'LHR'
                },
                currentLocation: { 
                    name: 'Mid-Atlantic', 
                    lat: getRandomLat(20, 40), 
                    lng: getRandomLng(-50, -30), 
                    flag: '🌊',
                    code: 'ATL'
                },
                carrier: 'Maersk',
                containerId: 'MAEU9876543',
                temperature: { 
                    current: 4.5, 
                    min: 4, 
                    max: 5, 
                    unit: '°C', 
                    status: 'normal',
                    history: generateTempHistory(4, 5)
                },
                humidity: { current: 78, min: 75, max: 80 },
                status: 'on-time',
                progress: 70,
                atd: '2024-01-16',
                eta: '2024-02-01',
                nextPort: 'Southampton, UK',
                documents: {
                    billOfLading: { status: 'complete', date: '2024-01-15' },
                    certificateOfOrigin: { status: 'complete', date: '2024-01-15' },
                    phytosanitary: { status: 'complete', date: '2024-01-15' },
                    healthCertificate: { status: 'complete', date: '2024-01-15' },
                    commercialInvoice: { status: 'complete', date: '2024-01-15' }
                },
                alerts: [],
                lastUpdated: new Date().toISOString(),
                history: generateActivityHistory('SC-2024-5109')
            }
        ];
        
        // Update all dashboard components
        updateDashboardStats();
        updateShipmentsTable();
        updateDocumentsList();
        updateActivityTimeline();
        updateMapMarkers();
        
        showToast('📦 Demo data loaded successfully', 'success');
    }
    
    // ===== HELPER FUNCTIONS =====
    function getRandomLat(min, max) {
        return min + Math.random() * (max - min);
    }
    
    function getRandomLng(min, max) {
        return min + Math.random() * (max - min);
    }
    
    function generateTempHistory(min, max, hasAlert = false) {
        const history = [];
        const now = new Date();
        for (let i = 24; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            let temp = min + Math.random() * (max - min);
            
            // Add occasional alert simulation
            if (hasAlert && i === 6) {
                temp = min - 2; // Simulate temperature drop
            }
            
            history.push({
                time: time.toISOString(),
                temperature: parseFloat(temp.toFixed(1))
            });
        }
        return history;
    }
    
    function generateActivityHistory(shipmentId) {
        const activities = [
            { action: 'created', details: 'Shipment created in system' },
            { action: 'documented', details: 'Initial documentation completed' },
            { action: 'loaded', details: 'Loaded at origin warehouse' },
            { action: 'departed', details: 'Departed from origin' },
            { action: 'in-transit', details: 'In transit to destination' },
            { action: 'checked', details: 'Routine temperature check passed' }
        ];
        
        return activities.map((activity, index) => ({
            id: `${shipmentId}-${index}`,
            time: new Date(Date.now() - (activities.length - index) * 4 * 60 * 60 * 1000).toISOString(),
            text: activity.details,
            type: activity.action,
            shipmentId: shipmentId
        }));
    }
    
    function getProductIcon(productType) {
        const icons = {
            'fruits': 'fas fa-apple-alt',
            'seafood': 'fas fa-fish',
            'pharma': 'fas fa-pills',
            'floral': 'fas fa-leaf',
            'meat': 'fas fa-drumstick-bite',
            'dairy': 'fas fa-cheese'
        };
        return icons[productType] || 'fas fa-box';
    }
    
    function formatStatus(status) {
        const statusMap = {
            'in-transit': 'In Transit',
            'delayed': 'Delayed',
            'on-time': 'On Time',
            'delivered': 'Delivered',
            'pending': 'Pending'
        };
        return statusMap[status] || status;
    }
    
    function getStatusColor(status, tempStatus) {
        if (tempStatus === 'alert') return '#ef4444';
        if (tempStatus === 'warning') return '#f59e0b';
        if (status === 'delayed') return '#f59e0b';
        if (status === 'on-time') return '#10b981';
        return '#3b82f6'; // in-transit default
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // ===== UPDATE FUNCTIONS =====
    function updateDashboardStats() {
        const active = shipments.length;
        const inTransit = shipments.filter(s => s.status === 'in-transit').length;
        const onSchedule = shipments.filter(s => s.status === 'on-time').length;
        const tempAlerts = shipments.filter(s => s.temperature.status === 'alert').length;
        
        document.getElementById('activeShipments').textContent = active;
        document.getElementById('inTransit').textContent = inTransit;
        document.getElementById('onSchedule').textContent = onSchedule;
        document.getElementById('tempAlerts').textContent = tempAlerts;
        
        // Update compliance percentage
        const totalDocs = shipments.reduce((acc, shipment) => {
            return acc + Object.values(shipment.documents).length;
        }, 0);
        
        const completedDocs = shipments.reduce((acc, shipment) => {
            return acc + Object.values(shipment.documents).filter(doc => doc.status === 'complete').length;
        }, 0);
        
        const compliancePercent = Math.round((completedDocs / totalDocs) * 100);
        document.getElementById('compliancePercent').textContent = `${compliancePercent}%`;
        document.querySelector('.meter-fill').style.width = `${compliancePercent}%`;
    }
    
    function updateShipmentsTable() {
        const tableBody = document.getElementById('shipmentsTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        shipments.forEach((shipment, index) => {
            const row = document.createElement('tr');
            row.className = 'shipment-row fade-in';
            row.dataset.id = shipment.id;
            row.style.animationDelay = `${index * 0.1}s`;
            
            // Determine CSS classes
            const statusClass = `status-${shipment.status.replace('-', '')}`;
            const tempClass = `temp-${shipment.temperature.status}`;
            
            row.innerHTML = `
                <td class="shipment-id">
                    <strong>${shipment.id}</strong><br>
                    <small>${shipment.containerId}</small>
                </td>
                <td>
                    <div class="shipment-product">
                        <div class="product-icon ${shipment.productType}">
                            <i class="${getProductIcon(shipment.productType)}"></i>
                        </div>
                        <div>
                            <div>${shipment.product}</div>
                            <small class="text-muted">${shipment.carrier}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="route-info">
                        <span class="route-origin">
                            <span class="location-flag">${shipment.origin.flag}</span>
                            ${shipment.origin.name}
                        </span>
                        <span class="route-arrow">
                            <i class="fas fa-arrow-right"></i>
                        </span>
                        <span class="route-destination">
                            <span class="location-flag">${shipment.destination.flag}</span>
                            ${shipment.destination.name}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="location-info">
                        <span class="location-flag">${shipment.currentLocation.flag}</span>
                        <span>${shipment.currentLocation.name}</span>
                    </div>
                </td>
                <td>
                    <div class="temperature-display ${tempClass}" onclick="showTemperatureChart('${shipment.id}')">
                        <i class="fas fa-thermometer-half"></i>
                        ${shipment.temperature.current}${shipment.temperature.unit}
                    </div>
                </td>
                <td>
                    <div class="humidity-display">
                        <i class="fas fa-tint"></i>
                        ${shipment.humidity.current}%
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${formatStatus(shipment.status)}
                    </span>
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${shipment.progress}%"></div>
                        </div>
                        <div class="progress-text">${shipment.progress}% • ETA: ${formatDate(shipment.eta)}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewShipmentDetails('${shipment.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="trackShipment('${shipment.id}')" title="Track on Map">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="downloadDocuments('${shipment.id}')" title="Download Documents">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function updateDocumentsList() {
        const container = document.getElementById('documentsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Get all documents from all shipments
        const allDocuments = [];
        shipments.forEach(shipment => {
            Object.entries(shipment.documents).forEach(([docName, docInfo]) => {
                allDocuments.push({
                    name: docName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    status: docInfo.status,
                    date: docInfo.date,
                    shipmentId: shipment.id,
                    type: docName
                });
            });
        });
        
        // Sort by status (missing/pending first)
        allDocuments.sort((a, b) => {
            const statusOrder = { 'missing': 0, 'pending': 1, 'complete': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
        
        // Display first 6 documents
        allDocuments.slice(0, 6).forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item slide-in';
            docItem.onclick = () => viewDocument(doc.shipmentId, doc.type);
            
            const docIcon = getDocumentIcon(doc.type);
            
            docItem.innerHTML = `
                <div class="document-icon">
                    <i class="${docIcon}"></i>
                </div>
                <div class="document-info">
                    <div class="document-name">${doc.name}</div>
                    <div class="document-meta">${doc.shipmentId} • ${doc.date ? formatDate(doc.date) : 'Not submitted'}</div>
                </div>
                <span class="document-status ${doc.status}">${doc.status.toUpperCase()}</span>
            `;
            
            container.appendChild(docItem);
        });
    }
    
    function getDocumentIcon(docType) {
        const icons = {
            'billOfLading': 'fas fa-file-invoice',
            'certificateOfOrigin': 'fas fa-globe-americas',
            'phytosanitary': 'fas fa-leaf',
            'healthCertificate': 'fas fa-heartbeat',
            'commercialInvoice': 'fas fa-file-invoice-dollar'
        };
        return icons[docType] || 'fas fa-file';
    }
    
    function updateActivityTimeline() {
        const container = document.getElementById('activityTimeline');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Get all activities from all shipments
        const allActivities = shipments.flatMap(shipment => shipment.history);
        
        // Sort by time (newest first)
        allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Display first 5 activities
        allActivities.slice(0, 5).forEach((activity, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item fade-in';
            timelineItem.style.animationDelay = `${index * 0.2}s`;
            
            timelineItem.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-time">
                        <i class="far fa-clock"></i>
                        ${formatDate(activity.time)}
                    </div>
                    <div class="timeline-text">${activity.text}</div>
                    <div class="timeline-details">
                        <i class="fas fa-ship"></i> ${activity.shipmentId}
                    </div>
                </div>
            `;
            
            container.appendChild(timelineItem);
        });
    }
    
    function updateMapMarkers() {
        // Clear existing markers
        mapLayers.shipments.clearLayers();
        
        shipments.forEach(shipment => {
            const markerColor = getStatusColor(shipment.status, shipment.temperature.status);
            
            // Create custom marker icon
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        background: ${markerColor};
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        cursor: pointer;
                        animation: pulse 2s infinite;
                    ">
                        <i class="fas fa-${shipment.productType === 'pharma' ? 'pills' : 'box'}"></i>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker(
                [shipment.currentLocation.lat, shipment.currentLocation.lng],
                { icon: markerIcon }
            ).addTo(mapLayers.shipments);
            
            // Add popup with shipment info
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2980;">
                        <i class="fas fa-ship"></i> ${shipment.id}
                    </h4>
                    <p style="margin: 5px 0;">
                        <strong>Product:</strong> ${shipment.product}<br>
                        <strong>Carrier:</strong> ${shipment.carrier}<br>
                        <strong>Container:</strong> ${shipment.containerId}<br>
                        <strong>Temperature:</strong> 
                        <span style="color: ${shipment.temperature.status === 'alert' ? '#ef4444' : shipment.temperature.status === 'warning' ? '#f59e0b' : '#10b981'}">
                            ${shipment.temperature.current}°C
                        </span><br>
                        <strong>Status:</strong> ${formatStatus(shipment.status)}<br>
                        <strong>Location:</strong> ${shipment.currentLocation.name}
                    </p>
                    <button onclick="trackShipment('${shipment.id}')" 
                            style="
                                background: linear-gradient(135deg, #1a2980, #26d0ce);
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;
                                width: 100%;
                                margin-top: 10px;
                            ">
                        <i class="fas fa-map-marker-alt"></i> Track Shipment
                    </button>
                </div>
            `);
            
            // Add route line (origin to current location)
            const routeLine = L.polyline([
                [shipment.origin.lat, shipment.origin.lng],
                [shipment.currentLocation.lat, shipment.currentLocation.lng]
            ], {
                color: markerColor,
                weight: 2,
                opacity: 0.7,
                dashArray: '5, 5'
            }).addTo(mapLayers.routes);
        });
        
        // Fit map to show all markers
        if (shipments.length > 0) {
            const bounds = L.latLngBounds(shipments.map(s => [s.currentLocation.lat, s.currentLocation.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Map controls
        document.querySelectorAll('.btn-map-control').forEach(btn => {
            btn.addEventListener('click', function() {
                const layer = this.dataset.layer;
                
                // Update button states
                document.querySelectorAll('.btn-map-control').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide layers
                Object.entries(mapLayers).forEach(([key, layerGroup]) => {
                    if (key === layer) {
                        map.addLayer(layerGroup);
                    } else {
                        map.removeLayer(layerGroup);
                    }
                });
            });
        });
        
        // Center map button
        document.getElementById('centerMap')?.addEventListener('click', () => {
            if (shipments.length > 0) {
                const bounds = L.latLngBounds(shipments.map(s => [s.currentLocation.lat, s.currentLocation.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            } else {
                map.setView(CONFIG.mapCenter, CONFIG.mapZoom);
            }
        });
        
        // Quick action buttons
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', function() {
                const action = this.dataset.action;
                handleQuickAction(action);
            });
        });
        
        // Modal close buttons
        document.getElementById('closeModal')?.addEventListener('click', () => {
            document.getElementById('shipmentModal').classList.remove('active');
        });
        
        document.getElementById('closeTempModal')?.addEventListener('click', () => {
            document.getElementById('tempModal').classList.remove('active');
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // New shipment button
        document.getElementById('newShipmentBtn')?.addEventListener('click', () => {
            showToast('🚢 New shipment feature coming soon!', 'info');
        });
        
        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            exportData();
        });
        
        // Refresh timeline
        document.getElementById('refreshTimeline')?.addEventListener('click', () => {
            updateActivityTimeline();
            showToast('🔄 Timeline refreshed', 'success');
        });
        
        // Upload document button
        document.getElementById('uploadDocBtn')?.addEventListener('click', () => {
            showToast('📄 Document upload feature coming soon!', 'info');
        });
        
        // Logout button
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            localStorage.removeItem('cryochain_auth');
            window.location.href = 'index.html';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                exportData();
            }
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }
    
    // ===== REAL-TIME UPDATES =====
    function startRealTimeUpdates() {
        // Update data every 5 seconds
        setInterval(() => {
            updateShipmentPositions();
            updateLastUpdatedTime();
        }, CONFIG.updateInterval);
        
        // Update UI animations
        setInterval(() => {
            animateTemperatureReadings();
        }, 3000);
    }
    
    function updateShipmentPositions() {
        // Simulate movement by slightly adjusting positions
        shipments.forEach(shipment => {
            if (shipment.status === 'in-transit' || shipment.status === 'delayed') {
                // Move towards destination (simplified)
                const latDiff = shipment.destination.lat - shipment.currentLocation.lat;
                const lngDiff = shipment.destination.lng - shipment.currentLocation.lng;
                
                // Move 1% closer to destination
                shipment.currentLocation.lat += latDiff * 0.01;
                shipment.currentLocation.lng += lngDiff * 0.01;
                
                // Update progress
                const distanceRemaining = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                shipment.progress = Math.min(99, shipment.progress + 0.5);
                
                // Simulate temperature fluctuations
                if (shipment.temperature.status !== 'alert') {
                    const fluctuation = (Math.random() - 0.5) * 0.5;
                    shipment.temperature.current += fluctuation;
                    
                    // Check if temperature goes out of range
                    if (shipment.temperature.current < shipment.temperature.min) {
                        shipment.temperature.current = shipment.temperature.min + 0.1;
                        shipment.temperature.status = 'warning';
                        shipment.alerts.push('Temperature approaching lower limit');
                        showToast(`⚠️ ${shipment.id}: Temperature alert!`, 'warning');
                    } else if (shipment.temperature.current > shipment.temperature.max) {
                        shipment.temperature.current = shipment.temperature.max - 0.1;
                        shipment.temperature.status = 'warning';
                        shipment.alerts.push('Temperature approaching upper limit');
                        showToast(`⚠️ ${shipment.id}: Temperature alert!`, 'warning');
                    } else {
                        shipment.temperature.status = 'normal';
                    }
                    
                    // Add to temperature history
                    shipment.temperature.history.push({
                        time: new Date().toISOString(),
                        temperature: parseFloat(shipment.temperature.current.toFixed(1))
                    });
                    
                    // Keep only last 25 readings
                    if (shipment.temperature.history.length > 25) {
                        shipment.temperature.history.shift();
                    }
                }
                
                shipment.lastUpdated = new Date().toISOString();
            }
        });
        
        // Update UI
        updateDashboardStats();
        updateShipmentsTable();
        updateMapMarkers();
    }
    
    function updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdatedTime').textContent = `Last updated: ${timeString}`;
    }
    
    function animateTemperatureReadings() {
        document.querySelectorAll('.temperature-display').forEach(display => {
            if (display.classList.contains('temp-alert') || display.classList.contains('temp-warning')) {
                display.classList.add('shake-alert');
                setTimeout(() => {
                    display.classList.remove('shake-alert');
                }, 500);
            }
        });
    }
    
    // ===== CONTAINER ANIMATIONS =====
    function startContainerAnimations() {
        const containers = document.querySelectorAll('.container-item');
        containers.forEach((container, index) => {
            // Randomize animation properties
            const duration = 20 + Math.random() * 10;
            const delay = index * 5;
            
            container.style.animationDuration = `${duration}s`;
            container.style.animationDelay = `-${delay}s`;
            container.style.animationTimingFunction = 'linear';
        });
    }
    
    // ===== QUICK ACTION HANDLERS =====
    function handleQuickAction(action) {
        switch (action) {
            case 'track':
                showToast('🔍 Enter tracking number to track shipment', 'info');
                break;
            case 'document':
                showToast('📁 Document upload dialog opening...', 'info');
                break;
            case 'alert':
                showToast('🔔 Alert settings panel opening...', 'info');
                break;
            case 'report':
                generateReport();
                break;
            case 'api':
                showToast('🔗 API integration guide opening...', 'info');
                break;
            case 'help':
                showToast('❓ Opening help center...', 'info');
                break;
        }
    }
    
    // ===== EXPORT FUNCTIONALITY =====
    function exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            totalShipments: shipments.length,
            shipments: shipments.map(s => ({
                id: s.id,
                product: s.product,
                status: s.status,
                temperature: s.temperature.current,
                progress: s.progress,
                eta: s.eta
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cryochain-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('📥 Data exported successfully!', 'success');
    }
    
    function generateReport() {
        showToast('📊 Generating monthly performance report...', 'info');
        
        // Simulate report generation
        setTimeout(() => {
            showToast('✅ Report generated! Download starting...', 'success');
            
            // Create a simple HTML report
            const reportContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>CryoChain Monthly Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #1a2980; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f8fafc; }
                        .success { color: #10b981; }
                        .warning { color: #f59e0b; }
                        .alert { color: #ef4444; }
                    </style>
                </head>
                <body>
                    <h1>📊 CryoChain Monthly Performance Report</h1>
                    <p>Generated: ${new Date().toLocaleDateString()}</p>
                    
                    <h2>Summary</h2>
                    <ul>
                        <li>Total Shipments: ${shipments.length}</li>
                        <li>On-time Delivery: ${shipments.filter(s => s.status === 'on-time').length}</li>
                        <li>Temperature Compliance: ${Math.round((shipments.filter(s => s.temperature.status === 'normal').length / shipments.length) * 100)}%</li>
                        <li>Document Completion: ${document.getElementById('compliancePercent').textContent}</li>
                    </ul>
                    
                    <h2>Shipment Details</h2>
                    <table>
                        <tr>
                            <th>Shipment ID</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Temperature</th>
                            <th>Progress</th>
                        </tr>
                        ${shipments.map(s => `
                            <tr>
                                <td>${s.id}</td>
                                <td>${s.product}</td>
                                <td class="${s.status === 'on-time' ? 'success' : s.status === 'delayed' ? 'alert' : 'warning'}">${formatStatus(s.status)}</td>
                                <td class="${s.temperature.status === 'normal' ? 'success' : s.temperature.status === 'alert' ? 'alert' : 'warning'}">${s.temperature.current}°C</td>
                                <td>${s.progress}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
                </html>
            `;
            
            const blob = new Blob([reportContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cryochain-report-${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    }
    
    // ===== TOAST NOTIFICATIONS =====
    function showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} slide-in`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
            animation: slideLeft 0.3s ease-out;
        `;
        
        const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
        
        toast.innerHTML = `
            <span style="font-size: 1.2em;">${icon}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    // ===== GLOBAL FUNCTIONS (called from HTML) =====
    window.viewShipmentDetails = function(shipmentId) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="shipment-details">
                <div class="detail-header">
                    <h4>${shipment.product}</h4>
                    <span class="status-badge status-${shipment.status.replace('-', '')}">
                        ${formatStatus(shipment.status)}
                    </span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <label><i class="fas fa-hashtag"></i> Shipment ID</label>
                        <p>${shipment.id}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-box"></i> Container ID</label>
                        <p>${shipment.containerId}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-shipping-fast"></i> Carrier</label>
                        <p>${shipment.carrier}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-thermometer-half"></i> Current Temperature</label>
                        <p class="temp-${shipment.temperature.status}">
                            ${shipment.temperature.current}${shipment.temperature.unit}
                            (Range: ${shipment.temperature.min} - ${shipment.temperature.max}${shipment.temperature.unit})
                        </p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-tint"></i> Humidity</label>
                        <p>${shipment.humidity.current}%</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-map-pin"></i> Current Location</label>
                        <p>${shipment.currentLocation.name}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar-alt"></i> Departure</label>
                        <p>${formatDate(shipment.atd)}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-calendar-check"></i> Estimated Arrival</label>
                        <p>${formatDate(shipment.eta)}</p>
                    </div>
                    <div class="detail-item">
                        <label><i class="fas fa-anchor"></i> Next Port</label>
                        <p>${shipment.nextPort}</p>
                    </div>
                </div>
                
                ${shipment.alerts.length > 0 ? `
                    <div class="alerts-section">
                        <h5><i class="fas fa-exclamation-triangle"></i> Alerts</h5>
                        <ul>
                            ${shipment.alerts.map(alert => `<li>${alert}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="documents-section">
                    <h5><i class="fas fa-file-alt"></i> Required Documents</h5>
                    <div class="documents-grid">
                        ${Object.entries(shipment.documents).map(([doc, info]) => `
                            <div class="document-status-item ${info.status}">
                                <i class="${getDocumentIcon(doc)}"></i>
                                <span>${doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                <span class="doc-status">${info.status.toUpperCase()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <style>
                .shipment-details { font-size: 14px; }
                .detail-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .detail-item label {
                    font-weight: 600;
                    color: #64748b;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .detail-item p {
                    margin: 0;
                    color: #1e293b;
                }
                .alerts-section {
                    background: #fef2f2;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #ef4444;
                }
                .alerts-section h5 { 
                    color: #dc2626; 
                    margin: 0 0 10px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .alerts-section ul {
                    margin: 0;
                    padding-left: 20px;
                    color: #991b1b;
                }
                .documents-section h5 {
                    color: #475569;
                    margin: 0 0 15px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .documents-grid {
                    display: grid;
                    gap: 10px;
                }
                .document-status-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }
                .document-status-item.complete {
                    border-left: 4px solid #10b981;
                }
                .document-status-item.pending {
                    border-left: 4px solid #f59e0b;
                }
                .document-status-item.missing {
                    border-left: 4px solid #ef4444;
                }
                .doc-status {
                    margin-left: auto;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .document-status-item.complete .doc-status {
                    background: #10b981;
                    color: white;
                }
                .document-status-item.pending .doc-status {
                    background: #f59e0b;
                    color: white;
                }
                .document-status-item.missing .doc-status {
                    background: #ef4444;
                    color: white;
                }
            </style>
        `;
        
        document.getElementById('shipmentModal').classList.add('active');
    };
    
    window.trackShipment = function(shipmentId) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        // Center map on this shipment
        map.setView([shipment.currentLocation.lat, shipment.currentLocation.lng], 5);
        
        // Open popup
        markers.forEach(marker => {
            if (marker.getPopup()) {
                const popupContent = marker.getPopup().getContent();
                if (popupContent.includes(shipmentId)) {
                    marker.openPopup();
                }
            }
        });
        
        showToast(`📍 Centered map on ${shipmentId}`, 'success');
    };
    
    window.downloadDocuments = function(shipmentId) {
        showToast(`📥 Preparing documents for ${shipmentId}...`, 'info');
        // In a real app, this would initiate a document download
    };
    
    window.showTemperatureChart = function(shipmentId) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        // Destroy existing chart if it exists
        if (tempChart) {
            tempChart.destroy();
        }
        
        const ctx = document.getElementById('tempChart').getContext('2d');
        
        const labels = shipment.temperature.history.slice(-12).map(h => 
            new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        const data = shipment.temperature.history.slice(-12).map(h => h.temperature);
        
        tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Temperature (°C) - ${shipmentId}`,
                    data: data,
                    borderColor: shipment.temperature.status === 'alert' ? '#ef4444' : 
                                shipment.temperature.status === 'warning' ? '#f59e0b' : '#10b981',
                    backgroundColor: shipment.temperature.status === 'alert' ? 'rgba(239, 68, 68, 0.1)' : 
                                   shipment.temperature.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: shipment.temperature.status === 'alert' ? '#ef4444' : 
                                         shipment.temperature.status === 'warning' ? '#f59e0b' : '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Temperature History - Last 12 Hours`,
                        font: { size: 16, weight: 'bold' },
                        color: '#1e293b'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { size: 12 },
                        bodyFont: { size: 14 },
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    y: {
                        min: Math.min(...data) - 1,
                        max: Math.max(...data) + 1,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#64748b',
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                }
            }
        });
        
        document.getElementById('tempModal').classList.add('active');
    };
    
    window.viewDocument = function(shipmentId, docType) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        const doc = shipment.documents[docType];
        showToast(`📄 Viewing ${docType.replace(/([A-Z])/g, ' $1')} for ${shipmentId}`, 'info');
    };
    
    // Initialize dashboard
    initDashboard();
});
