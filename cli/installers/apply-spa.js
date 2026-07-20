const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const spaPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Spotify', 'Apps', 'xpui.spa');
const tmpDir = path.join(os.tmpdir(), 'kld-' + Date.now());
const kladenDir = path.join(os.homedir(), '.kladen');
const backupPath = path.join(kladenDir, 'backup', 'xpui.spa');

function ps(cmd) {
  return execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; ${cmd}"`, { encoding: 'utf-8', stdio: 'pipe' });
}

// Backup if not exists
if (!fs.existsSync(backupPath)) {
  console.log('Backing up original...');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(spaPath, backupPath);
}

// Extract
console.log('Extracting...');
if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });
ps(`[System.IO.Compression.ZipFile]::ExtractToDirectory('${spaPath.replace(/'/g, "''")}', '${tmpDir.replace(/'/g, "''")}')`);

// Read index.html
const htmlPath = path.join(tmpDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Remove any old Kladen CSS/JS tags
html = html.replace(/<style id="kladen-css">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script id="kladen-[\w-]+">[\s\S]*?<\/script>/g, '');
html = html.replace(/<link [^>]*kladen[^>]*>/g, '');

// Add CSS as separate file in the zip
const cssPath = path.join(kladenDir, 'themes', 'default.css');
if (fs.existsSync(cssPath)) {
  fs.copyFileSync(cssPath, path.join(tmpDir, 'kladen.css'));
  if (!html.includes('kladen.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="kladen.css">\n</head>');
  }
}

// Add JS extensions as separate files in the zip
const extDir = path.join(kladenDir, 'extensions');
if (fs.existsSync(extDir)) {
  fs.readdirSync(extDir).filter(f => f.endsWith('.js')).forEach(file => {
    fs.copyFileSync(path.join(extDir, file), path.join(tmpDir, file));
    const tag = `<script src="${file}"></script>`;
    if (!html.includes(file)) {
      html = html.replace('</body>', `  ${tag}\n</body>`);
    }
  });
}

fs.writeFileSync(htmlPath, html, 'utf-8');

// Repack
console.log('Repacking...');
if (fs.existsSync(spaPath)) {
  try { fs.copyFileSync(spaPath, spaPath + '.bak2'); } catch {}
  fs.unlinkSync(spaPath);
}
ps(`[System.IO.Compression.ZipFile]::CreateFromDirectory('${tmpDir.replace(/'/g, "''")}', '${spaPath.replace(/'/g, "''")}')`);

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Done! Restart Spotify.');
