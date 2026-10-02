---
applyTo: "src/**"
---
<!-- GENERATED from .agents/rules/01-overlay.md by scripts/rules/sync.mjs. Do not edit. -->

# Active overlays

### Legacy code outside the rules - expires 2026-12-31 - owner: @isabelmaito
- Goal: bring the files below into the rules gradually, only when a task
  edits them. There is no migration task.
- Temporary rules: the files exist and keep working. When a task edits one,
  apply the core rule for edited files (that file and the direct imports the
  fix needs; anything larger, stop and ask). Then tell the user the entry can
  leave this list.
- Do not: copy these files as a pattern, add new files next to them, or touch
  listed files the task does not need.
- HTTP outside stores: `src/hooks/useChatSession.ts`,
  `components/features/ChatBot/ChatWindow/hooks/useAppointmentPolling.ts`,
  `src/lib/hooks/LocationContext.tsx`, `useIBGE.ts`, `useServiceSearch.ts`,
  `src/utils/usePushNotifications.ts`, screens `AdminAnalytics`,
  `AdminDashboard`, `Services/ServiceForm`, `CheckoutScreen` (`.tsx`,
  `.web.tsx`), `Login`, `PaymentStatusScreen.web`, `RegisterScreen`,
  `VerificationScreen`.
- `src/api/` (arrives with `stag-facul`): API modules outside stores. Never
  add to it; new calls go to the store of the domain.
- Appointment rules mirrored on the client (arrive with `stag-facul` in
  `src/lib/appointments.ts` and `src/lib/booking.ts`: `canCancel`,
  `canReschedule`, `MIN_ADVANCE_HOURS`, `isSlotBookable` and the rest). Their
  place is `src/stores/Appointment/`, marked "mirror of server rules for UX
  only; the server stays the source of truth".
- UI reading stores: `ui/ThemeToggle`, `ui/AddressCard`, `ui/ProfessionalCard`.
- Layout reading location: `layout/Header/Header.web.tsx` uses `useLocation`
  from `LocationContext` (`useLocationStore` once location is a store).
- React Context for app state: `src/lib/hooks/AuthContext.tsx`,
  `LocationContext.tsx`.
- Folders outside the allowlist: `src/components/debug/`,
  `src/components/Services/`, `src/lib/helpers/` (`httpClient.ts` stays the
  HTTP client import path), `src/lib/utils/`, `src/lib/hooks/` (its
  `useColors.ts` duplicates the theme one), `src/lib/constants/`.
- Loose files in `src/components/features/` (no folder):
  `DashboardKpiCards.tsx`, `EarningsChart.tsx`, `ServicesByCategoryList.tsx`.
- Platform integrations in `src/utils/`: `clarity.ts`, `ga-web.ts`,
  `usePushNotifications.ts`. Domain logic in `src/utils/icons.ts`.
- Stores without `index.ts`, `types.ts` or `<Domain>.ts`: `Availability`,
  `Services`, `Unsplash`, `ViaCep`.
- Single-use hooks in `src/hooks/`: `useChatSession`, `useChatSocket`,
  `useServicesLastQuery`.
- Existing `any` (about 80 files), `console.*` (about 50) and literal colors
  outside `src/theme/` (about 50).
