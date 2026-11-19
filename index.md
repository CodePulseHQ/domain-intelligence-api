---
layout: default
title: "Domain Intelligence API: WHOIS/RDAP expiry, DNS, SPF/DKIM/DMARC with plain-English fixes, SSL certificate and website technology for any list of domains."
description: "Check SPF, DKIM and DMARC in bulk, monitor SSL and domain expiry, look up WHOIS via RDAP and detect website technology. Guides and examples for Python, curl and automation."
---

<div class="hero">
  <h1>Domain Intelligence API</h1>
  <p class="lead">Check domains in bulk: DNS records, SPF/DKIM/DMARC with plain-English fixes, registration and expiry, the SSL certificate and the technology a website runs on. No API keys.</p>
  <a class="cta" href="https://apify.com/codepulsehq/domain-intelligence-api">Try it on Apify</a>
  <a class="cta secondary" href="https://github.com/CodePulseHQ/domain-intelligence-api">Examples on GitHub</a>
</div>

Pay per check that returns data: $0.0008 DNS and email security, $0.001 registration, $0.0008 SSL, $0.0014 website technology per domain (about $0.004 for everything). Made by [CodePulse](https://codepulsehq.com); these pages document our hosted Actor.

## Quick start

```bash
export APIFY_TOKEN=...   # free Apify account: Console > Settings > API & Integrations

curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["stripe.com", "github.com"], "checks": ["email", "ssl", "registration"]}'
```

## Guides {#guides}

<div class="cards">
  <div class="card"><h3><a href="docs/spf-too-many-dns-lookups.md">SPF too many DNS lookups: the 10 lookup limit and how to fix it</a></h3><p>What counts toward SPF's 10 DNS lookup limit, how to check your real count and five ways to get under it.</p></div>
  <div class="card"><h3><a href="docs/check-spf-dkim-dmarc-bulk.md">How to check SPF, DKIM and DMARC for many domains at once</a></h3><p>Check email authentication for a whole list of domains in one run, with plain-English problems to fix.</p></div>
  <div class="card"><h3><a href="docs/monitor-ssl-and-domain-expiry.md">How to monitor SSL certificate and domain expiry for a list of domains</a></h3><p>Schedule a daily check of SSL certificates and domain registrations and get warned before anything expires.</p></div>
  <div class="card"><h3><a href="docs/detect-website-technology-api.md">How to detect what technology a website uses (a cheaper BuiltWith alternative)</a></h3><p>Detect the CMS, ecommerce platform, framework, analytics, CDN and tools a website uses, with the evidence for each match.</p></div>
  <div class="card"><h3><a href="docs/whois-vs-rdap-api.md">WHOIS vs RDAP: how to look up domain registration data through an API</a></h3><p>WHOIS is being replaced by RDAP. What you get, what is hidden, and how to look up registrar, dates and status for many domains.</p></div>
</div>

## Free tools

Working in the browser, no sign-up: [MX lookup](tools/mx-record-lookup/), [SPF checker](tools/spf-record-checker/), [DMARC checker](tools/dmarc-record-checker/), [DKIM lookup](tools/dkim-record-lookup/), [DNS lookup](tools/dns-lookup/) and [domain expiry checker](tools/domain-expiry-checker/). [All tools](tools/)

## Frequently asked questions

**Do I need API keys?** No.

**What does it cost?** $0.0008 for DNS and email security, $0.001 for registration, $0.0008 for SSL and $0.0014 for website technology, per domain, only for checks that return data. About $0.004 per domain for everything.

**Is it WHOIS?** Registration data comes from RDAP, the modern replacement for WHOIS: registrar, dates, status, name servers and DNSSEC. Registrant contact details are hidden by registries.

**How accurate is technology detection?** It reads the homepage's headers, cookies, HTML and script URLs and shows the evidence for each match. It covers about 120 common technologies and doesn't run JavaScript.

## More from CodePulse

- [YouTube Transcript API](https://apify.com/codepulsehq/youtube-transcript-api): Transcripts of any YouTube video, playlist or channel.
- [SEC EDGAR API](https://apify.com/codepulsehq/sec-edgar-api): 10-K text as Markdown, financials, insider trades and 13F holdings.
- [US Federal Opportunities API](https://apify.com/codepulsehq/us-federal-opportunities-api): SAM.gov contracts, Grants.gov grants and award winners, no API key.
- [Speech to Text API](https://apify.com/codepulsehq/speech-to-text-api): Transcribe audio and video links with Whisper, from $0.24 an hour.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need API keys?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No."
      }
    },
    {
      "@type": "Question",
      "name": "What does it cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "$0.0008 for DNS and email security, $0.001 for registration, $0.0008 for SSL and $0.0014 for website technology, per domain, only for checks that return data. About $0.004 per domain for everything."
      }
    },
    {
      "@type": "Question",
      "name": "Is it WHOIS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Registration data comes from RDAP, the modern replacement for WHOIS: registrar, dates, status, name servers and DNSSEC. Registrant contact details are hidden by registries."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is technology detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It reads the homepage's headers, cookies, HTML and script URLs and shows the evidence for each match. It covers about 120 common technologies and doesn't run JavaScript."
      }
    }
  ]
}
</script>
