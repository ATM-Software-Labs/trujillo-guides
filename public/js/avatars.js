(function () {
  'use strict';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getInitials(name, handle) {
    var src = (name || handle || 'AT').trim();
    if (src.charAt(0) === '@') src = src.slice(1);
    var parts = src.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return src.slice(0, 2).toUpperCase();
  }

  function hashInt(str) {
    var hash = 0;
    var s = String(str || 'atm');
    for (var i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  var PRESETS = [
    {
      id: 'cyber-core',
      name: 'Cyber Core',
      desc: 'Núcleo hexagonal de computación distribuida en azul eléctrico y cian.',
      render: function (size, name, handle) {
        var s = size || 88;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <radialGradient id="cc-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/><stop offset="100%" stop-color="#0284c7" stop-opacity="0"/></radialGradient>' +
          '  <linearGradient id="cc-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>' +
          '  <linearGradient id="cc-ring" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#475569"/></linearGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#090d16"/>' +
          '<circle cx="50" cy="50" r="44" fill="url(#cc-glow)"/>' +
          '<polygon points="50,14 82,32 82,68 50,86 18,68 18,32" stroke="url(#cc-ring)" stroke-width="2" fill="none"/>' +
          '<polygon points="50,22 75,37 75,63 50,78 25,63 25,37" stroke="url(#cc-grad)" stroke-width="3.5" fill="#0f172a" fill-opacity="0.8"/>' +
          '<circle cx="50" cy="50" r="12" fill="url(#cc-grad)"/>' +
          '<circle cx="50" cy="50" r="6" fill="#f8fafc"/>' +
          '<line x1="50" y1="22" x2="50" y2="38" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="50" y1="62" x2="50" y2="78" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="25" y1="50" x2="38" y2="50" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>' +
          '<line x1="62" y1="50" x2="75" y2="50" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>' +
          '</svg>';
      }
    },
    {
      id: 'sentinel',
      name: 'Sentinel Shield',
      desc: 'Escudo geométrico defensivo con malla criptográfica y nodo central.',
      render: function (size, name, handle) {
        var s = size || 88;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <radialGradient id="st-glow" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/><stop offset="100%" stop-color="#083344" stop-opacity="0"/></radialGradient>' +
          '  <linearGradient id="st-shield" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="50%" stop-color="#0891b2"/><stop offset="100%" stop-color="#0e7490"/></linearGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#060b13"/>' +
          '<circle cx="50" cy="50" r="44" fill="url(#st-glow)"/>' +
          '<path d="M50 15 L80 26 C80 56 65 74 50 85 C35 74 20 56 20 26 Z" stroke="#334155" stroke-width="2" fill="#0f172a"/>' +
          '<path d="M50 22 L74 31 C74 54 62 68 50 78 C38 68 26 54 26 31 Z" stroke="url(#st-shield)" stroke-width="3" fill="none"/>' +
          '<path d="M50 32 L66 38 C66 52 57 62 50 69 C43 62 34 52 34 38 Z" fill="url(#st-shield)" fill-opacity="0.18"/>' +
          '<circle cx="50" cy="48" r="7" fill="url(#st-shield)"/>' +
          '<circle cx="50" cy="48" r="3" fill="#ecfeff"/>' +
          '</svg>';
      }
    },
    {
      id: 'quantum',
      name: 'Quantum Node',
      desc: 'Órbitas cuánticas entrelazadas en esmeralda, aguamarina y cian.',
      render: function (size, name, handle) {
        var s = size || 88;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="qt-g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>' +
          '  <linearGradient id="qt-g2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0d9488"/></linearGradient>' +
          '  <radialGradient id="qt-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/><stop offset="100%" stop-color="#064e3b" stop-opacity="0"/></radialGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#06110f"/>' +
          '<circle cx="50" cy="50" r="42" fill="url(#qt-bg)"/>' +
          '<ellipse cx="50" cy="50" rx="34" ry="14" stroke="url(#qt-g1)" stroke-width="2.5" fill="none" transform="rotate(-30 50 50)"/>' +
          '<ellipse cx="50" cy="50" rx="34" ry="14" stroke="url(#qt-g2)" stroke-width="2.5" fill="none" transform="rotate(30 50 50)"/>' +
          '<ellipse cx="50" cy="50" rx="34" ry="14" stroke="#6ee7b7" stroke-width="1.8" stroke-dasharray="3 3" fill="none" transform="rotate(90 50 50)"/>' +
          '<circle cx="50" cy="50" r="9" fill="url(#qt-g1)"/>' +
          '<circle cx="50" cy="50" r="4" fill="#f0fdf4"/>' +
          '<circle cx="68" cy="39" r="3.5" fill="#38bdf8"/>' +
          '<circle cx="32" cy="61" r="3" fill="#34d399"/>' +
          '</svg>';
      }
    },
    {
      id: 'terminal',
      name: 'Terminal Root',
      desc: 'Prompt de consola UNIX / Linux Kernel con prompt interactivo y matriz.',
      render: function (size, name, handle) {
        var s = size || 88;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="tr-b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#090d0b"/>' +
          '<rect x="12" y="14" width="76" height="72" rx="10" fill="#0f1914" stroke="#1f2d24" stroke-width="1.8"/>' +
          '<circle cx="22" cy="24" r="2.5" fill="#ef4444"/>' +
          '<circle cx="30" cy="24" r="2.5" fill="#f59e0b"/>' +
          '<circle cx="38" cy="24" r="2.5" fill="#10b981"/>' +
          '<line x1="12" y1="32" x2="88" y2="32" stroke="#1f2d24" stroke-width="1"/>' +
          '<path d="M24 46 L34 54 L24 62" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<line x1="39" y1="62" x2="52" y2="62" stroke="#34d399" stroke-width="3.5" stroke-linecap="round"/>' +
          '<text x="24" y="77" fill="#6ee7b7" font-size="9" font-family="monospace" opacity="0.65">root@atm:~#</text>' +
          '</svg>';
      }
    },
    {
      id: 'aurora',
      name: 'Aurora Flux',
      desc: 'Malla degradada bio-lumínica en violeta cósmico y cyan ultra brillante.',
      render: function (size, name, handle) {
        var s = size || 88;
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="af-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="50%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>' +
          '  <radialGradient id="af-r1" cx="30%" cy="30%" r="60%"><stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/><stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>' +
          '  <radialGradient id="af-r2" cx="70%" cy="70%" r="60%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/><stop offset="100%" stop-color="#0284c7" stop-opacity="0"/></radialGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#0c0a17"/>' +
          '<rect x="4" y="4" width="92" height="92" rx="18" fill="url(#af-g)" fill-opacity="0.2"/>' +
          '<circle cx="35" cy="35" r="32" fill="url(#af-r1)"/>' +
          '<circle cx="65" cy="65" r="32" fill="url(#af-r2)"/>' +
          '<path d="M22 68 C35 48 65 52 78 32" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>' +
          '<circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="2" stroke-opacity="0.4" fill="none"/>' +
          '<circle cx="50" cy="50" r="6" fill="#ffffff"/>' +
          '</svg>';
      }
    },
    {
      id: 'initials',
      name: 'Monogram High-Contrast',
      desc: 'Monograma geométrico ultra nítido con tipografía técnica y contraste Obsidian.',
      render: function (size, name, handle) {
        var s = size || 88;
        var inits = getInitials(name, handle);
        return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<defs>' +
          '  <linearGradient id="in-border" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>' +
          '  <radialGradient id="in-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/><stop offset="100%" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
          '</defs>' +
          '<rect width="100" height="100" rx="22" fill="#0b0f17"/>' +
          '<rect x="2" y="2" width="96" height="96" rx="20" stroke="url(#in-border)" stroke-width="2" fill="none"/>' +
          '<circle cx="50" cy="50" r="38" fill="url(#in-glow)"/>' +
          '<text x="50" y="62" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" fill="#f8fafc" text-anchor="middle" letter-spacing="0.05em">' + esc(inits) + '</text>' +
          '</svg>';
      }
    }
  ];

  function getPreset(id) {
    if (!id) return PRESETS[0];
    for (var i = 0; i < PRESETS.length; i++) {
      if (PRESETS[i].id === id) return PRESETS[i];
    }
    return PRESETS[0];
  }

  function generateSvg(presetId, name, handle, size) {
    var p = getPreset(presetId);
    return p.render(size || 88, name, handle);
  }

  function getSvgDataUri(presetId, name, handle, size) {
    var rawSvg = generateSvg(presetId, name, handle, size);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(rawSvg);
  }

  function renderAvatar(containerEl, options) {
    if (!containerEl) return;
    options = options || {};
    var preset = options.preset || 'cyber-core';
    var name = options.name || 'Alberto Trujillo Mingorance';
    var handle = options.handle || 'atrumin16';
    var size = options.size || 88;
    var customUrl = options.customUrl || '';

    if (customUrl && /^https?:\/\//i.test(customUrl)) {
      containerEl.innerHTML = '<img class="profile-large-avatar" src="' + esc(customUrl) + '" alt="' + esc(name) + '" width="' + size + '" height="' + size + '">';
      var img = containerEl.querySelector('img');
      if (img) {
        img.onerror = function () {
          containerEl.innerHTML = generateSvg(preset, name, handle, size);
        };
      }
    } else {
      containerEl.innerHTML = generateSvg(preset, name, handle, size);
    }
  }

  window.ATM_AVATARS = {
    presets: PRESETS,
    getPreset: getPreset,
    generateSvg: generateSvg,
    getSvgDataUri: getSvgDataUri,
    renderAvatar: renderAvatar,
    getInitials: getInitials
  };
})();
