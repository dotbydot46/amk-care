/**
 * AMK Care Google Sheet Lead Tracker
 * Paste this into Google Apps Script and deploy as a Web App.
 * Deploy access: Anyone with the link.
 */
const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Leads';

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME) ||
    SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

  const headers = [
    'Timestamp', 'Status', 'Full Name', 'Phone', 'Email', 'Care Location',
    'Type of Care', 'When Needed', 'Preferred Contact', 'Message',
    'Source', 'Page URL', 'UTM Source', 'UTM Campaign', 'Notes', 'Follow-up Date'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

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
    p.message || '',
    p.source || '',
    p.pageUrl || '',
    p.utmSource || '',
    p.utmCampaign || '',
    '',
    ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
