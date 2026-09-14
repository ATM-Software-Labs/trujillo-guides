(function () {
  'use strict';
  var pathEl = document.getElementById('nf-path');
  var p = window.location.pathname || '/';
  if (pathEl) pathEl.textContent = p;

  var decodedPath = p;
  try { decodedPath = decodeURIComponent(p); } catch (e) {}

  // SPA router recovery for dynamic routes
  // 1. /u/@username or /u/:username
  var userMatch = decodedPath.match(/^\/u\/(?:@)?([a-z0-9_.-]+)/i);
  if (userMatch && userMatch[1]) {
    try { sessionStorage.setItem('atm_resolved_404', '1'); } catch (e) {}
    var rawHandle = userMatch[1].replace(/^@+/, '');
    window.location.replace('/u?u=' + encodeURIComponent(rawHandle) + (window.location.hash || ''));
    return;
  }
  if (decodedPath === '/u' || decodedPath === '/u/') {
    try { sessionStorage.setItem('atm_resolved_404', '1'); } catch (e) {}
    window.location.replace('/u' + (window.location.hash || ''));
    return;
  }

  // 2. /settings
  if (/^\/settings(?:\/|$)/i.test(decodedPath)) {
    try { sessionStorage.setItem('atm_resolved_404', '1'); } catch (e) {}
    window.location.replace('/settings' + (window.location.search || '') + (window.location.hash || ''));
    return;
  }

  // 3. /g/:slug or /guides/:slug
  var guideMatch = decodedPath.match(/^\/(?:g|guides)\/([a-z0-9_-]+)/i);
  if (guideMatch && guideMatch[1]) {
    try { sessionStorage.setItem('atm_resolved_404', '1'); } catch (e) {}
    window.location.replace('/g?id=' + encodeURIComponent(guideMatch[1]) + (window.location.hash || ''));
    return;
  }
})();
