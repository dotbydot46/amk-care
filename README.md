# AMK Care Website V10 — Lead & SEO Ready

This version focuses on conversion and launch preparation.

## Added in V10

- Clear main CTA: **Request a Free Care Consultation**.
- Easy enquiry paths: website form, WhatsApp, email and phone.
- Optional Google Sheet / CRM integration.
- Lead tracker CSV template.
- Local SEO-ready section for service areas.
- SEO metadata, canonical URL, sitemap, robots.txt and structured data.
- Official AMK logo file added as a master asset.
- Continued responsive layout for mobile, tablet, laptop and desktop.

## Contact details used

- Phone / WhatsApp: 07852 888 932
- Email: help@amkcare.co.uk
- Instagram: https://www.instagram.com/amkcare
- Facebook: https://www.facebook.com/share/1JTbkJA1Gn/

## How to connect Google Sheet / CRM

1. Create a Google Sheet called `AMK Care Leads`.
2. Copy the sheet ID from the URL.
3. Open **Extensions > Apps Script**.
4. Paste the code from `google-apps-script.js`.
5. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with your real sheet ID.
6. Deploy as **Web app**.
7. Set access to **Anyone with the link**.
8. Copy the Web App URL.
9. Open `script.js` and paste the URL into:

```js
googleSheetEndpoint: ''
```

10. Upload the website again and test the form.

## Important before public launch

- Confirm company name, company number, address and service areas.
- Confirm regulatory status before adding any CQC/DBS/insurance claims.
- Confirm permission/consent for all real photos used on the website.
- Update `sitemap.xml` and `robots.txt` if the domain changes.
