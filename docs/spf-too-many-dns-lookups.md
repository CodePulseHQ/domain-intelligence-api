---
layout: default
title: "SPF 'too many DNS lookups': what the 10 lookup limit is and how to fix it"
description: "What counts toward SPF's 10 DNS lookup limit, how to check your real count and five ways to get under it."
---

# SPF 'too many DNS lookups': what the 10 lookup limit is and how to fix it

Your emails land in spam, or a checker says **"SPF permerror: too many DNS lookups"**. The cause is nearly always the same: your SPF record needs more than 10 DNS lookups.

## What counts as a lookup

SPF lets receivers ask DNS "is this server allowed to send for this domain?". To stop abuse, the spec caps a single check at **10 DNS-querying terms**. These count:

- `include:`
- `a`
- `mx`
- `ptr` (deprecated, avoid)
- `exists:`
- `redirect=`

These cost nothing: `ip4:`, `ip6:` and `all`.

The catch is that includes are followed. If you write `include:_spf.google.com`, that's one lookup, plus whatever Google's own record includes underneath. Every sending service you add (marketing email, helpdesk, CRM, invoicing) adds its own chain. Five or six services can push you past 10 without you ever writing a long record.

When a receiver passes 10, it gives up and treats SPF as failed with a permanent error. Some receivers then reject or junk your mail.

## Check your own count

Paste your domain into the free [SPF record checker](https://codepulsehq.github.io/domain-intelligence-api/tools/spf-record-checker/). It follows every include and shows the real total, the policy, and plain-English problems. It runs in your browser, with no sign-up.

Or from a terminal:

```bash
dig +short TXT example.com | grep spf1
dig +short TXT _spf.google.com      # then follow each include by hand
```

## How to get under 10

1. **Delete services you no longer use.** Old email tools are the most common culprit.
2. **Replace `a` and `mx` terms with `ip4:` addresses** if the addresses rarely change. IP terms are free.
3. **Remove `ptr`.** It's slow, deprecated and counts.
4. **Use a subdomain per service.** Send marketing mail from `news.example.com` with its own SPF record, so the main domain's budget isn't shared.
5. **Flatten as a last resort.** Flattening replaces includes with the IP ranges they resolve to. It works, but those ranges change, so the record goes stale unless something refreshes it automatically.

## Other SPF mistakes to check while you're there

- **More than one SPF record.** A domain must have exactly one. Merge them.
- **`+all` or `?all`** at the end. Use `~all` while testing and `-all` when you're sure of your senders.
- **Missing DKIM and DMARC.** SPF alone doesn't protect your From address. See the [DMARC checker](https://codepulsehq.github.io/domain-intelligence-api/tools/dmarc-record-checker/) and [DKIM lookup](https://codepulsehq.github.io/domain-intelligence-api/tools/dkim-record-lookup/).

## Checking many domains

If you manage a lot of domains (an agency, an MSP, or a due-diligence list), the [Domain Intelligence API](https://apify.com/codepulsehq/domain-intelligence-api) runs the SPF, DKIM and DMARC checks for a whole list in one run and returns the results as rows.
