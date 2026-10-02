# DelBicos app architecture

> "The architecture should make the correct implementation the obvious
> implementation."

A developer, human or agent, should be able to find, understand and safely
change a piece of code without learning unrelated abstractions. This document
explains *why* each rule exists. The rules themselves, short and imperative,
live in `.agents/rules/` and are what coding agents read.

## Principles

1. **Discoverability.** Every piece of code has one obvious place and one
   obvious shape.
2. **Explicit responsibility.** Each layer exists for a reason you can name.
3. **Minimum necessary architecture.** A new layer, folder or wrapper needs a
   concrete responsibility that nothing existing covers.
4. **Composition before inheritance.** The only class component is the map
   error boundary, because React requires a class for error boundaries.
5. **Libraries before home-made abstractions.** If a library solves it on its
   own, use it directly; a wrapper exists only for real integration.
6. **Abstract behavior, not appearance.** Unify only when intent and behavior
   are the same. The third copy of the same logic is the signal to extract.
7. **Consistency before local perfection.** A pull request follows the
   dominant pattern, even if something "more elegant" exists.
8. **Architecture changes are deliberate.** Proposal, discussion, agreement,
   migration plan, then implementation. Never inside a feature pull request.
9. **Visible exceptions.** A workaround stays evident where it is applied.
10. **Reviewability.** Code must be easy for someone else to review.
11. **The backend protects the business.** The app is not a trusted boundary.
    A rule the app repeats for a better experience is a mirror; the server
    stays the source of truth.

## Layers

The question for a component is not "smart or dumb?" but "is this UI, layout
or feature?".

- **Screens** compose layout, features and UI. When screen logic grows, it
  usually belongs to a feature or a store. Around 200 lines, or a lot of
  back-and-forth between internal functions, is a reason to look, never a
  hard limit.
- **UI components** are visual and generic, and receive data by props. A UI
  component that reads a store hides a dependency and can no longer be
  reused, so it may not import stores, not even their types.
- **Layout components** are recurring structure, such as the Header. They
  may read the theme and the session (`useThemeStore`, `useUserStore`)
  because every screen needs them, but they never trigger API calls (decision
  D3e).
- **Feature components** hold the behavior of one part of the product and may
  use stores.
- **Stores (decision D2).** Zustand stores are the only code that talks to an
  API. Typing, normalizing and reshaping responses in one place keeps
  components simple and makes every call easy to find. A separate `src/api/`
  layer would be a second place for the same responsibility. App state lives
  in stores rather than React Context for the same reason: one obvious place.
- **Hooks are a tool, not a way to organize code.** Before writing one, check
  a library, a store, a pure utility and plain component code. A hook earns
  its place with listeners, lifecycle, cleanup or platform APIs. A hook that
  only returns store values duplicates Zustand.
- **Utilities and integrations (decision D3a).** `src/utils/` holds pure,
  generic functions such as `isServiceAvailableNow`. A function that needs to
  understand what backend fields mean is domain logic and belongs to a store
  or feature. `src/lib/` holds only platform integrations: the HTTP client,
  Stripe, SSE, logger, analytics and push. Splitting "pure" from "talks to the
  platform" makes the right folder obvious; generic buckets such as
  `src/lib/helpers/` hide that difference and are not part of the allowlist.
- **Closed folder list (decision D3).** Top-level folders in `src/` and the
  three component categories are fixed. A new folder is a competing pattern
  without a team decision.
- **Colors come from the theme** (`useColors()`), so dark mode and future
  palette changes happen in one place.

## Anti-patterns

| Anti-pattern | Why it hurts |
| --- | --- |
| UI component reading a store or the API | Hidden dependency, no reuse |
| Giant screen | Mixes composition, logic and presentation |
| Hook created only to organize code | Indirection without responsibility |
| Hook that only returns store values | Duplicates Zustand |
| Utility for a trivial expression | `isDefined()` for something obvious in TypeScript |
| Abstraction by syntactic similarity | Erases differences of intent |
| Generic workaround | A local exception disguised as an official abstraction |
| New folder category inside a pull request | Competing pattern without a decision |

Objective signals (store import in UI, HTTP client outside stores, new
folder) can become CI checks. Subjective ones (unnecessary hook, utility with
domain logic, store used without destructuring) stay as review suggestions.

## Not decided yet

These were never discussed with concrete examples and must not become rigid
rules yet: server state versus app state in Zustand (cache, invalidation,
loading, optimistic updates), where each layer is tested, naming conventions,
the boundary between UI and feature in cases such as `ThemeToggle`, and when
a `.web.tsx` variant is worth it.

## How the agent rules work

- **Single source.** `.agents/rules/*.md`, in English, with frontmatter
  (`description`, `trigger`, `globs`, `alwaysApply`):
  - `00-core.md`: stack, architecture, code rules, governance. Every tool
    loads it in every conversation, so it stays short.
  - `01-overlay.md`: temporary initiatives and legacy exceptions, each with an
    owner and an expiry date.
  - `02-<layer>.md`, `03-tests.md`, `04-infra.md`: loaded only when the agent
    works on matching files.
- **Generated files.** `npm run rules:sync` (`scripts/rules/sync.mjs`) writes
  `AGENTS.md`, `CLAUDE.md` (imports `AGENTS.md`),
  `.github/copilot-instructions.md`, `.claude/rules/`, `.cursor/rules/`,
  `.github/instructions/` and `.claude/settings.json`. Every tool receives the
  same text without relying on imports. Generated files are never edited by
  hand.
- **Edit lock.** `.claude/settings.json` denies Claude Code edits to the rules
  and their enforcement. Other tools only have the governance text.
- **Local files.** Git hooks (`post-merge`, `post-checkout`, `post-rewrite`,
  installed by husky on `npm install`) run `sync.mjs --enforce`: they
  regenerate the outputs and move untracked instruction files to
  `.git/rules-quarantine/<date>/`. Nothing is deleted.
- **CI.** The `Rules` workflow fails when generated files differ from the
  source, and when a pull request adds instruction files outside the system,
  plan-like documents or logs.
- **CODEOWNERS.** Rules and enforcement files need approval from the rules
  owner, which closes the "rules maintenance" opening in the governance text.
- **Gradual adjustment.** Existing code outside the rules is not refactored in
  bulk. It is listed in `01-overlay.md`; an agent that edits such a file fixes
  that file and only the direct imports the fix needs, and asks before going
  further. The rules win over existing code, so a wrong pattern is never
  copied just because it exists.

The rules never tell an agent to read this document: that would spend tokens in
every conversation.

## Maintenance

A new rule is born from a repeated agent mistake, never from "maybe one day".

1. **Change a rule:** edit only the `.md` in `.agents/rules/`, run
   `npm run rules:sync`, and commit source and generated files together in a
   pull request that changes only rules, titled `chore(rules): ...`.
2. **New convention:** valid everywhere and one line long goes to the core;
   valid for one folder goes to that folder's layer.
3. **Temporary initiative:** a section in `01-overlay.md` with name, expiry
   date (up to 90 days) and owner; delete it when it ends.
4. **Token budget:** core around 60 lines; layers with 3 to 10 bullets that do
   not repeat the core; never `alwaysApply: true` on a layer.
5. **Personal preferences** live in each person's tool settings, never in the
   repository.
