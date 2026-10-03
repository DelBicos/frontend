---
description: Infrastructure - CI workflows, Docker, Expo config, scripts
trigger: glob
globs: ".github/workflows/**, Dockerfile*, docker-compose*.yml, app.json, scripts/**, package.json"
alwaysApply: false
---

# Infrastructure
- Use npm. Never add `pnpm-lock.yaml` or `yarn.lock`.
- Secrets come from GitHub secrets or `.env`, never from files in the
  repository.
- Keep CI job names: branch rulesets depend on them.
- Never change `.github/workflows/rules.yml`, `scripts/rules/` or `.husky/`.
