#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const hostAt = process.argv.indexOf('--host');
const host = hostAt >= 0 ? process.argv[hostAt + 1] : null;
if (!['claude-code', 'codex'].includes(host)) fail(`--host must be claude-code or codex`);
const root = process.env.BRAIN_ROOT && path.resolve(process.env.BRAIN_ROOT);
if (!root) fail(`BRAIN_ROOT is required`);
const engine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'brain.mjs');
if (!fs.existsSync(engine)) fail(`brain engine not found at ${engine}`);
try {
  const raw = fs.readFileSync(0, 'utf8');
  if (Buffer.byteLength(raw) > 1024 * 1024) fail(`hook input exceeds 1048576 bytes`);
  if (raw.trim()) JSON.parse(raw);
} catch (e) { fail(`malformed hook JSON: ${e.message}`); }

function fail(message) { console.error(`brain session hook: ${message}`); process.exit(2); }
function run(args) {
  const result = spawnSync(process.execPath, [engine, ...args], {
    cwd: root, env: { ...process.env, BRAIN_ROOT: root }, encoding: 'utf8', timeout: 30000,
  });
  if (result.status !== 0) fail(String(result.stderr || result.stdout).trim() || `${args.join(' ')} failed`);
  return result.stdout;
}

run(['sync']);
let c = {};
try { c = JSON.parse(fs.readFileSync(path.join(root, 'brain', '__meta', 'config.json'), 'utf8')); } catch { /* engine already diagnosed relevant config */ }
if (typeof c.working_memory === 'string' && c.working_memory) process.stdout.write(run(['get', c.working_memory, '--body']));
process.stdout.write(run(['focus', 'show']));
