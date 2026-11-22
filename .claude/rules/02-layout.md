---
paths:
  - "src/components/layout/**"
---
<!-- GENERATED from .agents/rules/02-layout.md by scripts/rules/sync.mjs. Do not edit. -->

# Layout components
- Recurring structure of the app, such as the Header. Built from UI
  components.
- Reads only `useThemeStore` and `useUserStore`. Never another store, the
  HTTP client or `axios`, and never a store action that calls the API
  (`signOut` is fine).
- Other data comes by props from the screen or a feature.
- `Name.web.tsx` only when web needs different code.
