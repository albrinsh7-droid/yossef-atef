/* Frontend for Vercel + Aiven MySQL */
const useApiCheckbox = document.getElementById('use-api');
const modeChip = document.getElementById('mode-chip');
const statusEl = document.getElementById('status');
const API_BASE = '/api';
let useApi = true;

// تفعيل الوضع الأونلاين افتراضياً
useApiCheckbox.checked = true;

// زر ملئ بيانات تجريبية
document.getElementById('seed-btn').addEventListener('click', () => {
    document.getElementById('departure').value = 'القاهرة';
    document.getElementById('destination').value = 'الرياض';
    document.getElementById('date').value = '2025-10-01';
    statusEl.textContent = 'تم ملئ بيانات تجريبية.. جارٍ البحث أوتوماتيكياً...';
    document.getElementById('flight-search-form').dispatchEvent(new Event('submit'));
});

// دالة البحث
async function handleSearch(e) {
    if(e) e.preventDefault();
    statusEl.textContent = 'جارٍ البحث في الداتا بيز...';
    const departure = document.getElementById('departure').value.trim();
    const destination = document.getElementById('destination').value.trim();
    try {
        const q = new URLSearchParams({ departure, destination }).toString(); 
        const res = await fetch(`${API_BASE}/flights?${q}`);
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
        flightsListEl.innerHTML = '<p class="no-results">❌ لا توجد رحلات مطابقة. جرب تبحث عن (القاهرة) و (الرياض) أو اضغط زر "ملئ بيانات تجريبية".</p>';
        return;
    }
    flights.forEach(f => {
        const div = document.createElement('div');
        div.className = 'flight-card';
        div.innerHTML = `
            <strong>✈️ ${escapeHtml(f.airline)} — ${escapeHtml(f.flight_number)}</strong>
            <div class='meta'>${escapeHtml(f.departure_city)} ← ${escapeHtml(f.destination_city)}</div>
            <div class='meta'>📅 ${new Date(f.departure_time).toLocaleDateString('ar-EG')}</div>
            <div class='price-tag'>السعر: ${f.price} ${escapeHtml(f.currency)}</div>
            <button class='primary' onclick="handleBooking(${f.id})">حجز الآن</button>
        `;
        flightsListEl.appendChild(div);
    });
}

async function handleBooking(flightId) {
    const passengerName = prompt('أدخل اسم المسافر:');
    if (!passengerName) return;
    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightId, passengerName, passengers: 1 })
        });
        const data = await res.json();
        alert('✅ تم الحجز بنجاح! رقم الحجز: ' + data.bookingReference);
        loadBookings();
    } catch (err) { alert('خطأ في الحجز'); }
}

async function loadBookings() {
    const listEl = document.getElementById('bookings-list');
    try {
        const res = await fetch(`${API_BASE}/bookings`);
        const list = await res.json();
        listEl.innerHTML = list.map(b => `<div class="flight-card">🎟️ حجز: ${b.bookingReference}<br>المسافر: ${b.passengerName}</div>`).join('') || '<p>لا توجد حجوزات.</p>';
    } catch (e) { }
}

function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
document.getElementById('flight-search-form').addEventListener('submit', handleSearch);
window.onload = loadBookings;
