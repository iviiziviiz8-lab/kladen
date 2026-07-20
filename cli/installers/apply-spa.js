const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const spaPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Spotify', 'Apps', 'xpui.spa');
const tmpDir = path.join(os.tmpdir(), 'kld-spotify');
const kladenDir = path.join(os.homedir(), '.kladen');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
}

// Extract spa
console.log('Extracting...');
if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });
run(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${spaPath}', '${tmpDir}')"`);

// Read index.html
let html = fs.readFileSync(path.join(tmpDir, 'index.html'), 'utf-8');

// Inject CSS
const cssPath = path.join(kladenDir, 'themes', 'default.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf-8');
  const cssTag = `<style id="kladen-css">${css}</style>`;
  html = html.includes('kladen-css')
    ? html.replace(/<style id="kladen-css">[\s\S]*?<\/style>/, cssTag)
    : html.replace('</head>', `  ${cssTag}\n</head>`);
}

// Inject JS extensions
const extDir = path.join(kladenDir, 'extensions');
if (fs.existsSync(extDir)) {
  fs.readdirSync(extDir).filter(f => f.endsWith('.js')).forEach(file => {
    const js = fs.readFileSync(path.join(extDir, file), 'utf-8');
    const extId = 'kladen-' + path.basename(file, '.js');
    const jsTag = `<script id="${extId}">${js}</script>`;
    html = html.includes(extId)
      ? html.replace(new RegExp(`<script id="${extId}">[\\s\\S]*?<\\/script>`), jsTag)
      : html.replace('</body>', `  ${jsTag}\n</body>`);
    console.log('  + Extension:', file);
  });
}

fs.writeFileSync(path.join(tmpDir, 'index.html'), html);

// Repack spa
console.log('Repacking...');
fs.copyFileSync(spaPath, spaPath + '.bak');
fs.unlinkSync(spaPath);
run(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${tmpDir}', '${spaPath}')"`);

fs.rmSync(tmpDir, { recursive: true });
console.log('Done! Restart Spotify.');
