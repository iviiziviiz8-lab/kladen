#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KLADEN_DIR = join(homedir(), '.kladen');
const XPUI_DIR = join(homedir(), 'AppData', 'Roaming', 'Spotify', 'Apps', 'xpui');

const args = process.argv.slice(2);
const cmd = args[0];

function help() {
  console.log(`
Kladen - Spotify Customization Toolkit

Usage:
  kladen apply <theme>   Apply a theme to Spotify
  kladen list            List installed themes
  kladen backup          Backup original Spotify files
  kladen restore         Restore from backup
  kladen config [key] [value]  View or set config
`);
}

async function findSpotify() {
  const paths = [
    XPUI_DIR,
    join(homedir(), 'AppData', 'Local', 'Spotify', 'Apps', 'xpui'),
    'C:\\Program Files\\Spotify\\Apps\\xpui',
    'C:\\Program Files (x86)\\Spotify\\Apps\\xpui',
  ];
  for (const p of paths) {
    if (existsSync(join(p, 'index.html'))) return p;
  }
  return null;
}

async function cmdList() {
  const themesDir = join(KLADEN_DIR, 'themes');
  if (!existsSync(themesDir)) {
    console.log('No themes installed. Add .css files to:', themesDir);
    return;
  }
  const files = readdirSync(themesDir).filter(f => f.endsWith('.css'));
  if (files.length === 0) {
    console.log('No themes found.');
  } else {
    console.log('Installed themes:');
    files.forEach(f => console.log('  - ' + f.replace('.css', '')));
  }
}

async function cmdBackup() {
  const xpui = await findSpotify();
  if (!xpui) { console.error('Spotify xpui not found.'); return; }
  const bakDir = join(KLADEN_DIR, 'backup');
  mkdirSync(bakDir, { recursive: true });
  copyFileSync(join(xpui, 'index.html'), join(bakDir, 'index.html'));
  console.log('Backup saved to:', join(bakDir, 'index.html'));
}

async function cmdRestore() {
  const bak = join(KLADEN_DIR, 'backup', 'index.html');
  const xpui = await findSpotify();
  if (!xpui) { console.error('Spotify xpui not found.'); return; }
  if (!existsSync(bak)) { console.error('No backup found.'); return; }
  copyFileSync(bak, join(xpui, 'index.html'));
  console.log('Restored from backup.');
}

async function cmdApply(themeName) {
  const xpui = await findSpotify();
  if (!xpui) { console.error('Spotify xpui not found.'); return; }

  if (!themeName) {
    console.error('Usage: kladen apply <theme-name>');
    return;
  }

  const cssPath = join(KLADEN_DIR, 'themes', themeName + '.css');
  if (!existsSync(cssPath)) {
    console.error('Theme not found:', themeName);
    await cmdList();
    return;
  }

  const htmlPath = join(xpui, 'index.html');
  const css = readFileSync(cssPath, 'utf-8');
  let html = readFileSync(htmlPath, 'utf-8');

  const tag = `<style id="kladen-css">${css}</style>`;
  if (html.includes('kladen-css')) {
    html = html.replace(/<style id="kladen-css">[\s\S]*?<\/style>/, tag);
  } else {
    html = html.replace('</head>', `  ${tag}\n</head>`);
  }

  mkdirSync(join(KLADEN_DIR, 'config'), { recursive: true });
  writeFileSync(join(KLADEN_DIR, 'config', 'current-theme'), themeName);
  copyFileSync(htmlPath, htmlPath + '.bak');
  writeFileSync(htmlPath, html);
  console.log(`Theme "${themeName}" applied! Restart Spotify.`);
}

async function cmdConfig(key, value) {
  const configDir = join(KLADEN_DIR, 'config');
  mkdirSync(configDir, { recursive: true });
  const configPath = join(configDir, 'settings.json');
  let config = {};
  if (existsSync(configPath)) {
    try { config = JSON.parse(readFileSync(configPath, 'utf-8')); } catch {}
  }
  if (!key) { console.log(JSON.stringify(config, null, 2)); return; }
  if (!value) { console.log(key + ' = ' + (config[key] || '(not set)')); return; }
  config[key] = value;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Set ${key} = ${value}`);
}

switch (cmd) {
  case 'apply': await cmdApply(args[1]); break;
  case 'list': case 'ls': await cmdList(); break;
  case 'backup': await cmdBackup(); break;
  case 'restore': await cmdRestore(); break;
  case 'config': await cmdConfig(args[1], args[2]); break;
  default: help(); break;
}
