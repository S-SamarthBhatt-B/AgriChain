// ===== GLOBAL VARIABLES =====
// These store our application data
let currentUser = null;           // Currently logged in user
let produceData = [];            // Array to store all produce registrations
let supplyChainEvents = [];      // Array to store supply chain updates
let retailerInventory = [];      // Array to store retailer inventory

// ===== INITIALIZATION =====
// This runs when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('AgriTrace app starting...');
    createFloatingParticles();
    loadDataFromStorage();
    setupEventListeners();
});

// ===== BACKGROUND ANIMATION =====
// Creates the floating particles in the background
function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation delay so particles don't all start together
        particle.style.animationDelay = Math.random() * 20 + 's';
        
        // Random animation duration for variety
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        particlesContainer.appendChild(particle);
    }
    
    console.log('Created 50 floating particles');
}

// ===== DATA MANAGEMENT =====
// Load saved data from browser's local storage
function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('agriTraceData');
        if (savedData) {
            const data = JSON.parse(savedData);
            produceData = data.produceData || [];
            supplyChainEvents = data.supplyChainEvents || [];
            retailerInventory = data.retailerInventory || [];
            console.log('Loaded data from storage:', data);
        }
    } catch (error) {
        console.error('Error loading data from storage:', error);
    }
}

// Save current data to browser's local storage
function saveDataToStorage() {
    try {
        const dataToSave = {
            produceData: produceData,
            supplyChainEvents: supplyChainEvents,
            retailerInventory: retailerInventory
        };
        localStorage.setItem('agriTraceData', JSON.stringify(dataToSave));
        console.log('Data saved to storage');
    } catch (error) {
        console.error('Error saving data to storage:', error);
    }
}

// ===== EVENT LISTENERS SETUP =====
// Set up all form submissions and button clicks
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Farmer forms
    document.getElementById('produceForm').addEventListener('submit', handleProduceRegistration);
    
    // Distributor forms
    document.getElementById('supplyChainForm').addEventListener('submit', handleSupplyChainUpdate);
    
    // Retailer forms
    document.getElementById('availableForm').addEventListener('submit', handleMarkAvailable);
    
    // Consumer forms
    document.getElementById('scanForm').addEventListener('submit', handleProductScan);
    
    console.log('Event listeners set up');
}

// ===== AUTHENTICATION =====
// Handle user login
function handleLogin(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    // Get form values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Simple validation (in a real app, this would be secure)
    if (username && password && role) {
        currentUser = { 
            username: username, 
            role: role 
        };
        
        console.log('User logged in:', currentUser);
        showDashboardForRole(role);
    } else {
        alert('Please fill in all fields');
    }
}

// Show the appropriate dashboard based on user role
function showDashboardForRole(role) {
    // Hide login page
    document.getElementById('loginPage').classList.add('hidden');
    
    // Hide all dashboards first
    const allDashboards = [
        'farmerDashboard', 
        'distributorDashboard', 
        'retailerDashboard', 
        'consumerDashboard'
    ];
    
    allDashboards.forEach(dashboardId => {
        document.getElementById(dashboardId).classList.add('hidden');
    });
    
    // Show the correct dashboard
    document.getElementById(role + 'Dashboard').classList.remove('hidden');
    
    // Load data for the specific role
    if (role === 'farmer') {
        loadFarmerSubmissions();
    } else if (role === 'distributor') {
        loadDistributorUpdates();
    } else if (role === 'retailer') {
        loadRetailerInventory();
    }
    
    console.log('Showing dashboard for role:', role);
}

// Log out the current user
function logout() {
    console.log('User logging out:', currentUser);
    currentUser = null;
    
    // Hide all dashboards
    const allDashboards = [
        'farmerDashboard', 
        'distributorDashboard', 
        'retailerDashboard', 
        'consumerDashboard'
    ];
    
    allDashboards.forEach(dashboardId => {
        document.getElementById(dashboardId).classList.add('hidden');
    });
    
    // Show login page
    document.getElementById('loginPage').classList.remove('hidden');
    
    // Clear login form
    document.getElementById('loginForm').reset();
}

// ===== FARMER FUNCTIONS =====
// Show farmer home screen
function showFarmerHome() {
    document.getElementById('registerProduce').classList.add('hidden');
    document.getElementById('farmerHome').classList.remove('hidden');
}

// Show produce registration form
function showRegisterProduce() {
    document.getElementById('farmerHome').classList.add('hidden');
    document.getElementById('registerProduce').classList.remove('hidden');
}

// Load and display farmer's previous submissions
function loadFarmerSubmissions() {
    const container = document.getElementById('farmerSubmissions');
    
    if (produceData.length === 0) {
        container.innerHTML = '<p>No submissions yet. Register your first produce!</p>';
        return;
    }
    
    // Create HTML for each submission
    const submissionsHTML = produceData.map(item => `
        <div class="history-item">
            <div class="history-date">${item.date}</div>
            <strong>${item.name}</strong> - ${item.quantity}kg<br>
            <small>Batch ID: ${item.batchId} | Origin: ${item.origin}</small>
        </div>
    `).join('');
    
    container.innerHTML = submissionsHTML;
}

// Handle new produce registration
function handleProduceRegistration(event) {
    event.preventDefault();
    
    // Generate unique batch ID
    const batchId = 'BATCH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Create produce object
    const newProduce = {
        batchId: batchId,
        name: document.getElementById('produceName').value,
        origin: document.getElementById('origin').value,
        harvestDate: document.getElementById('harvestDate').value,
        quantity: document.getElementById('quantity').value,
        details: document.getElementById('details').value,
        date: new Date().toLocaleDateString(),
        farmer: currentUser.username
    };
    
    // Add to our data array
    produceData.push(newProduce);
    saveDataToStorage();
    
    console.log('New produce registered:', newProduce);
    
    // Show success message
    showSuccessMessage('registerProduce', ✅ Produce registered successfully! Batch ID: ${batchId});
    
    // Reset form and return to home
    document.getElementById('produceForm').reset();
    setTimeout(() => {
        showFarmerHome();
        loadFarmerSubmissions();
    }, 2000);
}

// ===== DISTRIBUTOR FUNCTIONS =====
// Show distributor home screen
function showDistributorHome() {
    document.getElementById('updateSupplyChain').classList.add('hidden');
    document.getElementById('distributorHome').classList.remove('hidden');
}

// Show supply chain update form
function showUpdateSupplyChain() {
    document.getElementById('distributorHome').classList.add('hidden');
    document.getElementById('updateSupplyChain').classList.remove('hidden');
}

// Load and display distributor's recent updates
function loadDistributorUpdates() {
    const container = document.getElementById('distributorUpdates');
    
    if (supplyChainEvents.length === 0) {
        container.innerHTML = '<p>No updates yet. Start tracking supply chain events!</p>';
        return;
    }
    
    // Create HTML for each update
    const updatesHTML = supplyChainEvents.map(event => `
        <div class="history-item">
            <div class="history-date">${event.date}</div>
            <strong>${event.eventType}</strong> - ${event.batchId}<br>
            <small>Location: ${event.location}</small>
        </div>
    `).join('');
    
    container.innerHTML = updatesHTML;
}

// Handle supply chain event updates
function handleSupplyChainUpdate(event) {
    event.preventDefault();
    
    // Create supply chain event object
    const newEvent = {
        batchId: document.getElementById('batchId').value,
        eventType: document.getElementById('eventType').value,
        location: document.getElementById('location').value,
        details: document.getElementById('eventDetails').value,
        date: new Date().toLocaleDateString(),
        distributor: currentUser.username
    };
    
    // Add to our data array
    supplyChainEvents.push(newEvent);
    saveDataToStorage();
    
    console.log('Supply chain event recorded:', newEvent);
    
    // Show success message
    showSuccessMessage('updateSupplyChain', '✅ Supply chain event recorded successfully!');
    
    // Reset form and return to home
    document.getElementById('supplyChainForm').reset();
    setTimeout(() => {
        showDistributorHome();
        loadDistributorUpdates();
    }, 2000);
}

// ===== RETAILER FUNCTIONS =====
// Show retailer home screen
function showRetailerHome() {
    document.getElementById('markAvailable').classList.add('hidden');
    document.getElementById('retailerHome').classList.remove('hidden');
}

// Show mark available form
function showMarkAvailable() {
    document.getElementById('retailerHome').classList.add('hidden');
    document.getElementById('markAvailable').classList.remove('hidden');
}

// Load and display retailer's inventory
function loadRetailerInventory() {
    const container = document.getElementById('retailerInventory');
    
    if (retailerInventory.length === 0) {
        container.innerHTML = '<p>No items in inventory yet. Start adding products!</p>';
        return;
    }
    
    // Create HTML for each inventory item
    const inventoryHTML = retailerInventory.map(item => `
        <div class="history-item">
            <div class="history-date">${item.date}</div>
            <strong>${item.batchId}</strong> - $${item.price}/kg<br>
            <small>Store: ${item.storeName} | Location: ${item.shelfLocation}</small>
        </div>
    `).join('');
    
    container.innerHTML = inventoryHTML;
}

// Handle marking produce as available in store
function handleMarkAvailable(event) {
    event.preventDefault();
    
    // Create inventory item object
    const newInventoryItem = {
        batchId: document.getElementById('storeBatchId').value,
        storeName: document.getElementById('storeName').value,
        shelfLocation: document.getElementById('shelfLocation').value,
        price: document.getElementById('price').value,
        expiryDate: document.getElementById('expiryDate').value,
        date: new Date().toLocaleDateString(),
        retailer: currentUser.username
    };
    
    // Add to our data array
    retailerInventory.push(newInventoryItem);
    saveDataToStorage();
    
    console.log('Product marked as available:', newInventoryItem);
    
    // Show success message
    showSuccessMessage('markAvailable', '✅ Product marked as available in store!');
    
    // Reset form and return to home
    document.getElementById('availableForm').reset();
    setTimeout(() => {
        showRetailerHome();
        loadRetailerInventory();
    }, 2000);
}

// ===== CONSUMER FUNCTIONS =====
// Show consumer home screen
function showConsumerHome() {
    document.getElementById('scanQR').classList.add('hidden');
    document.getElementById('qrGenerator').classList.add('hidden');
    document.getElementById('consumerHome').classList.remove('hidden');
}

// Show QR scanning form
function showScanQR() {
    document.getElementById('consumerHome').classList.add('hidden');
    document.getElementById('qrGenerator').classList.add('hidden');
    document.getElementById('scanQR').classList.remove('hidden');
    document.getElementById('productHistory').classList.add('hidden');
}

// Generate a sample QR code for testing
function generateSampleQR() {
    document.getElementById('consumerHome').classList.add('hidden');
    document.getElementById('scanQR').classList.add('hidden');
    document.getElementById('qrGenerator').classList.remove('hidden');
    
    // Generate random batch ID
    const batchId = 'BATCH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('generatedBatchId').textContent = batchId;
    
    // Create simple QR code representation
    const qrElement = document.getElementById('generatedQR');
    qrElement.innerHTML = `
        <div style="font-size: 12px; line-height: 1.2;">
            📱 QR CODE<br>
            ${batchId}<br>
            <small>Scan with camera</small>
        </div>
    `;
    
    console.log('Generated sample QR code for batch:', batchId);
}

// Handle product scanning/tracking
function handleProductScan(event) {
    event.preventDefault();
    
    const batchId = document.getElementById('qrInput').value.toUpperCase();
    console.log('Scanning product with batch ID:', batchId);
    
    // Search for product in our data
    const produce = produceData.find(p => p.batchId === batchId);
    const events = supplyChainEvents.filter(e => e.batchId === batchId);
    const retail = retailerInventory.find(r => r.batchId === batchId);
    
    const historyContainer = document.getElementById('historyContent');
    
    // Check if we found any data
    if (!produce && events.length === 0 && !retail) {
        historyContainer.innerHTML = '<p>❌ No product found with this Batch ID. Try generating a sample QR code first!</p>';
    } else {
        // Build the product history HTML
        let historyHTML = '';
        
        // Show farm origin if available
        if (produce) {
            historyHTML += `
                <div class="history-item">
                    <div class="history-date">${produce.date}</div>
                    <strong>🌱 Farm Origin</strong><br>
                    Product: ${produce.name}<br>
                    Farm: ${produce.origin}<br>
                    Harvest Date: ${produce.harvestDate}<br>
                    Quantity: ${produce.quantity}kg<br>
                    Details: ${produce.details || 'No additional details'}
                </div>
            `;
        }
        
        // Show supply chain events
        events.forEach(event => {
            historyHTML += `
                <div class="history-item">
                    <div class="history-date">${event.date}</div>
                    <strong>🚛 ${event.eventType}</strong><br>
                    Location: ${event.location}<br>
                    Details: ${event.details || 'No additional details'}
                </div>
            `;
        });
        
        // Show retail information if available
        if (retail) {
            historyHTML += `
                <div class="history-item">
                    <div class="history-date">${retail.date}</div>
                    <strong>🏪 Available in Store</strong><br>
                    Store: ${retail.storeName}<br>
                    Location: ${retail.shelfLocation}<br>
                    Price: $${retail.price}/kg<br>
                    Best Before: ${retail.expiryDate}
                </div>
            `;
        }
        
        // If we have a batch ID but no events, show basic message
        if (historyHTML === '') {
            historyHTML = '<p>📦 Product registered but no supply chain events recorded yet.</p>';
        }
        
        historyContainer.innerHTML = historyHTML;
    }
    
    // Show the history section
    document.getElementById('productHistory').classList.remove('hidden');
}

// ===== UTILITY FUNCTIONS =====
// Show success message in a specific container
function showSuccessMessage(containerId, message) {
    const container = document.getElementById(containerId);
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    
    // Insert at the top of the container
    container.insertBefore(successMsg, container.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.remove();
        }
    }, 3000);
}

// ===== DEBUGGING FUNCTIONS =====
// These functions help with development and testing
function clearAllData() {
    produceData = [];
    supplyChainEvents = [];
    retailerInventory = [];
    saveDataToStorage();
    console.log('All data cleared');
}

function showAllData() {
    console.log('Current data state:');
    console.log('Produce:', produceData);
    console.log('Supply Chain Events:', supplyChainEvents);
    console.log('Retailer Inventory:', retailerInventory);
}