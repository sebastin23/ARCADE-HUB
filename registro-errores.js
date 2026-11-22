/* registro-errores.js · apunta los errores reales del hub (compartido)
   - Guarda los últimos 40 errores de JavaScript en este navegador (localStorage).
   - Ignora los de extensiones del navegador y los de otras webs.
   - Para verlos: abre errores.html (se puede copiar y borrar).
   - Avisos al administrador: cada error NUEVO (máx. 5 por visita) se envía al Worker de Ekovozia (HUB_API) solo con página, texto del error,
     archivo y línea; sin cuenta, sin datos personales. Se puede desactivar en errores.html (clave hub_errores_envio = off). */
(function (w) {
  'use strict';
  var KEY = 'hub_errores', MAX = 40, ORIGEN = location.origin;
  w.HUB_API = w.HUB_API || 'https://eco.x-mayor.workers.dev';   /* Worker de Ekovozia: chat de ayuda y avisos de errores */
  var enviados = 0, vistos = {};
  function enviar(p, m, f, l) {
    try {
      if (location.protocol !== 'https:' || localStorage.getItem('hub_errores_envio') === 'off') return;
      var k = p + '|' + m + '|' + f + '|' + l;
      if (vistos[k] || enviados >= 5) return;
      vistos[k] = 1; enviados++;
      fetch(w.HUB_API + '/hub/error', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify({ p: p, m: m, f: f, l: l }), keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  function propio(f) { return !f || f.indexOf(ORIGEN) === 0; }   /* "" = script en línea de la propia página */
  function guardar(msg, file, line, col) {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      var pag = location.pathname.split('/').pop() || 'index.html';
      var f = (file || '').replace(ORIGEN, '').replace(/\?.*$/, '');
      var u = a[a.length - 1], txt = String(msg).slice(0, 300);
      if (u && u.m === txt && u.f === f && u.l === line && u.p === pag) { u.n = (u.n || 1) + 1; u.t = Date.now(); }
      else a.push({ t: Date.now(), p: pag, m: txt, f: f, l: line || 0, c: col || 0, n: 1 });
      while (a.length > MAX) a.shift();
      localStorage.setItem(KEY, JSON.stringify(a));
      enviar(pag, txt, f, line || 0);
    } catch (e) {}
  }
  w.addEventListener('error', function (e) {
    if (e.target && e.target !== w && (e.target.src || e.target.href)) {   /* recurso que no carga (imagen, script…) */
      var u = e.target.src || e.target.href;
      if (propio(u)) guardar('No carga el archivo: ' + u.replace(ORIGEN, ''), '', 0, 0);
      return;
    }
    if (!propio(e.filename)) return;
    guardar(e.message, e.filename, e.lineno, e.colno);
  }, true);
  w.addEventListener('unhandledrejection', function (e) {
    var r = e.reason, m = r && (r.stack || r.message) || String(r);
    if (/chrome-extension|moz-extension|safari-extension/.test(m)) return;
    guardar('Promesa rechazada: ' + m, '', 0, 0);
  });
})(window);
