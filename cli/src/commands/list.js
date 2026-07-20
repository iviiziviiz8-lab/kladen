import { getKladenDir } from '../core/spotify.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export function getThemeDir(name) {
  return join(getKladenDir(), 'themes', name);
}

export async function list() {
  const themesDir = join(getKladenDir(), 'themes');
  if (!existsSync(themesDir)) {
    console.log('No themes installed.');
    console.log(`Place .css files in: ${themesDir}`);
    return;
  }

  const entries = await readdir(themesDir, { withFileTypes: true });
  const themes = [];

  for (const entry of entries) {
    if (entry.name.endsWith('.css')) {
      themes.push(entry.name.replace('.css', ''));
    } else if (entry.isDirectory()) {
      themes.push(entry.name);
    }
  }

  if (themes.length === 0) {
    console.log('No themes installed.');
  } else {
    console.log('Installed themes:');
    themes.forEach(t => console.log(`  - ${t}`));
  }

  console.log(`\nTheme directory: ${themesDir}`);
}
