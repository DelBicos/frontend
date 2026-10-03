---
description: Feature components - product behavior built from UI and stores
trigger: glob
globs: "src/components/features/**"
alwaysApply: false
---

# Feature components
- A feature is the behavior of one part of the product. It may use UI,
  layout and stores, never a screen.
- One folder per feature: `Name.tsx`, `index.ts`, `styles.ts`; sub-components
  and single-use hooks of the feature live inside its folder.
- Data and API calls go through stores. Never import `fetch`, `axios` or the
  HTTP client.
- Do not move global state into a UI component to shorten a feature; the UI
  stays generic and the feature passes props.
