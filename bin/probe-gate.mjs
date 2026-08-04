#!/usr/bin/env node
// falcon-pa probe gate — RELEASE GATE, maintainer-only. Not CI, not end-user.
// Requires: the `claude` CLI installed AND signed in on this machine; Node >= 22.5;
// macOS/Linux. Spends real tokens. Builds a THROWAWAY template + seeded store in a
// temp dir, runs behavior probes through headless Claude Code (`claude -p`), asserts
// on the answer text AND the store state after. NEVER touches this repo's brain/.
// Usage: node bin/probe-gate.mjs      exit 0 = all probes passed.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODEL = 'sonnet';             // the product-default tier (haiku proved flaky at teaching-following, runs 1-6)
const PROBE_TIMEOUT_MS = 300_000;
const MAX_TURNS = '40';

// ---------- dates (local time; "next X" = 1..7 days ahead) ----------
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nextDow = dow => { const d = new Date(); do d.setDate(d.getDate() + 1); while (d.getDay() !== dow); return d; };
const TODAY = ymd(new Date()), TUE = ymd(nextDow(2)), FRI = ymd(nextDow(5));

// ---------- engine runner (canonical env; never the repo's own store) ----------
function brain(dir, args, input) {
  return spawnSync(process.execPath, [join(dir, 'src', 'brain', 'brain.mjs'), ...args], {
    input, encoding: 'utf8',
    env: { ...process.env, BRAIN_ROOT: dir, NODE_NO_WARNINGS: '1' },
  });
}
function seed(dir, args, input) {
  const r = brain(dir, args, input);
  if (r.status !== 0) { console.error(r.stdout, r.stderr); throw new Error(`seed failed: brain ${args.join(' ')}`); }
  return r.stdout;
}
const warnFree = dir => {
  const r = brain(dir, ['check', '--all']);
  return /not a registered field|unregistered/.test(r.stdout + r.stderr)
    ? 'store ends with an unregistered-field warn' : null;
};

// ---------- preflight ----------
const cv = spawnSync('claude', ['--version'], { encoding: 'utf8' });
if (cv.error || cv.status !== 0) { console.error('probe gate needs the `claude` CLI installed and signed in.'); process.exit(2); }

// ---------- build the throwaway template ----------
const work = mkdtempSync(join(tmpdir(), 'falcon-pa-gate-'));
const tpl = join(work, 'template');
mkdirSync(tpl);
for (const f of ['CLAUDE.md', 'AGENTS.md', '.claude', 'bin', 'src', 'seeds', 'config'])
  cpSync(join(ROOT, f), join(tpl, f), { recursive: true });   // NEVER brain/ or .brain/

mkdirSync(join(tpl, 'brain', '__source'), { recursive: true });
mkdirSync(join(tpl, 'brain', '__meta'), { recursive: true });
const cfg = JSON.parse(readFileSync(join(ROOT, 'seeds', 'config.pa.json'), 'utf8'));
cfg.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
writeFileSync(join(tpl, 'brain', '__meta', 'config.json'), JSON.stringify(cfg, null, 2) + '\n');
const card = (name, text) => writeFileSync(join(tpl, 'brain', '__source', name), text);
card('me.md', `---\nentity: me\ndescription: Pat Tester — whose brain this is\ndate_created: ${TODAY}\nprofile:\n  important_to: []\n---\n`);
card('pa.md', `---\nentity: context\ndescription: the PA base desk\ndate_created: ${TODAY}\nprofile:\n  name: PA\n  mission: the PA base desk\n---\n`);
card('focus.md', `---\nentity: context\ndescription: the bubble of happening — always active\ndate_created: ${TODAY}\nprofile:\n  name: Focus\n  mission: the bubble of happening — always active\n---\n`);
seed(tpl, ['sync']);
seed(tpl, ['link', 'me', '--verb', 'in_context', '--to', 'pa', '--why', 'the subject of the PA desk']);
seed(tpl, ['new', '--entity', 'person', '--slug', 'jim-bob', '--description', 'Jim Bob']);
seed(tpl, ['new', '--entity', 'place', '--slug', 'lacs', '--description', 'LACS — venue']);
seed(tpl, ['new', '--entity', 'event', '--slug', 'meeting-jim-bob', '--description', 'Meeting with Jim Bob at LACS', '--due', `${TUE}T14:00`]);
seed(tpl, ['set', 'meeting-jim-bob', '--field', 'profile.location', '--to', 'lacs']);
seed(tpl, ['link', 'meeting-jim-bob', '--verb', 'with', '--to', 'jim-bob', '--why', 'meeting attendee']);
seed(tpl, ['new', '--entity', 'action', '--slug', 'send-lease-renewal', '--description', 'Send the LACS lease renewal', '--due', FRI]);

// sanity gate — fail BEFORE spending tokens
if (brain(tpl, ['doctor']).status !== 0) { console.error('seed store: doctor unhealthy'); process.exit(2); }
const wk = seed(tpl, ['futures', '--window', 'week']);
if (!/meeting-jim-bob/.test(wk) || !/send-lease-renewal/.test(wk)) {
  console.error(`seed store: week window missed a seeded future (date boundary?) —\n${wk}`); process.exit(2);
}
if (warnFree(tpl)) { console.error('seed store not warn-free'); process.exit(2); }

// ---------- probes ----------
const PROBES = [
  { name: 'week', pins: 'futures cockpit — the shipped empty-week regression',
    prompt: "What's on for the coming week?",
    answer: [/jim.?bob/i, /lease|renewal/i] },
  { name: 'capture', pins: 'capture — spoken commitment lands as an action with a due date',
    prompt: 'I met Sarah Chen from Northwind today. She wants the proposal by Friday.',
    answer: [/sarah|proposal/i],
    store(dir) {
      const out = brain(dir, ['list', '--entity', 'action', '--fields', 'slug,due,description']).stdout;
      const rows = out.trim().split('\n').filter(l => l && !l.startsWith('send-lease-renewal'));
      if (!rows.some(r => r.includes(FRI) && /proposal/i.test(r)))
        return `no new action due ${FRI} mentioning the proposal:\n${out}`;
      return null;
    } },
  { name: 'unregistered-field', pins: 'never swallow a warn — the piped-grep regression',
    prompt: "Jim Bob's favourite colour is green — remember that.",
    store(dir) {
      if (!/green/i.test(brain(dir, ['search', 'green']).stdout)) return 'fact not stored anywhere';
      return null; // shared warn-free check does the rest
    } },
  { name: 'wrong-kind', pins: 'four kinds — a "task" that is a decision files as a decision',
    prompt: 'Add a task for me: decide by Friday whether to renew the LACS booking.',
    store(dir) {
      const n = brain(dir, ['list', '--entity', 'decision', '--count']).stdout.trim();
      return Number(n) >= 1 ? null : `no decision filed (decision count = ${n})`;
    } },
  { name: 'preference', pins: 'operator model — durable preference folds into memory',
    prompt: 'From now on I prefer short calls, always before noon.',
    store(dir) {
      const me = brain(dir, ['get', 'me']).stdout;
      const prefs = brain(dir, ['list', '--entity', 'preference', '--fields', 'slug,description']).stdout;
      return /noon/i.test(me + prefs) ? null : 'preference captured neither on me card nor as a preference card';
    } },
  { name: 'read-map', pins: 'read map — answers from relations/get, not guessing',
    prompt: 'What do we know about Jim Bob?',
    answer: [/meeting|lacs/i] },
  { name: 'freeze', pins: 'freeze — a done future becomes a frozen record',
    prompt: "I sent the LACS lease renewal today. It's done.",
    store(dir) {
      if (/send-lease-renewal/.test(brain(dir, ['futures', '--all']).stdout)) return 'action still open in futures';
      if (!/occurred:/.test(brain(dir, ['get', 'send-lease-renewal', '--raw']).stdout)) return 'action not frozen (no occurred date)';
      return null;
    } },
];

// ---------- run (sequential; fresh store per probe) ----------
let failed = 0;
for (const p of PROBES) {
  const dir = join(work, p.name);
  cpSync(tpl, dir, { recursive: true });
  const r = spawnSync('claude', ['-p', p.prompt, '--model', MODEL, '--max-turns', MAX_TURNS, '--dangerously-skip-permissions'], {
    cwd: dir, encoding: 'utf8', timeout: PROBE_TIMEOUT_MS,
  });
  const reasons = [];
  if (r.error) reasons.push(`claude did not run: ${r.error.message}`);
  else if (r.status !== 0) reasons.push(`claude exited ${r.status}: ${(r.stderr || '').slice(0, 400)}`);
  const text = r.stdout || '';
  for (const rx of p.answer || []) if (!rx.test(text)) reasons.push(`answer missing ${rx}`);
  if (p.store) { const why = p.store(dir); if (why) reasons.push(why); }
  const wf = warnFree(dir); if (wf) reasons.push(wf);
  if (reasons.length) {
    failed++;
    console.log(`FAIL ${p.name} — pins: ${p.pins}`);
    for (const why of reasons) console.log(`  - ${why}`);
    console.log(`  answer: ${text.replace(/\n/g, ' ').slice(0, 300)}`);
    console.log(`  kept for inspection: ${dir}`);
  } else {
    console.log(`PASS ${p.name}`);
    rmSync(dir, { recursive: true, force: true });
  }
}
rmSync(tpl, { recursive: true, force: true });
if (!failed) rmSync(work, { recursive: true, force: true });
console.log(failed ? `${failed}/${PROBES.length} probes FAILED` : `all ${PROBES.length} probes passed`);
process.exit(failed ? 1 : 0);
