---
layout: default
title: "How to monitor SSL certificate and domain expiry for a list of domains"
description: "Schedule a daily check of SSL certificates and domain registrations and get warned before anything expires."
---

# How to monitor SSL certificate and domain expiry for a list of domains

**Short answer:** schedule the Actor on your domain list and filter two fields: `summary.ssl_days_left` and `summary.days_until_expiry`. Anything under your threshold needs attention.

```bash
curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["yourcompany.com", "client-a.com", "client-b.com"], "checks": ["ssl", "registration"]}'
```

```json
{ "domain": "stripe.com", "summary": { "registrar": "SafeNames Ltd.", "days_until_expiry": 296, "ssl_valid": true, "ssl_days_left": 172 } }
```

## Setting up the alert

1. Save the input as a Task and add a Schedule (daily is plenty).
2. Connect the run to email, Slack or a webhook from the Integrations tab.
3. Alert on rows where `summary.ssl_days_left < 14`, `summary.ssl_valid` is false, or `summary.days_until_expiry < 30`.

## What counts as a problem

- **Expired certificate:** `ssl.valid` is false and the error says it has expired.
- **Name mismatch:** the certificate doesn't cover the domain (check `ssl.san`).
- **Untrusted issuer or incomplete chain:** browsers will show a warning even though the certificate is in date.
- **Domain about to lapse:** a short `days_until_expiry`, or a status like `pendingDelete` in `registration.status`.

## Doing it yourself

```bash
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -dates -issuer
```

and an RDAP lookup for the expiry date. Fine for a handful of domains; across a portfolio you need the loop, the date arithmetic and the scheduling.

Ready-made pages: [SSL certificate expiry checker](https://apify.com/codepulsehq/domain-intelligence-api/examples/ssl-certificate-expiry-checker) and [domain expiry and WHOIS lookup](https://apify.com/codepulsehq/domain-intelligence-api/examples/domain-expiry-and-whois-lookup).
