/* Free DNS and domain tools. Runs entirely in the visitor's browser: DNS over HTTPS (Google, Cloudflare as backup)
   and RDAP. No data is sent to our servers. */
(function (root) {
  'use strict';

  var TYPES = { A: 1, AAAA: 28, CNAME: 5, MX: 15, NS: 2, SOA: 6, TXT: 16, CAA: 257 };

  function normalize(input) {
    var s = String(input || '').trim().toLowerCase();
    if (!s) return { error: 'Enter a domain name, for example example.com.' };
    try {
      var host = new URL(/^[a-z]+:\/\//.test(s) ? s : 'http://' + s).hostname.replace(/\.$/, '');
      if (!host || host.indexOf('.') < 0 || /[^a-z0-9.\-]/.test(host)) return { error: '"' + input + '" does not look like a domain name.' };
      return { domain: host };
    } catch (e) {
      return { error: '"' + input + '" does not look like a domain name.' };
    }
  }

  function fetchJson(url, headers) {
    return fetch(url, { headers: headers || {} }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* One DNS question. Returns { status, answers: [{name, type, ttl, data}] }. */
  function doh(name, type) {
    var t = TYPES[type] || type;
    var first = 'https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + t;
    var second = 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(name) + '&type=' + t;
    return fetchJson(first).catch(function () { return fetchJson(second, { accept: 'application/dns-json' }); }).then(function (j) {
      return {
        status: j.Status,
        answers: (j.Answer || []).filter(function (a) { return a.type === t; }).map(function (a) { return { name: a.name, type: a.type, ttl: a.TTL, data: a.data }; })
      };
    });
  }

  function txtValue(data) { return String(data).replace(/^"|"$/g, '').replace(/"\s*"/g, ''); }

  function txtRecords(name) {
    return doh(name, 'TXT').then(function (r) { return r.answers.map(function (a) { return txtValue(a.data); }); });
  }

  /* ---------- MX ---------- */
  var PROVIDERS = [
    [/google\.com\.?$|googlemail\.com\.?$/, 'Google Workspace / Gmail'], [/outlook\.com\.?$|protection\.outlook\.com\.?$/, 'Microsoft 365 / Outlook'],
    [/protonmail\.ch\.?$|proton\.me\.?$/, 'Proton Mail'], [/zoho\.[a-z.]+\.?$/, 'Zoho Mail'], [/mimecast\.com\.?$/, 'Mimecast'], [/pphosted\.com\.?$|ppe-hosted\.com\.?$/, 'Proofpoint'],
    [/mailgun\.org\.?$/, 'Mailgun'], [/secureserver\.net\.?$/, 'GoDaddy'], [/icloud\.com\.?$/, 'Apple iCloud Mail'], [/yahoodns\.net\.?$/, 'Yahoo Mail'],
    [/messagelabs\.com\.?$/, 'Symantec / Broadcom Email Security'], [/fastmail\.com\.?$|messagingengine\.com\.?$/, 'Fastmail'], [/improvmx\.com\.?$/, 'ImprovMX'], [/forwardemail\.net\.?$/, 'Forward Email'], [/cloudflare\.net\.?$/, 'Cloudflare Email Routing']
  ];
  function providerOf(host) {
    for (var i = 0; i < PROVIDERS.length; i++) if (PROVIDERS[i][0].test(host)) return PROVIDERS[i][1];
    return null;
  }
  function parseMx(answers) {
    return answers.map(function (a) {
      var p = String(a.data).trim().split(/\s+/);
      return { priority: parseInt(p[0], 10), host: (p[1] || '').replace(/\.$/, ''), ttl: a.ttl };
    }).sort(function (x, y) { return x.priority - y.priority; });
  }

  /* ---------- SPF ---------- */
  function parseSpf(record) {
    var terms = record.trim().split(/\s+/).slice(1), mech = [], lookups = 0, all = null, redirect = null;
    terms.forEach(function (t) {
      var q = /^[+\-~?]/.test(t) ? t[0] : '+', body = t.replace(/^[+\-~?]/, '').toLowerCase();
      if (body === 'all') { all = q; return; }
      if (body.indexOf('redirect=') === 0) { redirect = body.slice(9); lookups++; return; }
      var m = { qualifier: q, text: t, type: body.split(/[:\/=]/)[0], value: body.indexOf(':') > -1 ? body.slice(body.indexOf(':') + 1) : '' };
      if (/^(include|a|mx|ptr|exists)$/.test(m.type)) lookups++;
      mech.push(m);
    });
    return { mechanisms: mech, all: all, redirect: redirect, directLookups: lookups };
  }
  function spfPolicyName(q) { return { '-': 'strict (-all)', '~': 'softfail (~all)', '?': 'neutral (?all)', '+': 'permissive (+all)' }[q] || 'none (no "all" term)'; }

  /* Count DNS lookups the way receivers do: includes and redirects are followed, each costs one. */
  function spfTotalLookups(domain, state) {
    state = state || { count: 0, seen: {}, fetches: 0, voids: 0, errors: [] };
    if (state.fetches > 25) return Promise.resolve(state);
    state.fetches++;
    return txtRecords(domain).then(function (txt) {
      var recs = txt.filter(function (t) { return /^v=spf1(\s|$)/i.test(t.trim()); });
      if (!recs.length) { state.voids++; state.errors.push('No SPF record at ' + domain); return state; }
      var p = parseSpf(recs[0]);
      state.count += p.directLookups;
      var next = p.mechanisms.filter(function (m) { return m.type === 'include' && m.value; }).map(function (m) { return m.value; });
      if (p.redirect) next.push(p.redirect);
      return next.reduce(function (chain, d) {
        return chain.then(function () { if (state.seen[d]) return state; state.seen[d] = true; return spfTotalLookups(d, state); });
      }, Promise.resolve());
    }).then(function () { return state; });
  }

  function spfIssues(txt, parsed, total) {
    var out = [], recs = txt.filter(function (t) { return /^v=spf1(\s|$)/i.test(t.trim()); });
    if (!recs.length) return ['No SPF record found. Anyone can send mail pretending to be this domain.'];
    if (recs.length > 1) out.push('More than one SPF record. Receivers treat this as an error: merge them into one.');
    if (parsed.all === '+') out.push('SPF ends in +all, which allows every server on the internet to send as this domain.');
    else if (parsed.all === '?') out.push('SPF ends in ?all, which gives no protection.');
    else if (parsed.all === null && !parsed.redirect) out.push('SPF has no "all" term, so it does not say what to do with unlisted senders.');
    if (parsed.mechanisms.some(function (m) { return m.type === 'ptr'; })) out.push('The ptr mechanism is deprecated and slow. Remove it.');
    if (total > 10) out.push('SPF needs ' + total + ' DNS lookups. The limit is 10, so SPF will fail ("permerror") for many receivers.');
    return out;
  }

  /* ---------- DMARC ---------- */
  function parseDmarc(record) {
    var tags = {};
    record.split(';').forEach(function (p) {
      var i = p.indexOf('=');
      if (i > 0) tags[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim();
    });
    var list = function (v) { return v ? v.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : []; };
    return {
      policy: (tags.p || '').toLowerCase(), subdomainPolicy: (tags.sp || '').toLowerCase(), pct: tags.pct ? parseInt(tags.pct, 10) : 100,
      rua: list(tags.rua), ruf: list(tags.ruf), adkim: (tags.adkim || 'r').toLowerCase(), aspf: (tags.aspf || 'r').toLowerCase(), fo: tags.fo || '', tags: tags
    };
  }
  function dmarcIssues(d) {
    var out = [];
    if (!/^(none|quarantine|reject)$/.test(d.policy)) out.push('The record has no valid p= policy. p=none, p=quarantine or p=reject is required.');
    if (d.policy === 'none') out.push('Policy is p=none (monitoring only): spoofed mail is not blocked. Move to quarantine, then reject, once reports look clean.');
    if (!d.rua.length) out.push('No rua= address, so you will not receive aggregate reports.');
    if (d.pct < 100 && (d.policy === 'quarantine' || d.policy === 'reject')) out.push('The policy applies to only ' + d.pct + '% of mail (pct=' + d.pct + ').');
    if (d.subdomainPolicy === 'none' && d.policy !== 'none') out.push('Subdomains are not protected (sp=none).');
    return out;
  }

  /* ---------- DKIM ---------- */
  function parseDkim(record) {
    var tags = {};
    record.split(';').forEach(function (p) { var i = p.indexOf('='); if (i > 0) tags[p.slice(0, i).trim().toLowerCase()] = p.slice(i + 1).trim(); });
    var key = (tags.p || '').replace(/\s+/g, '');
    var bytes = Math.floor(key.length * 3 / 4);
    var bits = !key ? 0 : (tags.k || 'rsa').toLowerCase() === 'ed25519' ? 256 : bytes >= 500 ? 4096 : bytes >= 250 ? 2048 : bytes >= 140 ? 1024 : 512;
    return { version: tags.v || '', keyType: (tags.k || 'rsa').toLowerCase(), hasKey: key.length > 0, approxBits: bits, testing: /(^|:)y(:|$)/.test(tags.t || ''), tags: tags };
  }

  /* ---------- RDAP (domain registration) ---------- */
  var SECOND_LEVEL = /\.(co|com|org|net|gov|ac|edu)\.(uk|au|nz|jp|br|in|za|mx|ar|sg|hk|tr|il|kr)$/;
  function registrable(domain) {
    var parts = domain.split('.');
    return (SECOND_LEVEL.test(domain) ? parts.slice(-3) : parts.slice(-2)).join('.');
  }
  var bootstrapPromise = null;
  function bootstrap() {
    if (!bootstrapPromise) {
      bootstrapPromise = fetchJson('https://data.iana.org/rdap/dns.json').then(function (j) {
        var map = {};
        (j.services || []).forEach(function (svc) {
          var url = (svc[1] || []).filter(function (u) { return /^https/.test(u); })[0] || (svc[1] || [])[0];
          (svc[0] || []).forEach(function (t) { map[t.toLowerCase()] = url; });
        });
        return map;
      }).catch(function () { return {}; });
    }
    return bootstrapPromise;
  }
  /* Ask the registry's own RDAP server (found through IANA's bootstrap list); rdap.org is the fallback. */
  function rdap(domain) {
    var reg = registrable(domain), tld = reg.split('.').pop();
    return bootstrap().then(function (map) {
      var base = map[tld];
      var url = base ? base.replace(/\/?$/, '/') + 'domain/' + encodeURIComponent(reg) : 'https://rdap.org/domain/' + encodeURIComponent(reg);
      return fetch(url, { headers: { accept: 'application/rdap+json' } });
    }).then(function (r) {
      if (r.status === 404) return { registered: false };
      if (!r.ok) throw new Error('The registry answered HTTP ' + r.status);
      return r.json().then(function (v) {
        function ev(a) { var e = (v.events || []).filter(function (x) { return x.eventAction === a; })[0]; return e ? e.eventDate : null; }
        var registrar = null;
        (v.entities || []).forEach(function (e) {
          if ((e.roles || []).indexOf('registrar') > -1 && !registrar && e.vcardArray && e.vcardArray[1]) {
            e.vcardArray[1].forEach(function (f) { if (f[0] === 'fn') registrar = f[3]; });
          }
        });
        var exp = ev('expiration'), created = ev('registration');
        var days = function (d, dir) { return d ? Math.round(((new Date(d)).getTime() - Date.now()) / 86400000 * dir) : null; };
        return {
          registered: true, registrar: registrar, created: created, updated: ev('last changed'), expires: exp, daysLeft: days(exp, 1), ageDays: days(created, -1),
          status: v.status || [], nameservers: (v.nameservers || []).map(function (n) { return String(n.ldhName).toLowerCase(); }), dnssec: v.secureDNS ? !!v.secureDNS.delegationSigned : null
        };
      });
    });
  }

  var api = { TYPES: TYPES, normalize: normalize, doh: doh, txtRecords: txtRecords, parseMx: parseMx, providerOf: providerOf, parseSpf: parseSpf, spfPolicyName: spfPolicyName,
              spfTotalLookups: spfTotalLookups, spfIssues: spfIssues, parseDmarc: parseDmarc, dmarcIssues: dmarcIssues, parseDkim: parseDkim, registrable: registrable, rdap: rdap };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DomainTools = api;
})(typeof window !== 'undefined' ? window : globalThis);
