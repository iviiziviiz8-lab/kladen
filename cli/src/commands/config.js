import { getKladenDir } from '../core/spotify.js';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const CONFIG_PATH = join(getKladenDir(), 'config', 'settings.json');

export async function config(key, value) {
  await mkdir(join(getKladenDir(), 'config'), { recursive: true });

  let settings = {};
  if (existsSync(CONFIG_PATH)) {
    try {
      settings = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
    } catch {}
  }

  if (!key) {
    console.log('Current config:');
    console.log(JSON.stringify(settings, null, 2));
    return;
  }

  if (!value) {
    console.log(`${key} = ${settings[key] || '(not set)'}`);
    return;
  }

  settings[key] = value;
  await writeFile(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  console.log(`Set ${key} = ${value}`);
}
