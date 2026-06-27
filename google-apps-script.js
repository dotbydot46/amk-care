/**
 * AMK Care Service Google Sheets CRM Endpoint - V21
 * Saves website forms into Google Sheets and emails AMK Care Service.
 *
 * Supports:
 * 1) Client care enquiries / free consultations
 * 2) Carer applications / Join AMK Care
 *
 * Setup:
 * 1. Create/open the AMK Care Service Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this whole file into Apps Script.
 * 4. Update NOTIFY_EMAILS if needed.
 * 5. Deploy > New deployment > Web app.
 * 6. Execute as: Me. Access: Anyone.
 * 7. Copy the Web App URL into website script.js > AMK_CONFIG.googleSheetEndpoint.
 */
const CONFIG = {
  CLIENT_SHEET: 'Client Enquiries',
  CARER_SHEET: 'Carer Applications',
  NOTIFY_EMAILS: ['help@amkcare.co.uk'],
  COMPANY_NAME: 'AMK Care Service',
  COMPANY_NUMBER: '15313263'
};

const CLIENT_HEADERS = [
  'timestamp','status','name','phone','email','location','preferredContact','careType','whenNeeded',
  'message','source','pageUrl','utmSource','utmCampaign','followUpDate','notes'
];

const CARER_HEADERS = [
  'timestamp','status','name','phone','email','location','experience','roleInterest','availability',
  'rightToWork','dbs','references','drive','message','source','pageUrl','followUpDate','notes'
];

function doPost(e) {
  try {
    const data = parseRequest_(e);
    const isCarer = String(data.leadType || '').toLowerCase().includes('carer');
    const sheetName = isCarer ? CONFIG.CARER_SHEET : CONFIG.CLIENT_SHEET;
    const headers = isCarer ? CARER_HEADERS : CLIENT_HEADERS;
    const sheet = getSheet_(sheetName);

    ensureHeaders_(sheet, headers);
    const normalized = normalizeData_(data);
    sheet.appendRow(headers.map((key) => normalized[key] || ''));

    sendNotification_(normalized, isCarer);

    return json_({ ok: true, type: isCarer ? 'carer-application' : 'client-enquiry' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function parseRequest_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      if (e.postData.type && e.postData.type.indexOf('application/json') !== -1) {
        return JSON.parse(e.postData.contents);
      }
    } catch (err) {}
  }
  return e.parameter || {};
}

function normalizeData_(data) {
  return {
    timestamp: data.timestamp || new Date().toISOString(),
    status: data.status || 'New',
    leadType: data.leadType || 'Care enquiry',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    location: data.location || '',
    preferredContact: data.preferredContact || '',
    careType: data.careType || '',
    whenNeeded: data.whenNeeded || '',
    experience: data.experience || '',
    roleInterest: data.roleInterest || '',
    availability: data.availability || '',
    rightToWork: data.rightToWork || '',
    dbs: data.dbs || '',
    references: data.references || '',
    drive: data.drive || '',
    consent: data.consent || '',
    message: data.message || '',
    source: data.source || 'website-form',
    pageUrl: data.pageUrl || '',
    utmSource: data.utmSource || '',
    utmCampaign: data.utmCampaign || '',
    followUpDate: data.followUpDate || '',
    notes: data.notes || ''
  };
}

function getSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
}

function ensureHeaders_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = current.some(Boolean);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#05254A').setFontColor('#FFFFFF');
  }
}

function sendNotification_(data, isCarer) {
  if (!CONFIG.NOTIFY_EMAILS || !CONFIG.NOTIFY_EMAILS.length) return;
  const subject = isCarer ? 'New AMK Care Service carer application' : 'New AMK Care Service care consultation request';
  const body = buildEmailBody_(data, isCarer);
  MailApp.sendEmail({ to: CONFIG.NOTIFY_EMAILS.join(','), subject, body, name: 'AMK Care Service Website' });
}

function buildEmailBody_(data, isCarer) {
  const lines = [
    isCarer ? 'New carer application from the AMK Care Service website.' : 'New care consultation request from the AMK Care Service website.',
    '',
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Location: ${data.location}`
  ];

  if (isCarer) {
    lines.push(
      `Experience: ${data.experience}`,
      `Role interest: ${data.roleInterest}`,
      `Availability: ${data.availability}`,
      `Right to work: ${data.rightToWork}`,
      `DBS: ${data.dbs}`,
      `References: ${data.references}`,
      `Drives: ${data.drive}`
    );
  } else {
    lines.push(
      `Care type: ${data.careType}`,
      `When needed: ${data.whenNeeded}`,
      `Preferred contact: ${data.preferredContact}`
    );
  }

  lines.push('', 'Message:', data.message || 'No message provided.', '', `Page: ${data.pageUrl}`, `Company number: ${CONFIG.COMPANY_NUMBER}`);
  return lines.join('\n');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Optional manual test inside Apps Script editor. */
function testClientLead() {
  doPost({ parameter: {
    leadType: 'Care enquiry', name: 'Test Client', phone: '07852 888 932', email: 'test@example.com',
    location: 'London', preferredContact: 'Phone call', careType: 'Live-in care', whenNeeded: 'As soon as possible',
    message: 'Testing AMK Care Service client enquiry form.'
  }});
}

function testCarerLead() {
  doPost({ parameter: {
    leadType: 'Carer application', name: 'Test Carer', phone: '07123 456 789', email: 'carer@example.com',
    location: 'Kent', experience: 'Yes', roleInterest: 'Live-in Carer', availability: 'Full-time',
    rightToWork: 'Yes', dbs: 'Yes', references: 'Yes', drive: 'No',
    message: 'Testing AMK Care Service carer application form.'
  }});
}
