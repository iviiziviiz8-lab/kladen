import { findSpotify, backupOriginal, readIndexHtml, writeIndexHtml } from '../core/spotify.js';
import { getThemeCss, injectCustomCss, saveActiveTheme, getActiveTheme } from '../core/injector.js';
import { getThemeDir } from './list.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function apply(themeName) {
  const spotifyDir = findSpotify();
  if (!spotifyDir) {
    console.error('Spotify not found. Is it installed?');
    process.exit(1);
  }

  if (!themeName) {
    themeName = await getActiveTheme();
    if (!themeName) {
      console.error('No theme specified and no active theme found.');
      console.log('Usage: kladen apply <theme-name>');
      console.log('Themes:', await listThemes());
      process.exit(1);
    }
    console.log(`Re-applying active theme: ${themeName}`);
  }

  let css = await getThemeCss(themeName);
  if (!css) {
    console.error(`Theme "${themeName}" not found.`);
    console.log('Available themes:', await listThemes());
    process.exit(1);
  }

  console.log(`Backing up original Spotify files...`);
  await backupOriginal();

  let html = await readIndexHtml();

  // Inject custom CSS
  html = injectCustomCss(html, css);

  // Inject custom JS (if exists)
  const jsPath = join(getThemeDir(themeName), `${themeName}.js`);
  if (existsSync(jsPath)) {
    const js = await readFile(jsPath, 'utf-8');
    html = injectCustomJs(html, js);
  }

  await writeIndexHtml(html);
  await saveActiveTheme(themeName);

  console.log(`Theme "${themeName}" applied successfully!`);
  console.log('Restart Spotify to see the changes.');
}

async function listThemes() {
  const { readdir } = await import('fs/promises');
  const dir = join(process.env.HOME || process.env.USERPROFILE, '.kladen', 'themes');
  try {
    const files = await readdir(dir);
    return files
      .filter(f => f.endsWith('.css'))
      .map(f => f.replace('.css', ''))
      .join(', ');
  } catch {
    return '(no themes installed)';
  }
}
