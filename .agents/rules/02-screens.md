---
description: Screens - compose layout, features and UI
trigger: glob
globs: "src/screens/**"
alwaysApply: false
---

# Screens
- A screen composes layout, features and UI, like LEGO. Behavior that a
  screen does not own goes to a feature or a store.
- Location: `src/screens/public/` or `src/screens/private/<area>/`, one folder
  per screen with `<Screen>.tsx`, `index.ts` and `styles.ts`. Register routes
  in `NavigationStack.tsx` and their params in `src/screens/types.ts`.
- Data comes from stores (destructured). Never call `fetch`, `axios` or the
  HTTP client from a screen.
- A component or hook used only by this screen lives in the screen folder.
- `<Screen>.web.tsx` only when web needs different code, not for small style
  differences.
