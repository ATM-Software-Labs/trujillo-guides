(function () {
  'use strict';

  var DEFAULT_PROMPT = 'Eres un Senior Principal Systems Architect y Quantitative Financial Analyst en ATM Software Labs.\n' +
    'Proporciona análisis con rigor técnico de nivel producción, especificaciones RFC completas, arquitecturas de latencia ultrabaja en Edge, diagramas Mermaid y balances financieros cuantitativos.\n' +
    'Evita introducciones superficiales, disclaimers obvios y lenguaje corporativo genérico. Prioriza código limpio, comandos shell reproducibles y razonamiento estructurado.';

  var currentAvatarType = 'vector';
  var currentAvatarPreset = 'cyber-core';

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateAvatarPreview() {
    var box = document.getElementById('avatar-preview-box');
    if (!box) return;

    var name = (document.getElementById('setting-name') && document.getElementById('setting-name').value) || 'Alberto Trujillo Mingorance';
    var handle = (document.getElementById('setting-handle') && document.getElementById('setting-handle').value) || 'atrumin16';
    var customUrl = (document.getElementById('setting-avatar') && document.getElementById('setting-avatar').value) || '';

    if (window.ATM_AVATARS) {
      if (currentAvatarType === 'vector') {
        window.ATM_AVATARS.renderAvatar(box, {
          preset: currentAvatarPreset,
          name: name,
          handle: handle,
          size: 76
        });
      } else {
        window.ATM_AVATARS.renderAvatar(box, {
          customUrl: customUrl,
          name: name,
          handle: handle,
          preset: currentAvatarPreset,
          size: 76
        });
      }
    }
  }

  function renderPreviousAliases(aliases) {
    var box = document.getElementById('previous-aliases-box');
    var list = document.getElementById('previous-aliases-list');
    if (!box || !list) return;

    if (!aliases || !aliases.length) {
      box.style.display = 'none';
      list.innerHTML = '';
      return;
    }

    box.style.display = 'block';
    list.innerHTML = aliases.map(function (al) {
      return '<span class="alias-tag">@' + esc(al.replace(/^@+/, '')) + '</span>';
    }).join('');
  }

  function loadSettings() {
    var raw = localStorage.getItem('atm_settings');
    var data = {};
    try {
      if (raw) data = JSON.parse(raw);
    } catch (e) {}

    // Pull author defaults from existing studio session or platform defaults
    var session = {};
    try {
      var rawSession = localStorage.getItem('atm_studio_session') || localStorage.getItem('atm_user');
      if (rawSession) session = JSON.parse(rawSession);
    } catch (e) {}

    var author = data.author || {};
    var nameInput = document.getElementById('setting-name');
    var handleInput = document.getElementById('setting-handle');
    var previewSlug = document.getElementById('preview-handle-slug');
    var roleInput = document.getElementById('setting-role');
    var avatarInput = document.getElementById('setting-avatar');
    var bioInput = document.getElementById('setting-bio');
    var langSelect = document.getElementById('setting-lang');
    var themeSelect = document.getElementById('setting-theme');

    var cleanH = (author.handle || session.handle || 'atrumin16').replace(/^@+/, '');
    if (nameInput) nameInput.value = author.name || session.name || 'Alberto Trujillo Mingorance';
    if (handleInput) handleInput.value = cleanH;
    if (previewSlug) previewSlug.textContent = cleanH;
    if (roleInput) roleInput.value = author.role || (session.role === 'admin' ? 'Lead Systems Architect' : 'Senior Infrastructure Engineer') || 'Lead Systems Architect';
    if (avatarInput) avatarInput.value = author.avatar || session.picture || 'https://lh3.googleusercontent.com/a/ACg8ocLdgZZbUW1KzSg11REPuHungATAR_SeG52Na5yDYfOOXhpkXzs=s96-c';
    if (bioInput) bioInput.value = author.bio || 'Arquitectura de sistemas distribuidos, infraestructura de correo corporativo a coste cero, análisis cuantitativo y optimización en Cloudflare Edge & Linux Kernel.';

    // Historical aliases
    var prevHandles = author.previous_handles || [];
    renderPreviousAliases(prevHandles);

    // Avatar configuration
    currentAvatarPreset = author.avatarPreset || 'cyber-core';
    currentAvatarType = author.avatarType || (author.avatar && /^https?:\/\//i.test(author.avatar) ? 'custom' : 'vector');

    var presetIn = document.getElementById('setting-avatar-preset');
    if (presetIn) presetIn.value = currentAvatarPreset;

    // Set active preset button
    document.querySelectorAll('.preset-choice-btn').forEach(function (btn) {
      if (btn.getAttribute('data-preset') === currentAvatarPreset) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Set active avatar tab
    document.querySelectorAll('.avatar-type-btn').forEach(function (btn) {
      if (btn.getAttribute('data-av-type') === currentAvatarType) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    var presetsGrid = document.getElementById('avatar-presets-grid');
    var customBox = document.getElementById('avatar-custom-url-box');
    if (presetsGrid && customBox) {
      if (currentAvatarType === 'vector') {
        presetsGrid.style.display = 'grid';
        customBox.style.display = 'none';
      } else {
        presetsGrid.style.display = 'none';
        customBox.style.display = 'block';
      }
    }

    updateAvatarPreview();

    // Experience Mode
    var expMode = data.experienceMode || localStorage.getItem('atm_experience_mode') || 'simple';
    var radio = document.querySelector('input[name="experience-mode"][value="' + expMode + '"]');
    if (radio) radio.checked = true;

    var currentLang = (typeof window.atmLang === 'function' && window.atmLang()) || localStorage.getItem('atm_lang') || 'es';
    if (langSelect) langSelect.value = data.lang || currentLang;

    var currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('atm_theme') || 'dark';
    if (themeSelect) themeSelect.value = data.theme || currentTheme;

    // Inference & Models
    var models = data.models || {};
    var provSelect = document.getElementById('setting-provider');
    var modelIn = document.getElementById('setting-model-name');
    var endpIn = document.getElementById('setting-endpoint');
    var tempIn = document.getElementById('setting-temp');
    var toppIn = document.getElementById('setting-topp');
    var promptIn = document.getElementById('setting-system-prompt');
    var valTemp = document.getElementById('val-temp');
    var valTopp = document.getElementById('val-topp');

    if (provSelect) provSelect.value = models.provider || 'cloudflare';
    if (modelIn) modelIn.value = models.model || '@cf/meta/llama-3.3-70b-instruct';
    if (endpIn) endpIn.value = models.endpoint || '';
    if (tempIn) {
      tempIn.value = models.temp !== undefined ? models.temp : 0.2;
      if (valTemp) valTemp.textContent = tempIn.value;
    }
    if (toppIn) {
      toppIn.value = models.topp !== undefined ? models.topp : 0.9;
      if (valTopp) valTopp.textContent = toppIn.value;
    }
    if (promptIn) promptIn.value = models.systemPrompt || DEFAULT_PROMPT;

    // API Keys
    var keys = data.keys || {};
    var keyCf = document.getElementById('key-cf');
    var keyOai = document.getElementById('key-openai');
    var keyAnt = document.getElementById('key-anthropic');
    var keyGem = document.getElementById('key-gemini');
    var keyDeep = document.getElementById('key-deepseek');

    if (keyCf && keys.cloudflare) keyCf.value = keys.cloudflare;
    if (keyOai && keys.openai) keyOai.value = keys.openai;
    if (keyAnt && keys.anthropic) keyAnt.value = keys.anthropic;
    if (keyGem && keys.gemini) keyGem.value = keys.gemini;
    if (keyDeep && keys.deepseek) keyDeep.value = keys.deepseek;

    // Security & Privacy Toggles
    var sec = data.security || {};
    var togTelem = document.getElementById('toggle-telemetry');
    var togHist = document.getElementById('toggle-history');
    var togSync = document.getElementById('toggle-sync');
    var togCsp = document.getElementById('toggle-csp');
    var togOff = document.getElementById('toggle-offline');

    if (togTelem) togTelem.checked = sec.telemetry !== undefined ? sec.telemetry : false;
    if (togHist) togHist.checked = sec.history !== undefined ? sec.history : true;
    if (togSync) togSync.checked = sec.sync !== undefined ? sec.sync : true;
    if (togCsp) togCsp.checked = sec.csp !== undefined ? sec.csp : true;
    if (togOff) togOff.checked = sec.offline !== undefined ? sec.offline : true;
  }

  function saveSettings(e) {
    if (e) e.preventDefault();

    // Load existing settings to compare old handle
    var existingSettings = {};
    try {
      var raw = localStorage.getItem('atm_settings');
      if (raw) existingSettings = JSON.parse(raw);
    } catch (err) {}

    var existingAuthor = existingSettings.author || {};
    var oldHandle = (existingAuthor.handle || 'atrumin16').trim().replace(/^@+/, '').toLowerCase();

    var nameInput = document.getElementById('setting-name');
    var handleInput = document.getElementById('setting-handle');
    var roleInput = document.getElementById('setting-role');
    var avatarInput = document.getElementById('setting-avatar');
    var bioInput = document.getElementById('setting-bio');
    var langSelect = document.getElementById('setting-lang');
    var themeSelect = document.getElementById('setting-theme');

    var provSelect = document.getElementById('setting-provider');
    var modelIn = document.getElementById('setting-model-name');
    var endpIn = document.getElementById('setting-endpoint');
    var tempIn = document.getElementById('setting-temp');
    var toppIn = document.getElementById('setting-topp');
    var promptIn = document.getElementById('setting-system-prompt');

    var keyCf = document.getElementById('key-cf');
    var keyOai = document.getElementById('key-openai');
    var keyAnt = document.getElementById('key-anthropic');
    var keyGem = document.getElementById('key-gemini');
    var keyDeep = document.getElementById('key-deepseek');

    var togTelem = document.getElementById('toggle-telemetry');
    var togHist = document.getElementById('toggle-history');
    var togSync = document.getElementById('toggle-sync');
    var togCsp = document.getElementById('toggle-csp');
    var togOff = document.getElementById('toggle-offline');

    var cleanHandle = (handleInput && handleInput.value ? handleInput.value : 'atrumin16').trim().replace(/^@+/, '').toLowerCase();
    var authorName = (nameInput && nameInput.value) || 'Alberto Trujillo Mingorance';

    // Handle previous handles traceability
    var prevHandles = Array.isArray(existingAuthor.previous_handles) ? existingAuthor.previous_handles.slice() : [];
    if (oldHandle && oldHandle !== cleanHandle) {
      if (prevHandles.indexOf(oldHandle) === -1) {
        prevHandles.push(oldHandle);
      }
      // Update global aliases map for 301 redirection
      try {
        var aliases = JSON.parse(localStorage.getItem('atm_handle_aliases') || '{}');
        aliases[oldHandle] = cleanHandle;
        Object.keys(aliases).forEach(function (k) {
          if (aliases[k] === oldHandle) {
            aliases[k] = cleanHandle;
          }
        });
        localStorage.setItem('atm_handle_aliases', JSON.stringify(aliases));
      } catch (err) {}
    }

    // Determine avatar image/vector URL
    var activeAvatarUrl = '';
    if (currentAvatarType === 'vector') {
      if (window.ATM_AVATARS) {
        activeAvatarUrl = window.ATM_AVATARS.getSvgDataUri(currentAvatarPreset, authorName, cleanHandle, 88);
      } else {
        activeAvatarUrl = '/avatar.png';
      }
    } else {
      activeAvatarUrl = (avatarInput && avatarInput.value) || '/avatar.png';
    }

    // Experience mode
    var expRadio = document.querySelector('input[name="experience-mode"]:checked');
    var expMode = (expRadio && expRadio.value) || 'simple';
    try {
      localStorage.setItem('atm_experience_mode', expMode);
    } catch (err) {}

    var settings = {
      author: {
        name: authorName,
        handle: cleanHandle,
        role: (roleInput && roleInput.value) || 'Lead Systems Architect',
        avatar: activeAvatarUrl,
        avatarType: currentAvatarType,
        avatarPreset: currentAvatarPreset,
        previous_handles: prevHandles,
        bio: (bioInput && bioInput.value) || ''
      },
      experienceMode: expMode,
      lang: (langSelect && langSelect.value) || 'es',
      theme: (themeSelect && themeSelect.value) || 'dark',
      models: {
        provider: (provSelect && provSelect.value) || 'cloudflare',
        model: (modelIn && modelIn.value) || '@cf/meta/llama-3.3-70b-instruct',
        endpoint: (endpIn && endpIn.value) || '',
        temp: tempIn ? parseFloat(tempIn.value) : 0.2,
        topp: toppIn ? parseFloat(toppIn.value) : 0.9,
        systemPrompt: (promptIn && promptIn.value) || DEFAULT_PROMPT
      },
      keys: {
        cloudflare: (keyCf && keyCf.value) || '',
        openai: (keyOai && keyOai.value) || '',
        anthropic: (keyAnt && keyAnt.value) || '',
        gemini: (keyGem && keyGem.value) || '',
        deepseek: (keyDeep && keyDeep.value) || ''
      },
      security: {
        telemetry: togTelem ? togTelem.checked : false,
        history: togHist ? togHist.checked : true,
        sync: togSync ? togSync.checked : true,
        csp: togCsp ? togCsp.checked : true,
        offline: togOff ? togOff.checked : true
      },
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem('atm_settings', JSON.stringify(settings));

      // Synchronize with platform session so navbar chip updates immediately
      var session = {
        username: cleanHandle,
        handle: '@' + cleanHandle,
        name: settings.author.name,
        role: 'admin',
        isStudio: true,
        loggedIn: true,
        picture: activeAvatarUrl,
        bio: settings.author.bio
      };
      localStorage.setItem('atm_studio_session', JSON.stringify(session));
      localStorage.setItem('atm_user', JSON.stringify(session));
      localStorage.setItem('atm_guest_name', session.name);
      window.__taMe = session;

      // Apply theme changes live
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
        localStorage.setItem('atm_theme', settings.theme);
        localStorage.setItem('trujillo_theme', settings.theme);
      }

      // Apply language changes live if available
      if (settings.lang && typeof window.atmSetLang === 'function') {
        window.atmSetLang(settings.lang);
      }
    } catch (e) {}

    // Update historical aliases display in settings live
    renderPreviousAliases(prevHandles);

    // Show visual confirmation status
    var statusEl = document.getElementById('save-status-msg');
    if (statusEl) {
      statusEl.style.display = 'inline-block';
      setTimeout(function () {
        statusEl.style.display = 'none';
      }, 2600);
    }

    document.dispatchEvent(new CustomEvent('atm:settings-saved', { detail: settings }));
  }

  function bindAvatarControls() {
    var typeBtns = document.querySelectorAll('.avatar-type-btn');
    var presetsGrid = document.getElementById('avatar-presets-grid');
    var customBox = document.getElementById('avatar-custom-url-box');
    var presetBtns = document.querySelectorAll('.preset-choice-btn');
    var avatarUrlInput = document.getElementById('setting-avatar');
    var nameInput = document.getElementById('setting-name');
    var handleInput = document.getElementById('setting-handle');
    var previewSlug = document.getElementById('preview-handle-slug');

    typeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        typeBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentAvatarType = btn.getAttribute('data-av-type') || 'vector';

        if (presetsGrid && customBox) {
          if (currentAvatarType === 'vector') {
            presetsGrid.style.display = 'grid';
            customBox.style.display = 'none';
          } else {
            presetsGrid.style.display = 'none';
            customBox.style.display = 'block';
          }
        }
        updateAvatarPreview();
      });
    });

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        presetBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        currentAvatarPreset = btn.getAttribute('data-preset') || 'cyber-core';

        var presetIn = document.getElementById('setting-avatar-preset');
        if (presetIn) presetIn.value = currentAvatarPreset;

        updateAvatarPreview();
      });
    });

    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('input', updateAvatarPreview);
    }
    if (nameInput) {
      nameInput.addEventListener('input', updateAvatarPreview);
    }
    if (handleInput) {
      handleInput.addEventListener('input', function () {
        var val = handleInput.value.trim().replace(/^@+/, '');
        if (previewSlug) previewSlug.textContent = val || 'usuario';
        updateAvatarPreview();
      });
    }

    // Experience mode selection
    document.querySelectorAll('input[name="experience-mode"]').forEach(function (r) {
      r.addEventListener('change', function () {
        try {
          localStorage.setItem('atm_experience_mode', r.value);
        } catch (e) {}
      });
    });
  }

  function bindTabs() {
    var tabs = document.querySelectorAll('.settings-nav-btn');
    var sections = document.querySelectorAll('.settings-panel-section');

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-tab');
        tabs.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        sections.forEach(function (sec) {
          if (sec.id === 'sec-' + tabId) {
            sec.classList.add('is-active');
          } else {
            sec.classList.remove('is-active');
          }
        });
      });
    });
  }

  function bindSliders() {
    var tempIn = document.getElementById('setting-temp');
    var toppIn = document.getElementById('setting-topp');
    var valTemp = document.getElementById('val-temp');
    var valTopp = document.getElementById('val-topp');

    if (tempIn && valTemp) {
      tempIn.addEventListener('input', function () {
        valTemp.textContent = tempIn.value;
      });
    }
    if (toppIn && valTopp) {
      toppIn.addEventListener('input', function () {
        valTopp.textContent = toppIn.value;
      });
    }
  }

  function bindPasswordToggles() {
    var eyes = document.querySelectorAll('.btn-toggle-eye');
    eyes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var input = document.getElementById(targetId);
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        } else {
          input.type = 'password';
          btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        }
      });
    });
  }

  function bindResetPrompt() {
    var btn = document.getElementById('btn-reset-prompt');
    var promptIn = document.getElementById('setting-system-prompt');
    if (btn && promptIn) {
      btn.addEventListener('click', function () {
        promptIn.value = DEFAULT_PROMPT;
      });
    }
  }

  function bindDangerZone() {
    var btnDrafts = document.getElementById('btn-clear-drafts');
    var btnReset = document.getElementById('btn-reset-all');
    var btnLogout = document.getElementById('btn-logout-all');

    if (btnDrafts) {
      btnDrafts.addEventListener('click', function () {
        if (confirm('¿Eliminar todos los borradores locales guardados del editor?')) {
          try {
            localStorage.removeItem('atm_write_draft');
          } catch (e) {}
          alert('Borradores eliminados correctamente.');
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('¿Restablecer toda la configuración a los valores de fábrica? Se perderán las claves y personalizaciones locales.')) {
          try {
            localStorage.removeItem('atm_settings');
            localStorage.removeItem('atm_experience_mode');
          } catch (e) {}
          loadSettings();
          alert('Configuración restablecida.');
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        if (confirm('¿Cerrar todas las sesiones activas en este navegador?')) {
          try {
            localStorage.removeItem('trujillo_ai_token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('atm_studio_session');
            localStorage.removeItem('atm_user');
            localStorage.removeItem('atm_guest_name');
            localStorage.removeItem('trujillo_ai_user');
            localStorage.removeItem('auth_user');
          } catch (e) {}
          location.href = '/';
        }
      });
    }
  }

  function initSettings() {
    loadSettings();
    bindAvatarControls();
    bindTabs();
    bindSliders();
    bindPasswordToggles();
    bindResetPrompt();
    bindDangerZone();

    var form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', saveSettings);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
  } else {
    initSettings();
  }
})();
