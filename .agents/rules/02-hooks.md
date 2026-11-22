---
description: Hooks - reusable behavior with listeners, lifecycle or platform APIs
trigger: glob
globs: "src/hooks/**, src/**/use*.ts, src/**/use*.tsx"
alwaysApply: false
---

# Hooks
- A hook is for reusable behavior with listeners, lifecycle, cleanup or
  platform APIs (`useVoiceRecorder`, `useAppointmentStatusSocket`).
- Before writing one, check in order: a library, a store, a pure utility,
  plain component code.
- Never a hook that only returns store values or only organizes code.
- `src/hooks/` holds only hooks used by more than one component or screen.
  A single-use hook lives next to its consumer.
- Hooks never call the HTTP client or `axios`. Data received by a realtime
  hook goes to a store.
