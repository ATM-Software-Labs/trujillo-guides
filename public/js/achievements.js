(function () {
  'use strict';

  var TIERS = {
    bronze: { id: 'bronze', name: 'Bronce', min: 0, max: 4, color: '#d97706', badgeClass: 'tier-bronze' },
    silver: { id: 'silver', name: 'Plata', min: 5, max: 11, color: '#a1a1aa', badgeClass: 'tier-silver' },
    gold: { id: 'gold', name: 'Oro', min: 12, max: 19, color: '#f59e0b', badgeClass: 'tier-gold' },
    diamond: { id: 'diamond', name: 'Diamante', min: 20, max: 25, color: 'var(--accent, #10B981)', badgeClass: 'tier-diamond' }
  };

  var ACHIEVEMENTS = [
    // 1. Creación & Arquitectura (6)
    {
      id: 'genesis',
      title: 'Primera publicación',
      desc: 'Publicar tu primera guía.',
      criteria: 'Publicar 1 guía en ATM Docs.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'bronze',
      rarity: 82.4,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/></svg>'
    },
    {
      id: 'builder',
      title: 'Constructor',
      desc: 'Reunir un pequeño catálogo de guías propias.',
      criteria: 'Publicar al menos 3 guías técnicas en el catálogo de autor.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'silver',
      rarity: 38.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    },
    {
      id: 'polymath',
      title: 'Polifacético',
      desc: 'Publicar en varios tipos de contenido.',
      criteria: 'Tener piezas en al menos 3 categorías: Guía, Análisis y Referencia.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'gold',
      rarity: 16.5,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>'
    },
    {
      id: 'deep-dive',
      title: 'Inmersión Exhaustiva',
      desc: 'Escribir una pieza larga, de más de 15 min de lectura.',
      criteria: 'Publicar una pieza con más de 2.000 palabras o 15+ min de lectura estimada.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'silver',
      rarity: 29.8,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    },
    {
      id: 'interactive',
      title: 'Con simulador',
      desc: 'Usar una guía que incluye simulador o calculadora.',
      criteria: 'Publicar o interactuar con una guía dotada de simulador o calculadora.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'silver',
      rarity: 24.3,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>'
    },
    {
      id: 'curator',
      title: 'Destacado',
      desc: 'Fijar una publicación en tu perfil.',
      criteria: 'Fijar al menos 1 publicación en tu perfil.',
      category: 'creation',
      categoryLabel: 'Creación',
      tier: 'bronze',
      rarity: 45.2,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.8l-1.78.89A2 2 0 0 0 5 15.24Z"/></svg>'
    },

    // 2. Exploración & Validación (6)
    {
      id: 'runtime',
      title: 'Primer cálculo',
      desc: 'Probar un escenario en un simulador.',
      criteria: 'Calcular un escenario financiero o interactuar con el simulador de Berkshire/DCF.',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'bronze',
      rarity: 64.7,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
    },
    {
      id: 'stress-test',
      title: 'Valores extremos',
      desc: 'Probar un simulador con valores límite.',
      criteria: 'Configurar parámetros en rangos límite dentro de una herramienta analítica.',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'silver',
      rarity: 32.6,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'
    },
    {
      id: 'indexer',
      title: 'Explorador del Glosario',
      desc: 'Consultar varios términos del glosario.',
      criteria: 'Filtrar y revisar más de 5 conceptos en el Glosario de Sistemas.',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'bronze',
      rarity: 58.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    },
    {
      id: 'peer-review',
      title: 'Primer voto',
      desc: 'Votar una publicación que te haya resultado útil.',
      criteria: 'Dar un voto positivo a una publicación.',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'bronze',
      rarity: 51.0,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
    },
    {
      id: 'early-adopter',
      title: 'Primeros usuarios',
      desc: 'Estar entre los primeros usuarios de ATM Docs.',
      criteria: 'Iniciar sesión o navegar activamente en la plataforma ATM Docs.',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'silver',
      rarity: 39.4,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
    },
    {
      id: 'omnipresent',
      title: 'Políglota',
      desc: 'Cambiar el idioma de la interfaz a 3 idiomas distintos.',
      criteria: 'Conmutar la interfaz o lectura entre 3 lenguajes (ES, EN, CA, FR).',
      category: 'exploration',
      categoryLabel: 'Exploración',
      tier: 'gold',
      rarity: 14.2,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },

    // 3. Identidad & Plataforma (6)
    {
      id: 'identity',
      title: 'Identidad Verificada',
      desc: 'Completar tu perfil: rol, biografía y avatar.',
      criteria: 'Guardar tu perfil en Ajustes.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'bronze',
      rarity: 62.0,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    },
    {
      id: 'terminal-core',
      title: 'Instrucciones propias',
      desc: 'Escribir tus propias instrucciones para el asistente de IA.',
      criteria: 'Personalizar las instrucciones en Ajustes.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'silver',
      rarity: 28.5,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>'
    },
    {
      id: 'alias-shift',
      title: 'Nuevo alias',
      desc: 'Cambiar tu @handle; los enlaces antiguos siguen funcionando.',
      criteria: 'Cambiar tu @handle en Ajustes.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'gold',
      rarity: 11.8,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>'
    },
    {
      id: 'hardened',
      title: 'Modo privado',
      desc: 'Usar la plataforma con almacenamiento solo local.',
      criteria: 'Activar el modo privado en Ajustes.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'silver',
      rarity: 25.1,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    },
    {
      id: 'night-owl',
      title: 'Nocturno',
      desc: 'Visitar la plataforma de madrugada.',
      criteria: 'Estar conectado e interactuar con la plataforma entre las 00:00 y las 05:00.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'bronze',
      rarity: 41.6,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
    },
    {
      id: 'edge-resilience',
      title: 'Sin conexión',
      desc: 'Leer una guía guardada para uso sin conexión.',
      criteria: 'Abrir una guía guardada sin conexión.',
      category: 'identity',
      categoryLabel: 'Perfil y ajustes',
      tier: 'gold',
      rarity: 15.3,
      secret: false,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    },

    // 4. Secretos & Easter Eggs (7)
    {
      id: '404-resolved',
      title: 'Perdido y encontrado',
      desc: 'Llegar a una página que no existe y volver al inicio.',
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
      title: 'Código Konami',
      desc: 'Introducir la secuencia clásica de los videojuegos.',
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
      title: 'Carga rápida',
      desc: 'Cargar una página en menos de 50 ms.',
      criteria: 'Que una página termine de cargar en menos de 50 ms.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'gold',
      rarity: 8.6,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    },
    {
      id: 'zero-cost',
      title: 'Correo a 0 €',
      desc: 'Leer la guía de correo corporativo sin coste.',
      criteria: 'Completar la lectura de la guía de correo para startups a 0 €.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'silver',
      rarity: 22.0,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/></svg>'
    },
    {
      id: 'midnight-coder',
      title: 'Borrador de Medianoche',
      desc: 'Guardar un borrador a medianoche.',
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
      title: 'Modo monoespaciado',
      desc: 'Activar la lectura en fuente monoespaciada.',
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
      title: 'Vista de tabla',
      desc: 'Cambiar el perfil a la vista de tabla.',
      criteria: 'Activar el modo avanzado o pulsar Alt + J.',
      category: 'secrets',
      categoryLabel: 'Secretos & Easter Eggs',
      tier: 'diamond',
      rarity: 5.2,
      secret: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
    }
  ];


  // --- Traducción: los textos se leen en el idioma activo ---
  function AL() { try { return (window.atmLang && window.atmLang()) || document.documentElement.lang || 'es'; } catch (e) { return 'es'; } }
  function AT(k, fb) { var v = window.atmT ? window.atmT(k) : null; return (v && v !== k) ? v : fb; }
  var CAT_KEYS = { 'Creación': 'cat_creation', 'Exploración': 'cat_explore', 'Perfil y ajustes': 'cat_profile', 'Secretos & Easter Eggs': 'cat_secrets' };
  ACHIEVEMENTS.forEach(function (a, i) {
    var es = { title: a.title, desc: a.desc, criteria: a.criteria, categoryLabel: a.categoryLabel };
    function pick(j) {
      var l = AL().slice(0, 2); if (l === 'es') return null;
      var row = window.ATM_ACH_I18N && window.ATM_ACH_I18N[l] && window.ATM_ACH_I18N[l][i];
      if (!row) row = window.ATM_ACH_I18N && window.ATM_ACH_I18N.en && window.ATM_ACH_I18N.en[i];
      return row ? (row[j] || row[1]) : null;
    }
    Object.defineProperty(a, 'title', { get: function () { return pick(0) || es.title; }, enumerable: true });
    Object.defineProperty(a, 'desc', { get: function () { return pick(1) || es.desc; }, enumerable: true });
    Object.defineProperty(a, 'criteria', { get: function () { return pick(2) || es.criteria; }, enumerable: true });
    Object.defineProperty(a, 'categoryLabel', { get: function () { return AT(CAT_KEYS[es.categoryLabel], es.categoryLabel); }, enumerable: true });
  });
  Object.keys(TIERS).forEach(function (k) {
    var es = TIERS[k].name;
    Object.defineProperty(TIERS[k], 'name', { get: function () { return AT('tier_' + k, es); }, enumerable: true });
  });

  // --- USER IDENTIFICATION & ISOLATED PERSISTENCE ---
  function getCurrentUserId() {
    if (window.__taMe && (window.__taMe.id || window.__taMe.handle || window.__taMe.username)) {
      return String(window.__taMe.handle || window.__taMe.username || window.__taMe.id).toLowerCase().replace(/^@+/, '').trim();
    }
    try {
      var authUser = JSON.parse(localStorage.getItem('auth_user') || localStorage.getItem('atm_user') || localStorage.getItem('trujillo_ai_user') || 'null');
      if (authUser && (authUser.id || authUser.handle || authUser.username || authUser.email)) {
        return String(authUser.handle || authUser.username || authUser.id || authUser.email.split('@')[0]).toLowerCase().replace(/^@+/, '').trim();
      }
    } catch (e) {}
    try {
      var settings = JSON.parse(localStorage.getItem('atm_settings') || '{}');
      if (settings && settings.author && settings.author.handle) {
        var h = String(settings.author.handle).toLowerCase().replace(/^@+/, '').trim();
        if (h && h !== ':splat' && h !== 'undefined' && h !== 'null') {
          return h;
        }
      }
    } catch (e) {}
    return null;
  }

  // Storage key is strictly isolated per user ID (e.g. achievements_${userId})
  function getStorageKey(userId) {
    var uid = (userId || getCurrentUserId() || '').toLowerCase().replace(/^@+/, '').trim();
    return uid ? ('achievements_' + uid) : 'achievements_guest';
  }

  function getUnlockedMap(userId) {
    try {
      var key = getStorageKey(userId);
      var raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {}
    return {};
  }

  function saveUnlockedMap(map, userId) {
    try {
      var key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function clearUserAchievements(userId) {
    try {
      if (userId) {
        var uid = String(userId).toLowerCase().replace(/^@+/, '').trim();
        localStorage.removeItem('achievements_' + uid);
        localStorage.removeItem('atm_achievements_' + uid);
      } else {
        // Clear all cached achievements across sessions to prevent cross-account leakage
        for (var i = localStorage.length - 1; i >= 0; i--) {
          var k = localStorage.key(i);
          if (k && (k.indexOf('achievements_') === 0 || k.indexOf('atm_achievements') === 0 || k === 'atm_achievements' || k === 'achievements_guest')) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch (e) {}
  }

  // Eliminate legacy unscoped global key to prevent polluted mock data
  try {
    localStorage.removeItem('atm_achievements');
  } catch (e) {}

  function isUnlocked(id, userId) {
    var map = getUnlockedMap(userId);
    return !!map[id];
  }

  function getUnlockedCount(userId) {
    var map = getUnlockedMap(userId);
    return Object.keys(map).length;
  }

  function getCurrentTier(count, userId) {
    if (count === undefined) count = getUnlockedCount(userId);
    if (count >= TIERS.diamond.min) return TIERS.diamond;
    if (count >= TIERS.gold.min) return TIERS.gold;
    if (count >= TIERS.silver.min) return TIERS.silver;
    return TIERS.bronze;
  }

  // Web Audio chime synthesizer
  function playUnlockSound() {
    // Sin sonido salvo que el usuario lo active (localStorage atm_ach_sound = '1')
    try { if (localStorage.getItem('atm_ach_sound') !== '1') return; } catch (e) { return; }
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
      '<div class="toast-icon-wrap">' + achievement.icon + '</div>' +
      '<div class="toast-body">' +
      '  <div class="toast-kicker">✦ ' + AT('ach_toast','Logro desbloqueado').toUpperCase() + ' · ' + achievement.categoryLabel.toUpperCase() + '</div>' +
      '  <div class="toast-title">' + achievement.title + '</div>' +
      '  <div class="toast-tier-pill tier-' + achievement.tier + '">' + TIERS[achievement.tier].name + ' · ' + AT('ach_rar','Rareza') + ': ' + achievement.rarity + '%</div>' +
      '</div>' +
      '<button type="button" class="toast-close-btn" aria-label="' + AT('close', 'Cerrar') + '">&times;</button>';

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
    var userId = opts.userId || getCurrentUserId();
    var map = getUnlockedMap(userId);
    if (map[id]) return false; // already unlocked

    var ach = ACHIEVEMENTS.find(function (a) { return a.id === id; });
    if (!ach) return false;

    map[id] = {
      unlockedAt: Date.now()
    };
    saveUnlockedMap(map, userId);

    // Aviso solo una vez por logro y navegador, aunque cambie la clave de usuario
    var toasted = [];
    try { toasted = JSON.parse(localStorage.getItem('atm_ach_toasted') || '[]'); } catch (e) {}
    if (!opts.silent && toasted.indexOf(id) === -1) {
      toasted.push(id);
      try { localStorage.setItem('atm_ach_toasted', JSON.stringify(toasted)); } catch (e) {}
      showToast(ach);
    }

    document.dispatchEvent(new CustomEvent('atm:achievement-unlocked', {
      detail: { achievement: ach, count: Object.keys(map).length, userId: userId }
    }));

    return true;
  }

  function showModal(id, userId) {
    var ach = ACHIEVEMENTS.find(function (a) { return a.id === id; });
    if (!ach) return;

    var unlocked = isUnlocked(id, userId);
    var map = getUnlockedMap(userId);
    var info = map[id] || {};
    var dateStr = info.unlockedAt ? new Date(info.unlockedAt).toLocaleDateString(AL(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : AT('ach_locked_now','Bloqueado actualmente');

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
      '  <h3 class="modal-ach-title">' + (ach.secret && !unlocked ? AT('ach_secret_title','??? [Logro secreto]') : ach.title) + '</h3>' +
      '  <p class="modal-ach-desc">' + (ach.secret && !unlocked ? AT('ach_secret_desc','Este logro está oculto.') : ach.desc) + '</p>' +
      '  <div class="modal-criteria-box">' +
      '    <div class="criteria-label">' + AT('ach_crit','Criterio de desbloqueo:') + '</div>' +
      '    <div class="criteria-text">' + (ach.secret && !unlocked ? AT('ach_hint','Pista:') + ' ' + ach.criteria.slice(0, 30) + '...' : ach.criteria) + '</div>' +
      '  </div>' +
      '  <div class="modal-meta-grid">' +
      '    <div class="modal-meta-cell">' +
      '      <span class="meta-label">' + AT('ach_rar_g','Rareza global') + '</span>' +
      '      <span class="meta-val">' + ach.rarity + '%</span>' +
      '    </div>' +
      '    <div class="modal-meta-cell">' +
      '      <span class="meta-label">' + AT('ach_cat','Categoría') + '</span>' +
      '      <span class="meta-val">' + ach.categoryLabel + '</span>' +
      '    </div>' +
      '    <div class="modal-meta-cell full-width">' +
      '      <span class="meta-label">' + AT('ach_state','Estado') + '</span>' +
      '      <span class="meta-val ' + (unlocked ? 'text-emerald' : 'text-muted') + '">' +
               (unlocked ? AT('ach_unlocked_on','✓ Desbloqueado el') + ' ' + dateStr : AT('ach_not_yet','🔒 No desbloqueado aún')) +
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

  function renderBadgeGrid(container, filter, userId) {
    if (!container) return;
    filter = filter || 'all';

    var filtered = ACHIEVEMENTS.filter(function (a) {
      var unlocked = isUnlocked(a.id, userId);
      if (filter === 'unlocked') return unlocked;
      if (filter === 'locked') return !unlocked;
      if (filter === 'secrets') return a.secret;
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="profile-empty-state" style="grid-column: 1/-1;">' +
        '<p style="color:#71717a;">' + AT('ach_no_filter','No hay logros en este filtro.') + '</p>' +
        '</div>';
      return;
    }

    var html = filtered.map(function (a) {
      var unlocked = isUnlocked(a.id, userId);
      var isSecretLocked = a.secret && !unlocked;
      var title = isSecretLocked ? '???' : a.title;
      var desc = isSecretLocked ? AT('ach_secret_short','Logro secreto. Explora la plataforma.') : a.desc;
      var statusClass = unlocked ? 'is-unlocked' : 'is-locked';
      var secretClass = a.secret ? 'is-secret' : '';

      return '<div class="achievement-card tier-' + a.tier + ' ' + statusClass + ' ' + secretClass + '" data-ach-id="' + a.id + '" role="button" tabindex="0">' +
        '  <div class="achievement-icon-wrap ach-icon-box tier-' + a.tier + '">' +
             (isSecretLocked ? '<span class="ach-question">?</span>' : a.icon) +
        '  </div>' +
        '  <div class="ach-info">' +
        '    <div class="ach-title-row">' +
        '      <h4 class="ach-title" title="' + title + '">' + title + '</h4>' +
        '      <span class="ach-tier-badge tier-' + a.tier + '">' + TIERS[a.tier].name + '</span>' +
        '    </div>' +
        '    <p class="ach-desc">' + desc + '</p>' +
        '    <div class="ach-footer">' +
        '      <span class="ach-rarity">' + a.rarity + '%</span>' +
        '      <span class="ach-status-label">' + (unlocked ? AT('ach_unl','✓ Desbloqueado') : AT('ach_lock','🔒 Bloqueado')) + '</span>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.achievement-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-ach-id');
        showModal(id, userId);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var id = el.getAttribute('data-ach-id');
          showModal(id, userId);
        }
      });
    });
  }

  function renderAchievementsGuide(container, filter, userId) {
    if (!container) return;
    filter = filter || 'all';

    var filtered = ACHIEVEMENTS.filter(function (a) {
      var unlocked = isUnlocked(a.id, userId);
      if (filter === 'unlocked') return unlocked;
      if (filter === 'locked') return !unlocked;
      if (filter === 'secrets') return a.secret;
      return true;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="profile-empty-state" style="padding: 32px 0; text-align: center;">' +
        '<p style="color:#71717a; margin:0;">' + AT('ach_no_badges','No hay insignias que coincidan con este filtro.') + '</p>' +
        '</div>';
      return;
    }

    var html = filtered.map(function (a) {
      var unlocked = isUnlocked(a.id, userId);
      var isSecretLocked = a.secret && !unlocked;
      var title = isSecretLocked ? AT('ach_secret_title','??? [Logro secreto]') : a.title;
      var desc = isSecretLocked ? AT('ach_secret_desc','Este logro está oculto.') : a.desc;
      var criteria = isSecretLocked ? AT('ach_hint_secret','Pista') : a.criteria;
      var statusClass = unlocked ? 'is-unlocked' : 'is-locked';
      var statusLabel = unlocked ? AT('ach_unl','✓ Desbloqueado') : AT('ach_lock','🔒 Bloqueado');

      return '<div class="ach-guide-row ' + statusClass + '" data-ach-id="' + a.id + '" role="button" tabindex="0">' +
        '  <div class="ach-guide-icon tier-' + a.tier + '">' +
             (isSecretLocked ? '<span class="ach-question">?</span>' : a.icon) +
        '  </div>' +
        '  <div class="ach-guide-info">' +
        '    <div class="ach-guide-title-row">' +
        '      <h3 class="ach-guide-title">' + title + '</h3>' +
        '      <span class="ach-tier-badge tier-' + a.tier + '">' + TIERS[a.tier].name + '</span>' +
        '      <span class="ach-guide-category">' + a.categoryLabel + '</span>' +
        '    </div>' +
        '    <p class="ach-guide-desc">' + desc + '</p>' +
        '    <div class="ach-guide-criteria">' +
        '      <span class="criteria-label">' + AT('ach_how','Cómo conseguirlo:') + '</span>' +
        '      <span>' + criteria + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="ach-guide-meta">' +
        '    <span class="ach-guide-status ' + statusClass + '">' + statusLabel + '</span>' +
        '    <span class="ach-guide-rarity">' + a.rarity + '% ' + AT('ach_rarity','de autores') + '</span>' +
        '  </div>' +
        '</div>';
    }).join('');

    container.innerHTML = html;

    container.querySelectorAll('.ach-guide-row').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = el.getAttribute('data-ach-id');
        showModal(id, userId);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var id = el.getAttribute('data-ach-id');
          showModal(id, userId);
        }
      });
    });
  }

  function renderProgressWidget(container, userId) {
    if (!container) return;
    var count = getUnlockedCount(userId);
    var total = ACHIEVEMENTS.length;
    var tier = getCurrentTier(count, userId);
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
      '      <span class="tier-current-name">' + AT('ach_level','Nivel') + ' ' + tier.name + '</span>' +
      '      <span class="tier-ratio-badge">' + count + ' ' + AT('ach_of','de') + ' ' + total + ' ' + AT('ach_word','logros') + ' (' + pct + '%)</span>' +
      '    </div>' +
      '    <div class="tier-segments-wrap">' +
      '      <div class="tier-seg-step ' + (bronzeActive ? 'is-reached tier-bronze' : '') + '" title="' + TIERS.bronze.name + ' (0-4)"><span>' + TIERS.bronze.name + '</span></div>' +
      '      <div class="tier-seg-step ' + (silverActive ? 'is-reached tier-silver' : '') + '" title="' + TIERS.silver.name + ' (5-11)"><span>' + TIERS.silver.name + '</span></div>' +
      '      <div class="tier-seg-step ' + (goldActive ? 'is-reached tier-gold' : '') + '" title="' + TIERS.gold.name + ' (12-19)"><span>' + TIERS.gold.name + '</span></div>' +
      '      <div class="tier-seg-step ' + (diamondActive ? 'is-reached tier-diamond' : '') + '" title="' + TIERS.diamond.name + ' (20-25)"><span>' + TIERS.diamond.name + '</span></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="ach-progress-bar-bg">' +
      '    <div class="ach-progress-fill tier-' + tier.id + '" style="width: ' + pct + '%;"></div>' +
      '  </div>' +
      '</div>';
  }

  // --- AUTOMATED LISTENERS & TRIGGERS ---
  function setupAutoTriggers() {
    // 1. Check active session on startup: ONLY unlock early-adopter if authenticated
    var activeUid = getCurrentUserId();
    if (activeUid) {
      unlock('early-adopter', { silent: true, userId: activeUid });
      evaluateCatalogAchievements(null, activeUid);
    }

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

    // 11. Language switched observer (strictly user-isolated)
    document.addEventListener('atm:lang-changed', function (e) {
      try {
        var userKey = 'atm_used_langs_' + (getCurrentUserId() || 'guest');
        var usedLangs = JSON.parse(localStorage.getItem(userKey) || '[]');
        var l = (e.detail && e.detail.lang) || 'es';
        if (usedLangs.indexOf(l) === -1) {
          usedLangs.push(l);
          localStorage.setItem(userKey, JSON.stringify(usedLangs));
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

    // 13. Auth status change listener: evaluate on login
    document.addEventListener('atm:auth-changed', function (e) {
      var user = e.detail && e.detail.user;
      if (user) {
        var uid = (user.handle || user.username || user.id || '').replace(/^@+/, '');
        unlock('early-adopter', { silent: true, userId: uid });
        evaluateCatalogAchievements(null, uid);
      }
    });

    // 14. Guide published listener: evaluate on publication
    document.addEventListener('atm:guide-published', function (e) {
      var author = (e.detail && (e.detail.author || e.detail.authorHandle)) || getCurrentUserId();
      if (author) {
        evaluateCatalogAchievements(null, String(author).replace(/^@+/, ''));
      }
    });

    // 15. Logout listener: clean in-memory state and event dispatch
    document.addEventListener('atm:logout', function () {
      clearUserAchievements();
    });
  }

  // --- CATALOG & REQUIREMENT EVALUATION (STRICT ZERO-FALLBACK) ---
  function evaluateCatalogAchievements(userGuides, userId) {
    try {
      var targetId = (userId || getCurrentUserId() || '').toLowerCase().replace(/^@+/, '').trim();
      // If no target user can be resolved, DO NOT unlock author creation achievements
      if (!targetId || targetId === ':splat' || targetId === 'undefined') {
        return { count: 0, categoriesCount: 0, unlocked: [] };
      }

      var guides = [];
      if (Array.isArray(userGuides)) {
        guides = userGuides;
      } else {
        var raw = localStorage.getItem('atm_guides_data') || localStorage.getItem('atm_custom_guides');
        var all = raw ? JSON.parse(raw) : [];
        if (Array.isArray(all) && all.length > 0) {
          // STRICT FILTER by current author only
          guides = all.filter(function (g) {
            var gh = String(g.handle || g.authorHandle || '').toLowerCase().replace(/^@+/, '');
            var uid = String(g.authorId || g.userId || '').toLowerCase();
            return (targetId && gh === targetId) || (uid && uid === targetId);
          });
        }
      }

      // If user is platform architect (@atrumin16), include his canonical authored guides
      var isPlatformAuthor = (targetId === 'atrumin16' || targetId === 'alberto');
      if (isPlatformAuthor && (!guides || guides.length === 0)) {
        guides = [
          { slug: 'correo-corporativo-startups', kind: 'guide', readTime: '18 min', wordCount: 2400, pinned: true },
          { slug: 'informe-msft', kind: 'analysis', readTime: '22 min', wordCount: 3200 },
          { slug: 'desglose-cartera-berkshire-brk', kind: 'interactive', readTime: '15 min', wordCount: 2100 },
          { slug: 'it-glossary', kind: 'reference', readTime: '25 min', wordCount: 4500 }
        ];
      }

      // ZERO-FALLBACK: If the user has 0 guides, return 0 progress and empty array
      if (!guides || !guides.length) {
        return { count: 0, categoriesCount: 0, unlocked: [] };
      }

      var count = guides.length;
      var newlyUnlocked = [];

      // 1. Genesis: at least 1 guide
      if (count >= 1) {
        if (unlock('genesis', { silent: true, userId: targetId })) newlyUnlocked.push('genesis');
      }

      // 2. Builder: at least 3 guides
      if (count >= 3) {
        if (unlock('builder', { silent: true, userId: targetId })) newlyUnlocked.push('builder');
      }

      // 3. Polymath: at least 3 distinct categories (guide, analysis, reference)
      var categories = {};
      guides.forEach(function (g) {
        var k = String(g.kind || g.category || g.type || '').toLowerCase();
        if (k.indexOf('guide') !== -1 || k.indexOf('guía') !== -1 || k.indexOf('runbook') !== -1) categories['guide'] = true;
        if (k.indexOf('analysis') !== -1 || k.indexOf('análisis') !== -1) categories['analysis'] = true;
        if (k.indexOf('reference') !== -1 || k.indexOf('referencia') !== -1 || k.indexOf('glossary') !== -1) categories['reference'] = true;
        if (k.indexOf('interactive') !== -1 || k.indexOf('simulador') !== -1) categories['interactive'] = true;
      });
      var catCount = Object.keys(categories).length;
      if (catCount >= 3) {
        if (unlock('polymath', { silent: true, userId: targetId })) newlyUnlocked.push('polymath');
      }

      // 4. Deep-dive: guide with > 2000 words or 15+ min readTime
      var hasDeepDive = guides.some(function (g) {
        var readMins = parseInt(g.readTime || g.readingTime || '0', 10) || 0;
        var words = g.wordCount || ((g.content || '').split(/\s+/).filter(Boolean).length) || 0;
        return readMins >= 15 || words >= 2000;
      });
      if (hasDeepDive) {
        if (unlock('deep-dive', { silent: true, userId: targetId })) newlyUnlocked.push('deep-dive');
      }

      // 5. Interactive: guide with simulator / calculator
      var hasInteractive = guides.some(function (g) {
        var k = String(g.kind || g.category || g.type || '').toLowerCase();
        var s = String(g.slug || '').toLowerCase();
        return k === 'interactive' || k === 'simulador' || s.indexOf('berkshire') !== -1 || s.indexOf('simulador') !== -1;
      });
      if (hasInteractive) {
        if (unlock('interactive', { silent: true, userId: targetId })) newlyUnlocked.push('interactive');
      }

      // 6. Curator: pinned runbook in catalog
      var hasPinned = guides.some(function (g) {
        return !!(g.pinned || g.fixada);
      });
      if (hasPinned) {
        if (unlock('curator', { silent: true, userId: targetId })) newlyUnlocked.push('curator');
      }

      return {
        count: count,
        categoriesCount: catCount,
        unlocked: newlyUnlocked
      };
    } catch (e) {
      return { count: 0, categoriesCount: 0, unlocked: [] };
    }
  }

  // --- AUTHOR PUBLIC PROFILE ACHIEVEMENTS RESOLVER ---
  function getAuthorAchievements(authorHandle, authorGuides) {
    var cleanH = String(authorHandle || '').toLowerCase().replace(/^@+/, '').trim();
    if (!cleanH || cleanH === ':splat' || cleanH === 'undefined') {
      return [];
    }

    var isPlatformAuthor = (cleanH === 'atrumin16' || cleanH === 'alberto');

    // 1. If author has published guides, evaluate their publication-based badges
    if (Array.isArray(authorGuides) && authorGuides.length > 0) {
      evaluateCatalogAchievements(authorGuides, cleanH);
    } else if (isPlatformAuthor) {
      evaluateCatalogAchievements(null, 'atrumin16');
    }

    // 2. Fetch all unlocked badges in author's isolated storage
    var userMap = getUnlockedMap(cleanH);
    var unlockedIds = Object.keys(userMap);

    // 3. For platform author (@atrumin16), include canonical baseline if verified
    if (isPlatformAuthor) {
      var platformBaseline = ['genesis', 'builder', 'polymath', 'deep-dive', 'interactive', 'curator', 'runtime', 'zero-cost', 'early-adopter', 'speed-of-light'];
      platformBaseline.forEach(function (id) {
        if (unlockedIds.indexOf(id) === -1) unlockedIds.push(id);
      });
    }

    // Return the achievement objects matching unlockedIds
    return ACHIEVEMENTS.filter(function (a) {
      return unlockedIds.indexOf(a.id) !== -1;
    });
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
    getCurrentUserId: getCurrentUserId,
    getStorageKey: getStorageKey,
    getUnlockedMap: getUnlockedMap,
    unlock: unlock,
    showModal: showModal,
    showToast: showToast,
    renderBadgeGrid: renderBadgeGrid,
    renderAchievementsGuide: renderAchievementsGuide,
    renderProgressWidget: renderProgressWidget,
    evaluateCatalogAchievements: evaluateCatalogAchievements,
    getAuthorAchievements: getAuthorAchievements,
    clearUserAchievements: clearUserAchievements
  };
})();
