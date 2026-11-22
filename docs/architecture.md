# Arquitetura do app DelBicos

> "A arquitetura deve tornar a implementação correta a implementação óbvia."

Quem desenvolve, pessoa ou agente, precisa encontrar, entender e alterar um
trecho de código com segurança, sem aprender abstrações que não têm relação
com a mudança. Este documento explica *por que* cada regra existe. As regras
em si, curtas e imperativas, ficam em `.agents/rules/` e são o que os agentes
de código leem.

## Princípios

1. **Descoberta.** Cada trecho de código tem um lugar óbvio e uma forma óbvia.
2. **Responsabilidade explícita.** Cada camada existe por um motivo que dá
   para nomear.
3. **Arquitetura mínima necessária.** Camada, pasta ou wrapper novo precisa de
   uma responsabilidade concreta que nada do que já existe cobre.
4. **Composição antes de herança.** O único componente de classe é o error
   boundary do mapa, porque o React exige uma classe para error boundary.
5. **Biblioteca antes de abstração caseira.** Se uma biblioteca resolve
   sozinha, use direto. Wrapper só existe para uma integração real.
6. **Abstraia comportamento, não aparência.** Una só quando a intenção e o
   comportamento são os mesmos. A terceira cópia da mesma lógica é o sinal
   para extrair.
7. **Consistência antes da perfeição local.** Um pull request segue o padrão
   dominante, mesmo quando existe algo "mais elegante".
8. **Mudança de arquitetura é deliberada.** Proposta, discussão, acordo, plano
   de migração e só então a implementação. Nunca dentro de um pull request de
   feature.
9. **Exceção visível.** Um contorno fica evidente no lugar em que é aplicado.
10. **Facilidade de revisão.** O código precisa ser fácil para outra pessoa
    revisar.
11. **O backend protege o negócio.** O app não é uma fronteira confiável. Uma
    regra que o app repete para melhorar a experiência é um espelho. O
    servidor continua sendo a fonte da verdade.

## Camadas

A pergunta sobre um componente é "isto é UI, layout ou feature?".

- **Telas** compõem layout, features e UI. Quando a lógica da tela cresce, em
  geral ela pertence a uma feature ou a uma store. Cerca de 200 linhas, ou
  muita ida e volta entre funções internas, é motivo para olhar, nunca um
  limite rígido.
- **Componentes de UI** são visuais e genéricos, e recebem dados por props. Um
  componente de UI que lê uma store esconde uma dependência e deixa de poder
  ser reutilizado, então não pode importar stores, nem os tipos delas.
- **Componentes de layout** são estrutura recorrente, como o Header. Podem ler
  o tema e a sessão (`useThemeStore`, `useUserStore`) porque toda tela precisa
  deles, mas nunca disparam chamada de API (decisão D3e).
- **Componentes de feature** guardam o comportamento de uma parte do produto e
  podem usar stores.
- **Stores (decisão D2).** As stores Zustand são o único código que fala com
  uma API. Tipar, normalizar e remodelar as respostas num só lugar mantém os
  componentes simples e torna cada chamada fácil de achar. Uma camada
  separada `src/api/` seria um segundo lugar para a mesma responsabilidade. O
  estado do app vive em stores, em vez de React Context, pelo mesmo motivo:
  um lugar óbvio.
- **Hook é ferramenta, não jeito de organizar código.** Antes de escrever um,
  confira uma biblioteca, uma store, uma função pura e o código simples do
  componente. Um hook justifica o lugar com listeners, ciclo de vida, limpeza
  ou API de plataforma. Um hook que só devolve valores de store duplica o
  Zustand.
- **Utilitários e integrações (decisão D3a).** `src/utils/` guarda funções
  puras e genéricas, como `isServiceAvailableNow`. Uma função que precisa
  entender o que os campos do backend significam é lógica de domínio e
  pertence a uma store ou a uma feature. `src/lib/` guarda só integrações de
  plataforma: o cliente HTTP, Stripe, SSE, logger, analytics e push. Separar
  "puro" de "fala com a plataforma" torna a pasta certa óbvia. Baldes
  genéricos como `src/lib/helpers/` escondem essa diferença e não fazem parte
  da lista permitida.
- **Lista fechada de pastas (decisão D3).** As pastas de primeiro nível em
  `src/` e as três categorias de componente são fixas. Pasta nova é um padrão
  concorrente sem decisão do time.
- **As cores vêm do tema** (`useColors()`), então o modo escuro e uma mudança
  futura de paleta acontecem num só lugar.

## Anti-padrões

| Anti-padrão | Por que atrapalha |
| --- | --- |
| Componente de UI lendo uma store ou a API | Dependência escondida, sem reuso |
| Tela gigante | Mistura composição, lógica e apresentação |
| Hook criado só para organizar código | Indireção sem responsabilidade |
| Hook que só devolve valores de store | Duplica o Zustand |
| Utilitário para uma expressão trivial | `isDefined()` para algo óbvio em TypeScript |
| Abstração por semelhança sintática | Apaga diferença de intenção |
| Contorno genérico | Uma exceção local disfarçada de abstração oficial |
| Categoria nova de pasta dentro de um pull request | Padrão concorrente sem decisão |

Sinais objetivos (import de store na UI, cliente HTTP fora das stores, pasta
nova) podem virar checagens de CI. Os subjetivos (hook desnecessário,
utilitário com lógica de domínio, store usada sem desestruturar) ficam como
sugestão de review.

## Ainda não decidido

Isto nunca foi discutido com exemplos concretos e ainda não pode virar regra
rígida: estado de servidor versus estado do app no Zustand (cache,
invalidação, loading, atualização otimista), onde cada camada é testada,
convenções de nome, a fronteira entre UI e feature em casos como
`ThemeToggle`, e quando uma variante `.web.tsx` vale a pena.

## Como as regras dos agentes funcionam

- **Fonte única.** `.agents/rules/*.md`, em inglês, com frontmatter
  (`description`, `trigger`, `globs`, `alwaysApply`):
  - `00-core.md`: stack, arquitetura, regras de código, governança. Toda
    ferramenta carrega este arquivo em toda conversa, por isso ele fica curto.
  - `01-overlay.md`: iniciativas temporárias e exceções legadas, cada uma com
    dono e data de validade.
  - `02-<layer>.md`, `03-tests.md`, `04-infra.md`: carregados só quando o
    agente trabalha em arquivos correspondentes.
- **Arquivos gerados.** `npm run rules:sync` (`scripts/rules/sync.mjs`)
  escreve `AGENTS.md`, `CLAUDE.md` (importa `AGENTS.md`),
  `.github/copilot-instructions.md`, `.claude/rules/`, `.cursor/rules/`,
  `.github/instructions/` e `.claude/settings.json`. Cada ferramenta recebe o
  mesmo texto, sem depender de import. Arquivo gerado nunca é editado à mão.
- **Trava de edição.** `.claude/settings.json` impede o Claude Code de editar
  as regras e a aplicação delas. As outras ferramentas só têm o texto de
  governança.
- **Arquivos locais.** Os hooks do Git (`post-merge`, `post-checkout`,
  `post-rewrite`, instalados pelo husky no `npm install`) rodam
  `sync.mjs --enforce`: regeneram as saídas e movem arquivos de instrução não
  rastreados para `.git/rules-quarantine/<data>/`. Nada é apagado.
- **CI.** O workflow `Rules` falha quando os arquivos gerados divergem da
  fonte, e quando um pull request adiciona arquivos de instrução fora do
  sistema, documentos no estilo de plano ou logs.
- **CODEOWNERS.** Regras e arquivos de aplicação precisam de aprovação de
  quem é dono das regras, o que fecha a abertura de "manutenção de rules" no
  texto de governança.
- **Ajuste gradual.** Código existente fora das regras não é refatorado em
  massa. Ele fica listado em `01-overlay.md`. Um agente que edita um arquivo
  desses corrige esse arquivo e só os imports diretos de que a correção
  precisa, e pergunta antes de ir além. As regras vencem o código existente,
  então um padrão errado nunca é copiado só porque já está lá.

As regras nunca mandam um agente ler este documento: isso gastaria tokens em
toda conversa.

## Manutenção

Uma regra nova nasce de um erro repetido de agente, nunca de "quem sabe um
dia".

1. **Mudar uma regra:** edite só o `.md` em `.agents/rules/`, rode
   `npm run rules:sync` e faça o commit da fonte e dos arquivos gerados
   juntos, num pull request que muda só rules, com título `chore(rules): ...`.
2. **Convenção nova:** o que vale em todo lugar e cabe numa linha vai para o
   núcleo. O que vale para uma pasta vai para a camada dessa pasta.
3. **Iniciativa temporária:** uma seção em `01-overlay.md` com nome, data de
   validade (até 90 dias) e dono. Apague quando acabar.
4. **Orçamento de tokens:** núcleo em torno de 60 linhas. Camadas com 3 a 10
   itens que não repetem o núcleo. Nunca `alwaysApply: true` numa camada.
5. **Preferência pessoal** fica na configuração da ferramenta de cada pessoa,
   nunca no repositório.
