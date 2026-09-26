const STORAGE_KEY = 'aura-health-lab.bookings.v1';

const services = [
  { id: 'longevity', name: 'Comprehensive Longevity Check-up', short: 'Comprehensive Longevity Check-up', description: 'A deeper look at your health markers and what they mean for your next chapter.', price: 450, duration: '90 minutes', icon: 'sparkle', tag: 'Whole health' },
  { id: 'iv', name: 'Targeted IV Vitamin Therapy', short: 'Targeted IV Vitamin Therapy', description: 'A clinician-guided infusion plan, tailored to your needs and health history.', price: 190, duration: '60 minutes', icon: 'drop', tag: 'Restore' },
  { id: 'nutrition', name: 'Nutritional Biomarker Consultation', short: 'Nutritional Biomarker Consultation', description: 'Connect your biomarkers, nutrition, and everyday habits with a clear plan.', price: 280, duration: '60 minutes', icon: 'leaf', tag: 'Nutrition' },
];

const clinicians = [
  { id: 'morgan', name: 'Dr. Morgan Lee', credential: 'MD · Internal Medicine', specialty: 'Longevity & Preventive Care', bio: 'Known for turning complex health data into a plan that feels clear, practical, and personal.', rate: 185, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=180&h=220&q=85', alt: 'Dr. Morgan Lee, physician' },
  { id: 'james', name: 'Dr. James Bennett', credential: 'MD · Integrative Medicine', specialty: 'IV & Metabolic Health', bio: 'Combines evidence-led medicine with a whole-person approach to energy and resilience.', rate: 165, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=180&h=220&q=85', alt: 'Dr. James Bennett, physician' },
  { id: 'avery', name: 'Dr. Avery Chen', credential: 'DO · Clinical Nutrition', specialty: 'Nutrition & Biomarkers', bio: 'Helps patients find a sustainable, data-informed relationship with food and wellbeing.', rate: 175, image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=180&h=220&q=85', alt: 'Dr. Avery Chen, physician' },
];

const stepNames = ['Services', 'Schedule', 'Details', 'Confirmation'];
const timeGroups = [
  { name: 'Morning', icon: 'sun', slots: ['9:00 AM', '10:30 AM', '11:30 AM'] },
  { name: 'Afternoon', icon: 'sun-high', slots: ['1:00 PM', '2:30 PM', '4:00 PM'] },
  { name: 'Evening', icon: 'moon', slots: ['5:00 PM', '6:30 PM'] },
];

const state = {
  step: 1,
  serviceId: services[0].id,
  clinicianId: clinicians[0].id,
  date: '',
  time: '',
  visibleMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  form: { name: '', email: '', phone: '', birthDate: '', goals: '', emailNotice: true, smsNotice: false, consent: false },
  errors: {},
  booking: null,
};

const wizard = document.querySelector('#wizardCard');
const summary = document.querySelector('#summaryCard');
const progress = document.querySelector('#progressNav');
const historyDialog = document.querySelector('#historyDialog');
const historyContent = document.querySelector('#historyContent');
const toast = document.querySelector('#toast');

function icon(name) {
  const paths = {
    sparkle: '<path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 2l.7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z"/>',
    drop: '<path d="M12 2.5s-6.5 7.2-6.5 12a6.5 6.5 0 1 0 13 0c0-4.8-6.5-12-6.5-12Z"/><path d="M9 15.5c.3 1.5 1.3 2.4 2.8 2.7" stroke-linecap="round"/>',
    leaf: '<path d="M20.5 3.5C11 3.3 5.4 5 4 10.1c-1.2 4.4 2.3 8 6.2 7.2 5.2-1.1 7.5-7.3 10.3-13.8Z"/><path d="M3 21c3.2-6.1 7.1-9.7 13-12" stroke-linecap="round"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round"/><path d="M8 14h2m4 0h2m-8 3h2" stroke-linecap="round"/>',
    person: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.5-3.5 2.7-5.2 6.5-5.2s6 1.7 6.5 5.2" stroke-linecap="round"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.4 2" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="4" y="9" width="16" height="12" rx="2"/><path d="M8 9V6.5a4 4 0 0 1 8 0V9m-4 5v2" stroke-linecap="round"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M20 12H5m6 6-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="m5 12 4.2 4L19 6" stroke-linecap="round" stroke-linejoin="round"/>',
    sun: '<circle cx="12" cy="12" r="3.6"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-linecap="round"/>',
    'sun-high': '<circle cx="12" cy="14" r="3.7"/><path d="M12 2v5m0 14v1M4.2 6.2l3.5 3.5m8.6 8.6 3.5 3.5M2 14h4m12 0h4" stroke-linecap="round"/>',
    moon: '<path d="M20.5 14A8.4 8.4 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" stroke-linejoin="round"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6" stroke-linecap="round" stroke-linejoin="round"/>',
    phone: '<path d="M7 3h3l1.2 4-2 1.5a14 14 0 0 0 6.3 6.3l1.5-2 4 1.2v3c0 1.1-.9 2-2 2C10 18 6 14 5 5c0-1.1.9-2 2-2Z" stroke-linejoin="round"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
}

const serviceById = id => services.find(item => item.id === id);
const clinicianById = id => clinicians.find(item => item.id === id);
const formatMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const formatMonth = date => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
const formatDate = (dateValue, options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) => new Intl.DateTimeFormat('en-US', options).format(new Date(`${dateValue}T12:00:00`));
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function readBookings() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(item => item && item.reference && item.date && item.time) : [];
  } catch {
    return [];
  }
}

function updateHistoryCount() {
  const count = readBookings().length;
  const badge = document.querySelector('#historyCount');
  badge.textContent = count > 99 ? '99+' : String(count);
  badge.setAttribute('aria-label', `${count} saved ${count === 1 ? 'visit' : 'visits'}`);
}

function renderProgress() {
  progress.innerHTML = `<ol class="progress-list">${stepNames.map((name, index) => {
    const step = index + 1;
    const complete = step < state.step;
    const current = step === state.step;
    const classes = ['progress-item', current ? 'is-current' : '', complete ? 'is-complete' : ''].filter(Boolean).join(' ');
    const mark = complete ? icon('check') : String(step);
    const core = `<span class="step-marker">${complete ? `<span class="check-mark">${mark}</span>` : mark}</span><span class="step-label">${name}</span>`;
    return `<li class="${classes}" ${current ? 'aria-current="step"' : ''}>${complete ? `<button class="progress-link" data-go-step="${step}" type="button" aria-label="Go back to ${name}">${core}</button>` : core}</li>`;
  }).join('')}</ol>`;
}

function renderSummary() {
  const service = serviceById(state.serviceId);
  const doctor = clinicianById(state.clinicianId);
  const hasDate = Boolean(state.date && state.time);
  const isFinal = state.step === 4 && state.booking;
  const activeService = service && (state.step > 1 || state.step === 1);
  summary.innerHTML = `
    <div class="summary-head"><h3>${isFinal ? 'Visit at a glance' : 'Your visit'}</h3>${state.step > 1 && !isFinal ? `<button type="button" class="summary-edit" data-go-step="1">Edit choices</button>` : ''}</div>
    <div class="summary-body">
      ${activeService ? `<div class="summary-item"><span class="summary-item-icon">${icon('sparkle')}</span><span class="summary-item-copy"><small>Selected experience</small><strong>${service.short}</strong></span></div>` : `<div class="summary-empty"><span class="summary-empty-icon">${icon('sparkle')}</span><span>Choose a service to start shaping a visit around you.</span></div>`}
      ${doctor && state.step >= 1 ? `<div class="summary-item"><span class="summary-item-icon">${icon('person')}</span><span class="summary-item-copy"><small>Your specialist</small><strong>${doctor.name}</strong></span></div>` : ''}
      ${hasDate ? `<div class="summary-item"><span class="summary-item-icon">${icon('calendar')}</span><span class="summary-item-copy"><small>Date & time</small><strong>${formatDate(state.date, { month: 'short', day: 'numeric' })} · ${state.time}</strong></span></div>` : state.step > 1 ? `<div class="summary-item"><span class="summary-item-icon">${icon('calendar')}</span><span class="summary-item-copy"><small>Date & time</small><strong>Choose a time that works for you</strong></span></div>` : ''}
      ${service && doctor ? `<div class="summary-price"><div class="price-row"><span>Experience</span><strong>${formatMoney(service.price)}</strong></div><div class="price-row"><span>Clinician consultation</span><strong>${formatMoney(doctor.rate)}</strong></div><div class="price-row price-total"><span>Estimated total</span><strong>${formatMoney(service.price + doctor.rate)}</strong></div><p class="included-note">Includes your clinician consultation. Any recommended lab work or follow-up care is discussed with you before it is added.</p></div>` : ''}
    </div>
    <div class="summary-foot">${icon('lock')}<span>Private by design. Your details are only used to plan your visit.</span></div>`;
}

function footerButtons({ back = false, next = 'Continue', nextDisabled = false, nextLabel = 'Continue' } = {}) {
  return `<div class="wizard-footer"><span class="secure-copy">${icon('lock')} Your information is protected</span><div class="button-row">${back ? `<button class="button button-secondary" type="button" data-action="back">${icon('back')} Back</button>` : ''}<button class="button button-primary" type="button" data-action="next" ${nextDisabled ? 'disabled' : ''}>${nextLabel} ${next === 'arrow' ? icon('arrow') : ''}</button></div></div>`;
}

function renderServices() {
  const serviceCards = services.map(service => `<button class="service-card" type="button" data-service="${service.id}" aria-pressed="${state.serviceId === service.id}" aria-label="${service.name}, ${formatMoney(service.price)}, ${service.duration}">
    <span class="selection-indicator" aria-hidden="true"></span><span class="service-icon">${icon(service.icon)}</span><span class="service-name">${service.name}</span><span class="service-meta"><span>${service.duration}</span><strong>${formatMoney(service.price)}</strong></span>
  </button>`).join('');
  const doctorCards = clinicians.map(doctor => `<button class="doctor-card" type="button" data-clinician="${doctor.id}" aria-pressed="${state.clinicianId === doctor.id}" aria-label="Select ${doctor.name}, ${doctor.credential}, consultation ${formatMoney(doctor.rate)}">
    <img class="doctor-photo" src="${doctor.image}" alt="${doctor.alt}" loading="lazy" /><span class="doctor-info"><strong>${doctor.name}</strong><small>${doctor.credential}</small><small>${doctor.specialty}</small><span class="doctor-rate">Consultation ${formatMoney(doctor.rate)}</span></span><span class="doctor-bio">${doctor.bio}</span>
  </button>`).join('');
  return `<div class="fade-in"><p class="step-kicker">STEP 01 · FIND YOUR STARTING POINT</p><h2 class="wizard-title">Care that fits your goals</h2><p class="wizard-subtitle">Choose an experience and the clinician you would like to meet. You can review your investment before you continue.</p>
    <div class="section-label">Choose your experience <small>01 / 02</small></div><div class="service-grid">${serviceCards}</div>
    <div class="section-label">Meet your specialist <small>Choose the right fit for you</small></div><div class="doctor-grid">${doctorCards}</div>
    ${footerButtons({ next: 'arrow', nextLabel: 'Choose a time' })}</div>`;
}

function dateAvailability(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1);
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dayStart >= minDate && dayStart.getDay() !== 0;
}

function isSlotBooked(dateString, groupIndex, slotIndex) {
  const [year, month, day] = dateString.split('-').map(Number);
  const rule = (day * 3 + month * 5 + groupIndex * 7 + slotIndex * 2 + year) % 7;
  return rule === 0 || rule === 5;
}

function renderCalendar() {
  const month = state.visibleMonth;
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array(firstDay).fill('<span aria-hidden="true"></span>');
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const key = dateKey(date);
    const available = dateAvailability(date);
    const selected = key === state.date;
    cells.push(`<button class="calendar-day ${available ? 'is-available' : ''} ${selected ? 'is-selected' : ''}" type="button" data-date="${key}" ${available ? '' : 'disabled'} aria-pressed="${selected}" aria-label="${formatDate(key, { weekday: 'long', month: 'long', day: 'numeric' })}${available ? ', available' : ', unavailable'}">${day}</button>`);
  }
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthDistance = (month.getFullYear() - currentMonth.getFullYear()) * 12 + month.getMonth() - currentMonth.getMonth();
  const dates = cells.join('');
  const selectedTime = state.time;
  const slots = timeGroups.map((group, groupIndex) => `<div class="slot-group"><p class="slot-group-title">${icon(group.icon)} ${group.name}</p><div class="slot-list">${group.slots.map((slot, slotIndex) => {
    const booked = !state.date || isSlotBooked(state.date, groupIndex, slotIndex);
    const selected = selectedTime === slot;
    return `<button class="time-slot" type="button" data-time="${slot}" data-group="${groupIndex}" data-slot="${slotIndex}" ${booked ? 'disabled' : ''} aria-pressed="${selected}" aria-label="${slot}${booked ? ', unavailable' : ''}">${slot}</button>`;
  }).join('')}</div></div>`).join('');
  return `<div class="fade-in"><p class="step-kicker">STEP 02 · MAKE IT YOURS</p><h2 class="wizard-title">Find a time that feels right</h2><p class="wizard-subtitle">Pick a date and an open appointment time. Available days are marked with a green dot.</p>
    <div class="schedule-layout"><div class="calendar"><div class="calendar-head"><strong>${formatMonth(month)}</strong><span class="calendar-controls"><button class="icon-button" type="button" data-month="-1" ${monthDistance <= 0 ? 'disabled' : ''} aria-label="Previous month">‹</button><button class="icon-button" type="button" data-month="1" ${monthDistance >= 2 ? 'disabled' : ''} aria-label="Next month">›</button></span></div><div class="calendar-grid" role="grid" aria-label="${formatMonth(month)}">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(label => `<span class="calendar-weekday" role="columnheader">${label}</span>`).join('')}${dates}</div><div class="calendar-legend"><span><i class="legend-dot"></i> Available</span><span><i class="legend-dot unavailable"></i> Unavailable</span></div></div>
      <div class="slot-panel"><div class="section-label">Appointment time <small>New York time</small></div><div class="selected-date ${state.date ? 'has-date' : ''}" aria-live="polite">${state.date ? formatDate(state.date, { weekday: 'short', month: 'long', day: 'numeric' }) : 'Select a date to see available times'}</div>${slots}<p class="availability-note">Appointments are held for 10 minutes while you complete your details.</p></div></div>
    ${footerButtons({ back: true, next: 'arrow', nextLabel: 'Continue to your details', nextDisabled: !(state.date && state.time) })}</div>`;
}

function renderDetails() {
  const f = state.form;
  const errorFor = key => state.errors[key] ? `has-error` : '';
  const invalid = key => state.errors[key] ? 'aria-invalid="true"' : 'aria-invalid="false"';
  const errorMessage = key => `<small class="field-error" id="${key}Error">${state.errors[key] || ''}</small>`;
  return `<div class="fade-in"><p class="step-kicker">STEP 03 · JUST A LITTLE ABOUT YOU</p><h2 class="wizard-title">Let’s make your visit personal</h2><p class="form-intro">Share a few details so your clinician can prepare for a thoughtful first conversation. Fields marked with an asterisk are required.</p>
    <form class="patient-form" id="patientForm" novalidate>
      <div class="field ${errorFor('name')}"><label for="patientName">Full name <span aria-hidden="true">*</span></label><input id="patientName" name="name" type="text" autocomplete="name" placeholder="As it appears on your ID" value="${escapeAttribute(f.name)}" ${invalid('name')} aria-describedby="nameError" required />${errorMessage('name')}</div>
      <div class="field ${errorFor('email')}"><label for="patientEmail">Email address <span aria-hidden="true">*</span></label><input id="patientEmail" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${escapeAttribute(f.email)}" ${invalid('email')} aria-describedby="emailError" required />${errorMessage('email')}</div>
      <div class="field ${errorFor('phone')}"><label for="patientPhone">Phone number <span aria-hidden="true">*</span></label><input id="patientPhone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+1 (555) 000-0000" value="${escapeAttribute(f.phone)}" ${invalid('phone')} aria-describedby="phoneError" required />${errorMessage('phone')}</div>
      <div class="field ${errorFor('birthDate')}"><label for="patientBirthDate">Date of birth <span aria-hidden="true">*</span></label><input id="patientBirthDate" name="birthDate" type="date" autocomplete="bday" max="${dateKey(new Date())}" value="${escapeAttribute(f.birthDate)}" ${invalid('birthDate')} aria-describedby="birthDateError" required />${errorMessage('birthDate')}</div>
      <div class="field full ${errorFor('goals')}"><label for="patientGoals">What would you like help with? <span class="optional">(optional)</span></label><textarea id="patientGoals" name="goals" maxlength="600" placeholder="Share any goals, questions, or symptoms you would like your clinician to know about." ${invalid('goals')} aria-describedby="goalsError">${escapeHtml(f.goals)}</textarea><span class="field-hint">${f.goals.length}/600 characters · Please don’t include urgent or highly sensitive information here.</span>${errorMessage('goals')}</div>
      <div class="notice-options" aria-label="Appointment notifications"><label class="notice-choice"><input name="emailNotice" type="checkbox" ${f.emailNotice ? 'checked' : ''} /><span><strong>Email reminders</strong><small>Visit details and a gentle reminder</small></span></label><label class="notice-choice"><input name="smsNotice" type="checkbox" ${f.smsNotice ? 'checked' : ''} /><span><strong>Text message reminders</strong><small>Only if you opt in to SMS</small></span></label></div>
      <label class="consent-line ${errorFor('consent')}"><input name="consent" type="checkbox" ${f.consent ? 'checked' : ''} ${state.errors.consent ? 'aria-invalid="true"' : 'aria-invalid="false"'} /><span>I confirm these details are for appointment planning. This demo won’t send them to the clinic. <a href="#privacy" data-action="privacy">Privacy details</a>. <span aria-hidden="true">*</span>${errorMessage('consent')}</span></label>
    </form>
    ${footerButtons({ back: true, next: 'arrow', nextLabel: 'Review & confirm' })}</div>`;
}

function makeCode(reference) {
  const size = 21;
  let hash = 2166136261;
  for (const character of reference) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (x, y) => {
    for (let row = -1; row <= 7; row++) for (let col = -1; col <= 7; col++) {
      const xx = x + col, yy = y + row;
      if (xx < 0 || yy < 0 || xx >= size || yy >= size) continue;
      reserved[yy][xx] = true;
      if (row >= 0 && row <= 6 && col >= 0 && col <= 6) matrix[yy][xx] = row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4);
    }
  };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  let seed = hash >>> 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!reserved[y][x]) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    matrix[y][x] = ((seed >>> 27) & 1) === 1;
  }
  const cells = matrix.flatMap((row, y) => row.map((active, x) => active ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : '')).join('');
  return `<svg viewBox="-1 -1 ${size + 2} ${size + 2}" role="img" aria-label="Simulated visual booking code for ${reference}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" rx="1" fill="#fff"/><g fill="#294a35">${cells}</g></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
const escapeAttribute = escapeHtml;

function renderConfirmation() {
  const booking = state.booking;
  if (!booking) return renderServices();
  return `<div class="fade-in confirmation"><span class="success-icon">${icon('check')}</span><p class="step-kicker">STEP 04 · YOUR NEXT CHAPTER STARTS HERE</p><h2 class="wizard-title">Your visit plan is ready.</h2><p class="confirmation-intro">We’ve saved your plan and prepared your visit pass. Review the details below or add the planned visit to your calendar.</p>
    <div class="ticket"><div class="ticket-main"><div class="ticket-brand"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 5.5C13.3 13.3 9 18 9 24a11 11 0 0 0 22 0c0-6-4.3-10.7-11-18.5Z" stroke="currentColor" stroke-width="1.7"/><path d="M15.5 25.5c1.3 2.4 3 3.6 5.8 3.6 2 0 3.8-.8 5.1-2.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg> AURA HEALTH LAB</div><div class="ticket-ref"><small>Booking reference</small><strong>${escapeHtml(booking.reference)}</strong></div><div class="ticket-details"><span class="ticket-detail"><small>Experience</small><strong>${escapeHtml(booking.service)}</strong></span><span class="ticket-detail"><small>Specialist</small><strong>${escapeHtml(booking.clinician)}</strong></span><span class="ticket-detail"><small>Date & time</small><strong>${escapeHtml(formatDate(booking.date, { month: 'short', day: 'numeric', year: 'numeric' }))} · ${escapeHtml(booking.time)}</strong></span><span class="ticket-detail"><small>Estimated total</small><strong>${formatMoney(booking.total)}</strong></span></div></div><div class="ticket-code">${makeCode(booking.reference)}<small>SIMULATED VISIT CODE</small></div></div>
    <div class="confirmation-actions"><button class="button button-secondary" type="button" data-action="copy-reference">${icon('check')} Copy reference</button><a class="button button-primary" href="${googleCalendarUrl(booking)}" target="_blank" rel="noopener noreferrer">${icon('calendar')} Add to Google Calendar</a></div>
    <p class="demo-note">This booking is saved in this browser for the demo. Aura’s clinic scheduling and notification systems are not connected, so no appointment request has been sent to the clinic.</p>
    <div class="confirmation-bottom"><button class="button button-secondary" type="button" data-action="new-booking">Plan another visit</button></div></div>`;
}

function googleCalendarUrl(booking) {
  const start = dateTimeInNewYork(booking.date, booking.time);
  const end = new Date(start.getTime() + booking.durationMinutes * 60000);
  const calendarDate = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const parameters = new URLSearchParams({ action: 'TEMPLATE', text: `${booking.service} · Aura Health Lab`, dates: `${calendarDate(start)}/${calendarDate(end)}`, details: `Appointment with ${booking.clinician}. Booking reference ${booking.reference}. Estimated total ${formatMoney(booking.total)}.`, location: 'Aura Health Lab, New York, NY' });
  return `https://calendar.google.com/calendar/render?${parameters}`;
}

function timeTo24Hour(time) {
  const match = time.match(/^(\d+):(\d+)\s(AM|PM)$/);
  let hour = Number(match[1]) % 12;
  if (match[3] === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function dateTimeInNewYork(dateString, time) {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeTo24Hour(time).split(':').map(Number);
  const intended = Date.UTC(year, month - 1, day, hour, minute);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(intended));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const seenAsUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
  return new Date(intended - (seenAsUtc - intended));
}

function render() {
  renderProgress();
  renderSummary();
  wizard.innerHTML = state.step === 1 ? renderServices() : state.step === 2 ? renderCalendar() : state.step === 3 ? renderDetails() : renderConfirmation();
  if (state.step === 3) bindFormValues();
  if (state.step === 4 && state.booking) updateHistoryCount();
}

function bindFormValues() {
  const form = document.querySelector('#patientForm');
  if (!form) return;
  form.addEventListener('input', event => {
    const { name, value, checked } = event.target;
    if (name in state.form) state.form[name] = event.target.type === 'checkbox' ? checked : value;
    if (state.errors[name]) {
      delete state.errors[name];
      const field = event.target.closest('.field, .consent-line');
      field?.classList.remove('has-error');
      event.target.setAttribute('aria-invalid', 'false');
      const error = document.querySelector(`#${name}Error`);
      if (error) error.textContent = '';
    }
    if (name === 'goals') {
      const hint = event.target.parentElement.querySelector('.field-hint');
      hint.textContent = `${value.length}/600 characters · Please don’t include urgent or highly sensitive information here.`;
    }
  });
  form.addEventListener('change', event => {
    const { name, checked } = event.target;
    if (name in state.form && event.target.type === 'checkbox') state.form[name] = checked;
  });
}

function validateForm() {
  const values = state.form;
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address, like you@example.com.';
  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) errors.phone = 'Enter a phone number with 7 to 15 digits.';
  if (!values.birthDate) errors.birthDate = 'Enter your date of birth.';
  else {
    const birth = new Date(`${values.birthDate}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(birth.getTime()) || birth >= today) errors.birthDate = 'Choose a date before today.';
  }
  if (values.smsNotice && digits.length < 7) errors.phone = 'Enter a valid phone number to receive text reminders.';
  if (!values.consent) errors.consent = 'Please confirm to continue.';
  state.errors = errors;
  if (!Object.keys(errors).length) return true;
  render();
  const firstKey = Object.keys(errors)[0];
  const firstField = document.querySelector(`[name="${firstKey}"]`);
  firstField?.focus({ preventScroll: true });
  firstField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  announce('Please review the highlighted fields.');
  return false;
}

function createBooking() {
  const service = serviceById(state.serviceId);
  const clinician = clinicianById(state.clinicianId);
  const reference = `AHL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const booking = {
    reference,
    serviceId: service.id,
    service: service.name,
    clinicianId: clinician.id,
    clinician: clinician.name,
    date: state.date,
    time: state.time,
    duration: service.duration,
    durationMinutes: Number.parseInt(service.duration, 10),
    price: service.price,
    clinicianRate: clinician.rate,
    total: service.price + clinician.rate,
    createdAt: new Date().toISOString(),
  };
  const bookings = readBookings();
  bookings.unshift(booking);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings.slice(0, 30)));
  } catch {
    announce('Your visit pass is ready, but this browser could not save it for later.');
  }
  state.booking = booking;
}

function showStep(step) {
  state.step = Math.max(1, Math.min(4, step));
  state.errors = {};
  render();
  document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const current = document.querySelector('.progress-item[aria-current="step"]');
  current?.querySelector('.step-label')?.setAttribute('aria-live', 'polite');
}

let toastTimer;
function announce(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2900);
}

function renderHistory() {
  const bookings = readBookings();
  if (!bookings.length) {
    historyContent.innerHTML = `<div class="history-empty"><span class="summary-empty-icon">${icon('calendar')}</span><strong>Your story starts here</strong><p>Once you plan a visit, you’ll find its details and booking reference saved here on this device.</p></div>`;
    return;
  }
  historyContent.innerHTML = `<div class="history-list">${bookings.map(booking => `<article class="history-entry"><div><strong>${escapeHtml(booking.service)}</strong><small>${escapeHtml(formatDate(booking.date, { month: 'short', day: 'numeric', year: 'numeric' }))} · ${escapeHtml(booking.time)}<br>${escapeHtml(booking.clinician)} · ${escapeHtml(booking.reference)}</small></div><span class="history-cost">${formatMoney(booking.total)}</span></article>`).join('')}</div>`;
}

function resetBooking() {
  state.step = 1;
  state.serviceId = services[0].id;
  state.clinicianId = clinicians[0].id;
  state.date = '';
  state.time = '';
  state.form = { name: '', email: '', phone: '', birthDate: '', goals: '', emailNotice: true, smsNotice: false, consent: false };
  state.booking = null;
  render();
  document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

wizard.addEventListener('click', event => {
  const serviceButton = event.target.closest('[data-service]');
  if (serviceButton) {
    state.serviceId = serviceButton.dataset.service;
    render();
    document.querySelector(`[data-service="${state.serviceId}"]`)?.focus({ preventScroll: true });
    return;
  }
  const clinicianButton = event.target.closest('[data-clinician]');
  if (clinicianButton) {
    state.clinicianId = clinicianButton.dataset.clinician;
    render();
    document.querySelector(`[data-clinician="${state.clinicianId}"]`)?.focus({ preventScroll: true });
    return;
  }
  const dateButton = event.target.closest('[data-date]');
  if (dateButton) {
    state.date = dateButton.dataset.date;
    state.time = '';
    render();
    document.querySelector(`[data-date="${state.date}"]`)?.focus({ preventScroll: true });
    return;
  }
  const timeButton = event.target.closest('[data-time]');
  if (timeButton && !timeButton.disabled) {
    state.time = timeButton.dataset.time;
    render();
    document.querySelector(`[data-time="${CSS.escape(state.time)}"]`)?.focus({ preventScroll: true });
    return;
  }
  const monthButton = event.target.closest('[data-month]');
  if (monthButton && !monthButton.disabled) {
    state.visibleMonth = new Date(state.visibleMonth.getFullYear(), state.visibleMonth.getMonth() + Number(monthButton.dataset.month), 1);
    render();
    return;
  }
  const actionButton = event.target.closest('[data-action]');
  if (actionButton?.dataset.action === 'back') { showStep(state.step - 1); return; }
  if (actionButton?.dataset.action === 'next') {
    if (state.step === 1) showStep(2);
    else if (state.step === 2 && state.date && state.time) showStep(3);
    else if (state.step === 3 && validateForm()) { createBooking(); showStep(4); }
    return;
  }
  if (actionButton?.dataset.action === 'new-booking') { resetBooking(); return; }
  if (actionButton?.dataset.action === 'copy-reference') {
    navigator.clipboard?.writeText(state.booking.reference).then(() => announce('Booking reference copied.')).catch(() => announce(`Your reference is ${state.booking.reference}`));
    return;
  }
  if (actionButton?.dataset.action === 'privacy') { event.preventDefault(); announce('Only appointment details are saved locally. Intake details are not sent or saved after this visit plan.'); }
});

progress.addEventListener('click', event => {
  const button = event.target.closest('[data-go-step]');
  if (button) showStep(Number(button.dataset.goStep));
});
summary.addEventListener('click', event => {
  const button = event.target.closest('[data-go-step]');
  if (button) showStep(Number(button.dataset.goStep));
});

document.querySelector('#historyButton').addEventListener('click', () => {
  renderHistory();
  historyDialog.showModal();
});
document.querySelector('#closeHistory').addEventListener('click', () => historyDialog.close());
historyDialog.addEventListener('click', event => {
  if (event.target === historyDialog) historyDialog.close();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && historyDialog.open) historyDialog.close();
});

updateHistoryCount();
render();
