---
entity: preference
description: <the preference, one line — e.g. mornings are deep-work, no exceptions>
date_created: <YYYY-MM-DD>
relations:
  - stated_by: <operator-slug>
    why: <who said it, when, in what context — provenance is mandatory>
---
The preference as stated, whether the operator marked it durable or situational, and what
it costs to violate. Preferences evolve in place; contradictions get resolved by recency +
the updated stack, not silent overwrite.

<!-- SEED TEMPLATE — a stated operator preference, with provenance. Razor:
name the future decision this preference will steer ("how does the operator want meetings
scheduled?"). Fence is the first bytes so it lints/imports cleanly. Install: the seed registers `preference` + `stated_by` (no register step), copy to
brain/__source/<slug>.md, fill every <placeholder>, then: brain lint … &&
brain sync --slug <slug>. NOTE — durable subject preferences that fit
the me card's typed fields (important_to/likes/dislikes/working_style) belong THERE, not in
a per-preference card (operator-model doctrine); use this card for preferences that don't.
Cross-pollination is the point of the merge: an agent's operator states preferences too —
this seed serves agent-subject stores as readily as the PA's. -->
