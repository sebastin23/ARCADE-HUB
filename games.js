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
    disabled: true,
    status: 'Actualizando'
  },
  {
    id: 'turno-de-caja',
    name: 'Turno de Caja',
    emoji: '🛒',
    tags: ['3D', 'Simulador'],
    desc: 'Simulador 3D de supermercado: escanea pedidos, atiende a clientes con paciencia limitada, resuelve incidencias y repón estantes.',
    controls: 'WASD mover · ratón mirar · F escanear · E interactuar · Shift correr · Esc pausa',
    colors: ['#2f7d4f', '#b8ed6b'],
    disabled: true,
    status: 'Actualizando'
  },
  {
    id: 'saltation',
    name: 'Cuerda de Acero',
    emoji: '🪢',
    tags: ['3D', 'Ritmo', 'Tienda'],
    desc: 'Salta la cuerda de cable de grúa en Puerto Hierro. Cada salto limpio te hace más fuerte; desbloquea cuerdas y skins.',
    controls: 'Espacio o toque para saltar · mantén para salto alto',
    help: 'Salta cuando la cuerda baje; mantén pulsado para un salto alto (hace falta cuando la cuerda se duplica). Cada salto limpio da monedas (más si es perfecto) y músculo. Los fallos y el tiempo jugando lastiman los tobillos y reducen el salto: se curan con el tiempo real o vendándolos en el menú (30 monedas). Los capítulos se desbloquean al sumar saltos.',
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
    help: 'Huye de la policía, helicópteros y tanques. W/S aceleran, las flechas giran, A o clic usa la torreta, Shift da nitro y Espacio frena. Hay 10 modos, coches y skins. Usa el nitro para salir de apuros y la torreta para quitarte perseguidores.',
    colors: ['#ff3b5c', '#ffc53a'],
    badge: 'Destacado'
  },
  {
    id: 'neon-buggy',
    name: 'Neón Buggy Infinito',
    emoji: '🏎️',
    img: 'neon-buggy-icono.png',
    tags: ['3D', 'Conducción', 'Arcade'],
    desc: 'Viaja desde Villapeña huyendo de un monstruo gigante: Burgos, Madrid, Valencia (¡DANA!) y Marruecos. Pasos de cebra, abuelitas, cinemáticas, garaje y Pase Neón. ¡Turbo infinito!',
    controls: 'A/D girar · W turbo ∞ · S frenar · Espacio voltereta en el aire · botones en móvil',
    help: 'Mantén W (turbo) y esquiva muros y coches; las rampas te hacen volar y con Espacio haces volteretas en el aire. Recoge monedas y rompe cajas para comprar coches y subir el Pase Neón (se desliza desde abajo). Modo online: reto diario con tablas de distancia y oro, amigos, carreras con código de sala o al azar. En Ajustes hay tutorial, volumen, calidad, sensibilidad y contador de FPS. Si creas contraseña, tu progreso se guarda en la nube.',
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
    help: 'Salta entre islas flotantes con doble salto (Espacio) y dash (Shift). Los pads verdes dan súper salto, pisa a los enemigos rojos desde arriba, ojo con las plataformas móviles y no caigas a la lava. Recoge monedas y llega al portal.',
    colors: ['#ff7a1a', '#ffd400']
  },
  {
    id: 'demolicion-3d',
    name: 'Demolición 3D',
    emoji: '💥',
    tags: ['3D', 'Físicas', 'Puzles'],
    desc: 'Derriba las estructuras con tu cañón y destruye todas las bolas rojas. Munición normal, pesada y bombas.',
    controls: 'Ratón apuntar · mantén clic para cargar y suelta · 1/2/3 munición',
    help: 'Derriba muros y torres para alcanzar los barriles de pólvora y destruye todas las bolas rojas. Mantén clic para cargar la potencia y suelta para disparar; 1, 2 y 3 cambian entre munición normal, pesada y bombas. Apunta a la base de las estructuras para que caigan.',
    colors: ['#ff5a1f', '#8fcfff']
  },
  {
    id: 'pelotation',
    name: 'Pelotation',
    emoji: '🧱',
    tags: ['3D', 'Sandbox', 'Físicas'],
    desc: 'Sandbox de físicas en primera persona: dispara bolas, construye estructuras, haz explosiones y cambia la gravedad. Sin objetivos.',
    controls: 'WASD mover · ratón mirar · clic/Espacio usar · 1-5 herramientas · G gravedad · R limpiar',
    help: 'Es un sandbox sin objetivos. Elige herramienta con 1-5 (bola, bola pesada, poner caja, explosión, borrar), levanta estructuras con M, P, U, O e I, cambia la gravedad con G y el tiempo con T, y limpia todo con R. Las cajas no tienen límite, pero con miles puede ir lento.',
    colors: ['#3a8dde', '#87b5e0']
  },
  {
    id: 'snake',
    name: 'Snake 2025',
    emoji: '🐍',
    tags: ['2D', 'Arcade'],
    desc: 'El clásico de la serpiente con tienda, oro y mejoras.',
    controls: 'Flechas / WASD o deslizar el dedo',
    help: 'Come manzanas para crecer y ganar oro, y gástalo en skins y mejoras en la tienda. Evita chocarte contigo. Ojo: el juego tiene un cuadro de códigos secretos y escribir códigos incorrectos acarrea sanciones; el asistente no da esos códigos.',
    img: 'snake-icono.webp',
    colors: ['#4CAF50', '#1b5e20']
  },
  {
    id: 'survival-shooter',
    name: 'Survival Shooter',
    emoji: '🔫',
    tags: ['2D', 'Disparos', 'Supervivencia'],
    desc: 'Sobrevive a oleadas de enemigos y jefes, sube de nivel y mejora tu equipo en la tienda.',
    controls: 'Mando o teclado · Q bomba · E ataque cruz · C cofre · L cofre legendario',
    help: 'Sobrevive a las oleadas y a los jefes, sube de nivel y elige mejoras (si no las necesitas, pulsa Continuar). P o Esc pausan. Q lanza bomba, E ataque en cruz, C abre cofre y L cofre legendario. Compra equipo en la tienda. En el menú hay Configuraciones: números de daño, vibración de pantalla, FPS y color del menú.',
    img: 'survival-logo.webp',
    colors: ['#7b2cff', '#00e5ff']
  }
];
