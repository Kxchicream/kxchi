// ── NAVBAR LOGIC ──
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    highlightNav();
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
    });
});

function highlightNav() {
    const sections = ['home', 'services', 'pricing', 'projects', 'contact'];
    const scrollY = window.scrollY + 100;
    sections.forEach(id => {
        const el = document.getElementById(id);
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!el || !link) return;
        const top = el.offsetTop, bot = top + el.offsetHeight;
        link.classList.toggle('active', scrollY >= top && scrollY < bot);
    });
}

// ── CANVAS BACKGROUND ANIMATION ──
const canvas = document.getElementById('circuit-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function resizeCanvas() {
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const nodes = [];
const NUM_NODES = 35;

function initNodes() {
    nodes.length = 0;
    if (!canvas) return;
    for (let i = 0; i < NUM_NODES; i++) {
        nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2 });
    }
}
initNodes();
window.addEventListener('resize', initNodes);

function drawCircuit() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
                const alpha = (1 - dist / 160) * 0.35;
                ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[i].x, nodes[j].y); ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(59,130,246,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
            }
        }
    }
    nodes.forEach((n) => {
        n.pulse += 0.04;
        const glow = 0.6 + Math.sin(n.pulse) * 0.4;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fillStyle = `rgba(59,130,246,${0.2 * glow})`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(147,197,253,${glow})`; ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });
    requestAnimationFrame(drawCircuit);
}
if (canvas) drawCircuit();

// ── SCHEDULER ENGINE ──
const calMonthYear = document.getElementById('cal-month-year');
const calDaysGrid = document.getElementById('cal-days-grid');
const calPrevBtn = document.getElementById('cal-prev-btn');
const calNextBtn = document.getElementById('cal-next-btn');
const timeSlotsContainer = document.getElementById('time-slots-container');
const btnGoStep2 = document.getElementById('go-to-step-2');
const btnBackStep1 = document.getElementById('back-to-step-1');
const panelStep1 = document.getElementById('panel-step-1');
const panelStep2 = document.getElementById('panel-step-2');

const standardTimeSlots = ['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM'];
let currentCalendarDate = new Date();
let selectedFormattedDate = null;
let selectedFormattedTime = null;

function renderCalendar(targetDate) {
    if (!calDaysGrid) return;
    calDaysGrid.innerHTML = '';
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (calMonthYear) calMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayIndex; i++) { calDaysGrid.appendChild(document.createElement('div')); }

    for (let day = 1; day <= totalDays; day++) {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button'; dayBtn.classList.add('cal-day'); dayBtn.textContent = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (new Date(year, month, day) < today || new Date(year, month, day).getDay() === 0) dayBtn.disabled = true;
        if (selectedFormattedDate === dateStr) dayBtn.classList.add('selected');

        dayBtn.addEventListener('click', () => {
            document.querySelectorAll('.cal-day').forEach(b => b.classList.remove('selected'));
            dayBtn.classList.add('selected');
            selectedFormattedDate = dateStr;
            selectedFormattedTime = null;
            if (btnGoStep2) btnGoStep2.disabled = true;
            renderTimeSlots();
        });
        calDaysGrid.appendChild(dayBtn);
    }
}

async function getBookedSlots() {
    try {
        const res = await fetch('booking_handler.php');
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function renderTimeSlots() {
    if (!timeSlotsContainer) return;
    const bookings = await getBookedSlots();
    timeSlotsContainer.innerHTML = '';

    standardTimeSlots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('time-slot-btn');
        btn.textContent = slot;

        const isBooked = bookings.some(b => b.includes(`Date: ${selectedFormattedDate}`) && b.includes(`Time: ${slot}`));

        if (isBooked) {
            btn.disabled = true;
            btn.classList.add('booked');
        } else if (selectedFormattedTime === slot) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedFormattedTime = slot;
            if (btnGoStep2) btnGoStep2.disabled = false;
        });
        timeSlotsContainer.appendChild(btn);
    });
}

// ── FORM SUBMISSION ──
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dInput = form.querySelector('input[name="booking_date"]');
    const tInput = form.querySelector('input[name="booking_time"]');

    if (dInput) dInput.value = selectedFormattedDate || '';
    if (tInput) tInput.value = selectedFormattedTime || '';

    if (!dInput || !dInput.value || !tInput || !tInput.value) {
        alert("Error: Date or Time is missing. Please select a slot.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '⚙ Processing...';

    try {
        const formData = new FormData(form);
        const res = await fetch('booking_handler.php', { method: 'POST', body: formData });
        const result = await res.json();
        alert(result.message);
        if (result.success) location.reload();
    } catch (err) {
        alert("Submission failed.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm Appointment Slot';
    }
});

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    function initLiveClock() {
        const clockElement = document.getElementById('live-clock');
        if (!clockElement) return;
        setInterval(() => {
            const now = new Date();
            clockElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' — ' + now.toLocaleTimeString();
        }, 1000);
    }

    if (btnGoStep2) btnGoStep2.addEventListener('click', () => { panelStep1.classList.remove('active'); panelStep2.classList.add('active'); });
    if (btnBackStep1) btnBackStep1.addEventListener('click', () => { panelStep2.classList.remove('active'); panelStep1.classList.add('active'); });
    if (calPrevBtn) calPrevBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(currentCalendarDate); });
    if (calNextBtn) calNextBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(currentCalendarDate); });

    renderCalendar(currentCalendarDate);
    initLiveClock();
});