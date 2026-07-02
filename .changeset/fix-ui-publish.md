---
"@construkt-kit/styled-system": patch
"@construkt-kit/ui": patch
---

Corrective republish of the 0.2.0 line.

`[email protected]` was published with unresolvable `workspace:*` internal deps
(bare `npm publish` didn't rewrite the protocol), and `styled-system` had lagged
`preset` since 0.1.3 — so `[email protected]` referenced tokens/recipes (semantic
palettes, CSS-var knobs) missing from the published `styled-system`.

This release regenerates `styled-system` from the current `preset` and republishes
`ui` with concrete dependency versions via the automated `changeset publish` flow.
`preset` and `styled-system` are now a Changesets `fixed` group so styled-system
can never lag preset again.
