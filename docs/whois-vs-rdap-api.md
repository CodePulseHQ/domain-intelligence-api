---
layout: default
title: "WHOIS vs RDAP: how to look up domain registration data through an API"
description: "WHOIS is being replaced by RDAP. What you get, what is hidden, and how to look up registrar, dates and status for many domains."
---

# WHOIS vs RDAP: how to look up domain registration data through an API

**Short answer:** RDAP (Registration Data Access Protocol) is the standard that replaced WHOIS. It returns structured JSON instead of free text, and every registry runs its own server. The Actor finds the right server for each domain and returns the registrar, creation, update and expiry dates, status codes, name servers and DNSSEC state.

```bash
curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["stripe.com", "github.com"], "checks": ["registration"]}'
```

## Why WHOIS is going away

WHOIS is an old text protocol with no standard format, so every registry's output looks different and parsing is fragile. It also exposed personal contact details, which privacy law now restricts. RDAP is structured, supports access control and is required for the major registries.

## What you get, and what you don't

You get: registrar, registration date, last change, expiry date, status codes (such as `clientTransferProhibited`), name servers and whether DNSSEC is signed.

You don't get: the registrant's name, email and phone. Since privacy rules took effect, registries redact them for most domains, and no API can legally return what the registry hides.

## How the lookup works

1. Download IANA's RDAP bootstrap file (`https://data.iana.org/rdap/dns.json`), which maps each top-level domain to its RDAP server.
2. Query `<server>/domain/<registered domain>`. It must be the registered domain (`example.com`), not a subdomain (`www.example.com`), so the Actor uses the public suffix list to find it.
3. Read the `events` array for the dates and the `entities` array for the registrar.

Some country-code domains don't publish an RDAP server; for those you get the other checks and a note.

Ready-made page: [domain expiry and WHOIS lookup](https://apify.com/codepulsehq/domain-intelligence-api/examples/domain-expiry-and-whois-lookup).
