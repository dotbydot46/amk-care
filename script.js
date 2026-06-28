// AMK Care V22 - launch-ready forms and CRM connection
// Multi-page launch behaviour: navigation, client enquiries, carer applications, CRM readiness, cookie consent and GA4 placeholders.
const AMK_CONFIG = {
  email: 'help@amkcare.co.uk',
  phoneHref: '07852888932',
  whatsappNumber: '447852888932',
  googleSheetEndpoint: 'https://script.google.com/macros/s/AKfycbxS_ZrLWw6P4Pq-Sl1HbAnuYFOpB5XKHTlyquW7fblWcXYqoJZIJTdm3yEVU3XlOKOy/exec', // Connected Google Apps Script Web App URL.
  gaMeasurementId: '', // Optional: add GA4 ID, e.g. G-XXXXXXXXXX. Analytics loads only after cookie consent.
  companyNumber: '15313263',
  companyName: 'AMK Care Service'
};

function encodeParams(params) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function getFormPayload(form) {
  const data = new FormData(form);
  const payload = {
    timestamp: new Date().toISOString(),
    status: 'New',
    leadType: String(data.get('leadType') || form.dataset.amkForm || 'Care enquiry').trim(),
    name: String(data.get('name') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    email: String(data.get('email') || '').trim(),
    location: String(data.get('location') || '').trim(),
    preferredContact: String(data.get('preferredContact') || '').trim(),
    careType: String(data.get('careType') || '').trim(),
    whenNeeded: String(data.get('whenNeeded') || '').trim(),
    experience: String(data.get('experience') || '').trim(),
    roleInterest: String(data.get('roleInterest') || '').trim(),
    availability: String(data.get('availability') || '').trim(),
    rightToWork: String(data.get('rightToWork') || '').trim(),
    dbs: String(data.get('dbs') || '').trim(),
    references: String(data.get('references') || '').trim(),
    drive: String(data.get('drive') || '').trim(),
    consent: data.get('consent') ? 'Yes' : 'No',
    message: String(data.get('message') || '').trim(),
    source: 'website-form',
    pageUrl: window.location.href,
    utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
    utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || ''
  };
  return payload;
}

function buildLeadMessage(payload) {
  const isCarer = payload.leadType.toLowerCase().includes('carer');
  const lines = [
    isCarer ? 'New AMK Care Service carer application' : 'New AMK Care Service free consultation request',
    '',
    `Lead type: ${payload.leadType}`,
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Location: ${payload.location}`
  ];
  if (isCarer) {
    lines.push(
      `Experience: ${payload.experience}`,
      `Role interest: ${payload.roleInterest}`,
      `Availability: ${payload.availability}`,
      `Right to work: ${payload.rightToWork}`,
      `DBS: ${payload.dbs}`,
      `References: ${payload.references}`,
      `Drives: ${payload.drive}`
    );
  } else {
    lines.push(
      `Type of care: ${payload.careType}`,
      `When needed: ${payload.whenNeeded}`,
      `Preferred contact: ${payload.preferredContact}`
    );
  }
  lines.push('', 'Message:', payload.message || 'No message provided.', '', `Page: ${payload.pageUrl}`, `Company number: ${AMK_CONFIG.companyNumber}`);
  return lines.join('\n');
}

function saveLeadToSheet(payload) {
  if (!AMK_CONFIG.googleSheetEndpoint || !AMK_CONFIG.googleSheetEndpoint.startsWith('http')) return Promise.resolve(false);
  return fetch(AMK_CONFIG.googleSheetEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: encodeParams(payload)
  }).then(() => true).catch(() => false);
}

function openEmail(payload) {
  const subject = payload.leadType.toLowerCase().includes('carer') ? 'AMK Care Service carer application' : 'AMK Care Service free consultation request';
  window.location.href = `mailto:${AMK_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildLeadMessage(payload))}`;
}

function openWhatsApp(payload) {
  window.open(`https://wa.me/${AMK_CONFIG.whatsappNumber}?text=${encodeURIComponent(buildLeadMessage(payload))}`, '_blank', 'noopener');
}

function trackEvent(eventName, params = {}) { if (window.gtag) window.gtag('event', eventName, params); }
function loadAnalyticsIfConsented() {
  if (!AMK_CONFIG.gaMeasurementId || localStorage.getItem('amk_cookie_consent') !== 'accepted') return;
  if (document.querySelector('script[data-amk-ga4]')) return;
  const ga = document.createElement('script');
  ga.async = true;
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${AMK_CONFIG.gaMeasurementId}`;
  ga.setAttribute('data-amk-ga4', 'true');
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', AMK_CONFIG.gaMeasurementId);
}
loadAnalyticsIfConsented();

// Reliable navigation for same-page anchors, including Home on GitHub Pages and production domain.
document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const url = new URL(href, window.location.href);
    if (url.pathname.replace(/\/index\.html$/, '/') !== window.location.pathname.replace(/\/index\.html$/, '/')) return;
    const targetId = url.hash;
    if (!targetId) return;
    if (targetId === '#top' || targetId === '#home') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname);
      return;
    }
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', targetId);
  });
});


function setActiveNavLink() {
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html').replace(/\/$/, 'index.html');
  document.querySelectorAll('.nav__menu a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    const linkFile = (href.split('#')[0] || 'index.html');
    if (linkFile === currentFile || (currentFile === '' && linkFile === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });
}
setActiveNavLink();

const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  function closeMenu() { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
}

document.querySelectorAll('a[href^="tel:"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_call', { link_url: link.href })));
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_email', { link_url: link.href })));
document.querySelectorAll('a[href*="wa.me"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_whatsapp', { link_url: link.href })));

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => observer.observe(el));
} else { revealEls.forEach((el) => el.classList.add('is-visible')); }

async function submitAMKForm(form, method) {
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (form.dataset.submitting === 'true') return;

  const payload = getFormPayload(form);
  const note = form.querySelector('.form-note') || document.querySelector('#form-note');
  const hasEndpoint = AMK_CONFIG.googleSheetEndpoint && AMK_CONFIG.googleSheetEndpoint.startsWith('http');
  const buttons = form.querySelectorAll('button[type="submit"], [data-whatsapp-submit], #whatsapp-enquiry');

  form.dataset.submitting = 'true';
  form.setAttribute('aria-busy', 'true');
  buttons.forEach((button) => { button.disabled = true; });

  try {
    if (note) note.textContent = 'Sending your enquiry...';
    const savedToSheet = await saveLeadToSheet(payload);

    trackEvent(payload.leadType.toLowerCase().includes('carer') ? 'carer_application' : 'generate_lead', {
      lead_source: method,
      currency: 'GBP',
      value: 0
    });

    if (method === 'whatsapp') {
      if (note) note.textContent = savedToSheet ? 'Thank you. Your details have been saved. Opening WhatsApp now.' : 'Opening WhatsApp now.';
      openWhatsApp(payload);
      return;
    }

    if (hasEndpoint && savedToSheet) {
      if (note) note.textContent = 'Thank you. Your enquiry has been sent to AMK Care Service.';
      window.location.href = 'thank-you.html';
      return;
    }

    if (hasEndpoint && !savedToSheet) {
      if (note) note.textContent = 'We could not confirm automatic submission. Opening your email app as a backup.';
      openEmail(payload);
      return;
    }

    if (note) note.textContent = 'Opening your email app. After CRM setup, this form will submit automatically.';
    openEmail(payload);
  } finally {
    delete form.dataset.submitting;
    form.setAttribute('aria-busy', 'false');
    buttons.forEach((button) => { button.disabled = false; });
  }
}

document.querySelectorAll('form[data-amk-form], #care-enquiry-form, #carer-application-form').forEach((form) => {
  form.addEventListener('submit', (event) => { event.preventDefault(); submitAMKForm(form, 'form'); });
  form.querySelectorAll('[data-whatsapp-submit], #whatsapp-enquiry').forEach((btn) => {
    btn.addEventListener('click', () => submitAMKForm(form, 'whatsapp'));
  });
});

const cookieBanner = document.querySelector('#cookie-banner');
const acceptCookies = document.querySelector('#accept-cookies');
const rejectCookies = document.querySelector('#reject-cookies');
if (cookieBanner && !localStorage.getItem('amk_cookie_consent')) cookieBanner.hidden = false;
if (acceptCookies) acceptCookies.addEventListener('click', () => { localStorage.setItem('amk_cookie_consent', 'accepted'); if (cookieBanner) cookieBanner.hidden = true; loadAnalyticsIfConsented(); });
if (rejectCookies) rejectCookies.addEventListener('click', () => { localStorage.setItem('amk_cookie_consent', 'essential'); if (cookieBanner) cookieBanner.hidden = true; });
