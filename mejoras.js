/* Capa de mejoras común para todos los juegos del Arcade Hub.
   Añade: barra de herramientas (inicio, sonido, pantalla completa, FPS),
   control de volumen global, silencio al cambiar de pestaña,
   viñeta/ambiente visual, sombras suaves y realce de color en 2D. */
(function () {
  'use strict';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('hub_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('hub_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var muted = store.get('muted', false), showFps = store.get('fps', false), hidden = false;

  /* ---------- Audio: volumen maestro por contexto ---------- */
  var masters = [];
  function applyVolume() { masters.forEach(function (g) { g.gain.value = (muted || hidden) ? 0 : 1; }); }
  if (window.AudioNode && window.AudioDestinationNode) {
    var origConnect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest) {
      if (dest instanceof AudioDestinationNode) {
        var ctx = dest.context;
        if (!ctx.__hubMaster) {
          var g = ctx.createGain();
          origConnect.call(g, ctx.destination);
          ctx.__hubMaster = g; masters.push(g); applyVolume();
        }
        if (this !== ctx.__hubMaster) {
          var rest = Array.prototype.slice.call(arguments, 1);
          origConnect.apply(this, [ctx.__hubMaster].concat(rest));
          return dest;
        }
      }
      return origConnect.apply(this, arguments);
    };
  }
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; applyVolume(); });

  /* ---------- Gráficos ---------- */
  var has3D = !!(window.THREE && THREE.WebGLRenderer);
  if (has3D) {
    var origRender = THREE.WebGLRenderer.prototype.render, tuned = new WeakSet();
    THREE.WebGLRenderer.prototype.render = function () {
      if (!tuned.has(this)) {
        tuned.add(this);
        try { if (this.shadowMap.enabled) this.shadowMap.type = THREE.PCFSoftShadowMap; } catch (e) {}
      }
      return origRender.apply(this, arguments);
    };
  }

  var css = document.createElement('style');
  css.textContent =
    '#hub-vig{position:fixed;inset:0;pointer-events:none;z-index:2147482000;' +
    'background:radial-gradient(ellipse at center,rgba(0,0,0,0) 58%,rgba(0,0,0,' + (has3D ? '.38' : '.22') + ') 100%)}' +
    '#hub-bar{position:fixed;left:10px;bottom:10px;z-index:2147483000;display:flex;gap:6px;align-items:center;' +
    'opacity:.35;transition:opacity .2s;font:600 12px system-ui,sans-serif}' +
    '#hub-bar:hover,#hub-bar:focus-within{opacity:1}' +
    '#hub-bar a,#hub-bar button{all:unset;cursor:pointer;color:#fff;background:rgba(15,15,25,.78);' +
    'border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:5px 9px;line-height:1}' +
    '#hub-bar a:hover,#hub-bar button:hover{background:rgba(60,60,110,.9)}' +
    '#hub-fps{color:#9f9;background:rgba(15,15,25,.78);border-radius:8px;padding:5px 8px;display:none}' +
    (has3D ? '' : 'canvas{filter:saturate(1.15) contrast(1.05)}');
  document.head.appendChild(css);

  function build() {
    var v = document.createElement('div'); v.id = 'hub-vig'; document.body.appendChild(v);
    var bar = document.createElement('div'); bar.id = 'hub-bar';
    var home = document.createElement('a'); home.href = 'index.html'; home.textContent = '🏠'; home.title = 'Volver al Arcade Hub';
    var snd = document.createElement('button'); snd.title = 'Sonido on/off';
    var fs = document.createElement('button'); fs.textContent = '⛶'; fs.title = 'Pantalla completa';
    var fpsB = document.createElement('button'); fpsB.textContent = 'FPS'; fpsB.title = 'Mostrar FPS';
    var fpsT = document.createElement('span'); fpsT.id = 'hub-fps';
    function paint() { snd.textContent = muted ? '🔇' : '🔊'; fpsT.style.display = showFps ? 'block' : 'none'; }
    snd.onclick = function () { muted = !muted; store.set('muted', muted); applyVolume(); paint(); this.blur(); };
    fpsB.onclick = function () { showFps = !showFps; store.set('fps', showFps); paint(); this.blur(); };
    fs.onclick = function () {
      var d = document, el = d.documentElement;
      if (d.fullscreenElement) d.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen();
      this.blur();
    };
    [home, snd, fs, fpsB, fpsT].forEach(function (n) { bar.appendChild(n); });
    document.body.appendChild(bar); paint();

    var frames = 0, last = performance.now();
    (function tick(t) {
      frames++;
      if (t - last >= 500) { if (showFps) fpsT.textContent = Math.round(frames * 1000 / (t - last)) + ' fps'; frames = 0; last = t; }
      requestAnimationFrame(tick);
    })(last);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
