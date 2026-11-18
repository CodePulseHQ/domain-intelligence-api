# Domain Intelligence API: examples and guides

Check domains in bulk: DNS records, SPF/DKIM/DMARC with plain-English fixes, registration and expiry, the SSL certificate and the technology a website runs on. No API keys.

This repository contains runnable examples and how-to guides for the **[Domain Intelligence API on Apify](https://apify.com/codepulsehq/domain-intelligence-api)**, made by [CodePulse](https://codepulsehq.com). The examples call that hosted Actor, so you need a free [Apify](https://apify.com) account and API token. The code here is MIT licensed; the Actor is a paid, hosted service. Pay per check that returns data: $0.0008 DNS and email security, $0.001 registration, $0.0008 SSL, $0.0014 website technology per domain (about $0.004 for everything).

**Read the guides as a website:** [codepulsehq.github.io/domain-intelligence-api](https://codepulsehq.github.io/domain-intelligence-api/)

## Quick start

```bash
export APIFY_TOKEN=...   # free Apify account: Console > Settings > API & Integrations

curl -sS -X POST \
  "https://api.apify.com/v2/acts/codepulsehq~domain-intelligence-api/run-sync-get-dataset-items?token=${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["stripe.com", "github.com"], "checks": ["email", "ssl", "registration"]}'
```

## Guides

| Question | Guide |
|---|---|
| How to check SPF, DKIM and DMARC for many domains at once | [docs/check-spf-dkim-dmarc-bulk.md](docs/check-spf-dkim-dmarc-bulk.md) |
| How to monitor SSL certificate and domain expiry for a list of domains | [docs/monitor-ssl-and-domain-expiry.md](docs/monitor-ssl-and-domain-expiry.md) |
| How to detect what technology a website uses (a cheaper BuiltWith alternative) | [docs/detect-website-technology-api.md](docs/detect-website-technology-api.md) |
| WHOIS vs RDAP: how to look up domain registration data through an API | [docs/whois-vs-rdap-api.md](docs/whois-vs-rdap-api.md) |

## Examples

| File | What it does |
|---|---|
| [`examples/curl/quickstart.sh`](examples/curl/quickstart.sh) | One request, results back |
| [`examples/python/quickstart.py`](examples/python/quickstart.py) | The same with the Apify Python client, with a spend cap |

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

## Feedback

Found a problem or want an example added? Open an issue here, or use the **Issues** tab on the Actor's Apify page.
