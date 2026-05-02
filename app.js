const donorForm = document.getElementById('donorForm');
const scanBtn = document.getElementById('scanBtn');
const radarContainer = document.getElementById('radarContainer');
const scanIcon = document.getElementById('scanIcon');

// Toast Notification Function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl text-white font-medium shadow-lg z-50 flex items-center gap-2 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.innerHTML = `
        ${type === 'success' ? '✅' : '⚠️'} ${message}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 0.4s';
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ==================== 1. GEOLOCATION ENGINE ====================
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                let msg = "Failed to get location.";
                if (error.code === 1) msg = "Location access denied by user.";
                else if (error.code === 2) msg = "Location unavailable.";
                else if (error.code === 3) msg = "Location request timed out.";
                reject(new Error(msg));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

// Auto-fill location when page loads or on button click
async function autoFillLocation() {
    const latInput = document.getElementById('lat');
    const lngInput = document.getElementById('lng');

    try {
        const { latitude, longitude } = await getCurrentLocation();
        latInput.value = latitude.toFixed(6);
        lngInput.value = longitude.toFixed(6);
        showToast("📍 Location captured successfully!", "success");
    } catch (err) {
        console.error(err);
        showToast(err.message, "error");
    }
}

// ==================== 2. FORM VALIDATION ====================
function validateDonorForm(formData) {
    const errors = [];

    if (!formData.name || formData.name.trim().length < 3) {
        errors.push("Name must be at least 3 characters long.");
        document.getElementById('name').classList.add('border-red-500');
    } else {
        document.getElementById('name').classList.remove('border-red-500');
    }

    if (!formData.bloodGroup || formData.bloodGroup === "") {
        errors.push("Please select a blood group.");
        document.getElementById('bloodGroup').classList.add('border-red-500');
    } else {
        document.getElementById('bloodGroup').classList.remove('border-red-500');
    }

    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
        errors.push("Valid location coordinates are required.");
    }

    return errors;
}

// ==================== 3. API BRIDGE + FORM SUBMISSION ====================
donorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const formData = {
        name: document.getElementById('name').value.trim(),
        bloodGroup: document.getElementById('bloodGroup').value,
        latitude: parseFloat(document.getElementById('lat').value),
        longitude: parseFloat(document.getElementById('lng').value),
        isAvailable: true
    };

    // Validate
    const validationErrors = validateDonorForm(formData);
    if (validationErrors.length > 0) {
        showToast(validationErrors[0], "error");
        return;
    }

    // UI Loading State
    const submitBtn = donorForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
        Registering Beacon...
    `;

    try {
    const response = await fetch('https://sanjeevani-am9d.onrender.com/api/donors', {
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('🚀 Beacon Activated! You are now live on the Sanjeevani network.', 'success');
            donorForm.reset();
            // Optionally auto-fill location again
            setTimeout(autoFillLocation, 500);
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showToast('⚠️ Registration Failed. Is your server running on :8080?', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// ==================== 4. RADAR SCAN + UI FEEDBACK ====================
scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;
    scanIcon.classList.add('animate-spin');

    radarContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="radar-pulse mb-8"></div>
            <p class="text-red-600 font-bold animate-pulse uppercase tracking-widest text-sm">
                Pinging Sanjeevani Network...
            </p>
            <p class="text-slate-400 text-xs mt-2">Finding nearby donors</p>
        </div>
    `;

    try {
        const response = await fetch('https://sanjeevani-am9d.onrender.com/api/donors');
        if (!response.ok) throw new Error('Failed to fetch donors');

        const donors = await response.json();

        // Small delay for better UX
        setTimeout(() => {
            renderDonors(donors);
            scanBtn.disabled = false;
            scanIcon.classList.remove('animate-spin');
            
            if (donors && donors.length > 0) {
                showToast(`🎯 Found ${donors.length} donor(s) nearby!`, 'success');
            } else {
                showToast('No donors found in your area.', 'error');
            }
        }, 900);

    } catch (error) {
        console.error('Scan error:', error);
        radarContainer.innerHTML = `
            <div class="text-center p-8 bg-red-50 rounded-2xl border border-red-100">
                <p class="text-red-600 font-bold mb-2">Scan Failed</p>
                <p class="text-slate-500 text-xs">Could not connect to the Sanjeevani server.</p>
            </div>
        `;
        scanBtn.disabled = false;
        scanIcon.classList.remove('animate-spin');
    }
});

// ==================== 5. RENDER DONORS ====================
function renderDonors(donors) {
    if (!donors || donors.length === 0) {
        radarContainer.innerHTML = `
            <p class="text-slate-400 font-medium italic text-center py-12">
                No active donors found in your radar range.
            </p>`;
        return;
    }

    radarContainer.className = "grid grid-cols-1 md:grid-cols-2 gap-4 w-full content-start overflow-y-auto max-h-[600px] pr-2";
    
    radarContainer.innerHTML = donors.map((donor, index) => `
        <div class="donor-card bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4" 
             style="animation-delay: ${index * 80}ms">
            <div class="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-black text-2xl border border-red-100 shrink-0">
                ${donor.bloodGroup}
            </div>
            <div class="overflow-hidden flex-1">
                <h4 class="font-bold text-slate-900 truncate">${donor.name}</h4>
                <p class="text-[10px] font-mono text-slate-400 mt-1">
                    📍 ${donor.latitude.toFixed(4)}, ${donor.longitude.toFixed(4)}
                </p>
                <div class="flex items-center gap-1.5 mt-3">
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-xs font-bold text-green-600 uppercase tracking-wider">Available Now</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize: Auto fetch user location when page loads
document.addEventListener('DOMContentLoaded', () => {
    autoFillLocation();
    
    // Optional: Add a "Get My Location" button listener if you have one
    // const locationBtn = document.getElementById('getLocationBtn');
    // if (locationBtn) locationBtn.addEventListener('click', autoFillLocation);
});