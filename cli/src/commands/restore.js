import { getBackupDir, getXpuiDir } from '../core/spotify.js';
import { existsSync } from 'fs';
import { copyFile } from 'fs/promises';
import { join } from 'path';

export async function restore() {
  const backupPath = join(getBackupDir(), 'index.html');
  if (!existsSync(backupPath)) {
    console.error('No backup found at:', backupPath);
    process.exit(1);
  }

  const originalPath = join(getXpuiDir(), 'index.html');
  await copyFile(backupPath, originalPath);
  console.log('Spotify restored from backup.');
}
