/* Frontend-only app with optional API mode or IndexedDB offline mode.
   Mode switching: toggle checkbox #use-api. Default: Offline (IndexedDB).
*/

const useApiCheckbox = document.getElementById('use-api');
const modeChip = document.getElementById('mode-chip');
const statusEl = document.getElementById('status');
let useApi = true; // نخليه true افتراضياً عند الرفع عشان يكلم الـ API

// API base - تم تغييره للعمل على Vercel
const API_BASE = '/api';

useApiCheckbox.checked = true; // تفعيل الـ API في الواجهة

useApiCheckbox.addEventListener('change', e => {
    useApi = e.target.checked;
    modeChip.textContent = `الوضع: ${useApi ? 'API (خادم خارجي)' : 'Offline (IndexedDB)'} `;
    loadBookings();
});

// Simple IndexedDB wrapper
const DB_NAME = 'flight_booking_db_v1';
const DB_VERSION = 1;
let db;
function openDb(){
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (ev) => {
            db = ev.target.result;
            if(!db.objectStoreNames.contains('flights')){
                const flights = db.createObjectStore('flights', { keyPath: 'id', autoIncrement: true });
                flights.createIndex('departure_city', 'departure_city', { unique: false });
                flights.createIndex('destination_city', 'destination_city', { unique: false });
            }
            if(!db.objectStoreNames.contains('bookings')){
                const bookings = db.createObjectStore('bookings', { keyPath: 'id', autoIncrement: true });
                bookings.createIndex('bookingReference', 'bookingReference', { unique: true });
                bookings.createIndex('flightId', 'flightId', { unique: false });
            }
        };
        req.onsuccess = (ev) => { db = ev.target.result; resolve(db); };
        req.onerror = (ev) => { reject(ev.target.error); };
    });
}

async function addFlightToDb(flight){
    const tx = db.transaction('flights','readwrite');
    const store = tx.objectStore('flights');
    return new Promise((res, rej) => { const r = store.add(flight); r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error); });
}

async function getFlightsFromDb(filter){
    filter = filter || {};
    const tx = db.transaction('flights','readonly');
    const store = tx.objectStore('flights');
    return new Promise((res, rej) => {
        const out=[]; const cur = store.openCursor();
        cur.onsuccess = (ev)=>{
            const cursor = ev.target.result; if(!cursor){ res(out); return; }
            const val = cursor.value;
            let ok=true;
            if(filter.departure && filter.departure.trim().length) ok = ok && val.departure_city.toLowerCase().includes(filter.departure.toLowerCase());
            if(filter.destination && filter.destination.trim().length) ok = ok && val.destination_city.toLowerCase().includes(filter.destination.toLowerCase());
            if(filter.date && filter.date.length) {
                const dateOnly = new Date(val.departure_time).toISOString().split('T')[0];
                ok = ok && dateOnly === filter.date;
            }
            if(ok) out.push(val);
            cursor.continue();
        };
        cur.onerror = (e)=> rej(e.target.error);
    });
}

async function addBookingToDb(b){
    const tx = db.transaction(['bookings'],'readwrite');
    const store = tx.objectStore('bookings');
    return new Promise((res, rej)=>{ const r=store.add(b); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
}

async function getBookingsFromDb(){
    const tx = db.transaction('bookings','readonly');
    const store = tx.objectStore('bookings');
    return new Promise((res, rej)=>{ const out=[]; const cur=store.openCursor(null,'prev'); cur.onsuccess=(ev)=>{ const c=ev.target.result; if(!c){ res(out); return; } out.push(c.value); c.continue(); }; cur.onerror=(e)=>rej(e.target.error); });
}

// Seed demo data (تعبئة حقول البحث للسرعة)
document.getElementById('seed-btn').addEventListener('click', ()=>{
    const destinations = [
        'الرياض', 'أبوظبي', 'الكويت', 'عمان', 'بيروت', 'الدوحة', 'المنامة', 'بغداد', 'مسقط', 'تونس',
        'الرباط', 'الجزائر', 'نواكشوط', 'طرابلس', 'الخرطوم', 'جيبوتي', 'مقديشو', 'موروني', 'القدس', 'دمشق', 'صنعاء',
        'لندن', 'باريس', 'برلين', 'مدريد', 'روما', 'لشبونة', 'فيينا', 'أمستردام', 'بروكسل', 'أثينا',
        'ستوكهولم', 'أوسلو', 'كوبنهاغن', 'هلسنكي', 'موسكو', 'كييف', 'وارسو', 'براغ', 'بودابست', 'بوخارست', 
        'صوفيا', 'بلغراد', 'زغرب', 'برن', 'دبلن', 'ريغا', 'فيلنيوس', 'تالين', 'براتيسلافا', 'ليوبليانا'
    ];
    
    // إختيار وجهة عشوائية وتاريخ سفر عشوائي
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    const randomDay = Math.floor(Math.random() * 28) + 1; // يوم عشوائي
    const formattedDate = `2025-12-${randomDay < 10 ? '0' + randomDay : randomDay}`; // تاريخ عشوائي في شهر 12
    
    // تعبئة الحقول
    document.getElementById('departure').value = 'القاهرة';
    document.getElementById('destination').value = randomDest;
    document.getElementById('date').value = formattedDate; // ملء التاريخ ليتخطى المنع
    
    statusEl.textContent = 'تم تعبئة الحقول (شاملة التاريخ عشوائياً).. اضغط بحث!';
});

// UI functions
const flightsListEl = document.getElementById('flights-list');
const bookingsListEl = document.getElementById('bookings-list');

function renderFlightsLocal(flights){
    flightsListEl.innerHTML = '';
    if(!flights || flights.length===0){ flightsListEl.innerHTML = '<p>لا توجد رحلات مطابقة.</p>'; return; }
    flights.forEach(f=>{
        const div = document.createElement('div'); div.className='flight-card';
        div.innerHTML = `<strong>${escapeHtml(f.airline)} — رحلة ${escapeHtml(f.flight_number)}</strong>
        <div class='meta'>${escapeHtml(f.departure_city)} → ${escapeHtml(f.destination_city)} | ${new Date(f.departure_time).toLocaleString('ar-EG')}</div>
        <div class='meta'>السعر: ${f.price} ${escapeHtml(f.currency)}</div>
        <div style='margin-top:10px'><button class='primary' data-id='${f.id}'>حجز الآن</button></div>`;
        flightsListEl.appendChild(div);
    });
    flightsListEl.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click', async ()=>{
        const id = Number(b.getAttribute('data-id'));
        await handleBookingLocal(id);
    }));
}

function renderBookingsLocal(bookings){
    bookingsListEl.innerHTML = '';
    if(!bookings || bookings.length===0){ bookingsListEl.innerHTML = '<p>لا توجد حجوزات حتى الآن.</p>'; return; }
    bookings.forEach(b=>{
        const div = document.createElement('div'); div.className='flight-card';
        div.innerHTML = `<strong>حجز: ${escapeHtml(b.bookingReference)}</strong>
        <div class='meta'>${escapeHtml(b.passengerName)} — ${b.passengers} مسافر</div>
        <div class='meta'>رحلة: ${escapeHtml(b.flight.airline)} — ${escapeHtml(b.flight.flight_number)}</div>`;
        bookingsListEl.appendChild(div);
    });
}

function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// Local handlers
async function handleSearchLocal(e){
    e.preventDefault();
    statusEl.textContent = 'جارٍ البحث...';
    const departure = document.getElementById('departure').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const date = document.getElementById('date').value;
    if(useApi){
        // call API if desired
        try{
            const q = new URLSearchParams({ departure, destination, date }).toString();
            const res = await fetch(`${API_BASE}/flights?${q}`);
            if(!res.ok) throw new Error('فشل جلب الرحلات من الخادم');
            const flights = await res.json();
            renderFlightsLocal(flights);
            statusEl.textContent = 'تم التحميل من API';
        } catch(err){ 
            statusEl.textContent = 'خطأ API: ' + err.message; 
            console.error(err);
        }
    } else {
        await openDb();
        const flights = await getFlightsFromDb({ departure, destination, date });
        renderFlightsLocal(flights);
        statusEl.textContent = 'تم التحميل من IndexedDB';
    }
}

async function handleBookingLocal(flightId){
    const passengers = parseInt(document.getElementById('passengers').value || '1');
    const passengerName = prompt('أدخل اسم الراكب:');
    if(!passengerName) return alert('اسم الراكب مطلوب');
    if(useApi){
        // call API
        try{
            const res = await fetch(`${API_BASE}/bookings`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ flightId, passengerName, passengers }) });
            if(!res.ok) throw new Error('فشل إنشاء الحجز عبر API');
            const data = await res.json();
            alert('تم الحجز عبر API. رقم الحجز: ' + data.bookingReference);
            loadBookings();
        }catch(err){ alert('خطأ API: ' + err.message); }
    } else {
        // local booking
        await openDb();
        // read flight
        const tx = db.transaction('flights','readonly');
        const store = tx.objectStore('flights');
        const f = await new Promise((res,rej)=>{ const r=store.get(flightId); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
        if(!f) return alert('الرحلة غير موجودة');
        const bookingReference = 'BK-' + Math.random().toString(36).slice(2,8).toUpperCase();
        const rec = { bookingReference, passengerName, passengers, flightId, flight: f, createdAt: new Date().toISOString() };
        await addBookingToDb(rec);
        alert('تم الحجز محليًا. رقم الحجز: ' + bookingReference);
        loadBookings();
    }
}

async function loadBookings(){
    if(useApi){
        try{
            const res = await fetch(`${API_BASE}/bookings`);
            if(!res.ok) throw new Error('فشل جلب الحجوزات من API');
            const list = await res.json();
            renderBookingsLocal(list);
            statusEl.textContent = 'حجوزات من API';
        }catch(err){ 
            statusEl.textContent = 'خطأ API: ' + err.message; 
            console.error(err);
        }
    } else {
        await openDb();
        const list = await getBookingsFromDb();
        renderBookingsLocal(list);
        statusEl.textContent = 'حجوزات محلية (IndexedDB)';
    }
}

// Bind events
document.getElementById('flight-search-form').addEventListener('submit', handleSearchLocal);

// initial load
(async ()=>{ 
    await openDb(); 
    modeChip.textContent = `الوضع: ${useApi ? 'API (خادم خارجي)' : 'Offline (IndexedDB)'} `;
    loadBookings(); 
})();

// Smooth scroll with animation
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const section = document.querySelector(href);
            if(section){
              section.style.animation = 'fadeUp .6s ease';
              section.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});
