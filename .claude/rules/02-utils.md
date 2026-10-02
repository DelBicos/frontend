---
paths:
  - "src/utils/**"
---
<!-- GENERATED from .agents/rules/02-utils.md by scripts/rules/sync.mjs. Do not edit. -->

# Utils
- Pure functions only: same input, same output, no I/O, no React, no store.
  Examples: `isServiceAvailableNow`, `isValidCPF`, unit conversions.
- If a function needs to know what a backend field means, it belongs to a
  store or a feature.
- Never wrap a trivial expression or a library call that is already clear.
- Platform integrations (analytics, push, SDKs) go to `src/lib/`, not here.
