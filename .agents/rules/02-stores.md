---
description: Zustand stores - all API communication and app state
trigger: glob
globs: "src/stores/**"
alwaysApply: false
---

# Stores
- One folder per domain: `index.ts` (re-exports), `types.ts` (state, actions
  and payload types) and `<Domain>.ts` (`create<DomainStore>()(...)`, exported
  as `use<Domain>Store`).
- Stores call the API through `backendHttpClient` from
  `@lib/helpers/httpClient`, type payloads and normalize, merge and reshape
  responses so components receive ready data.
- Persistence uses `persist` from `expo-zustand-persist` with `AsyncStorage`.
- A client-side copy of a server rule (for example, whether an appointment
  can be cancelled) lives in the store of its domain with the comment
  "mirror of server rules for UX only; the server stays the source of truth".
- A store may read another store through `use<Other>Store.getState()`; never
  import a component or a screen.
