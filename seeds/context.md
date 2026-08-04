---
entity: context
description: <one line: what this world is>
date_created: <YYYY-MM-DD>
profile:
  name: <display name, e.g. "Wolf Network">
  mission: <one line: what this world is FOR — the roster line brain contexts prints>
---
<optional free prose about this world — no prescribed sections; the body may be empty>

<!-- SEED TEMPLATE — a CONTEXT card: a world of relevance (a desk you sit
down at), not a persona. The operator loads one by command ("load the wolf network
context"); nothing loads ambiently. Every install mints ONE base context — for a PA store
that is `pa`, the always-on desk global standing orders bind to. Razor: "what world am I
working in, and what does it contain?" The body is FREE-FORM AND OPTIONAL: the mission
one-liner lives in profile.mission (the context read prints it in the header), and
boundaries are standing-order cards bound via bound_by edges on THIS card — brain
relations <this-context-slug> lists them; skip any order whose listing carries a status
(superseded/archived/dropped = rescinded). Fence is the first bytes so it lints/imports
cleanly. Install: copy to <pa-store>/brain/__source/<slug>.md, fill every <placeholder>,
then: brain lint … && brain sync --slug <slug>. Members attach child-side, on the thing:
brain link <thing> --verb in_context --to <this-context-slug> --why "…". Orders bind:
brain link <this-context-slug> --verb bound_by --to <order-slug> --why "…". -->
