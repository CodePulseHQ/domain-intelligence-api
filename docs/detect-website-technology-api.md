---
layout: default
title: "How to detect what technology a website uses (a cheaper BuiltWith alternative)"
description: "Detect the CMS, ecommerce platform, framework, analytics, CDN and tools a website uses, with the evidence for each match."
---

# How to detect what technology a website uses

**Short answer:** choose the *website* check. The Actor fetches the homepage and matches its response headers, cookies, HTML, script URLs and meta tags against a library of signatures, and shows the evidence for each match so you can judge it yourself.

```bash
curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["shopify.com", "wordpress.org"], "checks": ["website"]}'
```

```json
{ "name": "Next.js", "category": "JavaScript framework", "evidence": "html: __NEXT_DATA__" }
```

## What it can and can't tell you

It covers about 120 common technologies: CMS (WordPress, Drupal, Ghost...), site builders (Wix, Squarespace, Webflow, Shopify), JavaScript frameworks, web servers, CDNs and hosting, analytics and ad pixels, chat and support widgets, payments and consent tools. It also reports security headers (HSTS, CSP, X-Frame-Options and others) and page basics (title, description, language).

It does **not** run JavaScript, so single-page apps that render everything in the browser reveal less, and it covers the homepage only. For exhaustive coverage of thousands of technologies and historical data, a dedicated paid database such as BuiltWith is more complete; this is the quick, cheap, pay-per-domain option for prospecting and audits.

## Use cases

- **Sales prospecting:** find Shopify stores using Klaviyo, or sites on an outdated CMS.
- **Competitor research:** what are they running, and behind which CDN?
- **Security hygiene:** which of your sites lack HSTS or a content security policy?

## Doing it yourself

Fetch the homepage, then match patterns such as `/wp-content/` (WordPress), `cdn.shopify.com` (Shopify), a `cf-ray` header (Cloudflare) or an `x-powered-by` header. The hard part is curating the signatures and keeping false positives down, for example a page that merely mentions "WooCommerce" in text isn't running it.

Ready-made page: [detect what technology a website uses](https://apify.com/codepulsehq/domain-intelligence-api/examples/website-technology-detector).
