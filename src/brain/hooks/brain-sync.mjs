#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const MAX_INPUT = 1024 * 1024;
const hostAt = process.argv.indexOf('--host');
const host = hostAt >= 0 ? process.argv[hostAt + 1] : null;
if (!['claude-code', 'codex'].includes(host)) fail(`--host must be claude-code or codex`);
const root = process.env.BRAIN_ROOT && path.resolve(process.env.BRAIN_ROOT);
if (!root) fail(`BRAIN_ROOT is required`);
const engine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'brain.mjs');
if (!fs.existsSync(engine)) fail(`brain engine not found at ${engine}`);

let input = '';
try { input = fs.readFileSync(0, 'utf8'); } catch (e) { fail(`cannot read hook input: ${e.message}`); }
if (Buffer.byteLength(input) > MAX_INPUT) fail(`hook input exceeds ${MAX_INPUT} bytes`);
let event;
try { event = JSON.parse(input); } catch (e) { fail(`malformed hook JSON: ${e.message}`); }
const phase = event.hook_event_name;
if (!['PreToolUse', 'PostToolUse'].includes(phase)) fail(`unsupported hook event '${String(phase)}'`);

function fail(message) { console.error(`brain hook: ${message}`); process.exit(2); }
function run(args) {
  return spawnSync(process.execPath, [engine, ...args], {
    cwd: root,
    env: { ...process.env, BRAIN_ROOT: root },
    encoding: 'utf8',
    timeout: 30000,
  });
}
function changedPaths() {
  if (host === 'claude-code') {
    if (!['Edit', 'Write'].includes(event.tool_name) || typeof event.tool_input?.file_path !== 'string')
      fail(`Claude Code ${phase} input must contain Edit|Write tool_input.file_path`);
    if (!path.isAbsolute(event.tool_input.file_path)) fail(`Claude Code tool_input.file_path must be absolute`);
    return [path.resolve(event.tool_input.file_path)];
  }
  if (event.tool_name !== 'apply_patch' || typeof event.tool_input?.command !== 'string')
    fail(`Codex ${phase} input must contain apply_patch tool_input.command`);
  const cwd = typeof event.cwd === 'string' ? event.cwd : root;
  const lines = event.tool_input.command.split(/\r?\n/);
  const paths = [];
  for (const line of lines) {
    if (!line.startsWith('*** ')) continue;
    const m = line.match(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/);
    if (m) paths.push(path.resolve(cwd, m[1]));
    else if (/^\*\*\* (?:Add File|Update File|Delete File|Move to):/.test(line)) fail(`malformed apply_patch path envelope '${line}'`);
  }
  return [...new Set(paths)].sort();
}
function config() {
  const p = path.join(root, 'brain', '__meta', 'config.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { fail(`cannot parse brain/__meta/config.json (${e.message})`); }
}
function workspaceInfo(c) {
  const workspace = path.resolve(root, typeof c.workspace_root === 'string' ? c.workspace_root : '.');
  let real = workspace; try { real = fs.realpathSync(workspace); } catch { /* lexical fallback */ }
  return { workspace, real };
}
function configuredSkill(file, c, workspace) {
  if (path.basename(file) !== 'SKILL.md' || !Array.isArray(c.skill_dirs)) return false;
  let realFile = file; try { realFile = fs.realpathSync(file); } catch { /* new/deleted path */ }
  for (const pattern of c.skill_dirs) {
    if (typeof pattern !== 'string' || !pattern || path.isAbsolute(pattern) || pattern.includes('**') || /[\[\]{}]/.test(pattern)) continue;
    const escaped = pattern.split(/[\\/]+/).map(part => part === '*' ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/');
    const rel = path.relative(workspace.workspace, file).split(path.sep).join('/');
    if (new RegExp(`^${escaped}(?:/.*)?$`).test(rel)) return true;
    const realRel = path.relative(workspace.real, realFile).split(path.sep).join('/');
    if (new RegExp(`^${escaped}(?:/.*)?$`).test(realRel)) return true;
  }
  return false;
}

const c = config(), workspace = workspaceInfo(c);
const sourceDir = path.resolve(root, 'brain', '__source');
const owned = changedPaths().map(file => {
  const directNode = path.dirname(file) === sourceDir && path.extname(file) === '.md';
  return directNode ? { kind: 'node', file, slug: path.basename(file, '.md') }
    : configuredSkill(file, c, workspace) ? { kind: 'skill', file } : null;
}).filter(Boolean);

if (phase === 'PreToolUse') {
  if (c.group === true && owned.some(item => item.kind === 'node'))
    fail(`group:true forbids direct brain/__source edits; read the current hash and use a CAS-bearing brain write`);
  for (const item of owned) {
    if (item.kind !== 'skill' || !fs.existsSync(item.file)) continue;
    const m = fs.readFileSync(item.file, 'utf8').match(/^<!-- materialized from brain: ([a-z0-9][a-z0-9-]*) -->$/m);
    if (m) fail(`${item.file} is DERIVED from the brain (skill node '${m[1]}') — edit brain/__source/${m[1]}.md instead; sync rewrites this file`);
  }
  process.exit(0);
}

const failures = [];
for (const item of owned) {
  if (item.kind === 'node') {
    if (fs.existsSync(item.file)) {
      if (fs.lstatSync(item.file).isSymbolicLink()) { failures.push(`${item.file}: source nodes must be direct files, not symlinks`); continue; }
      const lint = run(['lint', item.file]);
      if (lint.status !== 0) { failures.push(`${item.file}: ${String(lint.stderr || lint.stdout).trim() || 'lint failed'}`); continue; }
    }
    const sync = run(['sync', '--slug', item.slug]);
    if (sync.status !== 0) failures.push(`${item.file}: ${String(sync.stderr || sync.stdout).trim() || 'sync failed'}`);
  } else {
    const sync = run(['sync', '--skill', item.file]);
    if (sync.status !== 0) failures.push(`${item.file}: ${String(sync.stderr || sync.stdout).trim() || 'skill sync failed'}`);
  }
}
if (failures.length) fail(`${failures.length} reconciliation failure(s): ${failures.slice(0, 8).join(' | ')}`);
