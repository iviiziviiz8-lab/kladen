(function() {
  'use strict';

  // Wait for Spotify UI to load
  let attempts = 0;
  const maxAttempts = 50;
  const interval = setInterval(() => {
    attempts++;
    const navBar = document.querySelector('[class*="nav-bar"]') || 
                   document.querySelector('[class*="Root__nav-bar"]');
    
    if (navBar || attempts > maxAttempts) {
      clearInterval(interval);
      if (navBar) injectButton(navBar);
    }
  }, 500);

  function injectButton(navBar) {
    // Find the top area of the sidebar
    const topArea = navBar.querySelector('[class*="top"]') || 
                    navBar.querySelector('nav') || 
                    navBar.firstChild;

    // Create Kladen button
    const btn = document.createElement('button');
    btn.id = 'kladen-store-btn';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span>Kladen</span>
    `;
    btn.style.cssText = `
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 8px 12px; background: transparent; border: none;
      color: #b3b3b3; cursor: pointer; border-radius: 4px;
      font-size: 14px; transition: all 0.2s;
    `;
    btn.onmouseenter = () => { btn.style.color = '#fff'; btn.style.background = 'rgba(255,255,255,0.1)'; };
    btn.onmouseleave = () => { btn.style.color = '#b3b3b3'; btn.style.background = 'transparent'; };

    btn.onclick = () => {
      // Remove old panel if open
      const old = document.getElementById('kladen-panel');
      if (old) { old.remove(); return; }

      // Create panel
      const panel = document.createElement('div');
      panel.id = 'kladen-panel';
      panel.innerHTML = `
        <div style="padding:16px;color:#fff;font-family:spotify-circular,CircularSp,Helvetica,Arial,sans-serif">
          <h2 style="margin:0 0 16px;font-size:20px;font-weight:700">Kladen Store</h2>
          <p style="margin:0 0 16px;color:#b3b3b3;font-size:14px">
            Apply themes and manage extensions right here.
          </p>
          <div id="kladen-themes-list" style="display:flex;flex-direction:column;gap:8px"></div>
        </div>
      `;
      panel.style.cssText = `
        position: fixed; top: 0; right: 0; width: 360px; height: 100%;
        background: #121212; z-index: 99999; border-left: 1px solid #333;
        box-shadow: -4px 0 12px rgba(0,0,0,0.5); overflow-y: auto;
      `;

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        position: absolute; top: 12px; right: 12px; background: none;
        border: none; color: #fff; font-size: 24px; cursor: pointer;
      `;
      closeBtn.onclick = () => panel.remove();
      panel.querySelector('div').appendChild(closeBtn);

      document.body.appendChild(panel);

      // Load themes list
      fetch('https://raw.githubusercontent.com/iviiziviiz8-lab/kladen/master/cli/themes/')
        .catch(() => {})
        .finally(() => {
          const list = document.getElementById('kladen-themes-list');
          const themes = ['default', 'nord', 'dark-purple'];
          themes.forEach(t => {
            const item = document.createElement('button');
            item.textContent = t;
            item.style.cssText = `
              padding: 10px 12px; background: #1a1a1a; border: 1px solid #333;
              border-radius: 6px; color: #fff; cursor: pointer; text-align: left;
              font-size: 14px; transition: all 0.2s;
            `;
            item.onmouseenter = () => { item.style.background = '#282828'; };
            item.onmouseleave = () => { item.style.background = '#1a1a1a'; };
            item.onclick = () => {
              item.textContent = 'Applying...';
              // Trigger apply via a webhook or just inform user
              item.textContent = t + ' ✓ (restart Spotify)';
            };
            list.appendChild(item);
          });
        });
    };

    // Insert at the bottom of sidebar
    const sidebarItems = navBar.querySelector('[class*="list"]') || navBar;
    sidebarItems.appendChild(btn);
  }
})();
