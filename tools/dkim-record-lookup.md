---
layout: default
title: "DKIM Record Lookup: Check a DKIM Selector and Key (Free)"
description: "Look up a domain's DKIM public key by selector, check it exists and estimate its strength. Or leave the selector empty to try the most common ones. Free, runs in your browser."
permalink: /tools/dkim-record-lookup/
---

# DKIM record lookup

Enter a domain and the DKIM selector your mail provider uses (it's in the DKIM-Signature header of a message you sent). Leave the selector empty to try the ten most common ones. Free, no sign-up, runs in your browser.

<form class="tool-form" id="tool-form" autocomplete="off">
<input name="domain" type="text" placeholder="example.com" autocomplete="off" aria-label="Domain name" required><input name="selector" type="text" placeholder="selector (optional), e.g. google" autocomplete="off" aria-label="DKIM selector">
<button type="submit">Check</button>
</form>
<div id="tool-result" class="tool-result" aria-live="polite"></div>

## How to find your selector

Send yourself an email and open the original message source. In the `DKIM-Signature` header, the `s=` tag is the selector and `d=` is the domain. Common selectors: `google` (Google Workspace), `selector1` and `selector2` (Microsoft 365), `k1` (Mailchimp), `s1` and `s2` (SendGrid), `default`.

## How to read the result

- **Key present:** a record with an empty `p=` means the key was revoked, and mail signed with it will fail.
- **Key size:** 1024-bit keys still work but are considered weak. 2048-bit is the norm. The size shown is an estimate from the length of the key.
- **Test mode:** `t=y` tells receivers you are still testing, so they may ignore failures. Remove it once DKIM works.

## Check DKIM from the command line

```bash
dig +short TXT google._domainkey.example.com
```


## Frequently asked questions

**What is a DKIM selector?** A name chosen by the sender that points to one of the domain's DKIM keys. The key lives at selector._domainkey.domain, so a domain can have several.

**Why can't the tool list all my selectors?** DNS does not allow listing names, so a selector has to be known or guessed. That is why the tool tries ten common ones when you leave it empty.

**Does DKIM replace SPF?** No. They check different things. DKIM proves a message was not altered and was signed by the domain, SPF checks the sending server. DMARC combines the two.

<div class="cta-box">
<strong>Need to check hundreds of domains?</strong> The <a href="https://apify.com/codepulsehq/domain-intelligence-api">Domain Intelligence API</a> runs DNS, email security (SPF, DKIM, DMARC), registration and expiry, SSL and website technology for a whole list in one run, from $0.80 per 1,000 domains.<br>
<a class="cta" href="https://apify.com/codepulsehq/domain-intelligence-api">Try it on Apify</a>
</div>

[All free domain tools](../)

<script src="{{ '/assets/tools.js' | relative_url }}"></script>
<script src="{{ '/assets/tools-ui.js' | relative_url }}"></script>
<script>

ToolUI.bind('tool-form', function (domain, form) {
  var U = ToolUI, sel = form.elements.selector.value.trim().toLowerCase();
  var list = sel ? [sel] : ['default', 'google', 'selector1', 'selector2', 'k1', 'k2', 'mail', 's1', 's2', 'dkim'];
  return Promise.all(list.map(function (s) {
    return DomainTools.txtRecords(s + '._domainkey.' + domain).then(function (t) { return { s: s, rec: t.join('') }; }).catch(function () { return { s: s, rec: '' }; });
  })).then(function (res) {
    var found = res.filter(function (r) { return r.rec; });
    if (!found.length) return U.note(sel ? 'No DKIM record at ' + sel + '._domainkey.' + domain + '. Check the selector name in a sent message\'s DKIM-Signature header (s= tag).' : 'None of the ten common selectors exist for ' + domain + '. That does not prove DKIM is missing: selector names are chosen by the sender. Find yours in the DKIM-Signature header (s= tag) of a sent message.', 'warn');
    var wrap = U.el('div');
    found.forEach(function (f) {
      var d = DomainTools.parseDkim(f.rec), strong = d.keyType === 'ed25519' || d.approxBits >= 2048;
      wrap.appendChild(U.section('Selector "' + f.s + '"', U.el('div', {}, [U.code(f.rec),
        U.table(['Item', 'Value'], [
          ['Key present', d.hasKey ? U.badge('yes', 'ok') : U.badge('empty p= (key revoked)', 'bad')],
          ['Key type', d.keyType],
          ['Approximate key size', d.hasKey ? U.badge(d.approxBits + ' bit', strong ? 'ok' : 'warn') : '-'],
          ['Test mode (t=y)', d.testing ? U.badge('yes: receivers may ignore failures', 'warn') : 'no']
        ])])));
      if (d.hasKey && d.approxBits < 2048 && d.keyType === 'rsa') wrap.appendChild(U.note('A key of about ' + d.approxBits + ' bits is considered weak. Use 2048 bits where your provider allows.', 'warn'));
    });
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
      "name": "What is a DKIM selector?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A name chosen by the sender that points to one of the domain's DKIM keys. The key lives at selector._domainkey.domain, so a domain can have several."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't the tool list all my selectors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DNS does not allow listing names, so a selector has to be known or guessed. That is why the tool tries ten common ones when you leave it empty."
      }
    },
    {
      "@type": "Question",
      "name": "Does DKIM replace SPF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. They check different things. DKIM proves a message was not altered and was signed by the domain, SPF checks the sending server. DMARC combines the two."
      }
    }
  ]
}
</script>
