// Catálogo de juegos. Para añadir uno nuevo:
// 1) guarda el juego como <id>.html en la raíz
// 2) añade un objeto a esta lista. Nada más.
window.GAMES = [
  {
    id: 'pizzeria-don-marcos',
    name: "Don Marco's Pizzería",
    emoji: '🍕',
    tags: ['3D', 'Terror', 'Historia'],
    desc: 'Turno de noche en una pizzería cerrada desde 1994. Prepara tres pedidos, sigue las pistas y registra lo imposible antes de que suene el teléfono.',
    controls: 'WASD mover · ratón mirar · E usar · R registrar · F linterna · Shift correr · Esc pausa',
    colors: ['#d3442e', '#e7bd78'],
    badge: 'Nuevo'
  },
  {
    id: 'turno-de-caja',
    name: 'Turno de Caja',
    emoji: '🛒',
    tags: ['3D', 'Simulador'],
    desc: 'Simulador 3D de supermercado: escanea pedidos, atiende a clientes con paciencia limitada, resuelve incidencias y repón estantes.',
    controls: 'WASD mover · ratón mirar · F escanear · E interactuar · Shift correr · Esc pausa',
    colors: ['#2f7d4f', '#b8ed6b'],
    badge: 'Nuevo'
  },
  {
    id: 'saltation',
    name: 'Cuerda de Acero',
    emoji: '🪢',
    tags: ['3D', 'Ritmo', 'Tienda'],
    desc: 'Salta la cuerda de cable de grúa en Puerto Hierro. Cada salto limpio te hace más fuerte; desbloquea cuerdas y skins.',
    controls: 'Espacio o toque para saltar · mantén para salto alto',
    colors: ['#f4c20d', '#d8512f'],
    badge: 'Nuevo'
  },
  {
    id: 'fuga-3d',
    name: 'FUGA 3D',
    emoji: '🚔',
    tags: ['3D', 'Conducción', 'Acción'],
    desc: 'Huye de la policía, helicópteros, tanques y hasta Godzilla. Torreta, nitro, tráfico, power-ups, 10 modos, coches y skins.',
    controls: 'W/S acelerar · ←/→ girar · A / clic torreta · Shift nitro · Espacio freno',
    colors: ['#ff3b5c', '#ffc53a'],
    badge: 'Destacado'
  },
  {
    id: 'neon-buggy',
    name: 'Neón Buggy Infinito',
    emoji: '🏎️',
    tags: ['3D', 'Conducción', 'Arcade'],
    desc: 'Viaja desde Villapeña huyendo de un monstruo gigante: Burgos, Madrid, Valencia (¡DANA!) y Marruecos. Pasos de cebra, abuelitas, cinemáticas, garaje y Pase Neón. ¡Turbo infinito!',
    controls: 'A/D girar · W turbo ∞ · S frenar · Espacio voltereta en el aire · botones en móvil',
    colors: ['#ff2bd6', '#19f2ff'],
    badge: 'Nuevo'
  },
  {
    id: 'orbe-runner',
    name: 'Orbe Runner 3D',
    emoji: '🔶',
    tags: ['3D', 'Plataformas'],
    desc: 'Salta entre islas flotantes, recoge monedas, pisa enemigos y llega al portal sin caer a la lava.',
    controls: 'WASD mover · Espacio saltar (doble) · Shift dash · Q/E o arrastrar: cámara',
    colors: ['#ff7a1a', '#ffd400']
  },
  {
    id: 'demolicion-3d',
    name: 'Demolición 3D',
    emoji: '💥',
    tags: ['3D', 'Físicas', 'Puzles'],
    desc: 'Derriba las estructuras con tu cañón y destruye todas las bolas rojas. Munición normal, pesada y bombas.',
    controls: 'Ratón apuntar · mantén clic para cargar y suelta · 1/2/3 munición',
    colors: ['#ff5a1f', '#8fcfff']
  },
  {
    id: 'pelotation',
    name: 'Pelotation',
    emoji: '🧱',
    tags: ['3D', 'Disparos', 'Físicas'],
    desc: 'Dispara en primera persona y derriba todas las cajas con físicas realistas.',
    controls: 'WASD mover · ratón mirar · clic/Espacio disparar · R reiniciar',
    colors: ['#3a8dde', '#87b5e0']
  },
  {
    id: 'snake',
    name: 'Snake 2025',
    emoji: '🐍',
    tags: ['2D', 'Arcade'],
    desc: 'El clásico de la serpiente con tienda, oro y mejoras.',
    controls: 'Flechas / WASD o deslizar el dedo',
    img: 'snake-icono.png',
    colors: ['#4CAF50', '#1b5e20']
  },
  {
    id: 'survival-shooter',
    name: 'Survival Shooter',
    emoji: '🔫',
    tags: ['2D', 'Disparos', 'Supervivencia'],
    desc: 'Sobrevive a oleadas de enemigos y jefes, sube de nivel y mejora tu equipo en la tienda.',
    controls: 'Mando o teclado · Q bomba · E ataque cruz · C cofre · L cofre legendario',
    img: 'survival-logo.png',
    colors: ['#7b2cff', '#00e5ff']
  }
];
