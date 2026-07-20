#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join, basename, dirname } from 'path';
import { homedir, tmpdir } from 'os';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

const KLADEN_DIR = join(homedir(), '.kladen');
const APPS_DIR = join(homedir(), 'AppData', 'Roaming', 'Spotify', 'Apps');

const args = process.argv.slice(2);
const cmd = args[0];

function pwsh(script) {
  const escaped = script.replace(/"/g, '\\"');
  return execSync(`powershell -NoProfile -Command "${escaped}"`, { encoding: 'utf-8', stdio: 'pipe' });
}

function help() {
  console.log(`
Kladen - Spotify Customization Toolkit

Usage:
  kladen apply <theme>    Apply a theme (+ JS extensions)
  kladen list             List installed themes
  kladen extensions       List installed extensions
  kladen backup           Backup original Spotify files
  kladen restore          Restore from backup
  kladen config [key] [value]  View or set config
`);
}

function getSpaPath() {
  const p = join(APPS_DIR, 'xpui.spa');
  return existsSync(p) ? p : null;
}

function extractSpa(spaPath, destDir) {
  pwsh(`Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${spaPath}', '${destDir}')`);
}

function repackSpa(srcDir, spaPath) {
  if (existsSync(spaPath)) copyFileSync(spaPath, spaPath + '.bak');
  pwsh(`Add-Type -AssemblyName System.IO.Compression.FileSystem; if(Test-Path('${spaPath}')){Remove-Item '${spaPath}'-Force}; [System.IO.Compression.ZipFile]::CreateFromDirectory('${srcDir}', '${spaPath}')`);
}

function getExtensions() {
  const dir = join(KLADEN_DIR, 'extensions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.js'));
}

async function cmdList() {
  const dir = join(KLADEN_DIR, 'themes');
  if (!existsSync(dir)) { console.log('No themes installed.'); return; }
  const files = readdirSync(dir).filter(f => f.endsWith('.css'));
  if (files.length === 0) { console.log('No themes found.'); }
  else { console.log('Installed themes:'); files.forEach(f => console.log('  - ' + f.replace('.css', ''))); }
}

async function cmdExtensions() {
  const exts = getExtensions();
  if (exts.length === 0) { console.log('No extensions.'); return; }
  console.log('Installed extensions:'); exts.forEach(f => console.log('  - ' + f.replace('.js', '')));
}

async function cmdBackup() {
  const spa = getSpaPath();
  if (!spa) { console.error('xpui.spa not found. Is Spotify installed?'); return; }
  const bakDir = join(KLADEN_DIR, 'backup');
  mkdirSync(bakDir, { recursive: true });
  copyFileSync(spa, join(bakDir, 'xpui.spa'));
  console.log('Backup saved.');
}

async function cmdRestore() {
  const bak = join(KLADEN_DIR, 'backup', 'xpui.spa');
  if (!existsSync(bak)) { console.error('No backup found.'); return; }
  copyFileSync(bak, join(APPS_DIR, 'xpui.spa'));
  console.log('Restored from backup.');
}

async function cmdApply(themeName) {
  const spaPath = getSpaPath();
  if (!spaPath) { console.error('xpui.spa not found. Is Spotify installed?'); return; }

  if (!themeName) { console.error('Usage: kladen apply <theme-name>'); return; }

  // Backup on first use
  const bakPath = join(KLADEN_DIR, 'backup', 'xpui.spa');
  mkdirSync(dirname(bakPath), { recursive: true });
  if (!existsSync(bakPath)) copyFileSync(spaPath, bakPath);

  // Extract spa to temp dir
  const tmpDir = join(tmpdir(), 'kladen-' + randomUUID().slice(0, 8));
  mkdirSync(tmpDir, { recursive: true });
  extractSpa(spaPath, tmpDir);

  const htmlPath = join(tmpDir, 'index.html');
  if (!existsSync(htmlPath)) { console.error('index.html not found in xpui.spa'); return; }

  let html = readFileSync(htmlPath, 'utf-8');

  // Inject CSS
  const cssPath = join(KLADEN_DIR, 'themes', themeName + '.css');
  if (existsSync(cssPath)) {
    const css = readFileSync(cssPath, 'utf-8');
    const cssTag = `<style id="kladen-css">${css}</style>`;
    if (html.includes('kladen-css')) {
      html = html.replace(/<style id="kladen-css">[\s\S]*?<\/style>/, cssTag);
    } else {
      html = html.replace('</head>', `  ${cssTag}\n</head>`);
    }
  } else {
    html = html.replace(/<style id="kladen-css">[\s\S]*?<\/style>/, '');
  }

  // Inject JS extensions
  const exts = getExtensions();
  for (const ext of exts) {
    const jsPath = join(KLADEN_DIR, 'extensions', ext);
    const js = readFileSync(jsPath, 'utf-8');
    const extId = 'kladen-' + ext.replace('.js', '');
    const jsTag = `<script id="${extId}">${js}</script>`;
    if (html.includes(extId)) {
      html = html.replace(new RegExp(`<script id="${extId}">[\\s\\S]*?<\\/script>`), jsTag);
    } else {
      html = html.replace('</body>', `  ${jsTag}\n</body>`);
    }
  }

  writeFileSync(htmlPath, html);

  // Repack
  repackSpa(tmpDir, spaPath);
  rmSync(tmpDir, { recursive: true, force: true });

  // Save config
  mkdirSync(join(KLADEN_DIR, 'config'), { recursive: true });
  writeFileSync(join(KLADEN_DIR, 'config', 'current-theme'), themeName);

  console.log(`Theme "${themeName}" applied!`);
  if (exts.length > 0) console.log(`+ ${exts.length} extension(s) injected`);
  console.log('Restart Spotify to see changes.');
}

async function cmdConfig(key, value) {
  const configPath = join(KLADEN_DIR, 'config', 'settings.json');
  mkdirSync(join(KLADEN_DIR, 'config'), { recursive: true });
  let config = {};
  if (existsSync(configPath)) { try { config = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {} }
  if (!key) { console.log(JSON.stringify(config, null, 2)); return; }
  if (!value) { console.log(key + ' = ' + (config[key] || '(not set)')); return; }
  config[key] = value; writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Set ${key} = ${value}`);
}

switch (cmd) {
  case 'apply': await cmdApply(args[1]); break;
  case 'list': case 'ls': await cmdList(); break;
  case 'extensions': case 'ext': await cmdExtensions(); break;
  case 'backup': await cmdBackup(); break;
  case 'restore': await cmdRestore(); break;
  case 'config': await cmdConfig(args[1], args[2]); break;
  default: help(); break;
}
