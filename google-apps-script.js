/**
 * AMK Care Google Sheet Lead Tracker
 * Company number: 15313263
 *
 * Setup:
 * 1) Create a Google Sheet named: AMK Care Lead Tracker
 * 2) Add a sheet/tab named: Leads
 * 3) Copy the spreadsheet ID from the URL and paste it below.
 * 4) In Apps Script, deploy as: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) Copy the Web App URL into script.js as AMK_CONFIG.googleSheetEndpoint.
 */
const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Leads';

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  const headers = [
    'Timestamp', 'Status', 'Full Name', 'Phone', 'Email', 'Care Location',
    'Type of Care', 'When Needed', 'Preferred Contact', 'Consent', 'Message',
    'Source', 'Page URL', 'UTM Source', 'UTM Campaign', 'Company Number',
    'Notes', 'Follow-up Date'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const p = e.parameter || {};

  sheet.appendRow([
    new Date(),
    p.status || 'New',
    p.name || '',
    p.phone || '',
    p.email || '',
    p.location || '',
    p.careType || '',
    p.whenNeeded || '',
    p.preferredContact || '',
    p.consent || '',
    p.message || '',
    p.source || 'website-form',
    p.pageUrl || '',
    p.utmSource || '',
    p.utmCampaign || '',
    '15313263',
    '',
    ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('AMK Care lead tracker is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
