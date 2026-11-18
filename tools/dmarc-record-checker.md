---
layout: default
title: "DMARC Record Checker: Check a Domain's DMARC Policy (Free)"
description: "Look up and explain a domain's DMARC record: policy, subdomain policy, percentage, report addresses and alignment, with plain-English advice. Free, runs in your browser."
permalink: /tools/dmarc-record-checker/
---

# DMARC record checker

Enter a domain to read its DMARC record and see whether spoofed email is blocked, where reports are sent, and what to improve. Free, no sign-up, runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required>
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## How to read the result

- **p=none** only monitors. Nothing is blocked, but you start receiving reports. This is the right first step.
- **p=quarantine** sends failing mail to spam. **p=reject** blocks it outright, which is the goal.
- **rua** is the address that receives daily aggregate reports. Without it you are flying blind.
- **pct** lets you roll a policy out gradually (for example `pct=25`), but should end at 100.
- **sp** sets the policy for subdomains. If missing, subdomains follow `p`.
- **adkim / aspf** control how strictly the From domain must match the DKIM and SPF domains. Relaxed (`r`) is the usual default.

## Check DMARC from the command line

```bash
dig +short TXT _dmarc.example.com
```


## Frequently asked questions

**What is DMARC?** DMARC is a DNS record that tells receivers what to do with email that fails SPF and DKIM checks for your domain, and where to send reports.

**Which DMARC policy should I use?** Start with p=none and a rua address, read the reports for a few weeks to find all your legitimate senders, then move to quarantine and finally reject.

**Do I need DMARC to send email?** Large mailbox providers now require it from bulk senders, and without it anyone can spoof your domain more easily.

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
  return DomainTools.txtRecords('_dmarc.' + domain).then(function (txt) {
    var rec = txt.filter(function (t) { return /^v=DMARC1/i.test(t.trim()); })[0];
    if (!rec) return U.el('div', {}, [U.note('No DMARC record found at _dmarc.' + domain + '. Spoofed email is not blocked, and you get no reports about who sends as your domain.', 'warn'), U.note('A good starting record is: v=DMARC1; p=none; rua=mailto:dmarc@' + domain + ' . Monitor reports, then move to p=quarantine and p=reject.', 'info')]);
    var d = DomainTools.parseDmarc(rec), kind = d.policy === 'reject' ? 'ok' : d.policy === 'quarantine' ? 'warn' : 'bad';
    var wrap = U.el('div');
    wrap.appendChild(U.section('DMARC record', U.code(rec)));
    wrap.appendChild(U.section('Summary', U.table(['Tag', 'Meaning', 'Value'], [
      ['p', 'Policy for mail that fails', U.badge(d.policy || 'missing', d.policy ? kind : 'bad')],
      ['sp', 'Policy for subdomains', d.subdomainPolicy || 'same as p'],
      ['pct', 'Share of mail the policy applies to', d.pct + '%'],
      ['rua', 'Aggregate reports sent to', d.rua.join(', ') || 'none'],
      ['ruf', 'Failure reports sent to', d.ruf.join(', ') || 'none'],
      ['adkim / aspf', 'Alignment (r = relaxed, s = strict)', d.adkim + ' / ' + d.aspf]
    ])));
    wrap.appendChild(U.section('Problems', U.issues(DomainTools.dmarcIssues(d))));
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
      "name": "What is DMARC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DMARC is a DNS record that tells receivers what to do with email that fails SPF and DKIM checks for your domain, and where to send reports."
      }
    },
    {
      "@type": "Question",
      "name": "Which DMARC policy should I use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Start with p=none and a rua address, read the reports for a few weeks to find all your legitimate senders, then move to quarantine and finally reject."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need DMARC to send email?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Large mailbox providers now require it from bulk senders, and without it anyone can spoof your domain more easily."
      }
    }
  ]
}
</script>
