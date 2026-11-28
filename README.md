<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/DelBicos_git.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/DelBicos_LogoH.png">
      <img alt="Shows a black logo in light color mode and a white one in dark color mode." src="assets/DelBicos_git.png">
    </picture>
</p>

<p align="center">
  <a href="#-about">About</a> |
  <a href="#-apresentação">Apresentação</a> |
  <a href="#-prototype">Prototype</a> |
  <a href="#️-tecnologies">Tecnologies</a> |
  <a href="#-team">Team</a> |
  <a href="#-project-structure">Project Structure</a> |
  <a href="#️-installation">Installation</a> |
  <a href="https://github.com/DelBicos/backend">Backend</a> |
  <a href="https://github.com/DelBicos/docs">Docs</a>
</p>

# 💻 About

DelBicos (Delivery de Bicos) conecta clientes e trabalhadores informais da mesma vizinhança. O produto é um aplicativo [Expo](https://expo.dev) (React Native) para Android, iOS e web. A API fica no repositório [DelBicos/backend](https://github.com/DelBicos/backend).

Profissionais informais, de diversas vertentes, têm muita dificuldade para adquirir clientes na sua região de atuação, muitas vezes tendo que se deslocar por longas distâncias para chegar aos seus clientes, quando não o inverso. Enquanto que na outra ponta, clientes que se mudaram há pouco tempo para a região encontram muita dificuldade e insegurança ao procurar por profissionais confiáveis para realizar tarefas em suas residências.

Ao solucionar esse problema, notaria-se também os seguintes benefícios para a sociedade:

- A diminuição do translado entre cliente e profissional, que causaria a redução da emissão de gases do efeito estufa nesta atividade;
- O aumento de demanda para profissionais de diversas comunidades, contribuindo com a redução da desigualdade social;
- A integração de indivíduos no ciclo de consumo de serviços locais, levando à melhora na qualidade de vida;
- O acompanhamento das atividades e avaliações, levando a melhor confiabilidade e segurança.

> Os dois grupos destacados no problema descrito, compõem o público-alvo deste projeto.

> > 📌 **Status:** $\color{Apricot}{Em\ desenvolvimento}$

🔗 **Documentações das disciplinas do projeto**

- Repositório de documentação: [DelBicos Docs](https://github.com/DelBicos/docs)

<details>
  <summary> Documentações das disciplinas do projeto</summary>
  <p>
<a href="https://github.com/DelBicos/docs/blob/main/semester1/DOC_DELBICOS_I.pdf"> Delivery de Bicos I - 1 Semestre </a><p>
<a href="https://github.com/DelBicos/docs/blob/main/semester2/DOC_DELBICOS_II.pdf"> Delivery de Bicos II - 2 Semestre </a><p>
<a href="https://github.com/DelBicos/docs/blob/main/semester3/DOC_DELBICOS_III_GA.pdf"> Gestão Ágil de Projetos de Software - 3 Semestre </a><p>
<a href="https://github.com/DelBicos/docs/blob/main/semester3/DOC_DELBICOS_III_IHC.pdf"> Interação Humano-Computador - 3 Semestre </a><p>
<a href="https://github.com/DelBicos/docs/blob/main/semester4/DOC_DELBICOS_IV.pdf"> Projeto Interdisciplinar IV - 4 Semestre </a><p>
<a href="https://github.com/DelBicos/docs/blob/main/semester4/DOC_DELBICOS_IV_UX.pdf"> UX Design - 4 Semestre </a><p>
</p>
</details>

<br>

## 🎬 Apresentação

A aplicação está no ar em [azure.delbicos.com.br](https://azure.delbicos.com.br). Abaixo, o vídeo de pitch e os fluxos principais da navegação.

<image src="assets/delbicos_pitch_HD.gif" alt="Vídeo PITCH do projeto DelBicos" width="80%">
<p>Vídeo PITCH do projeto DelBicos
<p>
<image src="assets/Tela-de-Login.gif" alt="tela de login" width="80%">
<p>Tela de login
<p>
<image src="assets/tela-de-profile.gif" alt="tela da Área do Cliente" width="80%">
<p>Tela da Área do Cliente
<p>
<image src="assets/tela-dark-light.gif" alt="tela dark e light mode" width="80%">
<p>Tela Light, Dark e Contrast Mode

<br>

## 🎨 Prototype

O protótipo do DelBicos no Figma serve como uma demonstração visual interativa das funcionalidades centrais do sistema. Ele apresenta a página inicial, a navegação para pesquisa de profissionais, os fluxos de cadastro e login de usuários, além das interações de agendamento de serviços e pagamentos. Embora a página do administrador esteja desenvolvida, as áreas dedicadas aos perfis de cliente e profissional ainda estão em fase de finalização.

🔗 👉 [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/proto/1xZfYHmDwbr9aaqoh5ddxN/DelBicosV2?node-id=1364-969&t=tZpzceJg13szkrPk-1)

<br>

## 🛠️ Tecnologies

O app é Expo 54, React Native 0.81 e React 19, em TypeScript. O estado e as chamadas HTTP ficam nas stores Zustand. Navegação com React Navigation. Pagamentos com Stripe, chat com Socket.io e mapas com Google Maps.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white) ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge) ![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<br>

## 👥 Team

|                        Nome                        | Função                                 |
| :------------------------------------------------: | -------------------------------------- |
|  [Fernando Chibli](https://github.com/fershibli)   | _CTO e Desenvolvedor FullStack_        |
| [Douglas Wenzel](https://github.com/douglaswenzel) | _Scrum Master e Desenvolvedor FullStack_ |
|   [Isabel Maito](https://github.com/isabelmaito)   | _Designer e Desenvolvedora FullStack_  |

<br>

## 📝 Project Structure

A tela compõe layout, feature e UI. Só uma store fala com a API: componente não chama HTTP, e componente de UI não lê store. `src/lib` guarda integração de plataforma (cliente HTTP, Stripe, mapas, upload, logger, SSE). `src/utils` guarda função pura, sem interpretar campo do backend. A regra de negócio da API continua no servidor; o que o app repete é só espelho para a experiência. O porquê de cada camada está em [docs/architecture.md](docs/architecture.md).

```
frontend
├── src
│  ├── api             # Legado (auth, chatbot, payments). Chamada nova fica na store
│  ├── assets          # Imagens e fontes
│  ├── components
│  │  ├── features     # Comportamento de uma parte do produto (pode usar store)
│  │  ├── layout       # Cabeçalho, navegação, container. Não dispara API
│  │  └── ui           # Peça visual genérica, só por props
│  ├── config          # Ambiente do app (src/config/varEnvs.ts)
│  ├── hooks           # Listener, ciclo de vida ou API de plataforma (voz, chat e localização por socket)
│  ├── lib             # HTTP, Stripe, mapas, upload, logger, SSE
│  ├── screens
│  │  ├── public       # Feed, busca, categorias, perfil do parceiro, checkout, login, cadastro
│  │  └── private      # admin, chat, chatbot, client, professional, ProfessionalDashboard,
│  │                   # ProfessionalEarningsScreen (ganhos) e tickets
│  ├── stores          # Zustand. Único lugar que chama a API
│  ├── theme           # Claro, escuro e alto contraste
│  └── utils           # Função pura
├── patches            # Correções aplicadas no npm install (patch-package)
├── docs               # Arquitetura, contribuição, requisitos e qualidade
├── public             # Configuração do site estático (staticwebapp.config.json)
├── nginx              # Templates do contêiner de produção
├── app.json           # Expo: plugins e permissões. Fonte do prebuild
├── environments       # .env.dev e .env.prod locais (não vão para o git)
└── scripts            # Android (Gradle) e sincronização de regras
```

O site web é gerado com `expo export -p web` e publicado como site estático em uma Storage Account do Azure, em [azure.delbicos.com.br](https://azure.delbicos.com.br). A API roda em Azure App Service; o PostgreSQL e o Cosmos DB (API para MongoDB, usado pelo chat) ficam no Azure.

As pastas `ios/` e `android/` são geradas pelo `expo prebuild` e não são versionadas. `npm run ios` e `npm run android` criam a pasta; a fonte é o `app.json`.

## ⚙️ Installation

Node 20 (é a versão do CI). O gerenciador é o npm: o lockfile é o `package-lock.json`.

```bash
git clone https://github.com/DelBicos/frontend.git
cd frontend
npm install
```

O `postinstall` aplica os patches do `patch-package`.

Não há `.env.example` no repositório. Os arquivos de ambiente ficam em `environments/`, que o git ignora. `npm run set:dev` copia `environments/.env.dev` para `.env`; `npm run set:prod` copia `environments/.env.prod`.

| Variável | Para quê |
| --- | --- |
| `EXPO_PUBLIC_ENVIRONMENT` | `development`, `staging` ou `production` |
| `EXPO_PUBLIC_DOMAIN_ANDROID` | Host da API no Android. No Docker, `host.docker.internal` |
| `EXPO_PUBLIC_DOMAIN_IOS` | Host da API no iOS |
| `EXPO_PUBLIC_DOMAIN_WEB` | Host da API na web |
| `EXPO_PUBLIC_PORT` | Porta da API. No ambiente local, `3000` |
| `EXPO_PUBLIC_HTTP_PROTOCOL` | `http` em desenvolvimento. Fora dele, o app não sobe sem este valor |
| `EXPO_PUBLIC_WS_PROTOCOL` | `ws` em desenvolvimento. Fora dele, o app não sobe sem este valor |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave publicável do Stripe |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapas |
| `EXPO_PUBLIC_LOCATIONIQ_API_KEY` | Geocodificação |
| `EXPO_PUBLIC_UNSPLASH_API_KEY` | Imagens do Unsplash |
| `EXPO_PUBLIC_GOOGLE_ANALYTICS_ID` | Analytics na web |
| `EXPO_PUBLIC_CLARITY_ID` | Microsoft Clarity na web |

Em `development`, se o domínio for `localhost` ou estiver vazio, o app usa o host do Metro. No emulador Android sem host configurado, o fallback é `10.0.2.2`.

Antes de abrir um PR:

```bash
npm run typecheck
npm run lint
npm test
```

## 📚 Documentação

Guias em [docs/](docs/): [arquitetura](docs/architecture.md), [contribuição](docs/CONTRIBUTING.md), requisitos (RF03, RF04), inventário do chatbot e relatório do frontend.

## Execução

`npm start` sobe o Expo com dev client. `npm run web` abre no navegador.

### Android

É preciso o Android SDK, um emulador ou aparelho, e um JDK no `PATH` (React Native 0.81 usa o JDK 17). `npm run android:jvm` imprime Java, Node e a versão do Gradle.

`npm run android` e `npm run android:stable` são o mesmo fluxo: instalam o debug e sobem o Metro.

| Script | O que faz |
| --- | --- |
| `npm run android` | `android:install` e, em seguida, `npm start` |
| `npm run android:expo` | `expo run:android` |
| `npm run android:install` | Instala o debug com o Gradle, sem o flag `--configure-on-demand` do Expo |
| `npm run android:assemble:debug` | Gera o APK de debug |
| `npm run android:assemble:release` | Gera o APK de release |
| `npm run android:deploy:debug` | `set:dev`, monta o debug e copia o APK para `releases/` |
| `npm run android:deploy:release` | `set:prod`, monta o release e copia o APK para `releases/` |
| `npm run android:clean` | Apaga as pastas de build e roda `gradlew clean` |
| `npm run android:clean:cache` | `expo run:android --no-build-cache` |
| `npm run android:no-bundler` | Abre o app sem subir o Metro |
| `npm run android:release` | `expo run:android --variant release` |
| `npm run android:jvm` | Diagnóstico de Java, Node e Gradle |

Se o build nativo falhar, rode `npm run android:jvm` e depois `npm run android:clean`.

### iOS

É preciso o Xcode. Os scripts chamam o Expo direto:

| Script | O que faz |
| --- | --- |
| `npm run ios` | `expo run:ios` |
| `npm run ios:clean` | `expo run:ios --no-build-cache` |
| `npm run ios:no-bundler` | `expo run:ios --no-bundler` |
| `npm run ios:release` | `expo run:ios --configuration Release` |

### Web

```bash
npm run web
```

### Docker

O Compose usa a rede externa `delbicos-shared-network`, a mesma da API. Crie a rede uma vez, depois suba o app:

```bash
npm run docker:network
npm run docker:up
npm run docker:start
```

| Script | O que faz |
| --- | --- |
| `npm run docker:build` | Monta a imagem |
| `npm run docker:up` | Sobe o container `webapp-delbicos` (portas 8081 e 19000) |
| `npm run docker:start` | Roda `npm start` dentro do container |
| `npm run docker:logs` | Acompanha os logs |
| `npm run docker:exec` | Abre um shell no container |
| `npm run docker:down` | Derruba os containers |
| `npm run docker:stop` | Para os containers |
| `npm run docker:rebuild` | Derruba, monta sem cache e sobe de novo |
| `npm run docker:copy:env` | Copia o `.env` da raiz para o container |
| `npm run docker:clean` | Derruba os containers, apaga volumes e poda imagens soltas |

## Qualidade

| Script | O que faz |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `expo lint` |
| `npm run format:check` | Prettier em modo de checagem |
| `npm run format:fix` | Prettier reescreve os arquivos |
| `npm test` | Jest |
| `npm run test:coverage` | Jest com cobertura |
