---
applyTo: "src/lib/**"
---
<!-- GENERATED from .agents/rules/02-lib.md by scripts/rules/sync.mjs. Do not edit. -->

# Lib
- Only platform integrations: the HTTP client, Stripe (`stripe.ts` and
  `stripe.web.ts`), SSE, logger, analytics and push.
- A wrapper exists only when it adds real integration (configuration, token,
  platform split). A library that works on its own is used directly.
- Never add files to `src/lib/helpers/`, `src/lib/utils/`, `src/lib/hooks/`
  or `src/lib/constants/`. Pure functions go to `src/utils/`, hooks to
  `src/hooks/` or next to their consumer.
- An integration never holds app state; state lives in a store.
