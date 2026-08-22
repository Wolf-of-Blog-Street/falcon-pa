# falcon-pa

A business personal assistant with a brain. You talk to it in plain language; it
remembers your world — people, companies, meetings, obligations — and picks up where
it left off, session after session. It is not a coding tool: it speaks plainly, files
what matters, and answers from memory.

Works on **Mac, Linux, WSL, and native Windows**.

## The minimum you need to know

Your PA keeps **cards** — what it knows. **Records** — what happened. **Futures** —
what's to come. And your **focus** — what matters right now.

That sentence is the whole system. Here it is once, slowly:

- **Cards** are timeless truths. A person, a company, a project, a rule you set, a
  taste you have. Cards change as truth changes: Jacob moves city, his card moves
  with him — and the card keeps the history of the change.
- **Records** are the frozen past. A meeting that happened, a decision you made, an
  invoice you filed. Records never change — that is what makes them trustworthy.
- **Futures** are open items — things still going somewhere. Every future is one of
  **four kinds**, and telling your PA which kind you mean is the most useful habit
  you can build:

  | Kind | What it is | You say | It ends when |
  |------|-----------|---------|--------------|
  | **Action** | Something to do | "Send Acme the proposal by Friday" | Done → it becomes a record |
  | **Decision** | Something to decide | "I need to decide whether to renew the office lease by March" | Decided → the outcome is frozen as a record |
  | **Obligation** | Something you owe on a cycle | "I invoice the studio on the 1st every month" | Never — each cycle is filed and the date rolls forward |
  | **Event** | Something happening at a time | "Board call next Tuesday at 3" | It happens → it becomes a record of what took place |

- **Focus** is the short list of what matters right now. Things enter and leave
  focus as life moves; every session starts by reading it.

## How to talk to it

Naturally — but with the four kinds in mind. Examples of a normal day:

- *"I met Jacob from Acme today. He wants a proposal by Friday."*
  → A record (the meeting), cards (Jacob, Acme), and an action due Friday.
- *"What's due this week?"* → It reads the open futures and tells you.
- *"That lease thing — I decided. We're renewing."* → The decision freezes with its
  outcome. It will never ask again; it can always tell you when and what you decided.
- *"Did I invoice the studio last month?"* → It checks the obligation's filed cycles.
- *"What do we know about Acme?"* → The card, the meetings, the open items, the
  history — from memory, not from search.
- *"I prefer short calls before noon."* → Saved as a preference; it shapes plans
  from now on.
- *"Where were we?"* (new session) → It reads your focus and continues.

Useful habits:

- **Name the kind when it matters.** "That's a decision, not a task" files it right.
  Filed right, it comes back right.
- **Dump freely.** Give it a whole meeting in one breath; it sorts out what is worth
  keeping and skips what is not.
- **Ask before you re-tell.** It searches its memory first; if it knew, it answers.
- **Corrections stick.** "The deadline moved to Monday" updates the item and keeps
  the history of the change.

## Projects — how bigger things hang together

A **project** is anything with a goal and an end: a client engagement, an office
move, a product launch. It is a card like any other — what makes it a project is
what hangs off it: the actions, decisions, events, and obligations that drive it all
point at it.

- *"New project: the Acme rollout. First action: kickoff call by the 15th."*
- *"What's next for the Acme rollout?"* → the open futures pointing at it, in order.
- *"Add this to the rollout"* — anything you discuss can be hung on the project.
- Big projects nest: a project can contain smaller ones, and each keeps its own list.
- An active project belongs in **focus** (below) — that is what focus is for.
- When it ends, it closes — and the whole history stays: every meeting, every
  decision, every done action, still connected, still askable years later
  (*"how did we run the Acme rollout?"*).

## Focus, contexts, and abilities — how you build real roles

Three more ideas turn the PA from a notebook into a staff member:

**Focus — what matters right now.** A short list, read at the start of every session.
You steer it in plain words: *"Put the Acme deal in focus."* *"Drop the office move
from focus — it's done."* Things in focus come up first in everything the PA does.

**Contexts — the desks.** A context is a world of your life or business: `sales`,
`bookkeeping`, `wolf-network`, `home`. Everything belongs somewhere: people, projects,
rules, skills, tools. Say *"load the bookkeeping context"* and the PA sits down at
that desk: it reads the desk's own notes, sees everything on it, and ranks that world
first in every search. Several desks can be loaded at once; drop one when you leave
it. One desk — `pa` — is the base: your global rules live there.

**Skills and tools — the abilities on a desk.** A **skill** is a how-to the PA
follows: *"the monthly invoice run"*, *"how we onboard a client"* — written once,
followed every time, kept current. A **tool** is a real thing the PA uses: a script,
a service, a URL, a spreadsheet — recorded with how to run it. Skills and tools
attach to a desk and stay out of the way until that desk loads — load `bookkeeping`
and its abilities are in the PA's hands; in `sales` they never clutter the view.

**A desk + its skills + its tools + its rules = a role.** That is how you build one:

> *"New context: bookkeeping. Skill: the monthly invoice run — every 1st, generate
> invoices from the tracker, send drafts to me. Tool: the invoice generator at
> tools/invoice.py. Rule: never send an invoice without my sign-off."*

From then on, *"load bookkeeping and do the month"* is a complete instruction — the
desk carries the knowledge, the abilities, and the boundaries. Build one desk per
area of your life you want managed.

## What you need

- [Claude Code](https://claude.com/claude-code) (for `claude-pa`) and/or
  [Codex](https://github.com/openai/codex) (for `codex-pa`) — each asks you to sign
  in on first launch (Claude Code: an Anthropic account; Codex: an OpenAI account)
- Node.js ≥ 22.5
- Git (on native Windows: [Git for Windows](https://gitforwindows.org/) — Claude Code
  needs its Git Bash internally, even when you work in PowerShell)

## Install

**The easy way — let the agent do it.** Install
[Claude Code](https://claude.com/claude-code) or
[Codex](https://github.com/openai/codex), open it anywhere, and say:

> Read https://github.com/Wolf-of-Blog-Street/falcon-pa and install it for me as my
> PA, in a private folder.

The agent clones the repo, runs the setup, and walks you through the first run. The
manual steps below do the same thing by hand.

**Mac / Linux / WSL:**

```sh
# 1. Clone to a PRIVATE location — a filled PA holds your personal data
git clone https://github.com/Wolf-of-Blog-Street/falcon-pa.git my-pa && cd my-pa

# 2. Install the launchers (claude-pa, codex-pa) pointed at this clone
./bin/setup

# 3. Start
claude-pa        # or: codex-pa
```

(`bin/setup` puts the launchers in `~/.local/bin` — make sure it is on your PATH.)

**Windows (native, PowerShell):**

```powershell
git clone https://github.com/Wolf-of-Blog-Street/falcon-pa.git my-pa; cd my-pa
powershell -ExecutionPolicy Bypass -File bin\setup.ps1
claude-pa        # in a NEW terminal; or: codex-pa
```

(The script tells you the one PATH line to run if `%USERPROFILE%\.local\bin` is not on
your PATH yet. Codex on native Windows is newer — if it misbehaves, run `codex-pa`
under WSL with the Mac/Linux steps.)

**First run:** the PA notices it has no memory yet, installs its own brain from
`seeds/`, and asks your name and timezone. When Claude Code asks whether to trust the
folder and its settings, say yes — that is what turns on the session-start memory
hook. That is the whole setup.

## Updating and backing up

- **Update:** in your PA folder, `git pull`, then run the setup again
  (`./bin/setup` or `bin\setup.ps1`). Your memory is untouched — updates change the
  engine and teaching, never your data.
- **Back up:** the folder IS your assistant — memory included. Back it up like any
  important folder (a PRIVATE git remote works well: your memory is plain text and
  versions cleanly). Lose the folder without a backup and the memory is gone.

## What the PA keeps (the parts that are PA)

- **People, companies, places, projects** — the cards of your world, linked to each
  other with the reason for every link.
- **Meetings and conversations** — records with the substance distilled, not
  transcripts.
- **The four futures** — actions, decisions, obligations, events (see above). The
  due list, the "what's next", the recurring cycles.
- **Preferences** — your tastes, with who-said-it noted.
- **You** — a me card that learns what is important to you, what you like and
  dislike, and how you work. Short, budgeted, self-pruning. Never health, never
  private-life material — it omits or asks.
- **What it tried** — attempts that failed and why, so it does not repeat them.
- **Its questions** — things it needed to ask you, with your answers kept, so it
  asks once.

## What's inside (for the curious)

- **Brain engine:** falcon-brain **v2.0.1**, vendored at `src/brain/brain.mjs`, driven through
  the one entry point `./bin/brain` (`bin\brain.cmd` on Windows PowerShell)
  (release marked in `src/brain/VERSION`). Your memory is plain markdown files under
  `brain/` — readable, editable, yours. A disposable index serves fast reads. Zero
  dependencies beyond Node.
- **Seeds:** `seeds/` — the identity card, base desk, and focus templates the first
  run fills in, plus `config.pa.json` (the PA posture: schema locked, agent-log types
  disabled, votes off, attribution off).
- **Teaching:** `CLAUDE.md` (Claude Code) and `AGENTS.md` (Codex) carry the PA role,
  the first-run install, the session-start ritual, and the memory discipline.
  `config/pa-speak.md` is the plain-speech output style the setup installs.
- **Hooks:** `.claude/settings.json` + `bin/session-start.mjs` print your focus at
  every session start (cross-platform Node, no shell tricks).

## Privacy (hard line)

This public repo is the **bare template**. A filled clone holds its owner's personal
data: keep it in a private place, and never push personal data back here.
