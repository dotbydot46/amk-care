# AMK Care — Enquiry, Google Sheet/CRM and SEO Setup

Company name: AMK Care  
Company number: 15313263  
Main CTA: Request a Free Care Consultation

## 1. Enquiry flow

The website gives visitors four easy ways to enquire:

- Consultation form
- Phone contact
- WhatsApp enquiry
- Email enquiry

The form collects:

- Full name
- Phone number
- Email address
- Care location / postcode
- Preferred contact method
- Type of care
- When care is needed
- Message
- Consent confirmation

## 2. Connect form to Google Sheet / CRM

1. Create a new Google Sheet called `AMK Care Lead Tracker`.
2. Rename the first tab to `Leads`.
3. Open Extensions → Apps Script.
4. Paste the content from `google-apps-script.js`.
5. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the Google Sheet ID from the spreadsheet URL.
6. Click Deploy → New deployment → Web app.
7. Set:
   - Execute as: Me
   - Who has access: Anyone
8. Copy the Web App URL.
9. Open `script.js` and paste the Web App URL into:

```js
googleSheetEndpoint: ''
```

When connected, each website form enquiry can be saved into the private lead tracker.

## 3. CRM status columns

Use the status column like this:

- New
- Contacted
- Consultation booked
- Quote sent
- Converted
- Not suitable
- Follow-up later

## 4. SEO setup

The website includes:

- `robots.txt`
- `sitemap.xml`
- canonical link
- page meta title and description
- Open Graph tags for social sharing
- Twitter card tags
- LocalBusiness structured data
- FAQ-friendly content
- local care availability section
- image alt text

## 5. After launch

Set up:

- Google Search Console
- Google Business Profile
- Google Analytics, if required
- review collection process
- weekly social media posts linking back to the website

## 6. Important checks before public launch

Confirm before publishing:

- registered address
- service area
- regulatory status
- insurance / DBS / CQC wording if used
- photo permissions
- privacy policy
- terms and conditions
- complaints procedure
- safeguarding statement
