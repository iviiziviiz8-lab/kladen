import { findSpotify, backupOriginal, getBackupDir } from '../core/spotify.js';

export async function backup() {
  const spotifyDir = findSpotify();
  if (!spotifyDir) {
    console.error('Spotify not found.');
    process.exit(1);
  }

  const dest = await backupOriginal();
  console.log(`Backup saved to: ${dest}`);
}
