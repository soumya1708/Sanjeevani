/**
 * SANJEEVANI - Core Interactivity Engine
 * Merged Logic: Multi-Asset Routing + Geolocation + API Bridge
 */

// --- DOM ELEMENTS ---
const assetSelect = document.getElementById('asset-type');
const donorForm = document.getElementById('unifiedRegistryForm');
const detectLocBtn = document.getElementById('detect-loc');
const manualLocationInput = document.getElementById('manual-location');

// --- DYNAMIC SECTION MAPPING ---
const sections = {
    blood: document.getElementById('blood-fields'),
    plasma: document.getElementById('plasma-fields'),
    stem: document.getElementById('stem-fields'),
    organ: document.getElementById('organ-fields')
};

// ==================== 1. TOAST NOTIFICATION SYSTEM ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl text-white font-medium shadow-lg z-50 flex items-center gap-2 transition-all duration-400 ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`;
    toast.innerHTML = `${type === 'success' ? '✅' : '⚠️'} ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ==================== 2. CONDITIONAL FORM RENDERING ====================
assetSelect.addEventListener('change', (e) => {
    const selectedAsset = e.target.value;

    // Hide all specific sections
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.add('hidden-section');
            section.classList.remove('section-active');
        }
    });

    // Show only the relevant section
    if (sections[selectedAsset]) {
        sections[selectedAsset].classList.remove('hidden-section');
        sections[selectedAsset].classList.add('section-active');
    }
});

// ==================== 3. GEOLOCATION ENGINE ====================
async function handleGeolocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.", "error");
        return;
    }

    detectLocBtn.disabled = true;
    detectLocBtn.innerHTML = `⌛ Pinging Satellites...`;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const geoString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            // Fill the input
            manualLocationInput.value = geoString;
            
            // UI Update
            detectLocBtn.disabled = false;
            detectLocBtn.innerHTML = `✅ Location Captured`;
            detectLocBtn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
            
            showToast("📍 Coordinates captured successfully!", "success");
        },
        (error) => {
            detectLocBtn.disabled = false;
            detectLocBtn.innerHTML = `📍 Detect My Location`;
            
            let msg = "Failed to get location.";
            if (error.code === 1) msg = "Location access denied.";
            else if (error.code === 2) msg = "Location unavailable.";
            
            showToast(msg, "error");
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

detectLocBtn.addEventListener('click', handleGeolocation);

// ==================== 4. FORM SUBMISSION & API BRIDGE ====================
donorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect base data
    const baseData = {
        assetType: assetSelect.value,
        name: donorForm.querySelector('input[placeholder="Jane Doe"]').value,
        age: donorForm.querySelector('input[placeholder="25"]').value,
        location: manualLocationInput.value
    };

    // UI Loading State
    const submitBtn = donorForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Transmitting Beacon...`;

    try {
        // Construct the full payload based on the active section
        // In a real-world scenario, you would grab specific fields from the active section here
        
        const response = await fetch('https://sanjeevani-am9d.onrender.com/api/donors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(baseData)
        });

        if (response.ok) {
            showToast('🚀 Beacon Activated! Your life-saving asset is now live.', 'success');
            donorForm.reset();
            // Reset sections
            Object.values(sections).forEach(s => s.classList.add('hidden-section'));
        } else {
            throw new Error('Server response was not OK');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showToast('⚠️ Transmission Failed. Check your connection.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sanjeevani System Online.");
});
