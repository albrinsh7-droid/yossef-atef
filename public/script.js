/* Frontend for Vercel + Aiven MySQL */

const useApiCheckbox = document.getElementById('use-api');
const modeChip = document.getElementById('mode-chip');
const statusEl = document.getElementById('status');
const API_BASE = '/api';
let useApi = true;

// تفعيل الوضع الأونلاين افتراضياً
useApiCheckbox.checked = true;

useApiCheckbox.addEventListener('change', e => {
    useApi = e.target.checked;
    modeChip.textContent = `الوضع: ${useApi ? 'API (خادم خارجي)' : 'Offline (IndexedDB)'} `;
});

// زر ملئ بيانات تجريبية
document.getElementById('seed-btn').addEventListener('click', () => {
    document.getElementById('departure').value = 'القاهرة';
    document.getElementById('destination').value = 'الرياض';
    document.getElementById('date').value = '2025-10-01';
    statusEl.textContent = 'تم ملئ بيانات تجريبية.. اضغط بحث الآن!';
    // ضغطة بحث أوتوماتيك
    document.getElementById('flight-search-form').dispatchEvent(new Event('submit'));
});

// دالة البحث
async function handleSearch(e) {
    e.preventDefault();
    statusEl.textContent = 'جارٍ البحث في الداتا بيز...';
    
    const departure = document.getElementById('departure').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const date = document.getElementById('date').value;

    try {
        const q = new URLSearchParams({ departure, destination }).toString(); 
        const res = await fetch(`${API_BASE}/flights?${q}`);
        
        if (!res.ok) throw new Error('فشل الاتصال بالسيرفر');
        
        const flights = await res.json();
        renderFlights(flights);
        statusEl.textContent = `تم العثور على (${flights.length}) رحلة`;
    } catch (err) {
        statusEl.textContent = 'خطأ: ' + err.message;
    }
}

const flightsListEl = document.getElementById('flights-list');

function renderFlights(flights) {
    flightsListEl.innerHTML = '';
    if (!flights || flights.length === 0) {
        flightsListEl.innerHTML = '<p class="no-results">❌ لا توجد رحلات مطابقة في الداتا بيز. جرب تبحث عن (القاهرة إلى الرياض) أو (دبي إلى نيويورك).</p>';
        return;
    }
    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <div class="airline-info">
                <strong>✈️ ${escapeHtml(f.airline)} — رحلة ${escapeHtml(f.flight_number)}</strong>
            </div>
            <div class='meta'>${escapeHtml(f.departure_city)} ← ${escapeHtml(f.destination_city)}</div>
            <div class='meta'>📅 التاريخ: ${new Date(f.departure_time).toLocaleDateString('ar-EG')}</div>
            <div class='price-tag'>السعر: ${f.price} ${escapeHtml(f.currency)}</div>
            <button class='primary' onclick="handleBooking(${f.id})">حجز هذه الرحلة</button>
        `;
        flightsListEl.appendChild(div);
    });
}

async function handleBooking(flightId) {
    const passengerName = prompt('من فضلك أدخل اسم المسافر بالكامل:');
    if (!passengerName) return;
    const passengers = document.getElementById('passengers').value || 1;

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightId, passengerName, passengers })
        });
        const data = await res.json();
        alert(`✅ تم الحجز بنجاح!\nرقم الحجز الخاص بك هو: ${data.bookingReference}`);
        loadBookings();
    } catch (err) {
        alert('حدث خطأ أثناء الحجز');
    }
}

async function loadBookings() {
    const bookingsListEl = document.getElementById('bookings-list');
    try {
        const res = await fetch(`${API_BASE}/bookings`);
        const list = await res.json();
        bookingsListEl.innerHTML = '';
        if (list.length === 0) { bookingsListEl.innerHTML = '<p>لا توجد حجوزات مسجلة.</p>'; return; }
        list.forEach(b => {
             const div = document.createElement('div');
             div.className = 'flight-card';
             div.innerHTML = `<strong>🎟️ حجز: ${b.bookingReference}</strong><br>المسافر: ${b.passengerName}<br>الرحلة: ${b.flight.airline}`;
             bookingsListEl.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

function escapeHtml(s) { 
    if (!s && s !== 0) return ''; 
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); 
}

document.getElementById('flight-search-form').addEventListener('submit', handleSearch);
window.onload = loadBookings;
