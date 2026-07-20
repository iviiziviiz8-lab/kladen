import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { readFile, copyFile, mkdir } from 'fs/promises';

const APPDATA = join(homedir(), 'AppData', 'Roaming', 'Spotify');
const XPUI = join(APPDATA, 'Apps', 'xpui');
const KLADEN_DIR = join(homedir(), '.kladen');

export function findSpotify() {
  const paths = [
    APPDATA,
    join(process.env.LOCALAPPDATA || '', 'Spotify'),
    'C:\\Program Files\\Spotify',
    'C:\\Program Files (x86)\\Spotify',
  ];
  for (const p of paths) {
    if (existsSync(join(p, 'Spotify.exe')) || existsSync(join(p, 'spotify.exe'))) {
      return p;
    }
  }
  if (existsSync(XPUI)) return APPDATA;
  return null;
}

export function getXpuiDir() {
  return XPUI;
}

export function getKladenDir() {
  return KLADEN_DIR;
}

export function getBackupDir() {
  return join(KLADEN_DIR, 'backup');
}

export async function backupOriginal() {
  const backupDir = getBackupDir();
  const htmlPath = join(XPUI, 'index.html');
  if (!existsSync(htmlPath)) throw new Error('Spotify xpui/index.html not found');

  await mkdir(backupDir, { recursive: true });
  const dest = join(backupDir, 'index.html');
  await copyFile(htmlPath, dest);
  return dest;
}

export async function readIndexHtml() {
  const path = join(XPUI, 'index.html');
  return await readFile(path, 'utf-8');
}

export async function writeIndexHtml(content) {
  const path = join(XPUI, 'index.html');
  await copyFile(path, join(XPUI, 'index.html.kladen.bak'));
  const { writeFile } = await import('fs/promises');
  await writeFile(path, content, 'utf-8');
}
