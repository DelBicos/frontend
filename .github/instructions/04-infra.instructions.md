---
applyTo: ".github/workflows/**,Dockerfile*,docker-compose*.yml,app.json,scripts/**,package.json"
---
<!-- GENERATED from .agents/rules/04-infra.md by scripts/rules/sync.mjs. Do not edit. -->

# Infrastructure
- Use npm. Never add `pnpm-lock.yaml` or `yarn.lock`.
- Secrets come from GitHub secrets or `.env`, never from files in the
  repository.
- Keep CI job names: branch rulesets depend on them.
- Never change `.github/workflows/rules.yml`, `scripts/rules/` or `.husky/`.
