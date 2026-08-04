#!/usr/bin/env node
// falcon-pa session-start hook — prints the working-memory brief and the focus bubble.
// Cross-platform (no shell, no jq): Claude Code runs hooks with cwd = the project dir.
// Silent when the brain is not installed yet (first run handles that).
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const engine = join(root, 'src', 'brain', 'brain.mjs');
const configPath = join(root, 'brain', '__meta', 'config.json');
if (!existsSync(engine) || !existsSync(configPath)) process.exit(0);

const run = (args) => {
  try {
    process.stdout.write(execFileSync(process.execPath, [engine, ...args], {
      env: { ...process.env, BRAIN_ROOT: root, NODE_NO_WARNINGS: '1' },
      encoding: 'utf8',
    }));
  } catch { /* best-effort: a brain problem never blocks the session */ }
};

let wm = '';
try { wm = JSON.parse(readFileSync(configPath, 'utf8')).working_memory || ''; } catch {}
if (wm) run(['get', wm, '--body']);
run(['focus', 'show']);
