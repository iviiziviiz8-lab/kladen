#!/usr/bin/env node
import { program } from 'commander';
import { apply } from '../src/commands/apply.js';
import { backup } from '../src/commands/backup.js';
import { restore } from '../src/commands/restore.js';
import { config } from '../src/commands/config.js';
import { list } from '../src/commands/list.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

program
  .name('kladen')
  .description('Your personal Spotify customization toolkit')
  .version(pkg.version);

program
  .command('apply')
  .description('Apply a theme to Spotify')
  .argument('[theme]', 'Theme name to apply')
  .action(apply);

program
  .command('backup')
  .description('Backup original Spotify files')
  .action(backup);

program
  .command('restore')
  .description('Restore Spotify from backup')
  .action(restore);

program
  .command('config')
  .description('View or set configuration')
  .argument('[key]', 'Config key')
  .argument('[value]', 'Config value')
  .action(config);

program
  .command('list')
  .alias('ls')
  .description('List available themes')
  .action(list);

program.parse();
