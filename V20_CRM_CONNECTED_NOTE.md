# AMK Care V20 — CRM Connected

This version has the Google Apps Script Web App URL added to `script.js`, so the client consultation form and carer application form can save submissions to the AMK Care Google Sheet CRM.

Endpoint connected:
`https://script.google.com/macros/s/AKfycbxS_ZrLWw6P4Pq-Sl1HbAnuYFOpB5XKHTlyquW7fblWcXYqoJZIJTdm3yEVU3XlOKOy/exec`

## Test after upload
1. Submit a test client enquiry.
2. Check the Client Enquiries tab in Google Sheets.
3. Check email notification to the configured notification email.
4. Submit a test carer application.
5. Check the Carer Applications tab.
6. Delete test rows after confirming.

If submissions do not appear, check that the Apps Script deployment is set to:
- Execute as: Me
- Who has access: Anyone
