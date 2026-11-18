---
layout: default
title: "DNS Lookup: A, AAAA, MX, TXT, NS, CNAME, SOA and CAA Records (Free)"
description: "Free DNS lookup tool: see a domain's A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records in one go. Runs in your browser with no sign-up."
permalink: /tools/dns-lookup/
---

# DNS lookup

Enter a domain to see its DNS records. Choose one record type or look up all of them at once. Free, no sign-up, and the lookup runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required><select name="type" aria-label="Record type"><option value="ALL">All record types</option><option>A</option><option>AAAA</option><option>MX</option><option>NS</option><option>TXT</option><option>CNAME</option><option>SOA</option><option>CAA</option></select>
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## What the record types are

| Type | What it holds |
|---|---|
| A | The IPv4 address of the domain |
| AAAA | The IPv6 address of the domain |
| CNAME | An alias pointing to another name |
| MX | The mail servers for the domain, with priorities |
| NS | The name servers that answer for the domain |
| TXT | Free text: SPF, DKIM, DMARC, site verification codes |
| SOA | Zone details: primary name server, contact, serial and timers |
| CAA | Which certificate authorities may issue certificates |

## Run a DNS lookup from the command line

```bash
dig example.com ANY +noall +answer
dig +short A example.com
nslookup -type=TXT example.com
```


## Frequently asked questions

**What does a DNS lookup do?** It asks a DNS resolver for the records published for a domain, such as the IP address a website lives at or the servers that receive its email.

**Why do I see different results from my own machine?** Resolvers cache answers for the record's TTL, and some networks rewrite answers. This tool asks Google's public resolver, so you see what the wider internet sees.

**Is the lookup private?** The query goes from your browser to Google's public DNS-over-HTTPS service (Cloudflare as a backup). Nothing is sent to us.

<div class="cta-box">
<strong>Need to check hundreds of domains?</strong> The <a href="https://apify.com/codepulsehq/domain-intelligence-api">Domain Intelligence API</a> runs DNS, email security (SPF, DKIM, DMARC), registration and expiry, SSL and website technology for a whole list in one run, from $0.80 per 1,000 domains.<br>
<a class="cta" href="https://apify.com/codepulsehq/domain-intelligence-api">Try it on Apify</a>
</div>

[All free domain tools](../)

<script src="{{ '/assets/tools.js' | relative_url }}"></script>
<script src="{{ '/assets/tools-ui.js' | relative_url }}"></script>
<script>

ToolUI.bind('tool-form', function (domain, form) {
  var U = ToolUI, t = form.elements.type.value, types = t === 'ALL' ? ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA', 'CAA'] : [t];
  return Promise.all(types.map(function (ty) { return DomainTools.doh(domain, ty).then(function (r) { return { ty: ty, r: r }; }); })).then(function (res) {
    if (res[0].r.status === 3) return U.note('This domain does not exist (NXDOMAIN).', 'error');
    var rows = [];
    res.forEach(function (x) { x.r.answers.forEach(function (a) { rows.push([x.ty, String(a.data).replace(/^"|"$/g, ''), a.ttl + 's']); }); });
    if (!rows.length) return U.note('No ' + (t === 'ALL' ? '' : t + ' ') + 'records found for ' + domain + '.', 'warn');
    return U.table(['Type', 'Value', 'TTL'], rows);
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
      "name": "What does a DNS lookup do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It asks a DNS resolver for the records published for a domain, such as the IP address a website lives at or the servers that receive its email."
      }
    },
    {
      "@type": "Question",
      "name": "Why do I see different results from my own machine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Resolvers cache answers for the record's TTL, and some networks rewrite answers. This tool asks Google's public resolver, so you see what the wider internet sees."
      }
    },
    {
      "@type": "Question",
      "name": "Is the lookup private?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The query goes from your browser to Google's public DNS-over-HTTPS service (Cloudflare as a backup). Nothing is sent to us."
      }
    }
  ]
}
</script>
