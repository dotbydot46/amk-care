# AMK Care CRM & SEO Setup - V16

## CRM setup

The website now has two form types:

1. Client care enquiry / free consultation
2. Carer application / Join AMK Care

Both can be saved into one Google Sheet using the `leadType` column.

### Steps

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Paste `google-apps-script.js`.
4. Deploy as Web App.
5. Set access to Anyone.
6. Copy the Web App URL into `script.js` under `AMK_CONFIG.googleSheetEndpoint`.

## Recommended lead stages

### Client care enquiry
New → Contacted → Consultation Booked → Assessment Done → Care Started → Closed

### Carer application
New → Contacted → Screening → Interview → Documents Required → Accepted → Not Suitable

## SEO setup

Submit `sitemap.xml` in Google Search Console after launch.
Important pages:

- Home
- About
- Services
- Live-in Care
- Pricing
- Areas We Cover
- Join AMK Care
- Contact

Add verified service areas once AMK confirms them.
