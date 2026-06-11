// AMK Care V13
// Premium visual direction + lead capture, CRM readiness and SEO-friendly one-page navigation.
const AMK_CONFIG = {
  email: 'help@amkcare.co.uk',
  phoneHref: '07852888932',
  whatsappNumber: '447852888932',
  googleSheetEndpoint: '', // Paste deployed Google Apps Script Web App URL here when ready.
  companyNumber: '15313263'
};

function encodeParams(params) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

function buildLeadPayload(form) {
  const data = new FormData(form);
  return {
    timestamp: new Date().toISOString(),
    status: 'New',
    name: String(data.get('name') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    email: String(data.get('email') || '').trim(),
    location: String(data.get('location') || '').trim(),
    careType: String(data.get('careType') || '').trim(),
    whenNeeded: String(data.get('whenNeeded') || '').trim(),
    preferredContact: String(data.get('preferredContact') || '').trim(),
    consent: data.get('consent') ? 'Yes' : 'No',
    message: String(data.get('message') || '').trim(),
    source: 'website-form',
    pageUrl: window.location.href,
    utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
    utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || ''
  };
}

function buildLeadMessage(payload) {
  return [
    'New AMK Care website enquiry',
    '',
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Care location: ${payload.location}`,
    `Type of care: ${payload.careType}`,
    `When needed: ${payload.whenNeeded}`,
    `Preferred contact: ${payload.preferredContact}`,
    '',
    'Message:',
    payload.message || 'No message provided.',
    '',
    `Source: ${payload.source}`,
    `Page: ${payload.pageUrl}`,
    `Company number: ${AMK_CONFIG.companyNumber}`
  ].join('\n');
}

function saveLeadToSheet(payload) {
  if (!AMK_CONFIG.googleSheetEndpoint) return Promise.resolve(false);
  return fetch(AMK_CONFIG.googleSheetEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: encodeParams(payload)
  }).then(() => true).catch(() => false);
}

function openEmail(payload) {
  const message = buildLeadMessage(payload);
  window.location.href = `mailto:${AMK_CONFIG.email}?subject=${encodeURIComponent('AMK Care free consultation request')}&body=${encodeURIComponent(message)}`;
}

function openWhatsApp(payload) {
  const message = buildLeadMessage(payload);
  window.open(`https://wa.me/${AMK_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

// Reliable one-page navigation, including the Home link on GitHub Pages.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
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

const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

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
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

const form = document.querySelector('#care-enquiry-form');
const formNote = document.querySelector('#form-note');
if (form) {
  const submitLead = async (method) => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = buildLeadPayload(form);
    const savedToSheet = await saveLeadToSheet(payload);
    if (formNote) {
      formNote.textContent = savedToSheet
        ? 'Enquiry saved to the private AMK Care lead tracker. Opening your chosen contact method now.'
        : 'Opening your chosen contact method. Google Sheet/CRM can be connected later by adding the Apps Script Web App URL.';
    }
    if (method === 'whatsapp') openWhatsApp(payload);
    else openEmail(payload);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitLead('email');
  });

  const whatsappBtn = document.querySelector('#whatsapp-enquiry');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => submitLead('whatsapp'));
  }
}
