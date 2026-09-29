# DelBicos — frontend (Expo / React Native / TypeScript)

Site e app que conectam clientes e profissionais. O backend fica em `../backend` (mesma branch: `refactor/estrutura-seguranca`).

**Leia primeiro:** `docs/CONTINUAR_DESENVOLVIMENTO.md` (estado do refactor, próximo passo e pendências).

## Regras do projeto
- Só faça commit/push quando o usuário pedir.
- Sem `any` e sem `console.*` (ESLint bloqueia). Logs: `@lib/logger`. Erros de API: `getApiErrorMessage` (`@api/errors`) ou `errorMessage` (`@lib/utils/errors`).
- Cores só do tema (`useColors()` / `src/theme`); nada de hexadecimal novo nas telas. Botão primário = laranja com texto preto.
- Navegação: `useAppNavigation()` (`@screens/useAppNavigation`). Estilos só-web: `webStyle()` e `WebPressableState` (`@lib/types/web`).
- Arquivos abaixo de 600 linhas (teste em `src/__tests__/codeQuality.test.ts`).
- `ios/` e `android/` não são versionados (gerados por `expo prebuild`).
- Regras de agendamento/cancelamento espelham o servidor: `src/lib/appointments.ts`, `src/lib/booking.ts`. Mudou uma, mude a outra.
- Textos da interface em português do Brasil.

## Checagens antes de entregar
`npx tsc --noEmit && npm run lint && npx jest`

## Ambiente
Backend rodando com `npm run docker:dev` (em `../backend`); app com `npm run ios` ou `npm start` (web em http://localhost:8081).
