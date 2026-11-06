<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/DelBicos_git.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/DelBicos_LogoH.png">
      <img alt="Shows a black logo in light color mode and a white one in dark color mode." src="assets/DelBicos_git.png">
    </picture>
</p>

<p align="center">
  <a href="#-about">About</a> |
  <a href="#-entregas-de-sprints">Sprints</a> |
  <a href="#-backlogs">Backlogs</a> |
  <a href="#-user-stories">User Stories</a> |
  <a href="#-functional-requirements">Functional Requirements</a> |
  <a href="#-prototype">Prototype</a> |
  <a href="#️-tecnologies">Tecnologies</a> |
  <a href="#-team">Team</a> |
  <a href="#-project-structure">Project Structure</a> |
  <a href="#️-installation">Installation</a> |
  <a href="https://github.com/fershibli/DelBicosBackend">Backend Project</a>
</p>

# 💻 About

DelBicos - Delivery de Bicos, é um projeto que propõe conectar clientes e trabalhadores informais na mesma vizinhança, garantindo demanda local, qualidade e segurança e será projetado através de um website.

Profissionais informais, de diversas vertentes, têm muita dificuldade para adquirir clientes na sua região de atuação, muitas vezes tendo que se deslocar por longas distâncias para chegar aos seus clientes, quando não o inverso. Enquanto que na outra ponta, clientes que se mudaram há pouco tempo para a região encontram muita dificuldade e insegurança ao procurar por profissionais confiáveis para realizar tarefas em suas residências.

Ao solucionar esse problema, notaria-se também os seguintes benefícios para a sociedade:

- A diminuição do translado entre cliente e profissional, que causaria a redução da emissão de gases do efeito estufa nesta atividade;
- O aumento de demanda para profissionais de diversas comunidades, contribuindo com a redução da desigualdade social;
- A integração de indivíduos no ciclo de consumo de serviços locais, levando à melhora na qualidade de vida;
- O acompanhamento das atividades e avaliações, levando a melhor confiabilidade e segurança.

> Os dois grupos destacados no problema descrito, compõem o público-alvo deste projeto.

> > 📌 **Status:** $\color{Apricot}{Em\ desenvolvimento}$

-🔗 **Documentações das disciplinas do projeto**

- <a href="assets/DelBicos - Projeto Interdisciplinar IV.pdf"> Projeto Interdisciplinar IV - 4 Semestre </a><p>
- Repositório de documentação: [DelBicos Docs](https://github.com/DelBicos/docs)
- <a href="assets/DelBicos - Projeto Interdisciplinar IV - UX.pdf"> UX Design - 4 Semestre </a><p>

<details>
  <summary> Documentações das disciplinas do projeto</summary>
  <p>
<a href="assets/DelBicos - Delivery de Bicos I.pdf"> Delivery de Bicos I - 1 Semestre </a><p>
<a href="assets/DelBicos - Delivery de Bicos II.pdf"> Delivery de Bicos II - 2 Semestre </a><p>
<a href="assets/DelBicos - Projeto Interdisciplinar III - Gestão Ágil.pdf"> Gestão Ágil de Projetos de Software - 3 Semestre </a><p>
<a href="assets/Projeto_IHC-DelBicos-Projeto_Interdisciplinar_III.pdf"> Interação Humano-Computador - 3 Semestre </a><p>

</p>
</details>

<br>

## 🏁 Entregas de Sprints

<image src="assets/Entrega_de_sprints.png" alt="Entregas de Sprints do projeto DelBicos" width="80%">

| Sprint |    Período    | Entregas                                                                                                                                                                                                                                                                              |    Status    |
| :----: | :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------: |
|   01   | 04/06 - 20/06 | Figma do protótipo de agendar e pagar serviço, Página de Feed, Header, Endpoint GET de profissionais com filtros opcionais `<br>` (termo pesquisado, localização, categoria, subcategoria, data_inicio, data_fim) e com ordenação (relevância, avaliação, distância, disponibilidade) | ✅ Concluído |
|   02   | 10/06 - 17/06 | Página de Meus Agendamentos, Figma do protótipo de Página de Login, Página de Login por E-mail e Senha,`<br>` dois endpoints POST de login por senha, endpoint POST de cadastro, endpoint POST de cancelar agendamento                                                                | ✅ Concluído |
|   03   | 17/06 - 24/06 | Interações do protótipo do Figma, endpoint POST de cadastro de parceiro,`<br>` endpoint POST de aceitar agendamento, endpoint POST de editar disponibilidade                                                                                                                          | ✅ Concluído |
|   04   | 24/06 - 25/08 | Implementação de Envio de E-mails Automatizados                                                                                                                                                                                                                                       | ✅ Concluído |
|   05   | 26/08 - 08/09 | Implementação de Sistema de Agendamento com Calendário                                                                                                                                                                                                                                | ✅ Concluído |
|   06   | 09/09 - 15/09 | Implementação de Geolocalização e Mapas                                                                                                                                                                                                                                               | ✅ Concluído |
|   07   | 16/09 - 22/09 | Implementação de Upload e Armazenamento de Arquivos                                                                                                                                                                                                                                   | ✅ Concluído |
|   08   | 23/09 - 06/10 | Implementação de Sistema de Avaliações ou Comentários                                                                                                                                                                                                                                 | ✅ Concluído |
|   09   | 07/10 - 13/10 | Implementação de Geração de Entrega de Relatórios em PDF                                                                                                                                                                                                                              | ✅ Concluído |
|   10   | 14/10 - 20/10 | Implementação de Envio de Notificações em Tempo Real                                                                                                                                                                                                                                  | ✅ Concluído |
|   11   | 21/10 - 03/11 | Implementação de Integração com API de Pagamentos                                                                                                                                                                                                                                     | ✅ Concluído |
|   12   | 04/11 - 10/11 | Implementação de IExportação de Dados para Excel/CSV                                                                                                                                                                                                                                  | ✅ Concluído |
|   13   | 11/11 - 17/11 | Implementação de Visualização com Gráficos                                                                                                                                                                                                                                            | ✅ Concluído |

### 🎬 Apresentação

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

## 🎯 Backlogs

<details>
  <summary> Backlogs </summary>
  <p>
<image src="assets/backlogP.png" alt="Backlog de Produtos do projeto DelBicos" width="60%"><p>
<image src="assets/backlogS.png" alt="Backlog de Sprints do projeto DelBicos" width="60%">
</p>
</details>
<br>

## 🎥 User Stories

<details>
  <summary> User Stories </summary>
  <p>
<image src="assets/sprint01-1.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint01-2.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint01-3.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint02-1.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint02-2.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint03-1.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint03-2.png" alt="User Stories do projeto DelBicos" width="60%"><p>
<image src="assets/sprint04.png" alt="User Stories do projeto DelBicos" width="60%"><p>
</details>
<br>

## 💡 Functional Requirements

<details>
  <summary> Requisitos Funcionais - Cliente </summary>
  <image src="assets/requisitos_tabela_requisitos_funcionais_cliente.png" alt="Requisitos Funcionais do projeto DelBicos" width="80%"><p>
  <p>
 <summary> Requisitos Funcionais - Profissional </summary>
  <image src="assets/requisitos_tabela_requisitos_funcionais_profissional.png" alt="Requisitos Funcionais do projeto DelBicos" width="80%"><p>
  <p>
   <summary> Requisitos Funcionais - Administrador </summary>
  <image src="assets/requisitos_tabela_requisitos_funcionais_administrador.png" alt="Requisitos Funcionais do projeto DelBicos" width="80%"><p>
  <p>
</p>
</details>

<br>

## 🎨 Prototype

O protótipo do DelBicos no Figma serve como uma demonstração visual interativa das funcionalidades centrais do sistema. Ele apresenta a página inicial, a navegação para pesquisa de profissionais, os fluxos de cadastro e login de usuários, além das interações de agendamento de serviços e pagamentos. Embora a página do administrador esteja desenvolvida, as áreas dedicadas aos perfis de cliente e profissional ainda estão em fase de finalização.

🔗 👉 [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/proto/1xZfYHmDwbr9aaqoh5ddxN/DelBicosV2?node-id=1364-969&t=tZpzceJg13szkrPk-1)

<br>

## 🛠️ Tecnologies

![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Git](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white) ![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Swift](https://img.shields.io/badge/swift-F54A2A?style=for-the-badge&logo=swift&logoColor=white) ![Objective-C](https://img.shields.io/badge/OBJECTIVE--C-%233A95E3.svg?style=for-the-badge&logo=apple&logoColor=white) ![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white) ![Kotlin](https://img.shields.io/badge/Kotlin-0095D5?&style=for-the-badge&logo=kotlin&logoColor=white) ![Express](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white) ![MaterialUI](https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white) ![Node](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Zustand](https://img.shields.io/badge/Zustand-007ACC?style=for-the-badge&logo=React&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white) ![Penpot](https://img.shields.io/badge/Penpot-000000?style=for-the-badge&logo=penpot&logoColor=white) ![Gimp](https://img.shields.io/badge/gimp-5C5543?style=for-the-badge&logo=gimp&logoColor=white) ![Inkscape](https://img.shields.io/badge/Inkscape-000000?style=for-the-badge&logo=Inkscape&logoColor=white) ![Vscode](https://img.shields.io/badge/Vscode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white) ![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white) ![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

<br>

## 👥 Team

|                        Nome                        | Função                      |
| :------------------------------------------------: | --------------------------- |
|  [Fernando Chibli](https://github.com/fershibli)   | _Product Owner & FullStack_ |
| [Douglas Wenzel](https://github.com/douglaswenzel) | _Scrum Master & FullStack_  |
|    [Eduardo Kamo](https://github.com/edukamoz)     | _Desenvolvedor FullStack_   |
|  [Gustavo Ferreira](https://github.com/Gspedine)   | _Desenvolvedor FullStack_   |
|  [Iago Rossan](https://github.com/IagoYuriRossan)  | _Desenvolvedor FullStack_   |
|   [Isabel Maito](https://github.com/isabelmaito)   | _Desenvolvedora FullStack_  |
|    [Lucas Consani](https://github.com/konsanii)    | _Desenvolvedor FullStack_   |

<br>

## 📝 Project Structure

```
DelBicosV2
├── src
│  ├── api             # Legado (auth, chatbot, pagamentos). Chamadas novas vão para as stores
│  ├── assets          # Imagens e fontes
│  ├── components
│  │  ├── features     # Componentes com regra de negócio (agenda, gestão do agendamento...)
│  │  ├── layout       # Cabeçalho, navegação inferior, container de página
│  │  └── ui           # Peças reutilizáveis (botão, campos, selo de verificado...)
│  ├── config          # Variáveis de ambiente do app
│  ├── hooks           # Hooks reutilizáveis (voz, sockets, sessão do chatbot)
│  ├── lib             # Integrações de plataforma (HTTP, Stripe, upload, logger) e regras espelhadas do servidor
│  ├── utils           # Funções puras (erros, formatação, estilos só-web, nomes de ícones)
│  ├── screens         # Telas e navegação (public / private / admin)
│  ├── stores          # Estado global (Zustand) e único lugar que fala com a API
│  └── theme           # Cores e temas (claro, escuro, alto contraste)
├── patches            # Correções de dependências aplicadas no npm install (patch-package)
├── docs               # Guias e relatórios
├── app.json           # Configuração do Expo (plugins, permissões)
└── .agents/rules      # Regras de arquitetura do projeto (fonte do CLAUDE.md e AGENTS.md)
```

> As pastas `ios/` e `android/` são **geradas** (`expo prebuild`) e não são versionadas.
> `npm run ios` / `npm run android` criam a pasta sozinhos; a fonte de verdade é o `app.json`.

## ⚙️ Installation

```bash
git clone <repository-url>
cd DelBicosV2
npm install          # também aplica os patches de patch-package
cp .env.example .env # se existir; veja src/config/varEnvs.ts para as variáveis
```

Qualidade antes de abrir um PR:

```bash
npx tsc --noEmit     # tipos
npm run lint         # ESLint + Prettier
npm test             # Jest
```

## 📚 Documentação

Guias e relatórios em [docs/](docs/): contribuição, requisitos (RF03, RF04), inventário do chatbot e relatório do frontend.

## Running the Project

To run the project, use the following command:

```
npm start
```

This will start the development server.

### Running on Android Emulator

To run the project on an Android emulator, ensure you have the Android SDK and an emulator set up. Use the Android scripts below:

Basic Android run (with Metro, stable cross-platform):

```
pnpm android
```

Stable cross-platform run (same flow as `pnpm android`):

```
pnpm android:stable
```

Assemble debug APK with Gradle wrapper (without Expo `--configure-on-demand`):

```
pnpm android:assemble
```

Install debug build on emulator/device with Gradle wrapper:

```
pnpm android:install
```

Deep clean (remove previous build folders + `gradlew clean`):

```
pnpm android:clean
```

Clean rebuild using Expo cache flag:

```
pnpm android:clean:cache
```

Install/open app without starting Metro:

```
pnpm android:no-bundler
```

Local release build:

```
pnpm android:release
```

JVM/Gradle diagnostics (useful for onboarding and troubleshooting):

```
pnpm android:jvm
```

If you prefer npm, replace `pnpm` with `npm run`.

Expo direct Android flow (kept as fallback):

```
pnpm android:expo
```

Current script mappings in package.json:

```
android -> pnpm android:stable
android:expo -> expo run:android
android:stable -> pnpm android:install && pnpm start
android:assemble -> node scripts/android/gradlew-runner.mjs app:assembleDebug -x lint -x test --build-cache -PreactNativeDevServerPort=8081
android:install -> node scripts/android/gradlew-runner.mjs app:installDebug -x lint -x test --build-cache -PreactNativeDevServerPort=8081
android:clean -> node scripts/android/clean.mjs
android:clean:cache -> expo run:android --no-build-cache
android:no-bundler -> expo run:android --no-bundler
android:release -> expo run:android --variant release
android:jvm -> node scripts/android/jvm-info.mjs
```

Android troubleshooting notes:

- If you get `No matching variant ... No variants exist` on Windows, prefer `pnpm android:stable` or `pnpm android:install` instead of `pnpm android`.
- Run `pnpm android:jvm` and confirm Java is available (recommended JDK 17).
- Run `pnpm android:clean` before retrying a failed Android build.

### Running on iOS Simulator

To run the project on an iOS simulator, ensure you have Xcode installed. Use the iOS scripts below:

Basic iOS run (with Metro):

```
pnpm ios
```

Clean rebuild (when build cache is inconsistent):

```
pnpm ios:clean
```

Install/open app without starting Metro:

```
pnpm ios:no-bundler
```

Local release build:

```
pnpm ios:release
```

If you prefer npm, replace `pnpm` with `npm run`.

Current script mappings in package.json:

```
ios -> expo run:ios
ios:clean -> expo run:ios --no-build-cache
ios:no-bundler -> expo run:ios --no-bundler
ios:release -> expo run:ios --configuration Release
```

### Running on Web

To run the project on a web browser, use the following command:

```
npm run web
```

## Linting and Formatting

To ensure code quality and consistency, this project uses ESLint and Prettier. You can run the following commands to lint and format your code:

### Linting

To check for linting errors, run:

```
npm run lint
```

### Fixing Linting Errors

To automatically fix linting errors, run:

```
npm run lint --fix
```

### Formatting

To check for formatting issues, run:

```
npm run format:check
```

### Fixing Formatting Issues

To automatically fix formatting issues, run:

```
npm run format:fix
```

## Recommended VS Code Extensions

To enhance your development experience with ESLint and Prettier, consider installing the following extensions:

- **ESLint**: Integrates ESLint into your editor for real-time linting.
- **Prettier - Code formatter**: Automatically formats your code according to Prettier's rules.

By installing these extensions, you can maintain code quality and consistency throughout your project.
