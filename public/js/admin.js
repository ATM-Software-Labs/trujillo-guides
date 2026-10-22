// Panel interno de ATM Software Labs. La interfaz es solo presentación:
// cada dato y cada cambio pasa por /api/admin/*, que comprueba la sesión interna en servidor.
(function () {
  'use strict';
  var L = {
    es: { kicker: 'ATM SOFTWARE LABS · INTERNO', title: 'Panel interno', gateTitle: 'Acceso restringido', gateText: 'Este panel es solo para cuentas de ATM Software Labs. Entra con tu cuenta de Microsoft del trabajo.', gateBtn: 'Continuar con Microsoft', unavailable: 'El acceso con Microsoft todavía no está activado.',
      tabStats: 'Resumen', tabUsers: 'Usuarios', tabContent: 'Contenido', tabAch: 'Logros', tabLinks: 'Enlaces',
      who: 'Sesión interna: {n}', roleAdmin: 'Administrador', roleInternal: 'Interno (solo lectura)',
      sProfiles: 'Perfiles públicos', sEmail: 'Cuentas con correo', sInternal: 'Cuentas internas', sGuides: 'Publicaciones', sPinned: 'Fijadas', sHidden: 'Ocultas', sProviders: 'Perfiles por proveedor',
      uUser: 'Usuario', uProvider: 'Proveedor', uRole: 'Rol', uJoined: 'Alta', uSeen: 'Última visita', uInternal: 'Cuentas internas', uEmail: 'Correo', uLastLogin: 'Último acceso', none: 'Sin datos todavía.',
      cTitle: 'Título', cAuthor: 'Autor', cState: 'Estado', cActions: 'Acciones', pinned: 'Fijada', visible: 'Visible', hiddenS: 'Oculta',
      pin: 'Fijar', unpin: 'Desfijar', hide: 'Ocultar', unhide: 'Mostrar', reset: 'Restablecer', readonly: 'Solo los administradores pueden moderar. Tu cuenta es interna de solo lectura.', modNote: 'Los cambios se aplican en la portada en menos de un minuto.', saved: 'Guardado', failed: 'No se pudo guardar',
      aBadge: 'Insignia', aUsers: 'Autores con ella', aShare: 'Porcentaje', aBased: 'Calculado sobre {n} autores.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV y DNS', lGh: 'GitHub', lGhd: 'Repositorios de ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'Registros de aplicaciones y roles', lMyApps: 'Mis aplicaciones', lMyAppsd: 'Portal de acceso del tenant', lSite: 'Guías públicas', lSited: 'Portada', error: 'No se pudo cargar. Vuelve a intentarlo.' },
    en: { kicker: 'ATM SOFTWARE LABS · INTERNAL', title: 'Internal panel', gateTitle: 'Restricted access', gateText: 'This panel is only for ATM Software Labs accounts. Sign in with your work Microsoft account.', gateBtn: 'Continue with Microsoft', unavailable: 'Microsoft sign-in is not enabled yet.',
      tabStats: 'Overview', tabUsers: 'Users', tabContent: 'Content', tabAch: 'Achievements', tabLinks: 'Links',
      who: 'Internal session: {n}', roleAdmin: 'Administrator', roleInternal: 'Internal (read-only)',
      sProfiles: 'Public profiles', sEmail: 'Email accounts', sInternal: 'Internal accounts', sGuides: 'Posts', sPinned: 'Pinned', sHidden: 'Hidden', sProviders: 'Profiles by provider',
      uUser: 'User', uProvider: 'Provider', uRole: 'Role', uJoined: 'Joined', uSeen: 'Last seen', uInternal: 'Internal accounts', uEmail: 'Email', uLastLogin: 'Last sign-in', none: 'No data yet.',
      cTitle: 'Title', cAuthor: 'Author', cState: 'Status', cActions: 'Actions', pinned: 'Pinned', visible: 'Visible', hiddenS: 'Hidden',
      pin: 'Pin', unpin: 'Unpin', hide: 'Hide', unhide: 'Show', reset: 'Reset', readonly: 'Only administrators can moderate. Your account is internal read-only.', modNote: 'Changes reach the homepage in under a minute.', saved: 'Saved', failed: 'Could not save',
      aBadge: 'Badge', aUsers: 'Authors with it', aShare: 'Share', aBased: 'Based on {n} authors.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV and DNS', lGh: 'GitHub', lGhd: 'ATM Software Labs repositories', lEntra: 'Microsoft Entra', lEntrad: 'App registrations and roles', lMyApps: 'My Apps', lMyAppsd: 'Tenant access portal', lSite: 'Public guides', lSited: 'Homepage', error: 'Could not load. Try again.' },
    ca: { kicker: 'ATM SOFTWARE LABS · INTERN', title: 'Tauler intern', gateTitle: 'Accés restringit', gateText: 'Aquest tauler és només per a comptes d’ATM Software Labs. Entra amb el teu compte de Microsoft de la feina.', gateBtn: 'Continua amb Microsoft', unavailable: 'L’accés amb Microsoft encara no està activat.',
      tabStats: 'Resum', tabUsers: 'Usuaris', tabContent: 'Contingut', tabAch: 'Assoliments', tabLinks: 'Enllaços',
      who: 'Sessió interna: {n}', roleAdmin: 'Administrador', roleInternal: 'Intern (només lectura)',
      sProfiles: 'Perfils públics', sEmail: 'Comptes amb correu', sInternal: 'Comptes interns', sGuides: 'Publicacions', sPinned: 'Fixades', sHidden: 'Amagades', sProviders: 'Perfils per proveïdor',
      uUser: 'Usuari', uProvider: 'Proveïdor', uRole: 'Rol', uJoined: 'Alta', uSeen: 'Darrera visita', uInternal: 'Comptes interns', uEmail: 'Correu', uLastLogin: 'Darrer accés', none: 'Encara no hi ha dades.',
      cTitle: 'Títol', cAuthor: 'Autor', cState: 'Estat', cActions: 'Accions', pinned: 'Fixada', visible: 'Visible', hiddenS: 'Amagada',
      pin: 'Fixa', unpin: 'Desfixa', hide: 'Amaga', unhide: 'Mostra', reset: 'Restableix', readonly: 'Només els administradors poden moderar. El teu compte és intern de només lectura.', modNote: 'Els canvis arriben a la portada en menys d’un minut.', saved: 'Desat', failed: 'No s’ha pogut desar',
      aBadge: 'Insígnia', aUsers: 'Autors que la tenen', aShare: 'Percentatge', aBased: 'Calculat sobre {n} autors.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV i DNS', lGh: 'GitHub', lGhd: 'Repositoris d’ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'Registres d’aplicacions i rols', lMyApps: 'Les meves aplicacions', lMyAppsd: 'Portal d’accés del tenant', lSite: 'Guies públiques', lSited: 'Portada', error: 'No s’ha pogut carregar. Torna-ho a provar.' },
    fr: { kicker: 'ATM SOFTWARE LABS · INTERNE', title: 'Panneau interne', gateTitle: 'Accès restreint', gateText: 'Ce panneau est réservé aux comptes ATM Software Labs. Connectez-vous avec votre compte Microsoft professionnel.', gateBtn: 'Continuer avec Microsoft', unavailable: 'La connexion Microsoft n’est pas encore activée.',
      tabStats: 'Aperçu', tabUsers: 'Utilisateurs', tabContent: 'Contenu', tabAch: 'Succès', tabLinks: 'Liens',
      who: 'Session interne : {n}', roleAdmin: 'Administrateur', roleInternal: 'Interne (lecture seule)',
      sProfiles: 'Profils publics', sEmail: 'Comptes e-mail', sInternal: 'Comptes internes', sGuides: 'Publications', sPinned: 'Épinglées', sHidden: 'Masquées', sProviders: 'Profils par fournisseur',
      uUser: 'Utilisateur', uProvider: 'Fournisseur', uRole: 'Rôle', uJoined: 'Inscription', uSeen: 'Dernière visite', uInternal: 'Comptes internes', uEmail: 'E-mail', uLastLogin: 'Dernière connexion', none: 'Pas encore de données.',
      cTitle: 'Titre', cAuthor: 'Auteur', cState: 'État', cActions: 'Actions', pinned: 'Épinglée', visible: 'Visible', hiddenS: 'Masquée',
      pin: 'Épingler', unpin: 'Désépingler', hide: 'Masquer', unhide: 'Afficher', reset: 'Réinitialiser', readonly: 'Seuls les administrateurs peuvent modérer. Votre compte interne est en lecture seule.', modNote: 'Les changements arrivent sur l’accueil en moins d’une minute.', saved: 'Enregistré', failed: 'Échec de l’enregistrement',
      aBadge: 'Badge', aUsers: 'Auteurs qui l’ont', aShare: 'Part', aBased: 'Calculé sur {n} auteurs.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV et DNS', lGh: 'GitHub', lGhd: 'Dépôts ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'Inscriptions d’applications et rôles', lMyApps: 'Mes applications', lMyAppsd: 'Portail d’accès du tenant', lSite: 'Guides publics', lSited: 'Accueil', error: 'Chargement impossible. Réessayez.' },
    de: { kicker: 'ATM SOFTWARE LABS · INTERN', title: 'Interner Bereich', gateTitle: 'Eingeschränkter Zugang', gateText: 'Dieser Bereich ist nur für Konten von ATM Software Labs. Melde dich mit deinem geschäftlichen Microsoft-Konto an.', gateBtn: 'Weiter mit Microsoft', unavailable: 'Die Anmeldung mit Microsoft ist noch nicht aktiviert.',
      tabStats: 'Übersicht', tabUsers: 'Nutzer', tabContent: 'Inhalte', tabAch: 'Erfolge', tabLinks: 'Links',
      who: 'Interne Sitzung: {n}', roleAdmin: 'Administrator', roleInternal: 'Intern (nur Lesen)',
      sProfiles: 'Öffentliche Profile', sEmail: 'E-Mail-Konten', sInternal: 'Interne Konten', sGuides: 'Beiträge', sPinned: 'Angeheftet', sHidden: 'Ausgeblendet', sProviders: 'Profile nach Anbieter',
      uUser: 'Nutzer', uProvider: 'Anbieter', uRole: 'Rolle', uJoined: 'Beitritt', uSeen: 'Zuletzt gesehen', uInternal: 'Interne Konten', uEmail: 'E-Mail', uLastLogin: 'Letzte Anmeldung', none: 'Noch keine Daten.',
      cTitle: 'Titel', cAuthor: 'Autor', cState: 'Status', cActions: 'Aktionen', pinned: 'Angeheftet', visible: 'Sichtbar', hiddenS: 'Ausgeblendet',
      pin: 'Anheften', unpin: 'Lösen', hide: 'Ausblenden', unhide: 'Einblenden', reset: 'Zurücksetzen', readonly: 'Nur Administratoren können moderieren. Dein internes Konto hat nur Lesezugriff.', modNote: 'Änderungen erscheinen in weniger als einer Minute auf der Startseite.', saved: 'Gespeichert', failed: 'Speichern fehlgeschlagen',
      aBadge: 'Abzeichen', aUsers: 'Autoren damit', aShare: 'Anteil', aBased: 'Berechnet aus {n} Autoren.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV und DNS', lGh: 'GitHub', lGhd: 'Repositories von ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'App-Registrierungen und Rollen', lMyApps: 'Meine Apps', lMyAppsd: 'Zugangsportal des Tenants', lSite: 'Öffentliche Anleitungen', lSited: 'Startseite', error: 'Laden fehlgeschlagen. Bitte erneut versuchen.' },
    it: { kicker: 'ATM SOFTWARE LABS · INTERNO', title: 'Pannello interno', gateTitle: 'Accesso riservato', gateText: 'Questo pannello è solo per gli account ATM Software Labs. Accedi con il tuo account Microsoft di lavoro.', gateBtn: 'Continua con Microsoft', unavailable: 'L’accesso con Microsoft non è ancora attivo.',
      tabStats: 'Panoramica', tabUsers: 'Utenti', tabContent: 'Contenuti', tabAch: 'Traguardi', tabLinks: 'Link',
      who: 'Sessione interna: {n}', roleAdmin: 'Amministratore', roleInternal: 'Interno (sola lettura)',
      sProfiles: 'Profili pubblici', sEmail: 'Account email', sInternal: 'Account interni', sGuides: 'Pubblicazioni', sPinned: 'In evidenza', sHidden: 'Nascoste', sProviders: 'Profili per provider',
      uUser: 'Utente', uProvider: 'Provider', uRole: 'Ruolo', uJoined: 'Iscrizione', uSeen: 'Ultima visita', uInternal: 'Account interni', uEmail: 'Email', uLastLogin: 'Ultimo accesso', none: 'Ancora nessun dato.',
      cTitle: 'Titolo', cAuthor: 'Autore', cState: 'Stato', cActions: 'Azioni', pinned: 'In evidenza', visible: 'Visibile', hiddenS: 'Nascosta',
      pin: 'Fissa', unpin: 'Sblocca', hide: 'Nascondi', unhide: 'Mostra', reset: 'Ripristina', readonly: 'Solo gli amministratori possono moderare. Il tuo account interno è in sola lettura.', modNote: 'Le modifiche arrivano in home in meno di un minuto.', saved: 'Salvato', failed: 'Salvataggio non riuscito',
      aBadge: 'Badge', aUsers: 'Autori che lo hanno', aShare: 'Quota', aBased: 'Calcolato su {n} autori.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV e DNS', lGh: 'GitHub', lGhd: 'Repository di ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'Registrazioni app e ruoli', lMyApps: 'Le mie app', lMyAppsd: 'Portale di accesso del tenant', lSite: 'Guide pubbliche', lSited: 'Home', error: 'Impossibile caricare. Riprova.' },
    pt: { kicker: 'ATM SOFTWARE LABS · INTERNO', title: 'Painel interno', gateTitle: 'Acesso restrito', gateText: 'Este painel é só para contas da ATM Software Labs. Entra com a tua conta Microsoft de trabalho.', gateBtn: 'Continuar com Microsoft', unavailable: 'O acesso com Microsoft ainda não está ativo.',
      tabStats: 'Resumo', tabUsers: 'Utilizadores', tabContent: 'Conteúdo', tabAch: 'Conquistas', tabLinks: 'Ligações',
      who: 'Sessão interna: {n}', roleAdmin: 'Administrador', roleInternal: 'Interno (só leitura)',
      sProfiles: 'Perfis públicos', sEmail: 'Contas com e-mail', sInternal: 'Contas internas', sGuides: 'Publicações', sPinned: 'Fixadas', sHidden: 'Ocultas', sProviders: 'Perfis por fornecedor',
      uUser: 'Utilizador', uProvider: 'Fornecedor', uRole: 'Função', uJoined: 'Registo', uSeen: 'Última visita', uInternal: 'Contas internas', uEmail: 'E-mail', uLastLogin: 'Último acesso', none: 'Ainda sem dados.',
      cTitle: 'Título', cAuthor: 'Autor', cState: 'Estado', cActions: 'Ações', pinned: 'Fixada', visible: 'Visível', hiddenS: 'Oculta',
      pin: 'Fixar', unpin: 'Desafixar', hide: 'Ocultar', unhide: 'Mostrar', reset: 'Repor', readonly: 'Só os administradores podem moderar. A tua conta interna é só de leitura.', modNote: 'As alterações chegam à página inicial em menos de um minuto.', saved: 'Guardado', failed: 'Não foi possível guardar',
      aBadge: 'Insígnia', aUsers: 'Autores com ela', aShare: 'Percentagem', aBased: 'Calculado sobre {n} autores.',
      lCf: 'Cloudflare', lCfd: 'Pages, KV e DNS', lGh: 'GitHub', lGhd: 'Repositórios da ATM Software Labs', lEntra: 'Microsoft Entra', lEntrad: 'Registos de aplicações e funções', lMyApps: 'As minhas aplicações', lMyAppsd: 'Portal de acesso do tenant', lSite: 'Guias públicos', lSited: 'Página inicial', error: 'Não foi possível carregar. Tenta de novo.' }
  };
  var S = {"es": {"tabSites": "Sitios", "stSite": "Sitio", "stStatus": "Estado", "stAuth": "Acceso", "stDeploy": "Último despliegue", "stLinks": "Enlaces", "stOpen": "Abrir", "stRepo": "Repositorio", "stCf": "Cloudflare", "stAdmin": "Panel", "stDown": "Caído", "stRedirect": "Redirige", "stNoDeploy": "Sin datos de despliegue", "stChecked": "Comprobado {n}", "stRefresh": "Volver a comprobar", "stUsers": "usuarios", "stConv": "conversaciones", "stDeployNote": "Los despliegues vienen de ATM Labs (API de Cloudflare de solo lectura).", "auth_none": "Sin cuentas", "auth_redirect": "Redirección", "auth_central": "Central (X · Google · correo · Microsoft)", "auth_delegated": "Sesión central compartida", "auth_own": "Cuentas propias", "auth_proxy-ai": "Cuentas de Trujillo AI", "auth_own-admin": "Acceso de administración propio", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "chats compartidos", "stDiscord": "memorias de Discord", "stPending": "altas pendientes", "stOn": "activo", "stOff": "inactivo"}, "en": {"tabSites": "Sites", "stSite": "Site", "stStatus": "Status", "stAuth": "Access", "stDeploy": "Last deploy", "stLinks": "Links", "stOpen": "Open", "stRepo": "Repository", "stCf": "Cloudflare", "stAdmin": "Panel", "stDown": "Down", "stRedirect": "Redirects", "stNoDeploy": "No deploy data", "stChecked": "Checked {n}", "stRefresh": "Check again", "stUsers": "users", "stConv": "conversations", "stDeployNote": "Deploys come from ATM Labs (read-only Cloudflare API).", "auth_none": "No accounts", "auth_redirect": "Redirect", "auth_central": "Central (X · Google · email · Microsoft)", "auth_delegated": "Shared central session", "auth_own": "Own accounts", "auth_proxy-ai": "Trujillo AI accounts", "auth_own-admin": "Own admin access", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "shared chats", "stDiscord": "Discord memories", "stPending": "pending sign-ups", "stOn": "on", "stOff": "off"}, "ca": {"tabSites": "Llocs", "stSite": "Lloc", "stStatus": "Estat", "stAuth": "Accés", "stDeploy": "Darrer desplegament", "stLinks": "Enllaços", "stOpen": "Obre", "stRepo": "Repositori", "stCf": "Cloudflare", "stAdmin": "Tauler", "stDown": "Caigut", "stRedirect": "Redirigeix", "stNoDeploy": "Sense dades de desplegament", "stChecked": "Comprovat {n}", "stRefresh": "Torna a comprovar", "stUsers": "usuaris", "stConv": "converses", "stDeployNote": "Els desplegaments vénen d’ATM Labs (API de Cloudflare només de lectura).", "auth_none": "Sense comptes", "auth_redirect": "Redirecció", "auth_central": "Central (X · Google · correu · Microsoft)", "auth_delegated": "Sessió central compartida", "auth_own": "Comptes propis", "auth_proxy-ai": "Comptes de Trujillo AI", "auth_own-admin": "Accés d’administració propi", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "xats compartits", "stDiscord": "memòries de Discord", "stPending": "altes pendents", "stOn": "actiu", "stOff": "inactiu"}, "fr": {"tabSites": "Sites", "stSite": "Site", "stStatus": "État", "stAuth": "Accès", "stDeploy": "Dernier déploiement", "stLinks": "Liens", "stOpen": "Ouvrir", "stRepo": "Dépôt", "stCf": "Cloudflare", "stAdmin": "Panneau", "stDown": "Hors ligne", "stRedirect": "Redirige", "stNoDeploy": "Pas de données de déploiement", "stChecked": "Vérifié {n}", "stRefresh": "Vérifier à nouveau", "stUsers": "utilisateurs", "stConv": "conversations", "stDeployNote": "Les déploiements viennent d’ATM Labs (API Cloudflare en lecture seule).", "auth_none": "Sans comptes", "auth_redirect": "Redirection", "auth_central": "Central (X · Google · e-mail · Microsoft)", "auth_delegated": "Session centrale partagée", "auth_own": "Comptes propres", "auth_proxy-ai": "Comptes Trujillo AI", "auth_own-admin": "Accès admin propre", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "conversations partagées", "stDiscord": "mémoires Discord", "stPending": "inscriptions en attente", "stOn": "actif", "stOff": "inactif"}, "de": {"tabSites": "Websites", "stSite": "Website", "stStatus": "Status", "stAuth": "Zugang", "stDeploy": "Letztes Deployment", "stLinks": "Links", "stOpen": "Öffnen", "stRepo": "Repository", "stCf": "Cloudflare", "stAdmin": "Bereich", "stDown": "Nicht erreichbar", "stRedirect": "Leitet weiter", "stNoDeploy": "Keine Deployment-Daten", "stChecked": "Geprüft {n}", "stRefresh": "Erneut prüfen", "stUsers": "Nutzer", "stConv": "Unterhaltungen", "stDeployNote": "Deployments kommen von ATM Labs (Cloudflare-API nur lesend).", "auth_none": "Keine Konten", "auth_redirect": "Weiterleitung", "auth_central": "Zentral (X · Google · E-Mail · Microsoft)", "auth_delegated": "Geteilte zentrale Sitzung", "auth_own": "Eigene Konten", "auth_proxy-ai": "Trujillo-AI-Konten", "auth_own-admin": "Eigener Admin-Zugang", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "geteilte Chats", "stDiscord": "Discord-Erinnerungen", "stPending": "offene Registrierungen", "stOn": "an", "stOff": "aus"}, "it": {"tabSites": "Siti", "stSite": "Sito", "stStatus": "Stato", "stAuth": "Accesso", "stDeploy": "Ultimo deploy", "stLinks": "Link", "stOpen": "Apri", "stRepo": "Repository", "stCf": "Cloudflare", "stAdmin": "Pannello", "stDown": "Non raggiungibile", "stRedirect": "Reindirizza", "stNoDeploy": "Nessun dato di deploy", "stChecked": "Controllato {n}", "stRefresh": "Ricontrolla", "stUsers": "utenti", "stConv": "conversazioni", "stDeployNote": "I deploy arrivano da ATM Labs (API Cloudflare in sola lettura).", "auth_none": "Senza account", "auth_redirect": "Reindirizzamento", "auth_central": "Centrale (X · Google · email · Microsoft)", "auth_delegated": "Sessione centrale condivisa", "auth_own": "Account propri", "auth_proxy-ai": "Account Trujillo AI", "auth_own-admin": "Accesso admin proprio", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "chat condivise", "stDiscord": "memorie Discord", "stPending": "iscrizioni in attesa", "stOn": "attivo", "stOff": "disattivo"}, "pt": {"tabSites": "Sites", "stSite": "Site", "stStatus": "Estado", "stAuth": "Acesso", "stDeploy": "Última implementação", "stLinks": "Ligações", "stOpen": "Abrir", "stRepo": "Repositório", "stCf": "Cloudflare", "stAdmin": "Painel", "stDown": "Em baixo", "stRedirect": "Redireciona", "stNoDeploy": "Sem dados de implementação", "stChecked": "Verificado {n}", "stRefresh": "Verificar de novo", "stUsers": "utilizadores", "stConv": "conversas", "stDeployNote": "As implementações vêm do ATM Labs (API da Cloudflare só de leitura).", "auth_none": "Sem contas", "auth_redirect": "Redirecionamento", "auth_central": "Central (X · Google · e-mail · Microsoft)", "auth_delegated": "Sessão central partilhada", "auth_own": "Contas próprias", "auth_proxy-ai": "Contas Trujillo AI", "auth_own-admin": "Acesso de administração próprio", "auth_api": "API", "auth_myapps": "Microsoft My Apps", "stShared": "conversas partilhadas", "stDiscord": "memórias do Discord", "stPending": "registos pendentes", "stOn": "ativo", "stOff": "inativo"}};
  Object.keys(S).forEach(function (l) { Object.keys(S[l]).forEach(function (k) { L[l][k] = S[l][k]; }); });
  function lang() { var l = (window.atmLang && window.atmLang()) || 'es'; return L[l] ? l : 'en'; }
  function t(k, n) { var s = (L[lang()] || L.en)[k] || L.en[k] || k; return n != null ? s.replace('{n}', n) : s; }
  function $(id) { return document.getElementById(id); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(s) { if (!s) return '—'; try { return new Date(s).toLocaleDateString(document.documentElement.lang || undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return '—'; } }
  function api(path, opts) {
    return fetch(path, Object.assign({ credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }, opts || {}))
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { d.__status = r.status; return d; }); });
  }
  var state = { me: null, users: null, content: null, stats: null, ach: null, tab: 'stats' };

  function applyStatic() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-adm]'), function (el) { el.textContent = t(el.getAttribute('data-adm')); });
    document.title = t('title') + ' · ATM Software Labs';
    if (state.me) $('adm-who').textContent = t('who', state.me.name || state.me.handle) + ' · ' + (state.me.admin ? t('roleAdmin') : t('roleInternal'));
  }
  function stat(n, label) { return '<div class="admin-stat"><b>' + esc(n) + '</b><span>' + esc(label) + '</span></div>'; }
  function renderStats() {
    var s = state.stats; if (!s) return;
    var prov = Object.keys(s.byProvider || {}).map(function (k) { return '<span class="admin-pill">' + esc(k) + ' · ' + esc(s.byProvider[k]) + '</span>'; }).join(' ');
    $('adm-stats').innerHTML = stat(s.profiles, t('sProfiles')) + stat(s.emailAccounts, t('sEmail')) + stat(s.internalAccounts, t('sInternal')) +
      stat(s.guides, t('sGuides')) + stat(s.pinned, t('sPinned')) + stat(s.hidden, t('sHidden')) +
      '<div class="admin-stat" style="grid-column:1/-1"><span>' + esc(t('sProviders')) + '</span><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' + (prov || esc(t('none'))) + '</div></div>';
  }
  function renderUsers() {
    var d = state.users; if (!d) return;
    var rows = (d.users || []).map(function (u) {
      var av = u.avatar ? '<img class="admin-avatar" src="' + esc(u.avatar) + '" alt="" referrerpolicy="no-referrer">' : '<span class="admin-avatar"></span>';
      return '<tr><td>' + av + '<a href="/u/@' + encodeURIComponent(u.handle) + '">' + esc(u.name || u.handle) + '</a> <span class="admin-note">@' + esc(u.handle) + '</span></td><td>' + esc(u.provider || '—') + '</td><td><span class="admin-pill' + (u.role === 'admin' ? ' ok' : '') + '">' + esc(u.role) + '</span></td><td>' + fmtDate(u.joinedAt) + '</td><td>' + fmtDate(u.lastSeenAt) + '</td></tr>';
    }).join('');
    var irows = (d.internal || []).map(function (u) {
      return '<tr><td>' + esc(u.name || u.handle) + ' <span class="admin-note">@' + esc(u.handle) + '</span></td><td>' + esc(u.email || '—') + '</td><td><span class="admin-pill' + (u.admin ? ' ok' : '') + '">' + esc(u.admin ? t('roleAdmin') : t('roleInternal')) + '</span></td><td>' + fmtDate(u.lastLoginAt) + '</td></tr>';
    }).join('');
    $('adm-users').innerHTML = '<div class="admin-scroll"><table class="admin-table"><thead><tr><th>' + t('uUser') + '</th><th>' + t('uProvider') + '</th><th>' + t('uRole') + '</th><th>' + t('uJoined') + '</th><th>' + t('uSeen') + '</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">' + t('none') + '</td></tr>') + '</tbody></table></div>' +
      '<h2 style="font-size:1rem;margin:24px 0 8px">' + t('uInternal') + '</h2><div class="admin-scroll"><table class="admin-table"><thead><tr><th>' + t('uUser') + '</th><th>' + t('uEmail') + '</th><th>' + t('uRole') + '</th><th>' + t('uLastLogin') + '</th></tr></thead><tbody>' + (irows || '<tr><td colspan="4">' + t('none') + '</td></tr>') + '</tbody></table></div>';
  }
  function renderContent() {
    var d = state.content; if (!d) return;
    $('adm-content-note').textContent = d.canModerate ? t('modNote') : t('readonly');
    var dis = d.canModerate ? '' : ' disabled';
    $('adm-content').innerHTML = '<div class="admin-scroll"><table class="admin-table"><thead><tr><th>' + t('cTitle') + '</th><th>' + t('cAuthor') + '</th><th>' + t('cState') + '</th><th>' + t('cActions') + '</th></tr></thead><tbody>' +
      (d.items || []).map(function (g) {
        return '<tr><td><a href="' + esc(g.href) + '">' + esc(g.title || g.slug) + '</a><div class="admin-note">' + esc(g.kind) + ' · ' + fmtDate(g.date) + '</div></td><td>@' + esc(g.handle || '') + '</td><td>' +
          (g.hidden ? '<span class="admin-pill off">' + t('hiddenS') + '</span>' : '<span class="admin-pill">' + t('visible') + '</span>') + (g.pinned ? ' <span class="admin-pill ok">' + t('pinned') + '</span>' : '') +
          '</td><td><div class="admin-actions">' +
          '<button type="button" class="admin-btn" data-mod="' + (g.pinned ? 'unpin' : 'pin') + '" data-slug="' + esc(g.slug) + '"' + dis + '>' + t(g.pinned ? 'unpin' : 'pin') + '</button>' +
          '<button type="button" class="admin-btn" data-mod="' + (g.hidden ? 'unhide' : 'hide') + '" data-slug="' + esc(g.slug) + '"' + dis + '>' + t(g.hidden ? 'unhide' : 'hide') + '</button>' +
          (g.by ? '<button type="button" class="admin-btn" data-mod="reset" data-slug="' + esc(g.slug) + '"' + dis + '>' + t('reset') + '</button>' : '') +
          '</div></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function achTitle(a) {
    var v = a.title; if (typeof v === 'function') { try { v = v(); } catch (e) { v = a.id; } }
    return v || a.id;
  }
  function renderAch() {
    var d = state.ach; var A = window.ATM_ACHIEVEMENTS; if (!d) return;
    var list = (A && A.achievements) || [];
    var rows = list.map(function (a) {
      var n = d.counts[a.id] || 0; var pct = d.total ? Math.round(n * 1000 / d.total) / 10 : 0;
      return '<tr><td>' + esc(achTitle(a)) + '</td><td>' + n + '</td><td><div style="display:flex;align-items:center;gap:8px"><div class="admin-bar"><i style="width:' + pct + '%"></i></div>' + pct + '%</div></td></tr>';
    }).join('');
    $('adm-ach').innerHTML = '<p class="admin-note">' + esc(t('aBased', d.total)) + '</p><div class="admin-scroll"><table class="admin-table"><thead><tr><th>' + t('aBadge') + '</th><th>' + t('aUsers') + '</th><th>' + t('aShare') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function renderLinks() {
    var links = [
      ['https://dash.cloudflare.com/', 'lCf', 'lCfd'],
      ['https://github.com/ATM-Software-Labs', 'lGh', 'lGhd'],
      ['https://entra.microsoft.com/', 'lEntra', 'lEntrad'],
      ['https://myapps.microsoft.com/?tenantId=686bb631-e5e4-4fbf-bf55-835dd40fb263', 'lMyApps', 'lMyAppsd'],
      ['/', 'lSite', 'lSited']
    ];
    $('adm-links').innerHTML = links.map(function (l) { return '<a href="' + l[0] + '"' + (l[0].charAt(0) === '/' ? '' : ' target="_blank" rel="noopener"') + '>' + esc(t(l[1])) + '<small>' + esc(t(l[2])) + '</small></a>'; }).join('');
  }
  function ago(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(document.documentElement.lang || undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return '—'; }
  }
  function renderSites() {
    var d = state.sites; var box = $('adm-sites'); if (!box) return;
    if (!d) { box.innerHTML = '<p class="admin-note">…</p>'; return; }
    var dep = (state.deploys && state.deploys.projects) || {};
    var sum = state.summaries || {};
    var rows = d.sites.map(function (s) {
      var h = s.health || {};
      var pill = !h.status ? '<span class="admin-pill off">' + t('stDown') + (h.error ? ' · ' + esc(h.error) : '') + '</span>'
        : h.status >= 300 && h.status < 400 ? '<span class="admin-pill">' + t('stRedirect') + ' · ' + h.status + '</span>'
        : h.ok ? '<span class="admin-pill ok">' + h.status + ' · ' + h.ms + ' ms</span>' : '<span class="admin-pill off">' + h.status + '</span>';
      var dp = s.cf && dep[s.cf.type + ':' + s.cf.name];
      var dtxt = dp ? (dp.status ? '<span class="admin-pill' + (dp.status === 'success' ? ' ok' : dp.status === 'failure' ? ' off' : '') + '">' + esc(dp.status) + '</span> ' : '') + ago(dp.at) + (dp.branch ? ' <span class="admin-note">' + esc(dp.branch) + '</span>' : '') : '<span class="admin-note">' + t('stNoDeploy') + '</span>';
      var extra = sum[s.id] ? '<div class="admin-note">' + esc(sum[s.id]) + '</div>' : '';
      var cfUrl = s.cf ? 'https://dash.cloudflare.com/?to=/:account/' + (s.cf.type === 'pages' ? 'pages/view/' : 'workers/services/view/') + encodeURIComponent(s.cf.name) + (s.cf.type === 'pages' ? '' : '/production') : '';
      var links = '<a class="admin-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + t('stOpen') + '</a>' +
        (s.repo ? '<a class="admin-btn" href="https://github.com/' + esc(s.repo) + '" target="_blank" rel="noopener">' + t('stRepo') + '</a>' : '') +
        (cfUrl ? '<a class="admin-btn" href="' + cfUrl + '" target="_blank" rel="noopener">' + t('stCf') + '</a>' : '') +
        (s.admin ? '<a class="admin-btn primary" href="' + esc(s.admin) + '">' + t('stAdmin') + '</a>' : '');
      return '<tr><td><strong>' + esc(s.name) + '</strong><div class="admin-note">' + esc(s.url.replace(/^https:\/\//, '').replace(/\/$/, '')) + '</div>' + extra + '</td><td>' + pill + '</td><td>' + esc(t('auth_' + s.auth)) + '</td><td>' + dtxt + '</td><td><div class="admin-actions">' + links + '</div></td></tr>';
    }).join('');
    box.innerHTML = '<div class="admin-actions" style="justify-content:space-between;align-items:center;margin-bottom:10px"><span class="admin-note">' + esc(t('stChecked', ago(d.checkedAt))) + ' · ' + esc(t('stDeployNote')) + '</span><button type="button" class="admin-btn" id="adm-sites-refresh">' + t('stRefresh') + '</button></div>' +
      '<div class="admin-scroll"><table class="admin-table"><thead><tr><th>' + t('stSite') + '</th><th>' + t('stStatus') + '</th><th>' + t('stAuth') + '</th><th>' + t('stDeploy') + '</th><th>' + t('stLinks') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function loadSites(force) {
    if (state.sites && !force) return;
    if (force) { state.sites = null; renderSites(); }
    api('/api/admin/sites').then(function (d) {
      if (!d.ok) return;
      state.sites = d; renderSites();
      // Despliegues (ATM Labs) y resúmenes propios de cada sitio: CORS con credenciales, cada sitio comprueba la sesión
      if (d.deploysUrl && !state.deploys) {
        fetch(d.deploysUrl, { credentials: 'include', cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (x) { if (x && x.ok) { state.deploys = x; renderSites(); } }).catch(function () {});
      }
      state.summaries = state.summaries || {};
      d.sites.forEach(function (s) {
        if (!s.summary) return;
        fetch(s.summary, { credentials: 'include', cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
          if (!x || !x.ok) return;
          var parts = [];
          if (typeof x.users === 'number') parts.push(x.users + ' ' + t('stUsers'));
          if (typeof x.conversations === 'number') parts.push(x.conversations + ' ' + t('stConv'));
          if (typeof x.sharedChats === 'number') parts.push(x.sharedChats + ' ' + t('stShared'));
          if (typeof x.discordMemories === 'number') parts.push(x.discordMemories + ' ' + t('stDiscord'));
          if (typeof x.pendingSignups === 'number' && x.pendingSignups > 0) parts.push(x.pendingSignups + ' ' + t('stPending'));
          if (Array.isArray(x.facts)) x.facts.forEach(function (f) {
            if (!Array.isArray(f) || f.length < 2 || f[1] === '' || f[1] == null) return;
            var v = f[1] === 'on' ? t('stOn') : f[1] === 'off' ? t('stOff') : String(f[1]).slice(0, 60);
            parts.push(String(f[0]).slice(0, 30) + ': ' + v);
          });
          if (parts.length) { state.summaries[s.id] = parts.join(' · '); renderSites(); }
        }).catch(function () {});
      });
    });
  }
  function renderAll() { applyStatic(); renderStats(); renderUsers(); renderContent(); renderAch(); renderLinks(); renderSites(); }

  function loadAch() {
    if (state.ach || !state.users) return;
    var users = (state.users.users || []).slice(0, 40);
    var counts = {};
    Promise.all(users.map(function (u) {
      return fetch('/api/user/achievements?handle=' + encodeURIComponent(u.handle), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
        (d && (d.unlocked || d.achievements || []) || []).forEach(function (id) { if (typeof id === 'object') id = id.id; counts[id] = (counts[id] || 0) + 1; });
      }).catch(function () {});
    })).then(function () { state.ach = { total: users.length, counts: counts }; renderAch(); });
  }
  function show(tab) {
    state.tab = tab;
    Array.prototype.forEach.call(document.querySelectorAll('.admin-tab'), function (b) { var on = b.getAttribute('data-tab') === tab; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
    Array.prototype.forEach.call(document.querySelectorAll('.admin-panel'), function (p) { p.hidden = p.getAttribute('data-panel') !== tab; });
    if (tab === 'ach') loadAch();
    if (tab === 'sites') loadSites();
  }
  function toast(msg) { if (window.atmToast) window.atmToast(msg); }

  function init() {
    applyStatic(); renderLinks();
    api('/api/admin/me').then(function (d) {
      if (!d.ok) {
        $('adm-gate').hidden = false;
        if (d.__status === 404) { $('adm-ms-login').hidden = true; document.querySelector('[data-adm="gateText"]').textContent = t('unavailable'); }
        return;
      }
      state.me = d.user; $('adm-app').hidden = false; applyStatic();
      api('/api/admin/stats').then(function (s) { if (s.ok) { state.stats = s; renderStats(); } });
      api('/api/admin/users').then(function (u) { if (u.ok) { state.users = u; renderUsers(); if (state.tab === 'ach') loadAch(); } });
      api('/api/admin/content').then(function (c) { if (c.ok) { state.content = c; renderContent(); } });
    }).catch(function () { $('adm-gate').hidden = false; });
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.admin-tab'); if (tab) { show(tab.getAttribute('data-tab')); return; }
      if (e.target.closest('#adm-sites-refresh')) { loadSites(true); return; }
      var b = e.target.closest('[data-mod]'); if (!b || b.disabled) return;
      b.disabled = true;
      api('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-ATM-Admin': '1' }, body: JSON.stringify({ slug: b.getAttribute('data-slug'), action: b.getAttribute('data-mod') }) })
        .then(function (r) {
          if (!r.ok) { toast(t('failed')); b.disabled = false; return; }
          toast(t('saved'));
          return api('/api/admin/content').then(function (c) { if (c.ok) { state.content = c; renderContent(); } });
        });
    });
    document.addEventListener('atm:lang', renderAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
