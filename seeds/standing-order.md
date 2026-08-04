---
entity: standing-order
description: <one-line imperative — e.g. Never spend money without explicit authorization>
date_created: <YYYY-MM-DD>
relations:
  - issued_by: <operator-slug>
    why: <when/where the order was given>
---
The order, verbatim as issued, plus scope and any explicit exceptions the issuer named.
Standing orders are cards (they bind now); a rescinded order gets status + an updated entry,
never deletion. The status IS the rescission marker: session start skips any bound order
whose listing carries a status (reading a rescinded order injects dead policy).

<!-- SEED TEMPLATE — one card PER standing order, bound to a CONTEXT: global
orders bind the base context, scoped ones bind the context they gate. Session start loads
the context, then follows the binding explicitly (brain relations <base-context-slug> →
brain get <order-slug> --body, skipping any order whose listing carries a status — those are
rescinded) — get never traverses edges on its own. Razor: "what standing
orders bind me before I act?"
Fence is the first bytes so it lints/imports cleanly. Install: the seed registers `standing-order` + `issued_by` (no register step), copy to
brain/__source/<order-slug>.md, fill every <placeholder>, then: brain lint … && brain sync
--slug <order-slug> && brain link <context-slug> --verb bound_by --to <order-slug> --why "<why it binds now>". -->
