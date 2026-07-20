(function() {
  'use strict';

  function inject() {
    // Try to find sidebar navigation area
    const selectors = [
      '[class*="nav-bar"]',
      '[class*="sidebar"]',
      '[class*="Root__nav-bar"]',
      'nav[aria-label*="main"]',
      '[class*="main-navBar"]',
      '[data-testid="root-container"] nav',
    ];

    let navBar = null;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { navBar = el; break; }
    }

    if (!navBar) return false;

    // Create Kladen button
    const btn = document.createElement('button');
    btn.id = 'kladen-store-btn';
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>Kladen Store</span>
    `;
    btn.style.cssText = `
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 8px 12px; background: transparent; border: none;
      color: #b3b3b3; cursor: pointer; border-radius: 4px;
      font-size: 14px; font-family: inherit; transition: all 0.2s;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.color = '#fff'; btn.style.background = 'rgba(255,255,255,0.1)'; });
    btn.addEventListener('mouseleave', () => { btn.style.color = '#b3b3b3'; btn.style.background = 'transparent'; });
    btn.addEventListener('click', openPanel);

    // Find where to insert — after the logo or at the bottom of nav
    const logo = navBar.querySelector('[class*="logo"], a[href="/"], [class*="home"], [class*="top"]');
    const target = logo ? logo.parentNode : navBar;
    target.appendChild(btn);

    return true;
  }

  function openPanel() {
    const old = document.getElementById('kladen-panel');
    if (old) { old.remove(); return; }

    const panel = document.createElement('div');
    panel.id = 'kladen-panel';
    panel.innerHTML = `
      <div style="padding:24px;color:#fff;font-family:spotify-circular,CircularSp,Helvetica,Arial,sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <h2 style="margin:0;font-size:22px;font-weight:700">Kladen Store</h2>
          <button id="kladen-close" style="background:none;border:none;color:#b3b3b3;font-size:28px;cursor:pointer;padding:4px">&times;</button>
        </div>
        <p style="margin:0 0 20px;color:#b3b3b3;font-size:14px;line-height:1.5">
          Browse and apply themes. Add your own .css files to:<br>
          <code style="color:#fff;font-size:12px">%USERPROFILE%\.kladen\themes\</code>
        </p>
        <div id="kladen-themes" style="display:flex;flex-direction:column;gap:8px"></div>
        <p style="margin-top:20px;color:#666;font-size:12px">After applying, restart Spotify.</p>
      </div>
    `;
    panel.style.cssText = `
      position: fixed; top: 0; right: 0; width: 380px; height: 100%;
      background: #121212; z-index: 99999; border-left: 1px solid #333;
      box-shadow: -4px 0 20px rgba(0,0,0,0.7); overflow-y: auto;
    `;
    document.body.appendChild(panel);

    document.getElementById('kladen-close').onclick = () => panel.remove();

    // Populate themes
    const list = document.getElementById('kladen-themes');
    const themes = ['default', 'nord', 'dark-purple'];
    themes.forEach(t => {
      const item = document.createElement('button');
      item.textContent = t;
      item.style.cssText = `
        padding: 10px 14px; background: #1a1a1a; border: 1px solid #333;
        border-radius: 6px; color: #fff; cursor: pointer; text-align: left;
        font-size: 14px; transition: all 0.2s; font-family: inherit;
      `;
      item.addEventListener('mouseenter', () => { item.style.background = '#282828'; });
      item.addEventListener('mouseleave', () => { item.style.background = '#1a1a1a'; });
      item.addEventListener('click', () => {
        item.textContent = t + ' ✓ (restart Spotify)';
        item.style.borderColor = '#1ed760';
        item.style.color = '#1ed760';
      });
      list.appendChild(item);
    });
  }

  // Try to inject immediately, then retry
  if (!inject()) {
    const observer = new MutationObserver(() => {
      if (inject()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
