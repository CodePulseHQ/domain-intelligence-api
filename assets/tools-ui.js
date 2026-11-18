/* Small DOM helpers for the tool pages. Text is always inserted as text (never HTML), so a typed domain can't inject markup. */
(function (root) {
  'use strict';
  var T = root.DomainTools;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k]); });
    [].concat(kids === undefined ? [] : kids).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function table(headers, rows) {
    var t = el('table', { class: 'tool-table' });
    t.appendChild(el('thead', {}, el('tr', {}, headers.map(function (h) { return el('th', {}, h); }))));
    t.appendChild(el('tbody', {}, rows.map(function (r) { return el('tr', {}, r.map(function (c) { return el('td', {}, c == null ? '-' : (typeof c === 'object' ? c : String(c))); })); })));
    return t;
  }
  function badge(text, kind) { return el('span', { class: 'badge badge-' + (kind || 'info') }, text); }
  function code(text) { return el('code', { class: 'tool-code' }, text); }
  function issues(list) {
    if (!list.length) return el('p', { class: 'tool-ok' }, 'No problems found.');
    return el('div', {}, [el('p', { class: 'tool-warn-title' }, list.length === 1 ? '1 thing to fix:' : list.length + ' things to fix:'), el('ul', { class: 'tool-issues' }, list.map(function (i) { return el('li', {}, i); }))]);
  }
  function note(text, kind) { return el('p', { class: 'tool-note tool-note-' + (kind || 'info') }, text); }
  function section(title, node) { return el('div', { class: 'tool-section' }, [el('h3', {}, title), node]); }

  /* Wire a form: id of the form, a function(domain, formData) returning a Promise of a DOM node. */
  function bind(formId, run) {
    var form = document.getElementById(formId), out = document.getElementById('tool-result'), btn = form.querySelector('button');
    function go(e) {
      if (e) e.preventDefault();
      var n = T.normalize(form.elements.domain.value);
      out.textContent = '';
      if (n.error) { out.appendChild(note(n.error, 'error')); return; }
      btn.disabled = true; btn.textContent = 'Checking...';
      out.appendChild(note('Looking up ' + n.domain + '...', 'info'));
      Promise.resolve().then(function () { return run(n.domain, form); }).then(function (node) {
        out.textContent = ''; out.appendChild(el('p', { class: 'tool-for' }, ['Results for ', el('strong', {}, n.domain)])); out.appendChild(node);
      }).catch(function (err) {
        out.textContent = ''; out.appendChild(note('Sorry, that lookup failed: ' + (err && err.message ? err.message : 'unknown error') + '. Please try again.', 'error'));
      }).then(function () { btn.disabled = false; btn.textContent = 'Check'; });
    }
    form.addEventListener('submit', go);
    var q = new URLSearchParams(location.search).get('domain');
    if (q) { form.elements.domain.value = q; go(); }
  }

  root.ToolUI = { el: el, table: table, badge: badge, code: code, issues: issues, note: note, section: section, bind: bind };
})(window);
