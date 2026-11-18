---
layout: default
title: "SPF Record Checker: Validate SPF and Count DNS Lookups (Free)"
description: "Check a domain's SPF record: the policy, every mechanism, the real number of DNS lookups including includes (limit 10), and plain-English problems to fix. Free, runs in your browser."
permalink: /tools/spf-record-checker/
---

# SPF record checker

Enter a domain to read its SPF record, see which servers may send mail for it, and count the DNS lookups SPF really needs, including everything pulled in by <code>include:</code>. More than 10 lookups makes SPF fail. Free, no sign-up, runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required>
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## How to read the result

- **Policy:** the final `all` term decides what happens to mail from servers you did not list. `-all` rejects it, `~all` marks it suspicious (softfail), `?all` says nothing, `+all` allows everyone and defeats the purpose.
- **DNS lookups:** receivers stop after 10 lookups caused by `include`, `a`, `mx`, `ptr`, `exists` and `redirect`. Includes count too, and so do the includes inside them. Going over the limit returns a permanent error and SPF fails. Remove services you no longer use, or flatten the record.
- **One record only:** a domain must publish exactly one SPF record. Two records are an error.
- **ip4 and ip6 terms** cost no lookups.

## Check SPF from the command line

```bash
dig +short TXT example.com | grep spf1
```


## Frequently asked questions

**What is an SPF record?** SPF (Sender Policy Framework) is a TXT record listing the servers allowed to send email for a domain. Receivers check it to spot forged senders.

**Why does the 10 lookup limit exist?** It protects receivers from records that trigger endless DNS queries. Receivers give up past 10 and treat the record as broken.

**Is SPF enough on its own?** No. SPF only checks the technical sender address. Use it together with DKIM and a DMARC policy.

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
  return DomainTools.txtRecords(domain).then(function (txt) {
    var recs = txt.filter(function (t) { return /^v=spf1(\s|$)/i.test(t.trim()); });
    if (!recs.length) return U.issues(DomainTools.spfIssues(txt, null, 0));
    var p = DomainTools.parseSpf(recs[0]);
    return DomainTools.spfTotalLookups(domain).then(function (state) {
      var total = state.count, wrap = U.el('div');
      wrap.appendChild(U.section('SPF record', U.code(recs[0])));
      wrap.appendChild(U.section('Summary', U.table(['Item', 'Value'], [
        ['Policy for other senders', DomainTools.spfPolicyName(p.all)],
        ['DNS lookups needed (limit 10)', U.badge(total + ' of 10', total > 10 ? 'bad' : total >= 9 ? 'warn' : 'ok')],
        ['Number of SPF records', recs.length > 1 ? U.badge(String(recs.length) + ' (should be 1)', 'bad') : U.badge('1', 'ok')]
      ])));
      var rows = p.mechanisms.map(function (m) { return [m.text, m.type, { '+': 'Pass', '-': 'Fail', '~': 'Softfail', '?': 'Neutral' }[m.qualifier]]; });
      if (rows.length) wrap.appendChild(U.section('Mechanisms', U.table(['Term', 'Type', 'If it matches'], rows)));
      wrap.appendChild(U.section('Problems', U.issues(DomainTools.spfIssues(txt, p, total))));
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
      "name": "What is an SPF record?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SPF (Sender Policy Framework) is a TXT record listing the servers allowed to send email for a domain. Receivers check it to spot forged senders."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the 10 lookup limit exist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It protects receivers from records that trigger endless DNS queries. Receivers give up past 10 and treat the record as broken."
      }
    },
    {
      "@type": "Question",
      "name": "Is SPF enough on its own?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. SPF only checks the technical sender address. Use it together with DKIM and a DMARC policy."
      }
    }
  ]
}
</script>
