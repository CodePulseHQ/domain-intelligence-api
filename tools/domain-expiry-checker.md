---
layout: default
title: "Domain Expiry Checker: Registrar, Creation and Expiry Date (Free)"
description: "Check when a domain expires, who the registrar is, how old it is and its status, using RDAP, the modern replacement for WHOIS. Free, runs in your browser."
permalink: /tools/domain-expiry-checker/
---

# Domain expiry checker

Enter a domain to see when it expires, its registrar, creation date, status codes and name servers. The data comes straight from the registry using RDAP, the modern replacement for WHOIS. Free, no sign-up, runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required>
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## How to read the result

- **Days until expiry:** under 30 days is urgent. After expiry most domains enter a grace period before they are deleted, but sites and email can stop working immediately.
- **Status codes:** `clientTransferProhibited` is a normal lock against unauthorised transfers. `pendingDelete` or `redemptionPeriod` means the domain has expired and is being deleted.
- **DNSSEC:** whether the domain's DNS answers are cryptographically signed.
- **Why no owner name?** Since privacy laws changed, registries redact personal contact data for most domains.

## WHOIS vs RDAP

WHOIS is an old text protocol with no standard format. RDAP returns structured data and is what registries now run. This tool asks the registry's own RDAP server.

## Check expiry from the command line

```bash
curl -s https://rdap.org/domain/example.com | jq '.events'
```


## Frequently asked questions

**Is this the same as WHOIS?** It shows the same registration facts using RDAP, the newer standard that replaces WHOIS.

**Can I see the domain owner?** Usually not. Registries hide registrant names and contact details for privacy.

**Why does my country domain say not registered?** Some country-code registries don't publish RDAP data. The domain may still be registered.

<div class="cta-box">
<strong>Need to check hundreds of domains?</strong> The <a href="https://apify.com/codepulsehq/domain-intelligence-api">Domain Intelligence API</a> runs DNS, email security (SPF, DKIM, DMARC), registration and expiry, SSL and website technology for a whole list in one run, from $0.80 per 1,000 domains.<br>
<a class="cta" href="https://apify.com/codepulsehq/domain-intelligence-api">Try it on Apify</a>
</div>

[All free domain tools](../)

<script src="{{ '/assets/tools.js' | relative_url }}"></script>
<script src="{{ '/assets/tools-ui.js' | relative_url }}"></script>
<script>

ToolUI.bind('tool-form', function (domain) {
  var U = ToolUI;
  function d(x) { return x ? new Date(x).toISOString().slice(0, 10) : '-'; }
  return DomainTools.rdap(domain).then(function (r) {
    if (!r.registered) return U.note('The registry reports that ' + DomainTools.registrable(domain) + ' is not registered, or its registry does not publish RDAP data. If you meant a subdomain, enter the registered domain.', 'warn');
    var days = r.daysLeft, kind = days == null ? 'info' : days < 0 ? 'bad' : days < 30 ? 'bad' : days < 90 ? 'warn' : 'ok';
    var wrap = U.el('div');
    wrap.appendChild(U.table(['Item', 'Value'], [
      ['Registered domain', DomainTools.registrable(domain)],
      ['Registrar', r.registrar || '-'],
      ['Expires', d(r.expires)],
      ['Days until expiry', days == null ? '-' : U.badge(days < 0 ? 'expired ' + (-days) + ' days ago' : days + ' days', kind)],
      ['Created', d(r.created)],
      ['Age', r.ageDays == null ? '-' : (r.ageDays / 365.25).toFixed(1) + ' years'],
      ['Last changed', d(r.updated)],
      ['DNSSEC', r.dnssec == null ? '-' : r.dnssec ? 'signed' : 'not signed'],
      ['Status', (r.status || []).join(', ') || '-'],
      ['Name servers', (r.nameservers || []).join(', ') || '-']
    ]));
    wrap.appendChild(U.note('Registrant names and contact details are hidden by registries for privacy, so they cannot be shown here.', 'info'));
    return wrap;
  });
});

</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this the same as WHOIS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It shows the same registration facts using RDAP, the newer standard that replaces WHOIS."
      }
    },
    {
      "@type": "Question",
      "name": "Can I see the domain owner?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Usually not. Registries hide registrant names and contact details for privacy."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my country domain say not registered?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Some country-code registries don't publish RDAP data. The domain may still be registered."
      }
    }
  ]
}
</script>
