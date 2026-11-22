/* asistente.js · asistente de ayuda del hub (IA de Ekovozia) — v2
   - Botón flotante 💬 en el hub y dentro de cada juego (en los juegos es pequeño y se puede ocultar).
   - Explica cómo se juega, da consejos y responde dudas del juego en el que estás (usa el catálogo games.js).
   - "Reportar un problema": manda tu descripción (+ los últimos errores de tu navegador) al administrador.
   - Se carga el PRIMERO en cada página para que, al escribir en el chat, las teclas no muevan el juego.
   - La conversación solo vive en memoria: al recargar se borra. Habla con el Worker de Ekovozia (HUB_API). */
(function (w, d) {
  'use strict';
  var API = w.HUB_API || 'https://eco.x-mayor.workers.dev';
  var MAX_IN = 500, MAX_TURNS = 8, COOLDOWN = 2500, PREF = 'hub_asistente';
  var slug = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '') || 'index';
  var inGame = slug !== 'index';
  var turns = [], busy = false, lastSend = 0, lastReport = 0, mode = 'chat';
  var fab, panel, box, inp, btn, ready = false;

  /* ---- teclado: lo que escribes en el chat no llega al juego ---- */
  function enUi(t) { return t && t.closest && (t.closest('#asp') || t.closest('#asb')); }
  ['keydown', 'keypress'].forEach(function (ev) {
    w.addEventListener(ev, function (e) {
      if (!enUi(e.target)) return;
      if (ev === 'keydown' && e.key === 'Escape') { toggle(false); }
      e.stopImmediatePropagation();
    }, true);
  });

  /* ---- catálogo y prompt ---- */
  function catalogo(cb) {
    if (w.GAMES) return cb();
    var s = d.createElement('script'); s.src = 'games.js'; s.onload = cb; s.onerror = cb; d.head.appendChild(s);
  }
  function sistema() {
    var G = w.GAMES || [], cur = null, i;
    for (i = 0; i < G.length; i++) if (G[i].id === slug) cur = G[i];
    var t = 'Eres el asistente de ayuda de ARCADE HUB, un hub gratuito de minijuegos web. Responde en el idioma de la persona, de forma breve, cercana y clara (unas pocas frases, sin títulos). ' +
      'Tu trabajo: explicar cómo se juega, dar consejos y estrategias, resolver dudas de controles, cuentas, progreso y juegos, y ayudar con problemas. ' +
      'Solo hablas del hub y sus juegos; si preguntan otra cosa, dilo en una frase. Usa únicamente los datos de abajo: si no lo sabes, dilo, no inventes. ' +
      'Los consejos son de estrategia y manejo. No reveles códigos secretos, contraseñas de administrador ni formas de hacer trampas o saltarse sanciones. ' +
      'Datos generales: el progreso se guarda en el navegador (borrar los datos del navegador lo pierde); los favoritos del hub también. Neón Buggy guarda en la nube si creas contraseña. ' +
      'Si algo falla, recomienda recargar la página; si sigue, que pulse «Reportar un problema» en este chat y se avisa al administrador. Privacidad: politica-privacidad.html. ' +
      'Si preguntan quién eres: el asistente de IA del hub (Ekovozia); puedes equivocarte.\n';
    if (cur) t += '\nLA PERSONA ESTÁ JUGANDO AHORA A: ' + cur.name + '. Controles: ' + (cur.controls || '') + '. ' + (cur.desc || '') + ' Guía: ' + (cur.help || '') + '\n';
    else t += '\nLa persona está en la página principal del hub.\n';
    t += '\nTodos los juegos:\n';
    G.forEach(function (g) {
      if (cur && g.id === cur.id) return;
      t += '- ' + g.name + (g.disabled ? ' (no disponible ahora)' : '') + ': ' + (g.controls || '') + (g.help ? ' ' + g.help : '') + '\n';
    });
    return t.slice(0, 5800);
  }

  /* ---- interfaz ---- */
  function build() {
    if (ready) return; ready = true;
    var z = inGame ? 2147483000 : 40;
    var css = d.createElement('style');
    css.textContent =
      '#asb{position:fixed;z-index:' + z + ';border-radius:50%;border:1px solid rgba(255,255,255,.25);background:#ff3b5c;color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45);' +
      (inGame ? 'left:6px;top:45%;width:36px;height:36px;font-size:17px;opacity:.5;padding:0' : 'right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));width:52px;height:52px;font-size:24px') + '}#asb:hover,#asb:focus{opacity:1}' +
      '#asp{position:fixed;z-index:' + z + ';' + (inGame ? 'left:8px;bottom:8px;' : 'right:14px;bottom:calc(76px + env(safe-area-inset-bottom,0px));') + 'width:min(360px,calc(100vw - 16px));height:min(480px,calc(100vh - 70px));display:none;flex-direction:column;background:#121a33;color:#f4f7fb;border:1px solid rgba(255,255,255,.18);border-radius:16px;box-shadow:0 16px 50px rgba(0,0,0,.6);overflow:hidden;font:14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:left}' +
      '#asp.on{display:flex}#asp *{box-sizing:border-box}#asp header{padding:10px 12px;background:#0b1020;display:flex;align-items:center;gap:8px;font-weight:700}#asp header small{font-weight:400;color:#9aa7c7;display:block;font-size:11px}#asp header button{margin-left:auto;background:none;border:0;color:#9aa7c7;font-size:20px;cursor:pointer}' +
      '#asm{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px}#asm div{max-width:88%;padding:8px 10px;border-radius:12px;white-space:pre-wrap;word-break:break-word}' +
      '#asm .u{align-self:flex-end;background:#ff3b5c;color:#fff}#asm .a{align-self:flex-start;background:rgba(255,255,255,.09)}#asm .s{align-self:center;background:none;color:#9aa7c7;font-size:12px;text-align:center}' +
      '#asq{display:flex;gap:6px;padding:0 8px 6px;flex-wrap:wrap}#asq button{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#f4f7fb;border-radius:999px;padding:5px 10px;font:inherit;font-size:12px;cursor:pointer}#asq button.rep{border-color:#ffc53a;color:#ffc53a}' +
      '#asf{display:flex;gap:6px;padding:8px;border-top:1px solid rgba(255,255,255,.12)}#asf input{flex:1;min-width:0;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#f4f7fb;padding:9px 10px;font:inherit}#asf button{background:#ffc53a;border:0;border-radius:10px;padding:0 14px;font-weight:700;cursor:pointer;color:#000}#asf button:disabled{opacity:.5}' +
      '#asf.rep input{border-color:#ffc53a}';
    d.head.appendChild(css);
    fab = d.createElement('button');
    fab.id = 'asb'; fab.type = 'button'; fab.title = 'Ayuda'; fab.setAttribute('aria-label', 'Abrir el asistente de ayuda'); fab.textContent = '💬';
    panel = d.createElement('div');
    panel.id = 'asp'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Asistente de ayuda');
    panel.innerHTML = '<header><span>🤖</span><span>Ayuda del hub<small>Asistente de IA (Ekovozia) · no escribas datos personales</small></span><button type="button" id="asx" aria-label="Cerrar">✕</button></header>' +
      '<div id="asm"></div><div id="asq"></div><form id="asf"><input id="asi" maxlength="' + MAX_IN + '" autocomplete="off" placeholder="Pregunta sobre los juegos…"><button type="submit" id="ass">Enviar</button></form>';
    d.body.appendChild(fab); d.body.appendChild(panel);
    box = panel.querySelector('#asm'); inp = panel.querySelector('#asi'); btn = panel.querySelector('#ass');

    /* los toques y clics sobre el chat no llegan al juego */
    ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'pointermove', 'click', 'wheel', 'contextmenu'].forEach(function (ev) {
      [fab, panel].forEach(function (el) { el.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true }); });
    });

    if (inGame && lsGet(PREF) === 'off') fab.style.display = 'none';
    add('s', inGame ? 'Hola 👋 Soy una IA. Pregúntame cómo se juega a este juego, trucos de manejo o qué hacer si algo falla.' : 'Hola 👋 Soy una IA. Pregúntame cómo se juega, qué hace cada juego o qué hacer si algo falla.');
    quick();

    fab.addEventListener('click', function () { toggle(); });
    panel.querySelector('#asx').addEventListener('click', function () { toggle(false); });
    panel.querySelector('#asf').addEventListener('submit', onSubmit);
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function quick() {
    var q = panel.querySelector('#asq'); q.textContent = '';
    var mk = function (txt, fn, cls) { var b = d.createElement('button'); b.type = 'button'; b.textContent = txt; if (cls) b.className = cls; b.addEventListener('click', fn); q.appendChild(b); };
    if (mode === 'report') { mk('↩ Volver al chat', function () { setMode('chat'); }); return; }
    mk('¿Cómo se juega?', function () { send(inGame ? '¿Cómo se juega a este juego? Dame lo básico.' : '¿Qué juegos hay y cómo se juegan?'); });
    mk('Dame consejos', function () { send(inGame ? 'Dame consejos para jugar mejor a este juego.' : 'Dame consejos para empezar.'); });
    mk('⚠️ Reportar un problema', function () { setMode('report'); }, 'rep');
    if (inGame) mk('Ocultar este botón', function () { lsSet(PREF, 'off'); fab.style.display = 'none'; toggle(false); });
    else mk(lsGet(PREF) === 'off' ? 'Mostrar el botón en los juegos' : 'Ocultar el botón en los juegos', function () { lsSet(PREF, lsGet(PREF) === 'off' ? 'on' : 'off'); quick(); });
  }
  function setMode(m) {
    mode = m; var f = panel.querySelector('#asf');
    f.classList.toggle('rep', m === 'report');
    inp.placeholder = m === 'report' ? 'Cuéntame qué ha pasado y en qué momento…' : 'Pregunta sobre los juegos…';
    btn.textContent = m === 'report' ? 'Reportar' : 'Enviar';
    if (m === 'report') add('s', 'Describe el problema. Se envía al administrador junto con la página y los últimos errores de tu navegador. No pongas datos personales.');
    quick(); inp.focus();
  }

  function add(cls, text) {
    var e = d.createElement('div'); e.className = cls; e.textContent = text;   /* textContent: nunca HTML */
    box.appendChild(e); box.scrollTop = box.scrollHeight; return e;
  }
  function limpia(t) { return String(t).replace(/\*\*(.+?)\*\*/g, '$1').replace(/`/g, '').replace(/^#{1,6}\s+/gm, '').trim(); }

  function toggle(v) {
    if (!ready) return;
    var on = v === undefined ? !panel.classList.contains('on') : v;
    panel.classList.toggle('on', on);
    if (on) {
      try { if (d.pointerLockElement) d.exitPointerLock(); } catch (e) {}   /* juegos 3D: suelta el ratón */
      try { w.dispatchEvent(new Event('blur')); } catch (e) {}             /* muchos juegos sueltan teclas / se pausan al perder el foco */
      setTimeout(function () { inp.focus(); }, 50);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    var q = inp.value.trim();
    if (!q) return;
    if (mode === 'report') return report(q);
    send(q);
  }

  function send(q) {
    if (busy) return;
    var now = Date.now();
    if (now - lastSend < COOLDOWN) { add('s', 'Un momento, no vayas tan rápido 🙂'); return; }
    lastSend = now; busy = true; btn.disabled = true; inp.value = '';
    add('u', q); turns.push({ role: 'user', content: q });
    var wait = add('a', '…');
    catalogo(function () {
      var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 25000);
      fetch(API, {
        method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ tier: 'basic', system: sistema(), messages: turns.slice(-MAX_TURNS) })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (o) {
          if (o.s === 200 && o.j.text) {
            var t = limpia(o.j.text); wait.textContent = t; wait.className = 'a'; turns.push({ role: 'assistant', content: t });
          } else {
            turns.pop(); wait.className = 's';
            wait.textContent = o.s === 429 ? 'Demasiados mensajes seguidos. Espera un poco y prueba otra vez.' :
              o.s === 403 ? 'El asistente no está disponible ahora mismo.' : 'No he podido responder. Inténtalo de nuevo en un rato (o pulsa «Reportar un problema»).';
          }
        })
        .catch(function () { turns.pop(); wait.className = 's'; wait.textContent = 'Sin conexión con el asistente. Inténtalo más tarde.'; })
        .then(function () { clearTimeout(to); busy = false; btn.disabled = false; box.scrollTop = box.scrollHeight; });
    });
  }

  function report(q) {
    if (busy) return;
    if (Date.now() - lastReport < 60000) { add('s', 'Ya enviaste un reporte hace un momento. Espera un minuto.'); return; }
    busy = true; btn.disabled = true; inp.value = '';
    add('u', q);
    var errs = [];
    try { errs = JSON.parse(lsGet('hub_errores') || '[]').slice(-3).map(function (x) { return { p: x.p, m: x.m, f: x.f, l: x.l }; }); } catch (e) {}
    fetch(API + '/hub/report', {
      method: 'POST', headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ p: slug + '.html', t: q.slice(0, MAX_IN), errs: errs })
    }).then(function (r) {
      if (r.status === 204 || r.ok) { lastReport = Date.now(); add('s', '✅ ¡Enviado! Gracias, el administrador lo recibirá.'); setMode('chat'); }
      else add('s', r.status === 429 ? 'Demasiados reportes seguidos. Prueba en un rato.' : 'No se pudo enviar el reporte. Inténtalo más tarde.');
    }).catch(function () { add('s', 'Sin conexión: no se pudo enviar el reporte.'); })
      .then(function () { busy = false; btn.disabled = false; });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', build); else build();
})(window, document);
