// ===== CRYOCHAIN CONTAINER JOURNEY TRACKING =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 CryoChain Container Dashboard initialized');
    
    // ===== CONFIGURATION =====
    const CONFIG = {
        mapCenter: [20, 60],
        mapZoom: 3,
        simulationSpeed: 5,
        updateInterval: 5000
    };
    
    // ===== GLOBAL VARIABLES =====
    let map = null;
    let vessels = [];
    let containers = [];
    let selectedVessel = null;
    let selectedContainer = null;
    
    // ===== SAMPLE DATA =====
    const sampleVessels = [
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
            containers: ['MSCU1234567', 'CMAU9876543', 'TCLU9876543']
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
            containers: ['TEMU1234567', 'SEGU8765432']
        },
        {
            id: 'cosco-shipping',
            name: 'COSCO SHIPPING',
            mmsi: '477542300',
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
            delay: 0,
            containers: ['COSU3456789']
        }
    ];
    
    const sampleContainers = [
        {
            id: 'MSCU1234567',
            vesselId: 'maersk-honam',
            clientRef: 'GLOB-2024-001',
            product: 'Fresh Blueberries',
            productType: 'fruits',
            temperature: {
                current: 2.8,
                min: 2.0,
                max: 3.5,
                status: 'normal'
            },
            humidity: 75,
            weight: 18000,
            volume: 33.2,
            shipper: 'Chile Berry Farms',
            consignee: 'Fresh Foods Europe',
            notifyParty: 'Global Logistics BV',
            documents: {
                billOfLading: { status: 'complete', date: '2024-01-15', file: 'bl-001.pdf' },
                certificateOfOrigin: { status: 'complete', date: '2024-01-15', file: 'coo-001.pdf' },
                phytosanitary: { status: 'pending', date: null, file: null },
                healthCertificate: { status: 'complete', date: '2024-01-16', file: 'hc-001.pdf' },
                commercialInvoice: { status: 'complete', date: '2024-01-14', file: 'ci-001.pdf' },
                packingList: { status: 'complete', date: '2024-01-14', file: 'pl-001.pdf' }
            },
            journey: [
                {
                    milestone: 'pickup',
                    description: 'Container picked up from packhouse',
                    date: '2024-01-10T08:00:00',
                    status: 'actual',
                    location: 'Santiago, Chile'
                },
                {
                    milestone: 'stack',
                    description: 'Container stacked at origin terminal',
                    date: '2024-01-10T14:00:00',
                    status: 'actual',
                    location: 'San Antonio Terminal'
                },
                {
                    milestone: 'load',
                    description: 'Loaded on board vessel',
                    date: '2024-01-12T10:00:00',
                    status: 'actual',
                    location: 'San Antonio Port'
                },
                {
                    milestone: 'departure',
                    description: 'Vessel departure from origin',
                    date: '2024-01-12T18:00:00',
                    status: 'actual',
                    location: 'San Antonio, Chile'
                },
                {
                    milestone: 'transshipment',
                    description: 'Transshipment at Singapore',
                    date: '2024-01-28T12:00:00',
                    status: 'estimated',
                    location: 'Singapore'
                },
                {
                    milestone: 'arrival',
                    description: 'Vessel arrival at destination',
                    date: '2024-02-03T20:00:00',
                    status: 'estimated',
                    location: 'Rotterdam, Netherlands'
                },
                {
                    milestone: 'discharge',
                    description: 'Container discharge from vessel',
                    date: '2024-02-04T08:00:00',
                    status: 'estimated',
                    location: 'Rotterdam Terminal'
                },
                {
                    milestone: 'gateout',
                    description: 'Container gated out from terminal',
                    date: '2024-02-04T16:00:00',
                    status: 'estimated',
                    location: 'Rotterdam'
                }
            ],
            messages: [
                {
                    id: 'msg-001',
                    sender: 'Port Agent - San Antonio',
                    time: '2024-01-10T09:30:00',
                    content: 'Container safely loaded at terminal. All seals intact.',
                    priority: 'normal'
                },
                {
                    id: 'msg-002',
                    sender: 'Shipping Agent',
                    time: '2024-01-12T19:15:00',
                    content: 'Vessel departed on schedule. Next update at Panama Canal.',
                    priority: 'normal'
                },
                {
                    id: 'msg-003',
                    sender: 'Carrier Representative',
                    time: '2024-01-20T14:45:00',
                    content: 'Weather delay expected in South China Sea. Revised ETA to be confirmed.',
                    priority: 'urgent'
                }
            ],
            alerts: [
                {
                    type: 'delay',
                    message: 'Weather delay - 36 hours expected',
                    time: '2024-01-20T14:45:00',
                    status: 'active'
                }
            ]
        },
        {
            id: 'CMAU9876543',
            vesselId: 'maersk-honam',
            clientRef: 'GLOB-2024-002',
            product: 'Atlantic Salmon',
            productType: 'seafood',
            temperature: {
                current: -18.5,
                min: -25,
                max: -18,
                status: 'alert'
            },
            humidity: 85,
            weight: 22000,
            volume: 33.2,
            shipper: 'Norwegian Seafood AS',
            consignee: 'Tokyo Importers Ltd',
            notifyParty: 'Japan Customs Broker',
            documents: {
                billOfLading: { status: 'complete', date: '2024-01-16', file: 'bl-002.pdf' },
                certificateOfOrigin: { status: 'complete', date: '2024-01-16', file: 'coo-002.pdf' },
                phytosanitary: { status: 'complete', date: '2024-01-16', file: 'phyto-002.pdf' },
                healthCertificate: { status: 'missing', date: null, file: null },
                commercialInvoice: { status: 'pending', date: null, file: null }
            },
            journey: [
                {
                    milestone: 'pickup',
                    description: 'Container loaded at processing plant',
                    date: '2024-01-14T06:00:00',
                    status: 'actual',
                    location: 'Oslo, Norway'
                },
                {
                    milestone: 'stack',
                    description: 'Container at origin terminal',
                    date: '2024-01-14T12:00:00',
                    status: 'actual',
                    location: 'Oslo Terminal'
                },
                {
                    milestone: 'load',
                    description: 'Loaded on board vessel',
                    date: '2024-01-15T16:00:00',
                    status: 'actual',
                    location: 'Oslo Port'
                }
            ]
        }
    ];
    
    // ===== INITIALIZATION =====
    async function initDashboard() {
        console.log('🚢 Initializing container tracking dashboard...');
        
        // Initialize data
        vessels = [...sampleVessels];
        containers = [...sampleContainers];
        
        // Initialize components
        initMap();
        initVesselCards();
        initDocumentsGrid();
        setupEventListeners();
        startSimulation();
        
        console.log('✅ Dashboard ready with', containers.length, 'containers');
    }
    
    // ===== MAP INITIALIZATION =====
    function initMap() {
        map = L.map('vesselMap').setView(CONFIG.mapCenter, CONFIG.mapZoom);
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap, CryoChain',
            maxZoom: 19
        }).addTo(map);
        
        // Add vessel markers
        vessels.forEach(vessel => {
            addVesselMarker(vessel);
        });
        
        // Fit map to vessels
        fitMapToVessels();
    }
    
    function addVesselMarker(vessel) {
        const iconClass = `vessel-icon ${vessel.status}`;
        
        const vesselIcon = L.divIcon({
            className: 'vessel-marker',
            html: `
                <div class="${iconClass}" title="${vessel.name}">
                    <i class="fas fa-ship"></i>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        
        const marker = L.marker([vessel.position.lat, vessel.position.lng], {
            icon: vesselIcon
        }).addTo(map);
        
        // Add popup with quick actions
        marker.bindPopup(createVesselPopup(vessel));
        
        // Add click handler
        marker.on('click', function() {
            selectVessel(vessel.id);
        });
        
        // Store reference
        vessel.marker = marker;
    }
    
    function createVesselPopup(vessel) {
        const containerCount = containers.filter(c => c.vesselId === vessel.id).length;
        
        return `
            <div class="vessel-popup">
                <h4>${vessel.name}</h4>
                <div class="popup-info">
                    <div><strong>Containers:</strong> ${containerCount}</div>
                    <div><strong>Status:</strong> ${vessel.status === 'delayed' ? 'DELAYED' : 'ON TIME'}</div>
                    <div><strong>ETA:</strong> ${formatDate(vessel.eta)}</div>
                </div>
                <button onclick="window.selectVessel('${vessel.id}')" class="popup-btn">
                    <i class="fas fa-boxes"></i> View Containers
                </button>
            </div>
        `;
    }
    
    function fitMapToVessels() {
        if (vessels.length > 0) {
            const bounds = L.latLngBounds(vessels.map(v => [v.position.lat, v.position.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
    
    // ===== VESSEL CARDS =====
    function initVesselCards() {
        const container = document.getElementById('vesselCards');
        container.innerHTML = '';
        
        vessels.forEach(vessel => {
            const card = createVesselCard(vessel);
            container.appendChild(card);
        });
        
        // Initialize journey timeline for first container
        if (containers.length > 0) {
            updateJourneyTimeline(containers[0]);
        }
    }
    
    function createVesselCard(vessel) {
        const containerCount = containers.filter(c => c.vesselId === vessel.id).length;
        const delayed = vessel.delay > 0;
        
        const card = document.createElement('div');
        card.className = `vessel-card ${selectedVessel === vessel.id ? 'active' : ''}`;
        card.dataset.vesselId = vessel.id;
        
        card.innerHTML = `
            <div class="vessel-card-header">
                <div class="vessel-name">${vessel.name}</div>
                <div class="vessel-status status-${vessel.status}">
                    ${vessel.status === 'delayed' ? 'DELAYED' : 'ON TIME'}
                </div>
            </div>
            <div class="vessel-info">
                <div class="info-item">
                    <span class="info-label">From</span>
                    <span class="info-value">${vessel.origin}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">To</span>
                    <span class="info-value">${vessel.destination}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ETA</span>
                    <span class="info-value">${formatDate(vessel.eta)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Speed</span>
                    <span class="info-value">${vessel.speed} knots</span>
                </div>
            </div>
            ${delayed ? `
                <div class="vessel-delay">
                    <i class="fas fa-clock"></i>
                    <span>Delay: ${vessel.delay} hours</span>
                </div>
            ` : ''}
            <div class="vessel-containers">
                <i class="fas fa-box"></i>
                ${containerCount} container${containerCount !== 1 ? 's' : ''} on board
            </div>
        `;
        
        card.addEventListener('click', () => selectVessel(vessel.id));
        
        return card;
    }
    
    // ===== VESSEL SELECTION =====
    function selectVessel(vesselId) {
        selectedVessel = vesselId;
        const vessel = vessels.find(v => v.id === vesselId);
        
        if (!vessel) return;
        
        // Update active state
        document.querySelectorAll('.vessel-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-vessel-id="${vesselId}"]`).classList.add('active');
        
        // Center map on vessel
        map.setView([vessel.position.lat, vessel.position.lng], 6);
        
        // Open vessel details modal
        openVesselModal(vessel);
    }
    
    function openVesselModal(vessel) {
        const modal = document.getElementById('vesselModal');
        const title = document.getElementById('vesselModalTitle');
        const content = document.querySelector('.vessel-modal-content');
        
        title.textContent = vessel.name;
        
        // Get containers for this vessel
        const vesselContainers = containers.filter(c => c.vesselId === vessel.id);
        
        content.innerHTML = `
            <div class="vessel-overview">
                <div class="vessel-map-mini" id="vesselMapMini"></div>
                <div class="vessel-info-detailed">
                    <div class="info-item">
                        <span class="info-label">Vessel Name</span>
                        <span class="info-value">${vessel.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">IMO Number</span>
                        <span class="info-value">${vessel.imo}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">MMSI</span>
                        <span class="info-value">${vessel.mmsi}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Current Position</span>
                        <span class="info-value">${vessel.position.lat.toFixed(3)}°, ${vessel.position.lng.toFixed(3)}°</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Speed/Course</span>
                        <span class="info-value">${vessel.speed} knots / ${vessel.course}°</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Origin</span>
                        <span class="info-value">${vessel.origin}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Destination</span>
                        <span class="info-value">${vessel.destination}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Original ETA</span>
                        <span class="info-value">${formatDate(vessel.originalEta)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Revised ETA</span>
                        <span class="info-value ${vessel.delay > 0 ? 'highlight' : ''}">${formatDate(vessel.eta)}</span>
                    </div>
                    ${vessel.delay > 0 ? `
                        <div class="info-item">
                            <span class="info-label">Delay</span>
                            <span class="info-value delay">${vessel.delay} hours</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Delay Reason</span>
                            <span class="info-value">${getDelayReason(vessel.delayReason)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="vessel-containers-section">
                <h3><i class="fas fa-boxes"></i> Containers on Board (${vesselContainers.length})</h3>
                <div class="vessel-containers-grid" id="vesselContainersGrid">
                    ${vesselContainers.map(container => `
                        <div class="container-card" data-container-id="${container.id}" onclick="window.selectContainer('${container.id}')">
                            <div class="container-header">
                                <div class="container-id">${container.id}</div>
                                <div class="container-status ${container.temperature.status}">
                                    ${container.temperature.current}°C
                                </div>
                            </div>
                            <div class="container-product">${container.product}</div>
                            <div class="container-client">${container.clientRef}</div>
                            <div class="container-temperature ${container.temperature.status}">
                                <i class="fas fa-thermometer-half"></i>
                                Temp: ${container.temperature.current}°C
                                (Range: ${container.temperature.min} - ${container.temperature.max}°C)
                            </div>
                            <div class="container-documents">
                                ${Object.entries(container.documents).map(([doc, info]) => `
                                    <div class="doc-badge doc-${info.status}" title="${doc}: ${info.status}">
                                        ${doc.substring(0, 2).toUpperCase()}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="window.downloadVesselDocuments('${vessel.id}')">
                    <i class="fas fa-download"></i> Download All Documents
                </button>
                <button class="btn btn-primary" onclick="window.sendVesselMessage('${vessel.id}')">
                    <i class="fas fa-comment"></i> Send Message
                </button>
            </div>
        `;
        
        // Initialize mini map
        setTimeout(() => {
            const miniMap = L.map('vesselMapMini').setView([vessel.position.lat, vessel.position.lng], 5);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(miniMap);
            
            // Add vessel marker
            L.marker([vessel.position.lat, vessel.position.lng], {
                icon: L.divIcon({
                    html: `<div class="vessel-icon ${vessel.status}"><i class="fas fa-ship"></i></div>`,
                    iconSize: [30, 30]
                })
            }).addTo(miniMap);
        }, 100);
        
        modal.classList.add('active');
    }
    
    // ===== CONTAINER SELECTION =====
    function selectContainer(containerId) {
        selectedContainer = containerId;
        const container = containers.find(c => c.id === containerId);
        
        if (!container) return;
        
        // Close vessel modal
        document.getElementById('vesselModal').classList.remove('active');
        
        // Open container modal
        openContainerModal(container);
    }
    
    function openContainerModal(container) {
        const modal = document.getElementById('containerModal');
        const title = document.getElementById('containerModalTitle');
        const content = document.querySelector('.container-modal-content');
        
        title.textContent = `${container.id} - ${container.product}`;
        
        // Calculate journey progress
        const completedMilestones = container.journey.filter(m => m.status === 'actual').length;
        const totalMilestones = container.journey.length;
        const progressPercent = (completedMilestones / totalMilestones) * 100;
        
        content.innerHTML = `
            <div class="container-header-info">
                <div class="container-basic-info">
                    <div class="info-row">
                        <div class="info-item">
                            <span class="label">Container ID:</span>
                            <span class="value">${container.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Client Reference:</span>
                            <span class="value">${container.clientRef}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Product:</span>
                            <span class="value">${container.product}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <span class="label">Shipper:</span>
                            <span class="value">${container.shipper}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Consignee:</span>
                            <span class="value">${container.consignee}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Weight/Volume:</span>
                            <span class="value">${container.weight} kg / ${container.volume} m³</span>
                        </div>
                    </div>
                </div>
                
                <div class="container-temperature-panel">
                    <div class="temp-display ${container.temperature.status}">
                        <i class="fas fa-thermometer-half"></i>
                        <div class="temp-value">${container.temperature.current}°C</div>
                        <div class="temp-range">Range: ${container.temperature.min} - ${container.temperature.max}°C</div>
                    </div>
                    <div class="humidity-display">
                        <i class="fas fa-tint"></i>
                        Humidity: ${container.humidity}%
                    </div>
                </div>
            </div>
            
            <div class="container-timeline-detailed">
                <h3><i class="fas fa-project-diagram"></i> Container Journey (${progressPercent.toFixed(0)}% Complete)</h3>
                <div class="timeline-progress-bar">
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="timeline-events">
                    ${container.journey.map((milestone, index) => `
                        <div class="timeline-event ${milestone.status === 'actual' ? 'completed' : milestone.status === 'estimated' ? 'upcoming' : 'current'}">
                            <div class="event-icon">
                                ${getMilestoneIcon(milestone.milestone)}
                            </div>
                            <div class="event-content">
                                <div class="event-title">${getMilestoneLabel(milestone.milestone)}</div>
                                <div class="event-subtitle">${milestone.description}</div>
                                <div class="event-meta">
                                    <div class="event-date">
                                        <i class="far fa-calendar"></i>
                                        ${formatDate(milestone.date)}
                                    </div>
                                    <div class="event-status status-${milestone.status}">
                                        ${milestone.status === 'actual' ? 'ACTUAL' : 'ESTIMATED'}
                                    </div>
                                    <div class="event-location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${milestone.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="container-documents-panel">
                <h3><i class="fas fa-file-alt"></i> Documents</h3>
                <div class="documents-list">
                    ${Object.entries(container.documents).map(([docName, docInfo]) => `
                        <div class="document-item" onclick="window.viewDocument('${container.id}', '${docName}')">
                            <div class="document-info">
                                <div class="document-icon-small">
                                    <i class="fas fa-file"></i>
                                </div>
                                <div>
                                    <div class="document-title">${formatDocName(docName)}</div>
                                    <div class="document-date">${docInfo.date ? formatDate(docInfo.date) : 'Not submitted'}</div>
                                </div>
                            </div>
                            <div class="document-actions">
                                <span class="document-status status-${docInfo.status}">
                                    ${docInfo.status.toUpperCase()}
                                </span>
                                ${docInfo.file ? `
                                    <button class="btn-icon" onclick="window.downloadDocument('${container.id}', '${docName}')">
                                        <i class="fas fa-download"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="container-messages">
                <h3><i class="fas fa-comments"></i> Messages & Notifications</h3>
                
                ${container.alerts && container.alerts.length > 0 ? `
                    <div class="alerts-section">
                        ${container.alerts.map(alert => `
                            <div class="alert-message ${alert.type}">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div class="alert-content">
                                    <div class="alert-text">${alert.message}</div>
                                    <div class="alert-time">${formatDate(alert.time)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="message-history">
                    ${container.messages && container.messages.length > 0 ? `
                        ${container.messages.map(msg => `
                            <div class="message-item">
                                <div class="message-header">
                                    <span class="message-sender">${msg.sender}</span>
                                    <span class="message-time">${formatDate(msg.time)}</span>
                                </div>
                                <div class="message-content">${msg.content}</div>
                                ${msg.priority !== 'normal' ? `
                                    <div class="message-priority ${msg.priority}">
                                        ${msg.priority.toUpperCase()} PRIORITY
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    ` : '<p class="no-messages">No messages yet.</p>'}
                </div>
                
                <div class="message-composer">
                    <div class="message-input">
                        <textarea id="newMessage" placeholder="Type your message about this container..."></textarea>
                        <button class="btn btn-primary" onclick="window.sendContainerMessage('${container.id}')">
                            <i class="fas fa-paper-plane"></i> Send
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    // ===== DOCUMENTS =====
    function initDocumentsGrid() {
        const container = document.getElementById('documentsGrid');
        container.innerHTML = '';
        
        // Get recent documents from all containers
        const recentDocs = [];
        containers.forEach(container => {
            Object.entries(container.documents).forEach(([docName, docInfo]) => {
                if (docInfo.date) {
                    recentDocs.push({
                        containerId: container.id,
                        product: container.product,
                        docName: docName,
                        docInfo: docInfo
                    });
                }
            });
        });
        
        // Sort by date (newest first)
        recentDocs.sort((a, b) => new Date(b.docInfo.date) - new Date(a.docInfo.date));
        
        // Display first 6
        recentDocs.slice(0, 6).forEach(doc => {
            const card = createDocumentCard(doc);
            container.appendChild(card);
        });
    }
    
    function createDocumentCard(doc) {
        const card = document.createElement('div');
        card.className = 'document-card';
        card.dataset.containerId = doc.containerId;
        card.dataset.docName = doc.docName;
        
        card.innerHTML = `
            <div class="document-icon">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="document-name">${formatDocName(doc.docName)}</div>
            <div class="document-meta">
                ${doc.containerId}<br>
                ${doc.product}
            </div>
            <div class="document-status status-${doc.docInfo.status}">
                ${doc.docInfo.status.toUpperCase()}
            </div>
        `;
        
        card.addEventListener('click', () => viewDocument(doc.containerId, doc.docName));
        
        return card;
    }
    
    function viewDocument(containerId, docName) {
        const container = containers.find(c => c.id === containerId);
        if (!container || !container.documents[docName]) return;
        
        const docInfo = container.documents[docName];
        const modal = document.getElementById('documentModal');
        const title = document.getElementById('documentModalTitle');
        const viewer = document.getElementById('documentViewer');
        
        title.textContent = `${formatDocName(docName)} - ${containerId}`;
        
        if (docInfo.file) {
            viewer.innerHTML = `
                <div class="document-preview">
                    <div class="document-header">
                        <div class="document-title">${formatDocName(docName)}</div>
                        <div class="document-meta">
                            <div>Container: ${containerId}</div>
                            <div>Product: ${container.product}</div>
                            <div>Date: ${formatDate(docInfo.date)}</div>
                            <div>Status: <span class="status-${docInfo.status}">${docInfo.status.toUpperCase()}</span></div>
                        </div>
                    </div>
                    <div class="document-actions">
                        <button class="btn btn-primary" onclick="window.downloadDocument('${containerId}', '${docName}')">
                            <i class="fas fa-download"></i> Download Document
                        </button>
                        <button class="btn btn-secondary" onclick="window.printDocument('${containerId}', '${docName}')">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                    <div class="document-placeholder">
                        <i class="fas fa-file-pdf fa-3x"></i>
                        <p>Preview would show here in production</p>
                        <p>For demo: Document "${docInfo.file}" would be displayed</p>
                    </div>
                </div>
            `;
        } else {
            viewer.innerHTML = `
                <div class="document-missing">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Document Not Available</h3>
                    <p>The ${formatDocName(docName)} has not been uploaded yet.</p>
                    <button class="btn btn-primary" onclick="window.uploadDocumentPrompt('${containerId}', '${docName}')">
                        <i class="fas fa-upload"></i> Upload Document
                    </button>
                </div>
            `;
        }
        
        modal.classList.add('active');
    }
    
    // ===== JOURNEY TIMELINE =====
    function updateJourneyTimeline(container) {
        const timeline = document.getElementById('journeyTimeline');
        if (!timeline || !container.journey) return;
        
        const completed = container.journey.filter(m => m.status === 'actual').length;
        const total = container.journey.length;
        const progress = (completed / total) * 100;
        
        timeline.innerHTML = `
            <div class="timeline-header">
                <h4>${container.id} Journey Progress</h4>
                <div class="progress-text">${progress.toFixed(0)}% Complete</div>
            </div>
            <div class="timeline-track">
                <div class="timeline-progress" style="width: ${progress}%"></div>
                <div class="timeline-milestones">
                    ${container.journey.map((milestone, index) => `
                        <div class="milestone ${milestone.status === 'actual' ? 'completed' : milestone.status === 'estimated' ? 'upcoming' : 'current'}">
                            <div class="milestone-dot"></div>
                            <div class="milestone-label">${getMilestoneAbbr(milestone.milestone)}</div>
                            <div class="milestone-date">${formatDateShort(milestone.date)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="timeline-footer">
                <div class="current-milestone">
                    <strong>Current:</strong> ${container.journey.find(m => m.status === 'current')?.description || 'In Transit'}
                </div>
                <div class="next-milestone">
                    <strong>Next:</strong> ${container.journey.find(m => m.status === 'estimated')?.description || 'Arrival'}
                </div>
            </div>
        `;
    }
    
    // ===== HELPER FUNCTIONS =====
    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function formatDateShort(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    function formatDocName(docName) {
        return docName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace('Of', 'of')
            .replace('Bl', 'BL');
    }
    
    function getDelayReason(reason) {
        const reasons = {
            'weather': 'Weather Conditions',
            'port-congestion': 'Port Congestion',
            'mechanical': 'Mechanical Issue',
            'customs': 'Customs Delay'
        };
        return reasons[reason] || 'Operational Delay';
    }
    
    function getMilestoneIcon(milestone) {
        const icons = {
            'pickup': 'fas fa-truck-loading',
            'stack': 'fas fa-layer-group',
            'load': 'fas fa-ship',
            'departure': 'fas fa-anchor',
            'transshipment': 'fas fa-exchange-alt',
            'arrival': 'fas fa-flag-checkered',
            'discharge': 'fas fa-truck',
            'gateout': 'fas fa-door-open'
        };
        return icons[milestone] || 'fas fa-circle';
    }
    
    function getMilestoneLabel(milestone) {
        const labels = {
            'pickup': 'Container Pickup',
            'stack': 'Stack at Terminal',
            'load': 'Load on Vessel',
            'departure': 'Vessel Departure',
            'transshipment': 'Transshipment',
            'arrival': 'Vessel Arrival',
            'discharge': 'Container Discharge',
            'gateout': 'Gate Out from Terminal'
        };
        return labels[milestone] || milestone;
    }
    
    function getMilestoneAbbr(milestone) {
        const abbr = {
            'pickup': 'PICKUP',
            'stack': 'STACK',
            'load': 'LOAD',
            'departure': 'DEPART',
            'transshipment': 'TRANS',
            'arrival': 'ARRIVE',
            'discharge': 'DISCH',
            'gateout': 'GATE OUT'
        };
        return abbr[milestone] || milestone;
    }
    
    // ===== SIMULATION =====
    function startSimulation() {
        // Update vessel positions
        setInterval(() => {
            vessels.forEach(vessel => {
                if (vessel.speed > 0) {
                    // Simulate movement
                    vessel.position.lat += (Math.random() - 0.5) * 0.01;
                    vessel.position.lng += (Math.random() - 0.5) * 0.01;
                    
                    // Update marker if exists
                    if (vessel.marker) {
                        vessel.marker.setLatLng([vessel.position.lat, vessel.position.lng]);
                    }
                }
            });
        }, CONFIG.updateInterval);
        
        // Update temperature readings
        setInterval(() => {
            containers.forEach(container => {
                // Simulate small temperature fluctuations
                if (Math.random() > 0.8) {
                    const fluctuation = (Math.random() - 0.5) * 0.3;
                    container.temperature.current += fluctuation;
                    
                    // Check limits
                    if (container.temperature.current < container.temperature.min) {
                        container.temperature.current = container.temperature.min + 0.1;
                        container.temperature.status = 'alert';
                    } else if (container.temperature.current > container.temperature.max) {
                        container.temperature.current = container.temperature.max - 0.1;
                        container.temperature.status = 'alert';
                    } else if (Math.abs(container.temperature.current - container.temperature.min) < 0.5 || 
                              Math.abs(container.temperature.current - container.temperature.max) < 0.5) {
                        container.temperature.status = 'warning';
                    } else {
                        container.temperature.status = 'normal';
                    }
                }
            });
        }, 10000);
    }
    
    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        // Global search
        document.getElementById('globalSearch').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length > 2) {
                performSearch(searchTerm);
            }
        });
        
        // Quick search button
        document.getElementById('quickSearchBtn')?.addEventListener('click', () => {
            document.getElementById('globalSearch').focus();
        });
        
        // View all documents
        document.getElementById('viewAllDocs')?.addEventListener('click', () => {
            alert('Opening full documents view...');
        });
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                handleQuickAction(action);
            });
        });
        
        // Modal close buttons
        document.getElementById('closeVesselModal')?.addEventListener('click', () => {
            document.getElementById('vesselModal').classList.remove('active');
        });
        
        document.getElementById('closeContainerModal')?.addEventListener('click', () => {
            document.getElementById('containerModal').classList.remove('active');
        });
        
        document.getElementById('closeDocumentModal')?.addEventListener('click', () => {
            document.getElementById('documentModal').classList.remove('active');
        });
        
        document.getElementById('closeMessageModal')?.addEventListener('click', () => {
            document.getElementById('messageModal').classList.remove('active');
        });
        
        document.getElementById('cancelMessage')?.addEventListener('click', () => {
            document.getElementById('messageModal').classList.remove('active');
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // Send message
        document.getElementById('sendMessage')?.addEventListener('click', sendNewMessage);
        
        // Refresh vessels
        document.getElementById('refreshVessels')?.addEventListener('click', () => {
            fitMapToVessels();
            showToast('Vessel positions refreshed', 'success');
        });
        
        // Timeline help
        document.getElementById('timelineHelp')?.addEventListener('click', () => {
            showToast('Timeline shows container journey progress. Green = Completed, Blue = Current, Gray = Upcoming', 'info');
        });
    }
    
    function performSearch(searchTerm) {
        // Search containers
        const containerResults = containers.filter(c => 
            c.id.toLowerCase().includes(searchTerm) ||
            c.clientRef.toLowerCase().includes(searchTerm) ||
            c.product.toLowerCase().includes(searchTerm)
        );
        
        // Search vessels
        const vesselResults = vessels.filter(v => 
            v.name.toLowerCase().includes(searchTerm) ||
            v.imo.includes(searchTerm)
        );
        
        if (containerResults.length > 0) {
            selectContainer(containerResults[0].id);
            showToast(`Found container: ${containerResults[0].id}`, 'success');
        } else if (vesselResults.length > 0) {
            selectVessel(vesselResults[0].id);
            showToast(`Found vessel: ${vesselResults[0].name}`, 'success');
        } else {
            showToast('No results found', 'warning');
        }
    }
    
    function handleQuickAction(action) {
        switch (action) {
            case 'upload-doc':
                uploadDocumentPrompt();
                break;
            case 'add-note':
                openMessageModal();
                break;
            case 'track-shipment':
                showToast('Enter container or BL number to track', 'info');
                break;
            case 'generate-report':
                generateContainerReport();
                break;
        }
    }
    
    function uploadDocumentPrompt(containerId, docName) {
        const modal = document.getElementById('messageModal');
        const composer = document.querySelector('.message-composer');
        
        composer.innerHTML = `
            <h3><i class="fas fa-file-upload"></i> Upload Document</h3>
            <div class="form-group">
                <label>Container</label>
                <select id="uploadContainer">
                    ${containers.map(c => `
                        <option value="${c.id}" ${c.id === containerId ? 'selected' : ''}>
                            ${c.id} - ${c.product}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Document Type</label>
                <select id="uploadDocType">
                    <option value="billOfLading" ${docName === 'billOfLading' ? 'selected' : ''}>Bill of Lading</option>
                    <option value="certificateOfOrigin" ${docName === 'certificateOfOrigin' ? 'selected' : ''}>Certificate of Origin</option>
                    <option value="phytosanitary" ${docName === 'phytosanitary' ? 'selected' : ''}>Phytosanitary Certificate</option>
                    <option value="healthCertificate" ${docName === 'healthCertificate' ? 'selected' : ''}>Health Certificate</option>
                    <option value="commercialInvoice" ${docName === 'commercialInvoice' ? 'selected' : ''}>Commercial Invoice</option>
                    <option value="packingList" ${docName === 'packingList' ? 'selected' : ''}>Packing List</option>
                </select>
            </div>
            <div class="form-group">
                <label>Select File</label>
                <input type="file" id="fileUpload" accept=".pdf,.jpg,.png,.doc,.docx">
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="document.getElementById('messageModal').classList.remove('active')">
                    Cancel
                </button>
                <button class="btn btn-primary" onclick="window.processDocumentUpload()">
                    <i class="fas fa-upload"></i> Upload
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    function openMessageModal() {
        document.getElementById('messageModal').classList.add('active');
    }
    
    function sendNewMessage() {
        const recipient = document.getElementById('messageRecipient').value;
        const subject = document.getElementById('messageSubject').value;
        const content = document.getElementById('messageContent').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        
        if (!recipient || !content.trim()) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        // In a real app, this would send to API
        showToast(`Message sent to ${recipient}`, 'success');
        document.getElementById('messageModal').classList.remove('active');
        
        // Clear form
        document.getElementById('messageRecipient').value = '';
        document.getElementById('messageSubject').value = '';
        document.getElementById('messageContent').value = '';
    }
    
    function generateContainerReport() {
        const report = `
            CRYOCHAIN CONTAINER STATUS REPORT
            =================================
            Generated: ${new Date().toLocaleDateString()}
            
            SUMMARY:
            ----------
            Total Containers: ${containers.length}
            Active Vessels: ${vessels.length}
            Documents Complete: ${calculateDocCompletion()}%
            
            CONTAINER STATUS:
            ----------
            ${containers.map(c => `
            • ${c.id}
              Product: ${c.product}
              Vessel: ${vessels.find(v => v.id === c.vesselId)?.name || 'Unknown'}
              Temperature: ${c.temperature.current}°C (${c.temperature.status})
              Journey: ${c.journey.filter(m => m.status === 'actual').length}/${c.journey.length} milestones
              Documents: ${Object.values(c.documents).filter(d => d.status === 'complete').length}/${Object.keys(c.documents).length} complete
            `).join('\n')}
            
            RECOMMENDED ACTIONS:
            ----------
            1. Check temperature alerts
            2. Follow up on pending documents
            3. Monitor delayed vessels
            4. Update consignees on ETAs
        `;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `container-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Report generated successfully', 'success');
    }
    
    function calculateDocCompletion() {
        let total = 0;
        let complete = 0;
        
        containers.forEach(container => {
            Object.values(container.documents).forEach(doc => {
                total++;
                if (doc.status === 'complete') complete++;
            });
        });
        
        return total > 0 ? Math.round((complete / total) * 100) : 0;
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
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // ===== GLOBAL FUNCTIONS =====
    window.selectVessel = selectVessel;
    window.selectContainer = selectContainer;
    window.viewDocument = viewDocument;
    window.downloadDocument = function(containerId, docName) {
        const container = containers.find(c => c.id === containerId);
        if (!container) return;
        
        const docInfo = container.documents[docName];
        if (!docInfo || !docInfo.file) {
            showToast('Document not available for download', 'warning');
            return;
        }
        
        // Simulate download
        showToast(`Downloading ${formatDocName(docName)} for ${containerId}...`, 'success');
        
        // In real app, this would download actual file
        setTimeout(() => {
            showToast('Document downloaded successfully', 'success');
        }, 1000);
    };
    
    window.downloadVesselDocuments = function(vesselId) {
        const vesselContainers = containers.filter(c => c.vesselId === vesselId);
        const vessel = vessels.find(v => v.id === vesselId);
        
        if (!vessel) return;
        
        showToast(`Preparing document package for ${vessel.name}...`, 'info');
        
        // Simulate package creation
        setTimeout(() => {
            const data = {
                vessel: vessel.name,
                containers: vesselContainers.length,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${vessel.name}-documents-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Document package downloaded', 'success');
        }, 2000);
    };
    
    window.sendVesselMessage = function(vesselId) {
        openMessageModal();
        // Could pre-fill subject with vessel name
    };
    
    window.sendContainerMessage = function(containerId) {
        const textarea = document.getElementById('newMessage');
        const message = textarea.value.trim();
        
        if (!message) {
            showToast('Please enter a message', 'warning');
            return;
        }
        
        const container = containers.find(c => c.id === containerId);
        if (!container) return;
        
        // Add message to container
        if (!container.messages) container.messages = [];
        container.messages.push({
            id: `msg-${Date.now()}`,
            sender: 'You',
            time: new Date().toISOString(),
            content: message,
            priority: 'normal'
        });
        
        // Clear input
        textarea.value = '';
        
        // Refresh container modal if open
        if (document.getElementById('containerModal').classList.contains('active')) {
            openContainerModal(container);
        }
        
        showToast('Message sent and recorded', 'success');
    };
    
    window.printDocument = function(containerId, docName) {
        showToast(`Printing ${formatDocName(docName)}...`, 'info');
        // In real app, this would trigger print dialog
    };
    
    window.processDocumentUpload = function() {
        const containerId = document.getElementById('uploadContainer').value;
        const docType = document.getElementById('uploadDocType').value;
        const fileInput = document.getElementById('fileUpload');
        
        if (!fileInput.files.length) {
            showToast('Please select a file to upload', 'warning');
            return;
        }
        
        const container = containers.find(c => c.id === containerId);
        if (!container) return;
        
        // Update document status
        container.documents[docType] = {
            status: 'complete',
            date: new Date().toISOString(),
            file: `uploaded-${Date.now()}.pdf`
        };
        
        showToast(`${formatDocName(docType)} uploaded for ${containerId}`, 'success');
        document.getElementById('messageModal').classList.remove('active');
        
        // Refresh views
        initDocumentsGrid();
        
        // If container modal is open, refresh it
        if (selectedContainer === containerId) {
            openContainerModal(container);
        }
    };
    
    // Initialize dashboard
    initDashboard();
});
