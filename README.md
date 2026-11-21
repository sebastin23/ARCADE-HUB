# ARCADE HUB

https://sebastin23.github.io/ARCADE-HUB/

Todos los archivos están en la raíz del repositorio (sin carpetas).

## Archivos

- `index.html` – selector de juegos (portada).
- `games.js` – catálogo de juegos.
- `<id>.html` – cada juego (`snake.html`, `neon-buggy.html`, …).
- `mejoras.js` – script común a varios juegos.
- `survival-*` – recursos del Survival Shooter; `snake-icono.*` y `neon-buggy-icono.png` – iconos.
- `politica-privacidad.html` – política de privacidad.
- `supabase-01…03-*.sql` – base de datos del modo online de Neón Buggy.

## Añadir un juego

1. Crea `<id>.html` en la raíz.
2. Añade un objeto a la lista de `games.js` con el mismo `id`.

## Supabase (modo online de Neón Buggy)

Ejecuta los SQL **en orden** en *SQL Editor → New query → Run* (una vez cada uno):
`supabase-01-base.sql`, `supabase-02-solicitudes-amigos.sql`, `supabase-03-guardado-nube.sql`.

En *Authentication → Sign In / Providers*: activa **Allow anonymous sign-ins** y, en **Email**, desactiva **Confirm email**.
La URL y la clave pública (`sb_publishable_…`) van en `SB_URL` y `SB_KEY` dentro de `neon-buggy.html`.
