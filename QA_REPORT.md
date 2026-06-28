# AMK Care Service V22 QA Notes

## Completed
- CRM endpoint retained in script.js
- Fixed SVG viewBox casing
- Added active navigation state
- Added professional standards section without unconfirmed CQC wording
- Added honest reviews/testimonials placeholder only
- Improved homepage headline and service icon variety
- Added top contact bar for desktop while hiding it on mobile
- Kept mobile floating Contact / WhatsApp actions
- Removed fixed pricing and kept personalised quotation wording
- Removed unfinished public footer and company-detail placeholder copy
- Added `noindex` to the thank-you page and removed it from `sitemap.xml`
- Improved form submit handling with duplicate-click protection and email fallback if the CRM endpoint cannot be reached
- Replaced contact-page symbol icons with consistent SVG icons
- Added dependency-free static launch checker at `tools/launch-check.mjs`

## Local checks
- `node --check script.js`
- `node tools/launch-check.mjs`

## Check after upload
1. Home page desktop hero and top bar
2. Mobile menu and floating buttons
3. Contact form saves to Client Enquiries sheet
4. Join AMK Care form saves to Carer Applications sheet
5. Footer legal links
6. Sitemap URL paths after connecting amkcare.co.uk
7. Registered office, jurisdiction, and full company legal name/status are displayed once confirmed by AMK
8. CQC/regulatory wording is added only after registration/scope is confirmed
