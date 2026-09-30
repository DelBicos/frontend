# Continuar o desenvolvimento em outro computador (com o Claude)

Este guia registra **onde o refactor da branch `refactor/estrutura-seguranca` parou** e como retomar. Vale para os dois repositórios (`frontend` e `backend`), que devem estar na mesma branch.

## 1. Preparar o computador

Pré-requisitos: Node (versão do `.nvmrc`), Docker Desktop, Git, Xcode (iOS) ou Android Studio, e o Claude Code.

```bash
# uma pasta com os dois projetos lado a lado
git clone git@github.com:DelBicos/frontend.git
git clone git@github.com:DelBicos/backend.git
cd frontend && git checkout refactor/estrutura-seguranca && npm install
cd ../backend && git checkout refactor/estrutura-seguranca && npm install
```

**Segredos (nunca vão para o Git).** Crie `backend/.env` a partir de `backend/.env.example` e o `.env` do frontend (variáveis em `src/config/varEnvs.ts`). Você precisa ter à mão: chaves de teste do Stripe (`sk_test_`/`pk_test_`), `SENDGRID_API_KEY` e `SENDER_EMAIL_VERIFICADO`, `SECRET_KEY` (32+ caracteres), `LOCATIONIQ`/Google Maps se usar mapas. Copie do computador antigo por um meio seguro, não pelo chat nem pelo Git.

Subir tudo:

```bash
cd backend  && npm run docker:dev     # API + Postgres + Mongo + NLP
cd frontend && npm run ios            # ou npm start (web) / npm run android
```

As pastas `ios/` e `android/` **não são versionadas**: o comando acima as recria (`expo prebuild`). O banco local é sincronizado sozinho; para dados de exemplo rode `npm run seed` no backend. Contas de teste do seed: `fernando@delbicos.com.br` / `isabel@delbicos.com.br` (senha `1234`) e o admin `admin@delbicos.com.br` (senha do seeder).

Verificar que está tudo certo:

```bash
cd backend  && npx tsc --noEmit && npx jest        # 697 testes
cd frontend && npx tsc --noEmit && npm run lint && npx jest   # 149 testes
```

## 2. Retomar com o Claude

Abra o Claude Code na pasta do **frontend** (o `CLAUDE.md` de cada repositório já dá o contexto) e cole:

> Estamos na branch `refactor/estrutura-seguranca`, nos repositórios frontend e backend do DelBicos. Leia `docs/CONTINUAR_DESENVOLVIMENTO.md` e os `CLAUDE.md`. As fases 1 a 5 estão feitas; vamos começar a **fase 6 (identidade visual)**. Só faça commit ou push quando eu pedir.

Peça ao Claude para trabalhar também no backend (`/add-dir ../backend` ou abrir uma sessão lá) quando a tarefa mexer nos dois lados.

## 3. O que já foi feito (fases 1 a 5)

| Fase | Resultado |
| --- | --- |
| 1. Pagamento | O cartão é **autorizado** ao contratar e só **cobrado** quando o profissional aceita. Recusa ou 12 h sem resposta liberam a reserva (nada é cobrado). Pix deixou de funcionar (captura manual é só cartão). |
| 2. Ciclo do agendamento | Cancelamento com política, não comparecimento, reagendamento (seletor de horários livres), disputas decididas pelo admin. Política: 24 h ou mais grátis; 24 h a 2 h retém 20 %; menos de 2 h retém 30 %; não comparecimento 100 %; profissional cancela = reembolso total. Antecedência mínima de 12 h. Política escrita no FAQ e na página de Termos. |
| 3. AWS → Azure | Tudo de AWS removido. Imagens em Azure Blob Storage (URL assinada), e-mail com fallback em Azure Function, logs sem CloudWatch. Workflow de deploy na EC2 removido. |
| 4. Verificação de conta | MFA por código no e-mail; profissionais enviam documento + selfie (container **privado** do Azure), revisão manual pelo admin, selo "Verificado" no perfil, nos cards e em "Meu perfil". |
| 5. Qualidade | Zero `any` e `console.*` (ESLint no front, teste guarda no back), arquivos < 600 linhas, documentação reorganizada, pastas nativas fora do Git, validação de agenda no servidor, telas de admin refeitas com dados reais, admin entra pelo login comum. |

## 4. Próximo passo: fase 6 — identidade visual

- Cerca de 124 cores hexadecimais fixas no código precisam ir para o tema (`src/theme/`): procure por `#` em `src/**/*.ts(x)` fora de `src/theme`.
- Contraste: por exemplo, texto branco sobre laranja (botão "Fechar") reprova; o botão primário do app usa texto preto sobre laranja por isso. Conferir os três temas (claro, escuro, alto contraste). No tema escuro `primaryBlue` é cinza (`#545454`), o que já confundiu gráficos.
- Consolidar componentes-base (`src/components/ui`) e remover estilos duplicados.
- Ao terminar, rodar de novo a checagem de qualidade (seção 1).

## 5. Depois da fase 6: guia de configuração externa

O Claude prometeu guiar você, passo a passo e sem assumir experiência, por tudo que precisa ser configurado fora do código. **Nunca cole segredos no chat**; você os cadastra nos painéis e o Claude diz onde clicar.

1. **Azure Storage Account**: acesso anônimo de leitura a blobs, CORS (PUT/GET/OPTIONS; cabeçalhos `x-ms-blob-type` e `Content-Type`) para o container público **e** para o privado, e a connection string.
2. **App Settings do App Service**: `AZURE_STORAGE_CONNECTION_STRING`, `AZURE_STORAGE_CONTAINER` (`delbicos-uploads`), `AZURE_PRIVATE_CONTAINER` (`delbicos-private`), `STORAGE_PROVIDER=azure`. Sem a connection string, o envio de documentos responde 503 de propósito (o ImgBB é público e não pode guardar documentos).
3. **E-mail**: `AZURE_FUNCTION_URL` e `AZURE_FUNCTION_KEY` (Function da Iago, branch `feat/INFRA-15-azure-functions-email`). O MFA por e-mail depende de o envio funcionar.
4. **Migrations em stag/produção**: `npm run migrate` (há duas: `20260929100000-appointment-cancellation-lifecycle` e `20260930100000-account-verification`). No banco local de desenvolvimento elas **não** devem ser rodadas (o `sync` já criou as tabelas e a migration falharia).
5. **Deploy**: o workflow de deploy na EC2 foi removido; `stag`/`main` ficaram sem deploy automático. Decidir o substituto na Azure. Existe o workflow `deploy-azure-backend.yml` para a stag-facul.
6. **Neon (stag/produção)**: procurar URLs `amazonaws.com` em `users.avatar_uri`, `service.banner_uri`, `category.image_url` e `professional_gallery.url` antes de desligar o bucket S3.
7. **AWS**: desligar bucket, Lambda, EC2 e CloudWatch e apagar segredos do GitHub (`EC2_HOST`, `SSH_PRIVATE_KEY` etc.).
8. **Stripe**: chaves de teste no ambiente de demonstração; avisar o grupo de que o Pix parou.
9. **Testes que só dá para fazer com a configuração pronta**: envio real de documentos (Azure ou Azurite), código de MFA por e-mail e o fluxo completo de pagamento.

## 6. Cuidados antes de fazer merge na stag/main

- Avisar o grupo de que `ios/` e `android/` deixaram de ser versionados.
- Possíveis conflitos com a branch da Iago em `.env.example` e `package.json`.
- O login de admin (`/api/admin/login`) ainda existe, mas o app usa o login comum; o admin ainda não é obrigado a usar MFA.
- Limitações conhecidas: o cadastro agora exige bairro, cidade e estado; horários de agenda são "relógio de parede" guardados como UTC (convenção do app inteiro).

## 7. Mapa rápido do código

- **Backend** (`backend/`): `src/services/appointment` (agendamento, cancelamento, disputas), `src/services/payment` (Stripe), `src/services/auth` (login, MFA), `src/services/verification` (identidade), `src/services/storage` (Azure), `src/jobs/appointmentCron.ts` (expiração), `src/docs` (OpenAPI), `migrations/`.
- **Frontend** (`frontend/`): `src/api` (chamadas), `src/lib/appointments.ts` e `src/lib/booking.ts` (regras espelhadas do servidor), `src/components/features/AppointmentManage` (cancelar/reagendar/disputar), `src/screens/private/admin`, `src/screens/private/client/Profile/Tabs/VerificacaoConta`, `src/theme`.
- Swagger da API: `http://localhost:3000/docs`.
