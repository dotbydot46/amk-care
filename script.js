// AMK Care V23 - launch-ready forms, CRM connection and confirmed UK coverage
// Multi-page launch behaviour: navigation, client enquiries, carer applications, CRM readiness, cookie consent and optional consent-based analytics.
const AMK_CONFIG = {
  email: 'help@amkcare.co.uk',
  phoneHref: '07852888932',
  whatsappNumber: '447852888932',
  googleSheetEndpoint: 'https://script.google.com/macros/s/AKfycbxS_ZrLWw6P4Pq-Sl1HbAnuYFOpB5XKHTlyquW7fblWcXYqoJZIJTdm3yEVU3XlOKOy/exec', // Connected Google Apps Script Web App URL.
  gaMeasurementId: 'G-DZXGTRNBHY', // Loads only after analytics consent.
  companyNumber: '15313263'
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

async function saveLeadToSheet(payload) {
  if (!AMK_CONFIG.googleSheetEndpoint || !AMK_CONFIG.googleSheetEndpoint.startsWith('http')) return Promise.resolve(false);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try { await fetch(AMK_CONFIG.googleSheetEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: encodeParams(payload),
    signal: controller.signal
  }); return true; } catch { return false; } finally { clearTimeout(timeout); }
}

function openEmail(payload) {
  const subject = payload.leadType.toLowerCase().includes('carer') ? 'AMK Care Service carer application' : 'AMK Care Service free consultation request';
  window.location.href = `mailto:${AMK_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildLeadMessage(payload))}`;
}

function openWhatsApp(payload) {
  window.open(`https://wa.me/${AMK_CONFIG.whatsappNumber}?text=${encodeURIComponent(buildLeadMessage(payload))}`, '_blank', 'noopener');
}

// A new consent version asks visitors again now that analytics is actually enabled.
let cookieConsent = null;
try { cookieConsent = localStorage.getItem('amk_cookie_consent_v2'); } catch { /* Browsing and forms still work without storage. */ }
function rememberConsent(value) {
  cookieConsent = value;
  try { localStorage.setItem('amk_cookie_consent_v2', value); } catch { /* Keep the choice for this page. */ }
}
function trackEvent(eventName, params = {}) {
  if (cookieConsent === 'accepted' && window.gtag) window.gtag('event', eventName, params);
}
function loadAnalyticsIfConsented() {
  if (!AMK_CONFIG.gaMeasurementId || cookieConsent !== 'accepted') return;
  window[`ga-disable-${AMK_CONFIG.gaMeasurementId}`] = false;
  if (document.querySelector('script[data-amk-ga4]')) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  window.gtag('js', new Date());
  let referrer = '';
  try { const url = new URL(document.referrer); referrer = url.origin + url.pathname; } catch { /* No referrer. */ }
  window.gtag('config', AMK_CONFIG.gaMeasurementId, {
    page_location: window.location.origin + window.location.pathname,
    page_referrer: referrer,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const ga = document.createElement('script');
  ga.async = true;
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${AMK_CONFIG.gaMeasurementId}`;
  ga.setAttribute('data-amk-ga4', 'true');
  document.head.appendChild(ga);
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
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', window.location.pathname);
      return;
    }
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (targetId === '#main') { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
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
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
}

document.querySelectorAll('a[href^="tel:"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_call')));
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_email')));
document.querySelectorAll('a[href*="wa.me"]').forEach((link) => link.addEventListener('click', () => trackEvent('click_whatsapp')));

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
  if (form.getAttribute('aria-busy') === 'true') return;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const payload = getFormPayload(form);
  const note = form.querySelector('.form-note[role="status"]') || document.querySelector('#form-note');
  const hasEndpoint = AMK_CONFIG.googleSheetEndpoint && AMK_CONFIG.googleSheetEndpoint.startsWith('http');

  const buttons = [...form.querySelectorAll('button')];
  form.setAttribute('aria-busy', 'true');
  buttons.forEach((button) => { button.disabled = true; });
  // Open during the user's click, before the network wait can trigger popup blocking.
  if (method === 'whatsapp') openWhatsApp(payload);
  if (note) note.textContent = method === 'whatsapp' ? 'Review your message in WhatsApp and press Send to complete your enquiry.' : 'Sending your details...';
  const savedToSheet = await saveLeadToSheet(payload);
  form.removeAttribute('aria-busy');
  buttons.forEach((button) => { button.disabled = false; });

  trackEvent(method === 'whatsapp' ? 'whatsapp_form_open' : 'enquiry_submit_attempt', {
    lead_source: method,
    form_type: payload.leadType.toLowerCase().includes('carer') ? 'carer' : 'care'
  });

  if (method === 'whatsapp') {
    return;
  }

  if (hasEndpoint && savedToSheet) {
    if (note) note.textContent = 'Your details have been submitted. Please contact us if you need to follow up.';
    window.location.href = 'thank-you.html';
    return;
  }

  if (note) note.textContent = 'Opening your email app. Please review the message and press send.';
  openEmail(payload);
}

document.querySelectorAll('form[data-amk-form], #care-enquiry-form, #carer-application-form').forEach((form) => {
  const preferred = form.querySelector('[name="preferredContact"]');
  const email = form.querySelector('[name="email"]');
  if (preferred && email) {
    const updateEmailRequirement = () => {
      email.required = preferred.value === 'Email';
      email.setAttribute('aria-required', String(email.required));
    };
    preferred.addEventListener('change', updateEmailRequirement);
    updateEmailRequirement();
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); submitAMKForm(form, 'email'); });
  form.querySelectorAll('[data-whatsapp-submit], #whatsapp-enquiry').forEach((btn) => {
    btn.addEventListener('click', () => submitAMKForm(form, 'whatsapp'));
  });
});

const cookieBanner = document.querySelector('#cookie-banner');
const acceptCookies = document.querySelector('#accept-cookies');
const rejectCookies = document.querySelector('#reject-cookies');
if (cookieBanner && !cookieConsent) cookieBanner.hidden = false;
let cookieTrigger = null;
function closeCookieBanner() {
  if (cookieBanner) cookieBanner.hidden = true;
  cookieTrigger?.focus();
}
document.querySelectorAll('[data-cookie-settings]').forEach((button) => button.addEventListener('click', () => {
  cookieTrigger = button;
  if (cookieBanner) { cookieBanner.hidden = false; acceptCookies?.focus(); }
}));
if (acceptCookies) acceptCookies.addEventListener('click', () => { rememberConsent('accepted'); closeCookieBanner(); loadAnalyticsIfConsented(); });
if (rejectCookies) rejectCookies.addEventListener('click', () => {
  rememberConsent('essential');
  window[`ga-disable-${AMK_CONFIG.gaMeasurementId}`] = true;
  if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) return;
    ['', window.location.hostname, '.' + window.location.hostname].forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? '; domain=' + domain : ''}`;
    });
  });
  closeCookieBanner();
});
