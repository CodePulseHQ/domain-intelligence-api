---
layout: default
title: "How to check SPF, DKIM and DMARC for many domains at once"
description: "Check email authentication for a whole list of domains in one run, with plain-English problems to fix."
---

# How to check SPF, DKIM and DMARC for many domains at once

**Short answer:** choose the *email security* check, paste your domains, and read one row per domain with the SPF policy, DMARC policy, reporting addresses, which common DKIM selectors exist, and an `issues` list in plain English.

```bash
export APIFY_TOKEN=...   # free Apify account: Console > Settings > API & Integrations

curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["stripe.com", "github.com", "example.com"], "checks": ["email"]}'
```

## What each record does

- **SPF** (a TXT record starting `v=spf1`) lists the servers allowed to send mail for the domain. The final term matters: `-all` rejects everything else, `~all` marks it suspicious, `?all` gives no protection and `+all` allows anyone.
- **DKIM** signs each message. The public key lives at `<selector>._domainkey.<domain>`, and the selector name is chosen by the sender, so it can't be listed. The Actor tries ten very common selectors (`default`, `google`, `selector1`, `selector2`, `k1`, `k2`, `mail`, `s1`, `s2`, `dkim`), so "none found" isn't proof that DKIM is missing.
- **DMARC** (a TXT record at `_dmarc.<domain>`) tells receivers what to do when SPF and DKIM fail: `p=none` only monitors, `p=quarantine` sends to spam, `p=reject` blocks. `rua=` is where aggregate reports go.

## Problems the check reports

- No SPF record, or more than one (receivers treat several as broken).
- SPF ending in `+all`, `?all`, or with no `all` term.
- More than 10 DNS-lookup terms in SPF (the limit is 10; beyond it SPF fails for some receivers).
- No DMARC record, `p=none`, no `rua` address, or `pct` below 100.

## Doing it yourself

```bash
dig +short TXT example.com | grep spf1
dig +short TXT _dmarc.example.com
dig +short TXT default._domainkey.example.com
```

That works for one domain. For hundreds, you'd script the loop, parse the policies and decide what counts as a problem, which is what the Actor does.

Ready-made page: [check SPF, DKIM and DMARC for a list of domains](https://apify.com/codepulsehq/domain-intelligence-api/examples/check-spf-dkim-dmarc-for-many-domains).
