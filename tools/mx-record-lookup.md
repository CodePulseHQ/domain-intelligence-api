---
layout: default
title: "MX Record Lookup: Check a Domain's Mail Servers (Free)"
description: "Look up the MX records of any domain to see which mail servers receive its email, in priority order, with the mail provider detected. Free, no sign-up, runs in your browser."
permalink: /tools/mx-record-lookup/
---

# MX record lookup

Enter a domain to see its MX records: the mail servers that receive email for it, in priority order. The lowest number is tried first. Free, no sign-up, and the lookup runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required>
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## How to read MX records

- **Priority:** lower numbers are tried first. If the first server is unreachable, senders try the next priority. Servers with the same priority share the load.
- **Mail server:** the host name that accepts mail. It must resolve to an IP address (the lookup shows it) and must not be a CNAME.
- **Provider:** the tool recognises common hosts such as Google Workspace, Microsoft 365, Proton, Zoho and Mimecast from the server names.
- **No MX records:** senders fall back to the domain's A record. Most domains that want email publish MX records explicitly.

## Check MX records from the command line

```bash
dig +short MX example.com
nslookup -type=MX example.com
```


## Frequently asked questions

**What is an MX record?** An MX (mail exchange) record is a DNS record that says which servers accept email for a domain and in what order they should be tried.

**Why does my domain show no MX records?** Either email isn't set up for the domain, the records were added to a different domain or subdomain, or DNS changes haven't propagated yet. Check the domain's DNS provider.

**How long do MX changes take to show?** Up to the record's TTL, shown in the table. Many providers use 300 to 3600 seconds, and some resolvers cache longer.

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
  return DomainTools.doh(domain, 'MX').then(function (r) {
    if (r.status === 3) return U.note('This domain does not exist (NXDOMAIN).', 'error');
    var mx = DomainTools.parseMx(r.answers);
    if (!mx.length) return U.note('No MX records found. Mail servers fall back to the domain\'s own A/AAAA record, if it has one, so this domain may not be set up to receive email.', 'warn');
    if (mx.length === 1 && mx[0].priority === 0 && mx[0].host === '') return U.note('This domain publishes a "null MX" (priority 0, host "."), which means it explicitly does not accept email.', 'warn');
    return Promise.all(mx.map(function (m) { return DomainTools.doh(m.host, 'A').then(function (a) { return a.answers.map(function (x) { return x.data; }).join(', '); }).catch(function () { return ''; }); })).then(function (ips) {
      var rows = mx.map(function (m, i) { return [m.priority, m.host, ips[i] || '-', DomainTools.providerOf(m.host) || '-', m.ttl + 's']; });
      var providers = mx.map(function (m) { return DomainTools.providerOf(m.host); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
      var wrap = U.el('div');
      wrap.appendChild(U.table(['Priority', 'Mail server', 'IP address', 'Provider', 'TTL'], rows));
      wrap.appendChild(U.note(providers.length ? 'Mail looks hosted by: ' + providers.join(', ') + '.' : 'Mail provider not recognised from the server names.', 'info'));
      return wrap;
    });
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
      "name": "What is an MX record?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An MX (mail exchange) record is a DNS record that says which servers accept email for a domain and in what order they should be tried."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my domain show no MX records?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Either email isn't set up for the domain, the records were added to a different domain or subdomain, or DNS changes haven't propagated yet. Check the domain's DNS provider."
      }
    },
    {
      "@type": "Question",
      "name": "How long do MX changes take to show?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Up to the record's TTL, shown in the table. Many providers use 300 to 3600 seconds, and some resolvers cache longer."
      }
    }
  ]
}
</script>
