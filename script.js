// AMK Care V23 - launch-ready forms, CRM connection and confirmed UK coverage
// Multi-page launch behaviour: navigation, client enquiries, carer applications, CRM readiness, cookie consent and GA4 placeholders.
const AMK_CONFIG = {
  email: 'help@amkcare.co.uk',
  phoneHref: '07852888932',
  whatsappNumber: '447852888932',
  googleSheetEndpoint: 'https://script.google.com/macros/s/AKfycbxS_ZrLWw6P4Pq-Sl1HbAnuYFOpB5XKHTlyquW7fblWcXYqoJZIJTdm3yEVU3XlOKOy/exec', // Connected Google Apps Script Web App URL.
  gaMeasurementId: '', // Optional: add GA4 ID, e.g. G-XXXXXXXXXX. Analytics loads only after cookie consent.
  companyNumber: '15313263',
  companyName: 'AMK Care Service',
  legalCompanyName: 'A M KNOWLEDGE CARE SERVICES LIMITED',
  registeredOffice: 'Hall Farm Office, London Road, Weston, NR34 8TT, United Kingdom'
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

// Keep the confirmed legal company details consistent across all pages.
document.querySelectorAll('.footer-small').forEach((element) => {
  if (element.textContent.includes('Company number:')) {
    element.innerHTML = `AMK Care Service is operated by <strong>${AMK_CONFIG.legalCompanyName}</strong>. Company number: <strong>${AMK_CONFIG.companyNumber}</strong>. Registered office: ${AMK_CONFIG.registeredOffice}.`;
  }
});

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
  const payload = getFormPayload(form);
  const note = form.querySelector('.form-note') || document.querySelector('#form-note');
  const hasEndpoint = AMK_CONFIG.googleSheetEndpoint && AMK_CONFIG.googleSheetEndpoint.startsWith('http');

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

  if (hasEndpoint) {
    if (note) note.textContent = 'Thank you. Your enquiry has been sent to AMK Care Service.';
    window.location.href = 'thank-you.html';
    return;
  }

  if (note) note.textContent = 'Opening your email app. Please review the message and press send.';
  openEmail(payload);
}

document.querySelectorAll('form[data-amk-form], #care-enquiry-form, #carer-application-form').forEach((form) => {
  form.addEventListener('submit', (event) => { event.preventDefault(); submitAMKForm(form, 'email'); });
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

// Final public-release QA. This is intentionally narrow: it removes internal notes,
// corrects a few visitor-facing phrases and keeps the existing design and journeys intact.
(function applyFinalPublicQualityPolish() {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const setMeta = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', value);
  };

  const replaceText = (selector, original, replacement) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.textContent.trim() === original) element.textContent = replacement;
    });
  };

  const markRequiredFields = (form) => {
    if (!form) return;
    const heading = form.querySelector('h2, h3');
    if (heading && !form.querySelector('.form-required-note')) {
      const note = document.createElement('p');
      note.className = 'form-note form-required-note';
      note.textContent = 'Fields marked * are required.';
      heading.insertAdjacentElement('afterend', note);
    }
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach((field) => {
      if (field.type === 'checkbox') return;
      const label = field.closest('label');
      if (!label || label.dataset.requiredMarked === 'true') return;
      const star = document.createElement('span');
      star.textContent = ' *';
      star.setAttribute('aria-hidden', 'true');
      star.style.color = '#9b451f';
      star.style.fontWeight = '800';
      label.insertBefore(star, field);
      label.dataset.requiredMarked = 'true';
    });
  };

  // Replace the About page's temporary company note with confirmed details.
  if (currentPage === 'about.html') {
    const companyNotice = document.querySelector('.company-details-v26 .notice');
    if (companyNotice) {
      companyNotice.innerHTML = `AMK Care Service is operated by <strong>${AMK_CONFIG.legalCompanyName}</strong>. Registered office: ${AMK_CONFIG.registeredOffice}.`;
    }
    const description = 'Learn about AMK Care Service, providing personalised live in care and home care support throughout the UK.';
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:description"]', description);
  }

  // Confirmed by AMK Care Service: care is offered throughout the UK, subject to assessment and availability.
  const confirmedCoverageText = new Map([
    ['Live in care across England', 'Live in care across the UK'],
    ['AMK Care Service provides live in care across England and home care in selected local areas.', 'AMK Care Service provides live in care and home care throughout the UK, subject to assessment and availability.'],
    ['Live in Care throughout England.', 'Live in Care throughout the UK.'],
    ['AMK Care Service provides Live in Care throughout England.', 'AMK Care Service provides Live in Care throughout the UK.'],
    ['Home Care services are currently available within selected local areas and continue to expand.', 'Home care is available throughout the UK, subject to assessment and suitable carer availability.'],
    ['AMK Care Service provides live in care throughout England, subject to assessment and availability.', 'AMK Care Service provides live in care throughout the UK, subject to assessment and suitable carer availability.'],
    ['Live in care is available across England. Home care is currently offered in selected local areas. Families elsewhere in the UK are welcome to contact us so current availability can be discussed accurately.', 'Live in care and home care support are available throughout the UK, subject to assessment and suitable carer availability in the requested area.'],
    ['AMK Care Service currently advertises live in care across England and home care in selected local areas. Contact the team if support is needed elsewhere in the UK so current availability can be checked.', 'Yes. AMK Care Service provides care throughout the UK, subject to assessment and suitable carer availability in the requested area.']
  ]);

  document.querySelectorAll('h1, h2, h3, p, li, strong, span').forEach((element) => {
    const replacement = confirmedCoverageText.get(element.textContent.trim());
    if (replacement) element.textContent = replacement;
  });

  if (currentPage === 'index.html' || currentPage === '') {
    const description = 'AMK Care Service provides personalised live in care and home care support throughout the UK, with thoughtful attention to nutrition, mobility, daily routines and family peace of mind.';
    setMeta('meta[name="description"]', description);

    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      try {
        const data = JSON.parse(structuredData.textContent);
        const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
        const service = graph.find((item) => item['@type'] === 'Service');
        if (service) service.areaServed = { '@type': 'Country', name: 'United Kingdom' };
        structuredData.textContent = JSON.stringify(data);
      } catch (error) {
        console.warn('AMK Care structured data could not be updated.', error);
      }
    }
  }

  if (currentPage === 'areas-we-cover.html') {
    const description = 'AMK Care Service provides live in care and home care support throughout the UK, subject to assessment and suitable carer availability.';
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:description"]', description);
  }

  // Remove public-facing development notes while preserving real service disclaimers.
  document.querySelectorAll('.footer-col .footer-small').forEach((element) => {
    const text = element.textContent.toLowerCase();
    if (text.includes('regulatory wording') || text.includes('registration details')) element.remove();
  });

  document.querySelectorAll('.notice').forEach((element) => {
    const text = element.textContent.trim().toLowerCase();
    const isInternalNote =
      text.includes('before final launch') ||
      text.includes('before launch') ||
      text.includes('after an accessibility audit') ||
      text.includes('google analytics should only be connected once') ||
      text.includes('final regulatory wording will be added');
    if (isInternalNote) element.remove();
  });

  // Areas page: remove the internal SEO planning paragraph.
  if (currentPage === 'areas-we-cover.html') {
    document.querySelectorAll('.legal-card h2').forEach((heading) => {
      if (heading.textContent.trim().toLowerCase() === 'local seo note') {
        const next = heading.nextElementSibling;
        if (next && next.tagName === 'P') next.remove();
        heading.remove();
      }
    });
  }

  // Contact and recruitment forms: make required fields and privacy wording clearer.
  if (currentPage === 'contact.html') {
    const form = document.querySelector('#care-enquiry-form');
    markRequiredFields(form);
    const location = form?.querySelector('input[name="location"]');
    if (location) location.placeholder = 'e.g. Norwich NR3 1AB';
    const note = form?.querySelector('.form-note:not(.form-required-note)');
    if (note) note.innerHTML = 'Your details will be used only to respond to this care enquiry and handled in line with our <a href="privacy-policy.html">Privacy Policy</a>.';
  }

  if (currentPage === 'join-amk-care.html') {
    const form = document.querySelector('#carer-application-form');
    markRequiredFields(form);
    const note = form?.querySelector('.form-note:not(.form-required-note)');
    if (note) note.innerHTML = 'Your details will be used only to respond to your application and handled in line with our <a href="privacy-policy.html">Privacy Policy</a>.';

    const cta = document.querySelector('main .cta-strip');
    if (cta) {
      const title = cta.querySelector('h2');
      const paragraph = cta.querySelector('p');
      const links = cta.querySelectorAll('.cta-actions a');
      if (title) title.textContent = 'Ready to apply?';
      if (paragraph) paragraph.textContent = 'Complete the short application form or contact AMK Care Service on WhatsApp if you have a question.';
      if (links[0]) {
        links[0].href = '#carer-application-form';
        links[0].textContent = 'Apply Online';
      }
      if (links[1]) {
        links[1].href = 'https://wa.me/447852888932?text=Hello%20AMK%20Care%20Service%2C%20I%20have%20a%20question%20about%20joining%20the%20care%20team.';
        links[1].textContent = 'Ask on WhatsApp';
        links[1].target = '_blank';
        links[1].rel = 'noopener';
      }
    }
  }

  // The thank-you page already provides the next actions; remove the repeated enquiry CTA.
  if (currentPage === 'thank-you.html') {
    document.querySelector('main .cta-strip')?.remove();
  }

  // Core live-in care wording: avoid implying that one carer is continuously awake for 24 hours.
  if (currentPage === 'live-in-care.html') {
    replaceText(
      '.legal-card p',
      'A dedicated professional carer stays in the client’s home to provide regular companionship, reassurance and practical support throughout the day and night.',
      'A dedicated professional carer stays in the client’s home to provide companionship, reassurance and practical support throughout the day, with any night-time support agreed during the assessment and set out in the care plan.'
    );
    replaceText(
      '.service-detail-list li',
      'Around the clock companionship and reassurance',
      'Ongoing companionship and reassurance'
    );
    replaceText(
      '.service-detail-list li',
      'Support with daily routines, meals and personal comfort',
      'Support with daily routines, meals, hydration, mobility and personal comfort where included in the care plan'
    );
    const description = 'Live in Care from AMK Care Service, with ongoing companionship and personalised support available throughout the UK, subject to assessment and availability.';
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:description"]', description);
  }

  // Improve two legal-page sentences that sounded like internal drafting notes.
  if (currentPage === 'complaints.html') {
    replaceText(
      '.legal-card p',
      'AMK Care Service will acknowledge the concern and review it as quickly and fairly as possible. Timescales should be confirmed in AMK Care Service’s internal complaints policy.',
      'AMK Care Service will acknowledge the concern, explain the next steps and review it as quickly and fairly as possible. The person raising the concern will be kept informed.'
    );
  }

  if (currentPage === 'safeguarding.html') {
    replaceText(
      '.legal-card p',
      'If there is an immediate risk of harm, contact emergency services. For not immediate concerns relating to AMK Care Service support, please contact AMK Care Service so the concern can be reviewed and appropriate action taken.',
      'If there is an immediate risk of harm, contact the emergency services. For non-immediate concerns relating to AMK Care Service support, please contact the team so the concern can be reviewed and appropriate action taken.'
    );
  }

  // Keep footer wording consistent and professionally hyphenated.
  document.querySelectorAll('.footer-brand > p:not(.footer-small)').forEach((paragraph) => {
    paragraph.textContent = paragraph.textContent.replace(/person centred/gi, 'person-centred');
  });
})();