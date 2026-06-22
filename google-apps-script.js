/**
 * AMK Care Google Sheets CRM endpoint - V16.
 * Supports both client care enquiries and carer applications.
 * Setup:
 * 1) Create a Google Sheet.
 * 2) Extensions > Apps Script, paste this file.
 * 3) Deploy > New deployment > Web app.
 * 4) Execute as: Me. Who has access: Anyone.
 * 5) Copy the Web App URL into script.js > AMK_CONFIG.googleSheetEndpoint.
 */
const SHEET_NAME = 'AMK Website Leads';
const HEADERS = [
  'timestamp', 'status', 'leadType', 'name', 'phone', 'email', 'location',
  'preferredContact', 'careType', 'whenNeeded',
  'experience', 'roleInterest', 'availability', 'rightToWork', 'dbs', 'references', 'drive',
  'consent', 'message', 'source', 'pageUrl', 'utmSource', 'utmCampaign', 'followUpDate', 'notes'
];

function doPost(e) {
  try {
    const data = e.postData && e.postData.type === 'application/json'
      ? JSON.parse(e.postData.contents)
      : e.parameter;
    const sheet = getLeadSheet_();
    ensureHeaders_(sheet);
    sheet.appendRow(HEADERS.map((key) => data[key] || ''));
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getLeadSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = current.some(Boolean);
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}
