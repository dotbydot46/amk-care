# AMK Care Service Website V22

Professional static website build based on the approved AMK Care Service design.

## Included
- Multi-page public website
- Client care enquiry form connected to Google Sheet CRM endpoint
- Join AMK Care page with carer application form
- Individual service pages
- Legal/trust pages
- Cookie banner and accessibility statement
- Sitemap, robots.txt and SEO metadata
- V22 trust/growth polish: top contact bar, professional standards section, honest reviews placeholder, improved service icons and clearer family/carer funnels
- Launch QA script at `tools/launch-check.mjs`

## Current launch-readiness status
The public pages have been cleaned of unfinished "to be confirmed" placeholder copy, the thank-you page is set to `noindex`, and the sitemap excludes conversion-only pages.

Run the local static check with Node:

```bash
node tools/launch-check.mjs
```

## Still required from AMK before final public launch
- Full registered company display details: registered office address, where the company is registered, and full limited-company name/status if applicable
- Confirmed CQC/regulatory wording if personal care or other regulated activity is being provided
- Exact selected Home Care local areas
- Google Business Profile / review link
- AMK approval of legal pages
- Live test of both CRM forms after upload
