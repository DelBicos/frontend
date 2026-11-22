---
description: Layout components - recurring app structure
trigger: glob
globs: "src/components/layout/**"
alwaysApply: false
---

# Layout components
- Recurring structure of the app, such as the Header. Built from UI
  components.
- Reads only `useThemeStore` and `useUserStore`. Never another store, the
  HTTP client or `axios`, and never a store action that calls the API
  (`signOut` is fine).
- Other data comes by props from the screen or a feature.
- `Name.web.tsx` only when web needs different code.
