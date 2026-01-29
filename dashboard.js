// ===== CRYOCHAIN DASHBOARD SCRIPT =====
 
document.addEventListener('DOMContentLoaded', function() {
    console.log('CryoChain Dashboard initialized');
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        mapCenter: [20, 0],
        mapZoom: 2,
        updateInterval: 10000, // 10 seconds
        demoMode: true,
        dhlApiKey: 'demo_dhl_key_12345',
        carriers: ['DHL', 'Maersk', 'UPS', 'FedEx', 'Kuehne+Nagel']
    };
    
    // ===== GLOBAL VARIABLES =====
    let map = null;
    let shipments = [];
    let markers = [];
    
    // ===== INITIALIZATION =====
    async function initDashboard() {
        console.log('Initializing dashboard...');
        
        // Initialize map
        initMap();
        
        // Load demo data
        await loadDemoData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        // Initialize DHL tracking simulation
        initDHLTracking();
        
        console.log('Dashboard ready with', shipments.length, 'shipments');
    }
    
    // ===== MAP INITIALIZATION =====
    function initMap() {
        // Initialize Leaflet map
        map = L.map('trackingMap').setView(CONFIG.mapCenter, CONFIG.mapZoom);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap, CryoChain',
            maxZoom: 19
        }).addTo(map);
        
        // Add scale control
        L.control.scale().addTo(map);
    }
    
    // ===== DEMO DATA =====
    async function loadDemoData() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sample shipment data
        shipments = [
            {
                id: 'SC-2024-4821',
                product: 'Fresh Berries',
                productType: 'fruits',
                origin: { name: 'Santiago, Chile', lat: -33.4489, lng: -70.6693, flag: '🇨🇱' },
                destination: { name: 'Amsterdam, Netherlands', lat: 52.3676, lng: 4.9041, flag: '🇳🇱' },
                currentLocation: { name: 'Atlantic Ocean', lat: 15, lng: -30, flag: '🌊' },
                carrier: 'Maersk',
                temperature: { current: 2.8, min: 2.5, max: 3.2, unit: '°C', status: 'normal' },
                humidity: 75,
                status: 'in-transit',
                progress: 65,
                atd: '2024-01-15',
                eta: '2024-02-05',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'complete',
                    phytosanitary: 'pending',
                    healthCertificate: 'complete',
                    commercialInvoice: 'complete'
                },
                alerts: [],
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'SC-2024-5123',
                product: 'Atlantic Salmon',
                productType: 'seafood',
                origin: { name: 'Oslo, Norway', lat: 59.9139, lng: 10.7522, flag: '🇳🇴' },
                destination: { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, flag: '🇯🇵' },
                currentLocation: { name: 'Suez Canal', lat: 30.5852, lng: 32.2654, flag: '🇪🇬' },
                carrier: 'DHL',
                temperature: { current: -21.5, min: -25, max: -18, unit: '°C', status: 'alert' },
                humidity: 85,
                status: 'delayed',
                progress: 40,
                atd: '2024-01-20',
                eta: '2024-02-15',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'complete',
                    phytosanitary: 'complete',
                    healthCertificate: 'missing',
                    commercialInvoice: 'pending'
                },
                alerts: ['Temperature fluctuation detected'],
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'SC-2024-4987',
                product: 'Vaccines',
                productType: 'pharma',
                origin: { name: 'Basel, Switzerland', lat: 47.5596, lng: 7.5886, flag: '🇨🇭' },
                destination: { name: 'Singapore', lat: 1.3521, lng: 103.8198, flag: '🇸🇬' },
                currentLocation: { name: 'Dubai Airport', lat: 25.2532, lng: 55.3657, flag: '🇦🇪' },
                carrier: 'DHL',
                temperature: { current: 4.8, min: 2, max: 8, unit: '°C', status: 'warning' },
                humidity: 65,
                status: 'in-transit',
                progress: 75,
                atd: '2024-01-18',
                eta: '2024-01-25',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'complete',
                    phytosanitary: 'complete',
                    healthCertificate: 'complete',
                    commercialInvoice: 'complete'
                },
                alerts: [],
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'SC-2024-5234',
                product: 'Orchids',
                productType: 'floral',
                origin: { name: 'Bogotá, Colombia', lat: 4.7110, lng: -74.0721, flag: '🇨🇴' },
                destination: { name: 'Miami, USA', lat: 25.7617, lng: -80.1918, flag: '🇺🇸' },
                currentLocation: { name: 'Caribbean Sea', lat: 18, lng: -75, flag: '🌊' },
                carrier: 'UPS',
                temperature: { current: 2.2, min: 1, max: 3, unit: '°C', status: 'normal' },
                humidity: 92,
                status: 'on-time',
                progress: 50,
                atd: '2024-01-22',
                eta: '2024-01-24',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'pending',
                    phytosanitary: 'complete',
                    healthCertificate: 'complete',
                    commercialInvoice: 'complete'
                },
                alerts: [],
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'SC-2024-5109',
                product: 'Avocados',
                productType: 'fruits',
                origin: { name: 'Mexico City, Mexico', lat: 19.4326, lng: -99.1332, flag: '🇲🇽' },
                destination: { name: 'London, UK', lat: 51.5074, lng: -0.1278, flag: '🇬🇧' },
                currentLocation: { name: 'Mid-Atlantic', lat: 35, lng: -40, flag: '🌊' },
                carrier: 'Maersk',
                temperature: { current: 4.5, min: 4, max: 5, unit: '°C', status: 'normal' },
                humidity: 78,
                status: 'in-transit',
                progress: 70,
                atd: '2024-01-16',
                eta: '2024-02-01',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'complete',
                    phytosanitary: 'complete',
                    healthCertificate: 'complete',
                    commercialInvoice: 'complete'
                },
                alerts: [],
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'SC-2024-5345',
                product: 'Wagyu Beef',
                productType: 'seafood',
                origin: { name: 'Kobe, Japan', lat: 34.6901, lng: 135.1955, flag: '🇯🇵' },
                destination: { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, flag: '🇭🇰' },
                currentLocation: { name: 'East China Sea', lat: 30, lng: 125, flag: '🌊' },
                carrier: 'DHL',
                temperature: { current: -22.3, min: -25, max: -18, unit: '°C', status: 'normal' },
                humidity: 80,
                status: 'on-time',
                progress: 85,
                atd: '2024-01-19',
                eta: '2024-01-23',
                documents: {
                    billOfLading: 'complete',
                    certificateOfOrigin: 'complete',
                    phytosanitary: 'complete',
                    healthCertificate: 'complete',
                    commercialInvoice: 'pending'
                },
                alerts: [],
                lastUpdated: new Date().toISOString()
            }
        ];
        
        // Update dashboard with data
        updateShipmentsTable();
        updateDocumentsList();
        updateActivityTimeline();
        updateMapMarkers();
        updateDashboardStats();
    }
    
    // ===== UPDATE FUNCTIONS =====
    function updateShipmentsTable() {
        const tableBody = document.getElementById('shipmentsTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        shipments.forEach(shipment => {
            const row = document.createElement('tr');
            row.className = 'shipment-row';
            row.dataset.id = shipment.id;
            
            // Determine status colors
            const statusClass = `status-${shipment.status.replace('-', '')}`;
            const tempClass = `temp-${shipment.temperature.status}`;
            
            // Document icons
            const docIcons = Object.entries(shipment.documents).map(([doc, status]) => {
                const docAbbr = doc.substring(0, 2).toUpperCase();
                return `<div class="doc-icon doc-${status}" title="${doc}: ${status}" data-doc="${doc}">${docAbbr}</div>`;
            }).join('');
            
            row.innerHTML = `
                <td class="shipment-id">${shipment.id}</td>
                <td>
                    <div class="shipment-product">
                        <div class="product-icon ${shipment.productType}">
                            ${getProductIcon(shipment.productType)}
                        </div>
                        <span>${shipment.product}</span>
                    </div>
                </td>
                <td>
                    <div class="route-info">
                        <span class="route-origin">${shipment.origin.name}</span>
                        <span class="route-arrow">→</span>
                        <span class="route-destination">${shipment.destination.name}</span>
                        <small>${shipment.carrier}</small>
                    </div>
                </td>
                <td>
                    <div class="location-info">
                        <span class="location-flag">${shipment.currentLocation.flag}</span>
                        <span>${shipment.currentLocation.name}</span>
                    </div>
                </td>
                <td>
                    <div class="temperature-display ${tempClass}">
                        <i class="fas fa-thermometer-half"></i>
                        ${shipment.temperature.current}${shipment.temperature.unit}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${formatStatus(shipment.status)}
                    </span>
