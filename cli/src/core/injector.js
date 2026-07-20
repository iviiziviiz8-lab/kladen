import { readFile } from 'fs/promises';
import { join } from 'path';
import { getKladenDir } from './spotify.js';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { writeFile } from 'fs/promises';

export function injectCustomCss(html, cssContent) {
  const cssTag = `<style id="kladen-css" data-kladen>\n${cssContent}\n</style>`;
  if (html.includes('data-kladen')) {
    return html.replace(/<style id="kladen-css" data-kladen>[\s\S]*?<\/style>/, cssTag);
  }
  return html.replace('</head>', `  ${cssTag}\n</head>`);
}

export function injectCustomJs(html, jsContent) {
  const jsTag = `<script id="kladen-js" data-kladen>\n${jsContent}\n</script>`;
  if (html.includes('data-kladen-js')) {
    return html.replace(/<script id="kladen-js" data-kladen>[\s\S]*?<\/script>/, jsTag);
  }
  return html.replace('</body>', `  ${jsTag}\n</body>`);
}

export async function getThemeCss(themeName) {
  const themePaths = [
    join(getKladenDir(), 'themes', `${themeName}.css`),
    join(getKladenDir(), 'themes', themeName, 'theme.css'),
  ];
  for (const p of themePaths) {
    if (existsSync(p)) {
      return await readFile(p, 'utf-8');
    }
  }
  return null;
}

export async function saveActiveTheme(themeName) {
  const dir = join(getKladenDir(), 'config');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'current-theme'), themeName, 'utf-8');
}

export async function getActiveTheme() {
  try {
    const { readFile } = await import('fs/promises');
    return (await readFile(join(getKladenDir(), 'config', 'current-theme'), 'utf-8')).trim();
  } catch {
    return null;
  }
}
