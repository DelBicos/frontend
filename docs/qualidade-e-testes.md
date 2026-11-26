# Plano de testes — App

> App do DelBicos: Expo 54 + React Native (web, Android e iOS), TypeScript, Zustand e React Navigation.
> Versão de 26/11/2026, escrita sobre a `stag` daquele dia. O plano da API fica em `DelBicos/backend`, em `docs/qualidade-e-testes.md`.

## 1. Origem e o que mudou

Este plano reaproveita os documentos da disciplina de Qualidade e Testes de Software (set. e out. de 2026) e os confronta com o código atual:

| Documento antigo | O que foi reaproveitado | O que estava desatualizado |
| --- | --- | --- |
| TQS — Entrega 1 (plano e casos de teste) | Itens FE-01 a FE-16, níveis e tipos de teste, critérios, papéis | Telas de foto do serviço e aprovação do cliente não existem; o acompanhamento segue os estados atuais da API (seção 6) |
| Análise de valores limites — avatar | Casos de tipo, nome e arquivo ausente | Na web a foto agora passa por recorte e sai como JPEG de 512 px; a falha "sem retorno visual da rejeição" foi corrigida com aviso na tela (seção 7) |
| Casos de teste UML — Check-in/Check-out | Cobertura de estados e transições | Os estados mudaram; o app só exibe e dispara as transições que a API faz |
| Testes unitários do agendamento | Caso das stores (`AppointmentStore`) | Os casos de API ficam no plano do backend |

## 2. Objetivo

- Garantir que stores, regras de tela e fluxos críticos (login, agendamento, pagamento, acompanhamento, chat) funcionem na web e no app.
- Impedir regressões: toda PR roda lint, typecheck e testes; o deploy do site no Azure só sai se os três passarem.
- Atingir e manter **80% de cobertura de linhas** (RNF-06), por etapas (seção 12).

## 3. Escopo

**Incluído:** login, cadastro e verificação; feed, categorias e busca; perfil do profissional; checkout e status do pagamento; meus agendamentos e gestão (cancelar, reagendar, disputa, avaliação); deslocamento e acompanhamento no mapa; código de início e fim do serviço; chat e chatbot (texto e voz); perfil do cliente (dados, foto, endereços, senha, verificação, notificações); dashboard e ganhos do profissional; painel admin (estatísticas, disputas, verificações); tickets de suporte; tema escuro e alto contraste; navegação.

**Excluído:** testes em iPhone real (sem aparelho; validação na web e no Android); acessibilidade WCAG completa (só verificação funcional de leitor de tela, VLibras e contraste); carga.

## 4. Itens a testar

Atualizados a partir da Entrega 1.

| ID | Item | Prioridade | Onde é testado hoje |
| --- | --- | --- | --- |
| FE-01 | Login, cadastro e verificação (MFA) | Alta | `stores/User` (sessão, MFA); telas: lacuna |
| FE-02 | Feed e categorias | Média | `screens/public/Feed`, `stores/Category` |
| FE-03 | Busca por categoria, subcategoria e proximidade | Alta | `stores/Professional`, `stores/SubCategory`; telas: lacuna |
| FE-04 | Perfil do profissional | Média | `stores/Professional`; tela: lacuna |
| FE-05 | Checkout e status do pagamento | Alta | Lacuna |
| FE-06 | Meus agendamentos e gestão | Alta | `stores/Appointment`, `AppointmentManage`, `AppointmentDetailsModal` |
| FE-07 | Deslocamento e acompanhamento | Crítica | `TodayVisitCard`; `Deslocamento` e mapa: lacuna |
| FE-08 | Código de início e fim do serviço | Crítica | Lacuna |
| FE-10 | Chat (lista, conversa, socket, reenvio) | Alta | `stores/Chat`; telas e `useChatSocket`: lacuna |
| FE-11 | Perfil do cliente | Média | `MenuNavegacao`, `TrocarSenhaForm`, stores de endereço e favoritos |
| FE-12 | Chatbot e comando de voz | Alta | `components/features/ChatBot`, `lib/chatbot`, `useChatVoice`, `stores/ChatBot` |
| FE-13 | Dashboard do profissional | Alta | `ProfessionalDashboard`, `stores/Dashboard` |
| FE-14 | Painel admin | Alta | `stores/Admin`; telas: lacuna |
| FE-15 | Tema e acessibilidade | Média | `theme`, `stores/Theme` |
| FE-16 | Navegação | Média | `BottomNav` |
| FE-17 | Tickets de suporte | Média | `stores/Ticket`, `components/features/Tickets`, telas de tickets |
| FE-18 | Foto de perfil com recorte | Média | `ImageCropModal/cropMath`; modal e envio: lacuna |

FE-09 (foto do serviço) da Entrega 1 não foi implementado e fica fora até existir.

## 5. Estratégia

| Nível | Foco | Ferramenta | Onde |
| --- | --- | --- | --- |
| Unitário | Stores, utils, `lib`, hooks, funções puras | Jest (`jest-expo`), HTTP mockado | `__tests__/` ao lado do código |
| Componente | Telas e componentes renderizados, interação | `@testing-library/react-native` | `__tests__/` ao lado do componente |
| Sistema (E2E) | Fluxos completos contra o Azure | Manual, web e Android | Roteiro na seção 8 |
| Aceitação | Demonstração para professores e banca | Manual | — |

Convenções (de `.agents/rules/03-tests.md`):
- Mockar o cliente HTTP e os módulos nativos; teste nunca acessa a rede.
- Teste de store dispara a ação e confere o estado por `use<Domínio>Store.getState()`.
- Teste de tela segue os de tickets e chatbot: renderiza com a Testing Library, interage e confere o texto e as chamadas à store.
- Nunca apagar, pular ou afrouxar um teste para uma mudança passar.

## 6. Acompanhamento do agendamento

O app mostra e dispara as transições que a API controla (detalhes no plano do backend):

`pending` → `confirmed` → `in_transit` → `arrived` → `in_progress` → `completed`, com saídas para `canceled` (de `pending` ou `confirmed`) e `no_show` (de `confirmed`).

| Caso | O que o app precisa fazer | Testado |
| --- | --- | --- |
| AC-01 | Cada status aparece com o rótulo e a ação certos para cliente e profissional | Parcial (`TodayVisitCard`, `AppointmentDetailsModal`) |
| AC-02 | Profissional marca "a caminho" e o cliente vê o mapa | Não |
| AC-03 | "Cheguei" fora do raio de 300 m mostra o erro da API | Não |
| AC-04 | Código errado no início ou no fim mostra o erro e não muda o status | Não |
| AC-05 | Cancelar só aparece em `pending` e `confirmed`, com a prévia de retenção | Parcial (`AppointmentManage`) |
| AC-06 | Avaliação só aparece em `completed` | Não |

## 7. Foto de perfil (valores limite)

Atualizado a partir da análise de valores limites do avatar.

| ID | Caso | Esperado hoje | Testado |
| --- | --- | --- | --- |
| AV-01 | JPG ou PNG escolhido na web | Abre "Ajustar foto"; o envio é um JPEG quadrado de 512 px | Cálculo: sim; modal: não |
| AV-02 | Arrastar e zoom (1× a 3×) | A imagem nunca deixa área vazia no círculo | Sim (`cropMath`) |
| AV-03 | Seletor de arquivos | Só oferece imagens (`mediaTypes: Images`) | Não |
| AV-04 | Imagem que o navegador não abre | Mensagem "Não foi possível abrir esta imagem." | Não |
| AV-05 | Falha no envio | Aviso de erro na tela, foto anterior mantida | Não |
| AV-06 | Cancelar o recorte | Nada é enviado | Não |
| AV-07 | App nativo | Recorte do sistema (`allowsEditing`), sem o modal | Manual |

Os casos de tipo e tamanho do lado do servidor estão no plano do backend.

## 8. Roteiro manual (sistema)

Em `https://azure.delbicos.com.br` e no Android, com a conta de teste de cliente e a de profissional (credenciais com o analista de testes, fora do repositório):

1. Login, busca, perfil do profissional, agendamento e pagamento com cartão de teste do Stripe.
2. Chat: mensagens nos dois lados, histórico ao reabrir, reenvio de mensagem que falhou.
3. Profissional: a caminho, cheguei, início e fim com o código; cliente acompanha no mapa.
4. Avaliação, cancelamento e reagendamento.
5. Foto de perfil com recorte.
6. Tema escuro e alto contraste nas telas acima.

## 9. Lacunas conhecidas

| Área | Cobertura | Ação |
| --- | --- | --- |
| `screens/public` (login, cadastro, checkout, busca) | 1% | Testes de tela, começando por checkout e login |
| `screens/private` (agendamentos, deslocamento, admin, perfil) | 8% | Testes de tela para FE-06 a FE-08 primeiro |
| `components/ui` | 6% | Testes de componente para os mais usados |
| `components/features` | 22% | Acompanhamento, mapa e modais de agendamento |
| `hooks` e `lib/hooks` | 9–22% | `useChatSocket`, rastreamento de deslocamento |

## 10. Critérios de entrada e saída

**Entrada:** `npm ci` sem erro; `npm run lint` e `npm run typecheck` limpos.

**Saída de uma PR:** lint, typecheck e testes verdes no CI (o deploy do site depende disso); nenhum teste removido ou pulado; teste novo para regra nova ou bug corrigido.

**Saída de uma entrega:** cobertura no mínimo da etapa vigente (seção 12); 100% dos itens críticos (FE-07, FE-08) com teste automatizado; roteiro manual executado na web e no Android; 0 defeitos bloqueantes abertos.

## 11. Como rodar

```bash
npm test                 # todos os testes
npm run test:coverage    # com relatório em coverage/
npm run lint && npm run typecheck
```

## 12. Cobertura

| Data | Linhas | Ramos | Funções | Observação |
| --- | --- | --- | --- | --- |
| 26/11/2026 | 24,5% | 19,2% | 22,2% | `stag` após a #198; stores entre 85% e 100%, telas e componentes abaixo de 25% |

Meta: 80% de linhas, em etapas. A cada etapa atingida, o mínimo vai para o `coverageThreshold` do `jest.config.js`, para o CI barrar quedas. A ordem segue a prioridade da seção 4: lógica (stores, utils, lib, hooks), depois os itens críticos e de prioridade alta, depois o restante.

## 13. Papéis

| Papel | Responsabilidade | Responsável |
| --- | --- | --- |
| Analista de testes | Manter este plano, os casos e o relatório | Douglas |
| QA / testador | Executar o roteiro manual e registrar defeitos | Gustavo |
| Desenvolvedores frontend | Escrever os testes junto com as telas e corrigir defeitos | Isabel, Fernando R., Lucas, Iago |
| Analista de requisitos | Validar regras de negócio | Fernando L. |
| Product owner | Priorizar e aceitar as entregas | Isabel |
| Orientação | Acompanhar e aprovar | Prof. Cassio, Profª Maria Janaina |
