# AMK Care Google Sheet CRM Setup - V20

This website can capture two types of leads:

1. Client care enquiries / free consultations
2. Carer applications from the Join AMK Care page

The website form can send each submission into Google Sheets and email AMK Care automatically.

## Recommended Google Sheet tabs

- Dashboard
- Client Enquiries
- Carer Applications
- Lists
- Instructions

A ready-to-use Excel/Google Sheets template is included:

`AMK_Care_CRM_Template.xlsx`

Upload this file to Google Drive and open it with Google Sheets.

## Setup steps

1. Open Google Drive.
2. Upload `AMK_Care_CRM_Template.xlsx`.
3. Open it with Google Sheets.
4. Go to Extensions > Apps Script.
5. Delete any starter code and paste the full contents of `google-apps-script.js`.
6. Confirm `NOTIFY_EMAILS` is correct. Default is `help@amkcare.co.uk`.
7. Click Deploy > New deployment.
8. Select type: Web app.
9. Execute as: Me.
10. Who has access: Anyone.
11. Click Deploy and copy the Web App URL.
12. Open website `script.js` and paste the URL into:

```js
googleSheetEndpoint: 'https://script.google.com/macros/s/AKfycbxS_ZrLWw6P4Pq-Sl1HbAnuYFOpB5XKHTlyquW7fblWcXYqoJZIJTdm3yEVU3XlOKOy/exec'
```

13. Upload the updated website files.
14. Test the client enquiry form and carer application form.

Google’s Apps Script documentation explains that web app deployments make a specific version of the script available for use, and that public-use deployments should be versioned deployments.

## Daily workflow

### Client enquiries
New → Contacted → Consultation Booked → Assessment Done → Care Started → Not Suitable / Closed

### Carer applications
New → Contacted → Screening → Interview → Documents Required → Training → Accepted → Not Suitable / Closed

## Privacy reminder

Care enquiries can contain personal or sensitive family information. Only give Google Sheet access to trusted AMK Care staff who need it.
