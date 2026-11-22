# RF03 — CRUD de Serviços (Frontend)

> **Requisito:** Permitir que profissionais cadastrem, editem, removam e consultem seus serviços. Clientes podem visualizar e filtrar serviços disponíveis no feed e agendar diretamente.

---

## 1. Visão Geral do Fluxo

```
[Dashboard do Parceiro]
        │
        ▼
[QuickAction "Serviços"] ──► [ServicesListScreen]
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼              ▼
                   [Criar]        [Editar]       [Remover]
                        └─────────────┴─────────────┘
                                      │
                                [ServiceForm]
                                      │
                             [AvailabilityManager]
                             (dias/horários do serviço)

[Feed / ListServices] ──► [ServiceCard] ──► [SubCategoryScreen] ──► [SearchResult] ──► [Checkout]
```

---

## 2. Arquivos Criados / Alterados

### 2.1 Stores (estado global)

| Arquivo                           | Status                | Responsabilidade                                             |
| --------------------------------- | --------------------- | ------------------------------------------------------------ |
| `src/stores/Services/Services.ts` | **Criado/Refatorado** | Store Zustand com todo o estado e operações CRUD de serviços |

#### `src/stores/Services/Services.ts`

- **Tipo exportado:** `ServiceItem` — representa um serviço com campos: `id`, `title`, `description`, `date`, `price_cents`, `duration`, `subcategory_id`, `banner_uri`, `active`, `category_id`, `availabilities[]`.
- **Métodos da store:**
  - `fetchServices(opts?)` — `GET /api/services` com filtros opcionais (`day`, `category_id`, `subcategory_id`, `q`). Normaliza campos variantes do backend (`Availabilities` vs `availabilities`, `price` vs `price_cents`).
  - `fetchMyServices(opts?)` — `GET /api/services/my` — lista apenas os serviços do profissional autenticado.
  - `reloadServices()` — refaz a última `fetchServices` com os mesmos filtros (armazenados em `lastQuery`).
  - `reloadMyServices()` — alias de recarga para `fetchMyServices`.
  - `createService(data)` — `POST /api/services` — cria e insere localmente na lista.
  - `updateService(id, data)` — `PUT /api/services/:id` — atualiza e substitui localmente.
  - `deleteService(id)` — `DELETE /api/services/:id` — remove da lista local imediatamente.
- **Persistência:** não persistida (Zustand simples sem `persist`), dados recarregados ao montar telas.

---

### 2.2 Telas (Screens)

#### `src/screens/private/professional/Services/ServicesList.tsx`

**Status: Criado**

Tela de gerenciamento de serviços do profissional (aba "Serviços" do portal do parceiro).

- Montagem: chama `fetchMyServices()` via `useEffect`.
- Exibe lista de serviços em `FlatList` com `ServiceCard` interno mostrando título, data e preço formatado (`formatBRL`).
- **Ações por item:**
  - **Editar** → abre `ServiceForm` em `Modal` com `editing = ServiceItem`.
  - **Remover** → exibe `Alert.alert` de confirmação → chama `deleteService(id)`.
- **Criar** → botão "Adicionar" no header → abre `ServiceForm` com `editing = null`.
- Suporta abertura automática do modal de criação via parâmetro de rota `openCreate` (usado pelo Dashboard).
- Registrada na aba `ProfessionalServicesTab` do `ProfessionalTabs` (NavigationStack).

---

#### `src/screens/private/professional/Services/ServiceForm.tsx`

**Status: Criado**

Formulário de criação e edição de serviço (abre em `Modal` full-screen via `ServicesList`).

- **Gerenciamento de formulário:** `react-hook-form` com `Controller`.
- **Campos:**
  - Título (`title`) — texto livre.
  - Descrição (`description`) — texto livre.
  - Preço (`price`) — campo com máscara de moeda BRL (`maskCurrency` / `unmaskCurrency`).
  - Duração (`duration`) — `CustomSelect` com opções de 15 min a 3h.
  - Categoria (`category_id`) — `CustomSelect` alimentado por `useCategoryStore`.
  - Subcategoria (`subcategory_id`) — `CustomSelect` filtrado pela categoria selecionada, alimentado por `useSubCategoryStore`.
  - Banner (`banner_uri`) — picker de imagem + upload direto para o Azure Blob Storage via URL temporária (`POST /api/uploads` → `PUT` na `uploadUrl`, com os `uploadHeaders`).
  - Ativo/Inativo (`active`) — `Switch`.
  - Disponibilidades (`availabilities`) — componente `AvailabilityManager`.
- **Submit (`onSubmit`):**
  - Monta payload com `price` como float (backend calcula `price_cents`).
  - Chama `createService` ou `updateService` dependendo de `initial`.
  - Após salvar, chama `reloadMyServices()` e `reloadServices()` e fecha o modal.
- **Proteção contra duplo-submit:** `submittingRef` + `Animated` no botão Salvar (opacidade reduzida durante envio).
- **Upload de banner:** URL temporária (SAS) + PUT direto no Azure Blob Storage; somente salva `banner_uri` no form após sucesso.

---

### 2.3 Componentes

#### `src/components/features/ListServices/index.tsx`

**Status: Criado/Refatorado**

Componente público de exibição de serviços no feed do cliente.

- **Filtros visuais:**
  - Chips horizontais por **Categoria** → ao selecionar, carrega subcategorias.
  - Chips horizontais por **Subcategoria** (aparece condicionalmente).
  - Toggle "Hoje" e "Disponível agora".
- **Carregamento:**
  - `useEffect` inicial e ao mudar filtros → chama `fetchServices(opts)` com `day`, `category_id` ou `subcategory_id`.
  - **Polling automático a cada 15s** enquanto a tela está em foco (`useIsFocused`).
  - **SSE real-time:** `initSSE()` registra listener em `new_service` → dispara `loadServices()` ao receber evento.
- **Filtro local "Disponível agora":** aplica `isServiceAvailableNow(service)` sobre a lista já carregada.
- Renderiza lista via `FlatList` com componente `ServiceCard`.

---

#### `src/components/features/ListServices/ServiceCard.tsx`

**Status: Criado**

Card de serviço exibido no feed público.

- Exibe: título, preço formatado, resumo de disponibilidade (até 3 dias/horários), badge "Disponível agora" via `isServiceAvailableNow`.
- Botão "Agendar" navega para `SubCategoryScreen` passando `categoryId` e `subcategory_id` para pré-selecionar a subcategoria correta.

---

#### `src/components/features/ServiceAvailability/AvailabilityManager.tsx`

**Status: Criado**

Componente embutido em `ServiceForm` para gerenciar os slots de disponibilidade do serviço.

- Permite adicionar/remover entradas com `dia da semana`, `horário de início` e `horário de fim`.
- Integrado ao `react-hook-form` via `Controller` no campo `availabilities`.
- Valor salvo como array de `{ day: number, start: string, end: string }`.

---

#### `src/components/debug/ServicesDebug.tsx`

**Status: Criado**

Componente de debug (apenas em `__DEV__`) que exibe o valor atual de `lastQuery` da store de serviços.

---

### 2.4 Utilitários e Hooks

#### `src/lib/utils/availability.ts`

**Status: Criado**

Função utilitária `isServiceAvailableNow(service: ServiceItem): boolean`:

- Verifica se o dia da semana atual e a hora atual estão dentro de algum slot `availabilities` do serviço.
- Usada em `ListServices` (filtro "Disponível agora") e `ServiceCard` (badge).

---

#### `src/hooks/useServicesLastQuery.ts`

**Status: Criado**

Hook seletor simples que expõe `lastQuery` da store de serviços. Usado pelo `ServicesDebug`.

---

#### `src/lib/sse.ts`

**Status: Criado**

Cliente SSE compatível com React Native (sem `EventSource` nativo).

- Implementado com `XMLHttpRequest` + `onprogress` para streaming de eventos.
- Expõe interface `addEventListener('new_service', handler)` e `removeEventListener`.
- Conecta em `GET /api/sse` com token de autorização.
- Usado em `ListServices` para receber eventos `new_service` em tempo real.

---

### 2.5 Navegação

#### `src/screens/NavigationStack.tsx`

**Alterado**

- Import de `ServicesListScreen` adicionado.
- Aba `ProfessionalServicesTab` registrada em `ProfessionalTabs` com ícone "wrench" e título "Serviços".
- Suporta parâmetro `openCreate` para abrir o formulário diretamente ao navegar.

---

#### `src/screens/private/ProfessionalDashboard.tsx`

**Alterado**

- `QuickAction` "Serviços" adicionado ao scroll horizontal de ações rápidas.
- `onPress` navega para `ProfessionalServicesTab` com `{ openCreate: true }`.

---

### 2.6 Telas de Agendamento (integração com RF03)

#### `src/screens/public/SearchResultScreen/SearchResultScreen.tsx`

**Alterado**

- Consome serviços indiretamente via `fetchProfessionalsByAvailability` que filtra profissionais com serviços disponíveis na data/subcategoria escolhida.
- Exibe resultados como lista de `ProfessionalResultCard`.

---

## 3. Endpoints de Backend Consumidos

| Método   | Rota                                     | Descrição                                    | Store/Componente                   |
| -------- | ---------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `GET`    | `/api/services`                          | Lista serviços públicos com filtros          | `fetchServices`                    |
| `GET`    | `/api/services/my`                       | Lista serviços do profissional autenticado   | `fetchMyServices`                  |
| `POST`   | `/api/services`                          | Cria novo serviço                            | `createService`                    |
| `PUT`    | `/api/services/:id`                      | Edita serviço existente                      | `updateService`                    |
| `DELETE` | `/api/services/:id`                      | Remove serviço                               | `deleteService`                    |
| `POST`   | `/api/uploads`                           | Solicita presigned URL para upload de banner | `ServiceForm`                      |
| `GET`    | `/api/sse`                               | Stream SSE de eventos do sistema             | `src/lib/sse.ts`                   |
| `GET`    | `/api/professionals/search-availability` | Busca profissionais com disponibilidade      | `fetchProfessionalsByAvailability` |

---

## 4. Diagrama de Dependências

```
ProfessionalDashboard
  └─► [navega] ProfessionalServicesTab
                └─► ServicesList (tela)
                      ├─► useServicesStore (fetchMyServices, deleteService)
                      └─► ServiceForm (modal)
                            ├─► useServicesStore (createService, updateService)
                            ├─► useCategoryStore
                            ├─► useSubCategoryStore
                            └─► AvailabilityManager

Feed (tela pública)
  └─► ListServices (componente)
        ├─► useServicesStore (fetchServices)
        ├─► useCategoryStore
        ├─► useSubCategoryStore
        ├─► isServiceAvailableNow (lib/utils)
        ├─► initSSE (lib/sse) ──► SSE real-time
        └─► ServiceCard
              └─► isServiceAvailableNow
              └─► [navega] SubCategoryScreen ──► SearchResultScreen ──► Checkout
```

---

## 5. Resumo de Arquivos por Categoria

| Categoria          | Arquivo                                                               | Status            |
| ------------------ | --------------------------------------------------------------------- | ----------------- |
| Store              | `src/stores/Services/Services.ts`                                     | Criado/Refatorado |
| Tela (parceiro)    | `src/screens/private/professional/Services/ServicesList.tsx`          | Criado            |
| Tela (parceiro)    | `src/screens/private/professional/Services/ServiceForm.tsx`           | Criado            |
| Componente (feed)  | `src/components/features/ListServices/index.tsx`                      | Criado/Refatorado |
| Componente (feed)  | `src/components/features/ListServices/ServiceCard.tsx`                | Criado            |
| Componente (form)  | `src/components/features/ServiceAvailability/AvailabilityManager.tsx` | Criado            |
| Componente (debug) | `src/components/debug/ServicesDebug.tsx`                              | Criado            |
| Utilitário         | `src/lib/utils/availability.ts`                                       | Criado            |
| Utilitário (SSE)   | `src/lib/sse.ts`                                                      | Criado            |
| Hook               | `src/hooks/useServicesLastQuery.ts`                                   | Criado            |
| Navegação          | `src/screens/NavigationStack.tsx`                                     | Alterado          |
| Dashboard          | `src/screens/private/ProfessionalDashboard.tsx`                       | Alterado          |
