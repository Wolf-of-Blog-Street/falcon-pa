---
entity: skill
description: Procedures for the brain memory engine (brain.mjs): the md-first contract, the session-start read order, write discipline, the removal decision tree, and pointers to the install/admin/upgrade ceremonies. Use at session start, before any brain write, and before removing any node.
date_created: 2026-08-23
date_updated: 2026-08-23
profile:
  name: brain
relations:
  - in_context: pa
    why: the brain-use procedure card rides the PA's base context
---
# brain — correct use of the memory engine

## The contract: the brain finds; your file tools read and write

- The CLI is **search plus special acts**. Use it to FIND slugs (`search`, `list`,
  `futures`, `relations`, `tools`, `skills`, `contexts`) and for the acts files cannot do:
  `roll`, `freeze`, `forget`, `recover`, `register`, `apply` (multi-node transactions),
  `sync`, `doctor`, `reindex`.
- **All content reading**: read the exact canonical Markdown path returned by the brain.
  Prefer the host's native Read tool when one exists. If Codex exposes no native Read,
  use its shell tool only as a bounded reader for that one returned path, for example
  `rg -n '^' -- '<absolute path returned by brain>'`. Never run `rg` over `brain/`, use
  `cat`/`sed` on store files, or turn shell access into a second corpus-search surface.
- **All ordinary writes**: the Edit/Write tools on the md. The vendored PostToolUse hook
  (`brain-sync.mjs`, on Claude Code and Codex) lints the file and updates the sqlite index automatically. If the
  hook reports a lint failure, fix the frontmatter immediately — the index was not
  updated.
- Treat CLI search output as pointers, not content — find the slug, then read that exact file
  with the host capability above.
- Skills are NORMAL brain nodes: the full instruction body lives in the skill node's md.
  Host `SKILL.md` files under configured `skill_dirs` are DERIVED (each carries a
  `materialized from brain` marker) — never edit them; edit the node and sync rewrites
  every host copy. An unmarked `SKILL.md` in a configured dir is adopted into a full node
  on the next sync.
- In a `group:true` store, direct `brain/__source/*.md` edits are blocked because a host
  edit cannot prove cross-session CAS. Read the current hash and use a CAS-bearing engine
  write instead. Direct configured `SKILL.md` edits remain allowed.

`brain <verb>` below means `BRAIN_ROOT="$STORE_ROOT" node <path-to-vendored>/brain.mjs <verb>`,
where `STORE_ROOT` is the root the store lives under. This skill is procedure only; reference
depth lives in `kit/README.md` and `INSTALL.md` in the `falcon-brain` component.

## Session start

The vendored SessionStart hook prints steps 1–2; read them, then continue:

1. Working memory: `brain get <working-memory-slug> --body`. Skip this step if the store's
   `__meta/config.json` has no `working_memory` key.
2. `brain focus show`.
3. `brain contexts`.
4. `brain context <base-context-slug>` — the card body plus the member roster in one read.
5. The bound standing orders: `brain relations <base-context-slug>` lists them; Read each
   card. Skip any order whose listing carries a status (`card·superseded`, `card·archived`,
   `card·dropped`) — a status-bearing order is rescinded, and reading it injects dead policy.

After any `git pull`, merge, or branch switch, run `brain sync` before any other brain command.
The index is derived from the tracked md files, and a pull changes those files.

## Write discipline

- Ordinary writes go through Edit/Write on the md (see The contract above); the hook lints
  and syncs. New nodes: Write the md with valid frontmatter (copy an existing node's shape,
  or a `kit/seeds/` template).
- Stamp `created_by` in frontmatter when authoring an md directly. Set
  `BRAIN_WHO=<writer name>` before every CLI write (`apply`, `roll`, `freeze`, …).
- The Edit/Write freshness guard is the race protection: if a write refuses because the
  file changed on disk, re-read and re-apply. Never bypass it with shell writes.
- Never edit the sqlite index.
- Before you mint a node, name the future question that retrieves it. No retrieving question,
  no node.

## Removal decision tree

Pick the branch that matches. Do not default to `forget`:

- Replaced by something better → supersede.
- Rescinded but was real policy → status-drop:
  `brain set <slug> --field status --to dropped`. The ruling stays readable as history;
  session-start readers already skip status-bearing orders.
- Should never have existed, or the operator says delete → unlink its edges
  (`brain relations <slug>` lists them), then `brain forget <slug>`.

## Ceremonies (by pointer)

All in the `falcon-brain` component:

- New store → `INSTALL.md` (the whole flow).
- Entity-type growth on a locked store → `INSTALL.md` § Admin mode. Follow the proposal path
  (a note whose description starts `schema proposal:`); never seek the unlock mid-task.
- Engine upgrades → `INSTALL.md` § Upgrading the engine, including the one-time release rituals.
- Seed templates and per-seed ceremonies → `kit/README.md` § Layout.

## Contract rule

Before the first use of any verb in a session, read its flag contract:

```
brain <verb> --help
```

Do not guess flags. A guessed flag is refused and wastes the turn; a wrong verb choice is
worse — check the removal decision tree first for anything destructive.
