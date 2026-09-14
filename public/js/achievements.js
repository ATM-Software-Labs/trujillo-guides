(function () {
  'use strict';

  var TIERS = {
    bronze: { id: 'bronze', name: 'Bronce', min: 0, max: 4, color: '#d97706', badgeClass: 'tier-bronze' },
    silver: { id: 'silver', name: 'Plata', min: 5, max: 11, color: '#94a3b8', badgeClass: 'tier-silver' },
    gold: { id: 'gold', name: 'Oro', min: 12, max: 19, color: '#f59e0b', badgeClass: 'tier-gold' },
    diamond: { id: 'diamond', name: 'Diamante', min: 20, max: 25, color: '#38bdf8', badgeClass: 'tier-diamond' }
  };

  var ACHIEVEMENTS = [
    // 1. Creación & Arquitectura (6)
    {
      id: 'genesis',
      title: 'Génesis Arquitectónico',
      desc: 'Publicar el primer runbook o especificación técnica en la plataforma.',
      criteria: 'Crear y desplegar 1 guía técnica en ATM Docs.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'bronze',
      rarity: 82.4,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
    },
    {
      id: 'builder',
      title: 'Constructor de Infraestructura',
      desc: 'Diseñar y documentar una suite sólida de guías de sistemas distribuidos.',
      criteria: 'Publicar al menos 3 guías técnicas en el catálogo de autor.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'silver',
      rarity: 38.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    },
    {
      id: 'polymath',
      title: 'Polímata de Sistemas',
      desc: 'Dominar la diversidad técnica publicando en múltiples disciplinas.',
      criteria: 'Tener piezas en al menos 3 categorías: Guía, Análisis y Referencia.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'gold',
      rarity: 16.5,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>'
    },
    {
      id: 'deep-dive',
      title: 'Inmersión Exhaustiva',
      desc: 'Redactar un análisis con profundidad de nivel RFC superior a 15 min de lectura.',
      criteria: 'Publicar una pieza con más de 2.000 palabras o 15+ min de lectura estimada.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'silver',
      rarity: 29.8,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    },
    {
      id: 'interactive',
      title: 'Modelo Computacional',
      desc: 'Integrar simuladores matemáticos o calculadoras reactivas en tus documentos.',
      criteria: 'Publicar o interactuar con una guía dotada de simulador o calculadora.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'silver',
      rarity: 24.3,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>'
    },
    {
      id: 'curator',
      title: 'Curador Maestro',
      desc: 'Estructurar y fijar piezas de referencia crítica en la cabecera del perfil.',
      criteria: 'Fijar (pin) al menos 1 runbook prioritario en tu catálogo personal.',
      category: 'creation',
      categoryLabel: 'Creación & Arquitectura',
      tier: 'bronze',
      rarity: 45.2,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.8l-1.78.89A2 2 0 0 0 5 15.24Z"/></svg>'
    },

    // 2. Exploración & Validación (6)
    {
      id: 'runtime',
      title: 'Ejecución en Caliente',
      desc: 'Simular proyecciones en tiempo real mediante los motores interactivos.',
      criteria: 'Calcular un escenario financiero o interactuar con el simulador de Berkshire/DCF.',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'bronze',
      rarity: 64.7,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    },
    {
      id: 'stress-test',
      title: 'Test de Estrés',
      desc: 'Probar los límites de los modelos numéricos ajustando variables extremas.',
      criteria: 'Configurar parámetros en rangos límite dentro de una herramienta analítica.',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'silver',
      rarity: 32.6,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'
    },
    {
      id: 'indexer',
      title: 'Explorador del Glosario',
      desc: 'Auditar la base de conocimiento técnico y consultar terminología de sistemas.',
      criteria: 'Filtrar y revisar más de 5 conceptos en el Glosario de Sistemas.',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'bronze',
      rarity: 58.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    },
    {
      id: 'peer-review',
      title: 'Revisión por Pares',
      desc: 'Contribuir al consenso de calidad mediante votos técnicos en publicaciones.',
      criteria: 'Emitir un voto positivo (upvote) a una publicación destacada de la comunidad.',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'bronze',
      rarity: 51.0,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
    },
    {
      id: 'early-adopter',
      title: 'Early Adopter v7',
      desc: 'Formar parte del núcleo inicial de ingenieros en la arquitectura modular v7.',
      criteria: 'Iniciar sesión o navegar activamente en la plataforma ATM Docs.',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'silver',
      rarity: 39.4,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    },
    {
      id: 'omnipresent',
      title: 'Políglota Global',
      desc: 'Navegar por la infraestructura multilingüe y alternar entre 3 idiomas.',
      criteria: 'Conmutar la interfaz o lectura entre 3 lenguajes (ES, EN, CA, FR).',
      category: 'exploration',
      categoryLabel: 'Exploración & Validación',
      tier: 'gold',
      rarity: 14.2,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },

    // 3. Identidad & Plataforma (6)
    {
      id: 'identity',
      title: 'Identidad Verificada',
      desc: 'Completar tu perfil de autor: rol técnico, biografía y avatar vectorial.',
      criteria: 'Guardar la configuración de perfil en la consola de ajustes.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'bronze',
      rarity: 62.0,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    },
    {
      id: 'terminal-core',
      title: 'Directiva de Consola',
      desc: 'Configurar un System Prompt personalizado para la orquestación de IA en Edge.',
      criteria: 'Personalizar las instrucciones de inferencia en Modelos & Inferencia.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'silver',
      rarity: 28.5,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>'
    },
    {
      id: 'alias-shift',
      title: 'Trazabilidad de Alias',
      desc: 'Actualizar tu handle de autor y validar la redirección histórica de enlaces.',
      criteria: 'Modificar tu @handle en Ajustes manteniendo la trazabilidad histórica.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'gold',
      rarity: 11.8,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>'
    },
    {
      id: 'hardened',
      title: 'Blindaje Local',
      desc: 'Operar bajo políticas estrictas de seguridad de contenido y almacenamiento local.',
      criteria: 'Activar CSP estricto y custodia de credenciales aislada.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'silver',
      rarity: 25.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    },
    {
      id: 'night-owl',
      title: 'Ingeniero Nocturno',
      desc: 'Despliegues y revisiones técnicas en la ventana de mantenimiento nocturno.',
      criteria: 'Estar conectado e interactuar con la plataforma entre las 00:00 y las 05:00.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'bronze',
      rarity: 41.6,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    },
    {
      id: 'edge-resilience',
      title: 'Resiliencia en el Edge',
      desc: 'Comprobar la disponibilidad offline leyendo documentos desde CacheStorage.',
      criteria: 'Navegar o activar la caché offline de publicaciones prioritarias.',
      category: 'identity',
      categoryLabel: 'Identidad & Plataforma',
      tier: 'gold',
      rarity: 15.3,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    },

    // 4. Secretos & Easter Eggs (7)
    {
      id: '404-resolved',
      title: 'Enrutador Resiliente',
      desc: 'Encontrar una ruta inexistente y ser rescatado con éxito por el fallback SPA.',
      criteria: 'Resolver una navegación 404 y regresar al flujo activo.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'silver',
      rarity: 18.9,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
    },
    {
      id: 'konami-kernel',
      title: 'Konami Kernel Override',
      desc: 'Desbloquear el bypass de depuración mediante la secuencia clásica retro.',
      criteria: 'Introducir la secuencia Konami clásica con las flechas y teclas: ↑ ↑ ↓ ↓ ← → ← → B A.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'diamond',
      rarity: 3.8,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>'
    },
    {
      id: 'speed-of-light',
      title: 'Velocidad de la Luz',
      desc: 'Servir una página directamente desde la caché L1 de Cloudflare en menos de 50ms.',
      criteria: 'Carga completa de recurso con latencia de Edge verificada < 50ms.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'gold',
      rarity: 8.6,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    },
    {
      id: 'zero-cost',
      title: 'Arquitectura Cero Euros',
      desc: 'Aprender a operar sistemas corporativos de alta fidelidad sin costes de licencia.',
      criteria: 'Completar la lectura de la guía de correo para startups a 0 €.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'silver',
      rarity: 22.0,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>'
    },
    {
      id: 'midnight-coder',
      title: 'Borrador de Medianoche',
      desc: 'Guardar un avance de ingeniería durante las horas más silenciosas de la noche.',
      criteria: 'Escribir o guardar un borrador en el editor entre las 23:30 y las 04:30.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'gold',
      rarity: 9.4,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    {
      id: 'monospaced',
      title: 'Consola Pura',
      desc: 'Activar el modo de lectura monoespaciada para auditar sintaxis y especificaciones.',
      criteria: 'Presionar la combinación de teclas Alt + M.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'diamond',
      rarity: 4.1,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'
    },
    {
      id: 'matrix-view',
      title: 'Visor Matricial',
      desc: 'Alternar la vista compacta de ingeniería para visualizar telemetría y densidad de datos.',
      criteria: 'Activar el Modo Avanzado de datos o presionar Alt + J.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'diamond',
      rarity: 5.2,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
    }
  ];

  function getUnlockedMap() {
    try {
      var raw = localStorage.getItem('atm_achievements');
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {}
    return {};
  }

  function saveUnlockedMap(map) {
    try {
      localStorage.setItem('atm_achievements', JSON.stringify(map));
    } catch (e) {}
  }

  function isUnlocked(id) {
    var map = getUnlockedMap();
    return !!map[id];
  }

  function getUnlockedCount() {
    var map = getUnlockedMap();
    return Object.keys(map).length;
  }

  function getCurrentTier(count) {
    if (count === undefined) count = getUnlockedCount();
    if (count >= TIERS.diamond.min) return TIERS.diamond;
    if (count >= TIERS.gold.min) return TIERS.gold;
    if (count >= TIERS.silver.min) return TIERS.silver;
    return TIERS.bronze;
  }

  // Web Audio chime synthesizer
  function playUnlockSound() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();
      var now = ctx.currentTime;
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {}
  }

  function showToast(achievement) {
    var old = document.getElementById('achievement-toast');
    if (old) old.remove();

    var toast = document.createElement('div');
    toast.id = 'achievement-toast';
    toast.className = 'achievement-toast tier-' + achievement.tier;
    toast.innerHTML =
      '<div class="toast-glow"></div>' +
      '<div class="toast-icon-wrap">' + achievement.icon + '</div>' +
      '<div class="toast-body">' +
      '  <div class="toast-kicker">✦ LOGRO DESBLOQUEADO · ' + achievement.categoryLabel.toUpperCase() + '</div>' +
      '  <div class="toast-title">' + achievement.title + '</div>' +
      '  <div class="toast-tier-pill tier-' + achievement.tier + '">' + TIERS[achievement.tier].name + ' · Rareza: ' + achievement.rarity + '%</div>' +
      '</div>' +
      '<button type="button" class="toast-close-btn" aria-label="Cerrar">&times;</button>';

    document.body.appendChild(toast);

    playUnlockSound();

    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    var timer = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.remove(); }, 350);
    }, 4500);

    var closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        clearTimeout(timer);
        toast.classList.remove('is-visible');
        setTimeout(function () { toast.remove(); }, 250);
      });
    }
  }

  function unlock(id, opts) {
    opts = opts || {};
    var map = getUnlockedMap();
    if (map[id]) return false; // already unlocked

    var ach = ACHIEVEMENTS.find(function (a) { return a.id === id; });
    if (!ach) return false;

    map[id] = {
      unlockedAt: Date.now()
    };
    saveUnlockedMap(map);

    if (!opts.silent) {
      showToast(ach);
    }

    document.dispatchEvent(new CustomEvent('atm:achievement-unlocked', {
      detail: { achievement: ach, count: Object.keys(map).length }
    }));

    return true;
  }

  function showModal(id) {
    var ach = ACHIEVEMENTS.find(function (a) { return a.id === id; });
    if (!ach) return;

    var unlocked = isUnlocked(id);
    var map = getUnlockedMap();
    var info = map[id] || {};
    var dateStr = info.unlockedAt ? new Date(info.unlockedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Bloqueado actualmente';

    var oldModal = document.getElementById('achievement-modal-overlay');
    if (oldModal) oldModal.remove();

    var overlay = document.createElement('div');
    overlay.id = 'achievement-modal-overlay';
    overlay.className = 'achievement-modal-overlay';
    overlay.innerHTML =
      '<div class="achievement-modal-card tier-' + ach.tier + (unlocked ? ' is-unlocked' : ' is-locked') + '">' +
      '  <button type="button" class="modal-close-btn" aria-label="Cerrar">&times;</button>' +
      '  <div class="modal-header-visual">' +
      '    <div class="modal-icon-badge achievement-icon-wrap tier-' + ach.tier + '">' + ach.icon + '</div>' +
      '    <div class="modal-tier-tag tier-' + ach.tier + '">' + TIERS[ach.tier].name.toUpperCase() + '</div>' +
      '  </div>' +
      '  <h3 class="modal-ach-title">' + (ach.secret && !unlocked ? '??? [Logro Secreto]' : ach.title) + '</h3>' +
      '  <p class="modal-ach-desc">' + (ach.secret && !unlocked ? 'Este logro está oculto. Explora y experimenta con la plataforma para descubrir su requisito.' : ach.desc) + '</p>' +
      '  <div class="modal-criteria-box">' +
      '    <div class="criteria-label">Criterio de Desbloqueo:</div>' +
      '    <div class="criteria-text">' + (ach.secret && !unlocked ? 'Pista: ' + ach.criteria.slice(0, 30) + '...' : ach.criteria) + '</div>' +
      '  </div>' +
      '  <div class="modal-meta-grid">' +
      '    <div class="modal-meta-cell">' +
      '      <span class="meta-label">Rareza Global</span>' +
      '      <span class="meta-val">' + ach.rarity + '%</span>' +
      '    </div>' +
      '    <div class="modal-meta-cell">' +
      '      <span class="meta-label">Categoría</span>' +
      '      <span class="meta-val">' + ach.categoryLabel + '</span>' +
      '    </div>' +
      '    <div class="modal-meta-cell full-width">' +
      '      <span class="meta-label">Estado</span>' +
      '      <span class="meta-val ' + (unlocked ? 'text-emerald' : 'text-muted') + '">' +
               (unlocked ? '✓ Desbloqueado el ' + dateStr : '🔒 No desbloqueado aún') +
      '      </span>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(overlay);

    function closeModal() {
      overlay.classList.remove('is-active');
      setTimeout(function () { overlay.remove(); }, 200);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    var closeBtn = overlay.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    });

    requestAnimationFrame(function () {
      overlay.classList.add('is-active');
    });
  }

  function renderBadgeGrid(container, filter) {
    if (!container) return;
    filter = filter || 'all';

    var filtered = ACHIEVEMENTS.filter(function (a) {
      var unlocked = isUnlocked(a.id);
      if (filter === 'unlocked') return unlocked;
      if (filter === 'locked') return !unlocked;
      if (filter === 'secrets') return a.secret;
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="profile-empty-state" style="grid-column: 1/-1;">' +
        '<p style="color:#64748b;">No hay logros en este filtro.</p>' +
        '</div>';
      return;
    }

    var html = filtered.map(function (a) {
      var unlocked = isUnlocked(a.id);
      var isSecretLocked = a.secret && !unlocked;
      var title = isSecretLocked ? '???' : a.title;
      var desc = isSecretLocked ? 'Logro Secreto. Explora la plataforma.' : a.desc;
      var statusClass = unlocked ? 'is-unlocked' : 'is-locked';
      var secretClass = a.secret ? 'is-secret' : '';

      return '<div class="achievement-card tier-' + a.tier + ' ' + statusClass + ' ' + secretClass + '" data-ach-id="' + a.id + '" role="button" tabindex="0">' +
        '  <div class="achievement-icon-wrap ach-icon-box tier-' + a.tier + '">' +
             (isSecretLocked ? '<span class="ach-question">?</span>' : a.icon) +
        '  </div>' +
        '  <div class="ach-info">' +
        '    <div class="ach-title-row">' +
        '      <h4 class="ach-title">' + title + '</h4>' +
        '      <span class="ach-tier-badge tier-' + a.tier + '">' + TIERS[a.tier].name + '</span>' +
        '    </div>' +
        '    <p class="ach-desc">' + desc + '</p>' +
        '    <div class="ach-footer">' +
        '      <span class="ach-rarity">' + a.rarity + '% tienen esto</span>' +
        '      <span class="ach-status-label">' + (unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado') + '</span>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.achievement-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-ach-id');
        showModal(id);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var id = el.getAttribute('data-ach-id');
          showModal(id);
        }
      });
    });
  }

  function renderProgressWidget(container) {
    if (!container) return;
    var count = getUnlockedCount();
    var total = ACHIEVEMENTS.length;
    var tier = getCurrentTier(count);
    var pct = Math.round((count / total) * 100);

    // 4 segment progress dots
    var bronzeActive = count >= TIERS.bronze.min;
    var silverActive = count >= TIERS.silver.min;
    var goldActive = count >= TIERS.gold.min;
    var diamondActive = count >= TIERS.diamond.min;

    container.innerHTML =
      '<div class="ach-progress-card tier-' + tier.id + '">' +
      '  <div class="ach-progress-header">' +
      '    <div class="ach-tier-indicator">' +
      '      <span class="tier-glow-dot tier-' + tier.id + '"></span>' +
      '      <span class="tier-current-name">Nivel ' + tier.name + '</span>' +
      '      <span class="tier-ratio-badge">' + count + ' de ' + total + ' Logros (' + pct + '%)</span>' +
      '    </div>' +
      '    <div class="tier-segments-wrap">' +
      '      <div class="tier-seg-step ' + (bronzeActive ? 'is-reached tier-bronze' : '') + '" title="Bronce (0-4)"><span>Bronce</span></div>' +
      '      <div class="tier-seg-step ' + (silverActive ? 'is-reached tier-silver' : '') + '" title="Plata (5-11)"><span>Plata</span></div>' +
      '      <div class="tier-seg-step ' + (goldActive ? 'is-reached tier-gold' : '') + '" title="Oro (12-19)"><span>Oro</span></div>' +
      '      <div class="tier-seg-step ' + (diamondActive ? 'is-reached tier-diamond' : '') + '" title="Diamante (20-25)"><span>Diamante</span></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="ach-progress-bar-bg">' +
      '    <div class="ach-progress-fill tier-' + tier.id + '" style="width: ' + pct + '%;"></div>' +
      '  </div>' +
      '</div>';
  }

  // --- AUTOMATED LISTENERS & TRIGGERS ---
  function setupAutoTriggers() {
    // 1. Early adopter baseline
    unlock('early-adopter', { silent: true });

    // 2. Night Owl check (00:00 to 05:00)
    var currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5) {
      unlock('night-owl');
    }

    // 3. Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
    var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var konamiIndex = 0;
    document.addEventListener('keydown', function (e) {
      var key = e.key.toLowerCase();
      var targetKey = konamiCode[konamiIndex].toLowerCase();
      if (key === targetKey) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          konamiIndex = 0;
          unlock('konami-kernel');
        }
      } else {
        konamiIndex = (key === konamiCode[0].toLowerCase()) ? 1 : 0;
      }
    });

    // 4. Alt + M: Monospaced mode easter egg
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        document.body.classList.toggle('font-mono-mode');
        unlock('monospaced');
      }
    });

    // 5. Alt + J: Matrix View easter egg
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'j' || e.key === 'J')) {
        document.body.classList.toggle('matrix-density-mode');
        unlock('matrix-view');
      }
    });

    // 6. Check 404 resolved in session
    try {
      if (sessionStorage.getItem('atm_resolved_404')) {
        unlock('404-resolved');
      }
    } catch (e) {}

    // 7. Speed of Light check (<50ms navigation timing)
    window.addEventListener('load', function () {
      setTimeout(function () {
        try {
          var navEntries = performance.getEntriesByType('navigation');
          if (navEntries && navEntries.length) {
            var nav = navEntries[0];
            var edgeLatency = nav.responseStart - nav.requestStart;
            if (edgeLatency > 0 && edgeLatency < 50) {
              unlock('speed-of-light');
            }
          }
        } catch (e) {}
      }, 500);
    });

    // 8. Zero cost guide reader
    try {
      if (window.location && window.location.pathname && window.location.pathname.indexOf('correo-corporativo-startups') !== -1) {
        unlock('zero-cost');
      }
    } catch (e) {}

    // 9. Runtime simulation observer
    document.addEventListener('atm:simulation-run', function () {
      unlock('runtime');
    });

    // 10. Upvote / Peer review observer
    document.addEventListener('atm:upvoted', function () {
      unlock('peer-review');
    });

    // 11. Language switched observer
    document.addEventListener('atm:lang-changed', function (e) {
      try {
        var usedLangs = JSON.parse(localStorage.getItem('atm_used_langs') || '[]');
        var l = (e.detail && e.detail.lang) || 'es';
        if (usedLangs.indexOf(l) === -1) {
          usedLangs.push(l);
          localStorage.setItem('atm_used_langs', JSON.stringify(usedLangs));
        }
        if (usedLangs.length >= 3) {
          unlock('omnipresent');
        }
      } catch (err) {}
    });

    // 12. Settings saved observer
    document.addEventListener('atm:settings-saved', function (e) {
      unlock('identity');
      var s = e.detail || {};
      if (s.models && s.models.systemPrompt && s.models.systemPrompt.length > 50) {
        unlock('terminal-core');
      }
      if (s.security && s.security.csp && s.security.offline) {
        unlock('hardened');
      }
      if (s.author && s.author.previous_handles && s.author.previous_handles.length > 0) {
        unlock('alias-shift');
      }
    });

    // 13. Evaluate publication-based achievements
    evaluateCatalogAchievements();
  }

  function evaluateCatalogAchievements() {
    try {
      var all = [];
      var raw = localStorage.getItem('atm_guides_data') || localStorage.getItem('atm_custom_guides');
      if (raw) all = JSON.parse(raw);
      // Combine with static catalog count if available
      var count = (all && all.length) ? all.length : 4;
      if (count >= 1) unlock('genesis', { silent: true });
      if (count >= 3) unlock('builder', { silent: true });
      if (count >= 4) {
        unlock('polymath', { silent: true });
        unlock('deep-dive', { silent: true });
        unlock('interactive', { silent: true });
        unlock('curator', { silent: true });
      }
    } catch (e) {}
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoTriggers);
  } else {
    setupAutoTriggers();
  }

  window.ATM_ACHIEVEMENTS = {
    achievements: ACHIEVEMENTS,
    tiers: TIERS,
    isUnlocked: isUnlocked,
    getUnlockedCount: getUnlockedCount,
    getCurrentTier: getCurrentTier,
    unlock: unlock,
    showModal: showModal,
    showToast: showToast,
    renderBadgeGrid: renderBadgeGrid,
    renderProgressWidget: renderProgressWidget,
    evaluateCatalogAchievements: evaluateCatalogAchievements
  };
})();
