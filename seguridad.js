/* ============================================================
   seguridad.js · comprobación de claves por hash (compartido)
   - Las claves NO aparecen en el código: solo su huella SHA-256
     con sal y varias vueltas (hash lento).
   - Para cambiar una clave usa generar-clave.html.
   - Nota: en una web estática esto oculta la clave a quien mira
     el código, pero una clave corta se puede adivinar a base de
     probar. Usa claves largas.
   ============================================================ */
(function (w) {
  'use strict';

  /* SHA-256 síncrono (texto UTF-8 -> hexadecimal) */
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  function utf8(s) {
    var o = [], i, c;
    s = unescape(encodeURIComponent(s));
    for (i = 0; i < s.length; i++) { c = s.charCodeAt(i); o.push(c); }
    return o;
  }
  function sha256(str) {
    var m = utf8(str), l = m.length, i, j;
    m.push(0x80);
    while (m.length % 64 !== 56) m.push(0);
    var hi = Math.floor(l / 0x20000000), lo = (l << 3) >>> 0;
    m.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255,
           (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var Wd = new Array(64);
    for (i = 0; i < m.length; i += 64) {
      for (j = 0; j < 16; j++) Wd[j] = (m[i+4*j] << 24) | (m[i+4*j+1] << 16) | (m[i+4*j+2] << 8) | m[i+4*j+3];
      for (j = 16; j < 64; j++) {
        var a0 = Wd[j-15], a1 = Wd[j-2];
        var s0 = ((a0 >>> 7) | (a0 << 25)) ^ ((a0 >>> 18) | (a0 << 14)) ^ (a0 >>> 3);
        var s1 = ((a1 >>> 17) | (a1 << 15)) ^ ((a1 >>> 19) | (a1 << 13)) ^ (a1 >>> 10);
        Wd[j] = (Wd[j-16] + s0 + Wd[j-7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (j = 0; j < 64; j++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[j] + Wd[j]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  /* hash lento: sal + n vueltas */
  function hash(texto, sal, n) {
    var h = sha256(sal + ':' + texto), i;
    for (i = 1; i < (n || 1); i++) h = sha256(h + texto);
    return h;
  }
  function nuevaSal() {
    var a = new Uint8Array(12), s = '', i;
    (w.crypto || w.msCrypto).getRandomValues(a);
    for (i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2);
    return s;
  }

  var T = {
  /* contraseña de administrador (Survival y Neón Buggy) */
  admin: {"s":"cf138bf8a9f41ee068f47204","n":6000,"h":"e3606828ef2b063bedc105ca842fdcd100a2b990dfa925bb4bdea8b0e8355c59"},
  /* secuencia Konami de Neón Buggy */
  konami: {"s":"65e22376ef0bb95a96327c1b","n":1,"h":"31b844671ca4ef3e6d9fa23ebf4d9be9607f1696a77794a09aa762de97a1a2e6"},
  /* códigos de trucos de Snake (identificador -> huella) */
  snake: {
    "s": "84a159d6fdbdfdef56bb028a",
    "n": 6000,
    "h": {
      "infinito": "4eceb79a6a9e0a36b2a57189e7e63bdd3985443ad8256ff05597695f0dd924c5",
      "invencible": "e621383d202bf308fb4bf994e05d7561345f14a00144b4e973ba02fb8c54f0b5",
      "perdon": "73e7607b88c52fd73ca9cf3c2bc611e64aa809d05afb8c3c69fa00058ec50522",
      "cabeza": "5796ce4bd9ed347bdcda4a426c86760865b4300a414b7d218023a3945540149b",
      "x2": "76ad7325ab9175e1deade8a275ab2776800772ab13f1d6df18d62490a4900125",
      "x10": "a46f099f4855b10a24167ef770a7352870ddb42e86e32c43e6116b6a55964abc",
      "ganar": "b3870dfac0e9191c27151e341db798f986d6a27eaeb1659c3bc1bf465dd41d09"
    }
  }
};

  /* bloqueo tras 5 intentos fallidos (1 minuto) */
  function bloqueado() {
    try { var t = +localStorage.getItem('sec_lock') || 0; return Math.max(0, Math.ceil((t - Date.now()) / 1000)); } catch (e) { return 0; }
  }
  function fallo() {
    try {
      var n = (+localStorage.getItem('sec_fails') || 0) + 1;
      if (n >= 5) { localStorage.setItem('sec_lock', String(Date.now() + 60000)); n = 0; }
      localStorage.setItem('sec_fails', String(n));
    } catch (e) {}
  }
  function acierto() { try { localStorage.removeItem('sec_fails'); } catch (e) {} }

  w.SEC = {
    hash: hash,
    nuevaSal: nuevaSal,
    tablas: T,
    bloqueado: bloqueado,
    /* contraseña de administrador */
    admin: function (t) {
      if (bloqueado()) return false;
      var ok = hash(String(t || ''), T.admin.s, T.admin.n) === T.admin.h;
      if (ok) acierto(); else fallo();
      return ok;
    },
    /* secuencia Konami (array de e.code) */
    konami: function (arr) { return hash(arr.join(','), T.konami.s, T.konami.n) === T.konami.h; },
    /* código de trucos de Snake: devuelve su identificador o null */
    snake: function (t) {
      var h = hash(String(t || '').trim().toLowerCase(), T.snake.s, T.snake.n), k;
      for (k in T.snake.h) if (T.snake.h[k] === h) return k;
      return null;
    }
  };
})(window);
