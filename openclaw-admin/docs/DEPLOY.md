# Deploy — Alfred Admin

## Opções

### 1. Vercel (recomendado)

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Deploy (primeira vez)
vercel

# Deploy de produção
vercel --prod
```

**Variáveis de ambiente no painel Vercel:**
- `DATABASE_URL` — connection string pooled do Neon (obrigatório)
- `DATABASE_URL_UNPOOLED` — **apenas para migrations locais, nunca em produção**
- `AUTH_SECRET` — gere com `openssl rand -base64 32`
- `AUTH_URL` — URL pública da app em produção (ex: `https://alfred.vercel.app`)
- `AUTH_TRUST_HOST` — `true`
- `NEXT_PUBLIC_APP_URL` — mesma URL pública
- `NEXT_PUBLIC_APP_NAME` — `Alfred Admin`

**Região:** Usar `iad1` (us-east-1) para ficar na mesma região que o Neon.

### 2. Docker

```bash
# Build
docker build -t alfred-admin .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e AUTH_SECRET="..." \
  -e AUTH_URL="http://localhost:3000" \
  alfred-admin
```

### 3. Alternativas (Railway, Render)

Qualquer plataforma que suporte Node.js 22+ e variáveis de ambiente. Usar o `Dockerfile` incluído.

## CI/CD (GitHub Actions)

Ver `.github/workflows/ci.yml` (criado na TASK-092). O pipeline:
1. `pnpm typecheck`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm build`
5. `drizzle-kit check` (detecta drift entre schema.ts e banco)

Deploy automático na Vercel ao merge em `main`.

## Rotação de Secrets

Se `AUTH_SECRET` ou `DATABASE_URL` forem comprometidos:
1. Revogar imediatamente no painel Neon / gerar novo AUTH_SECRET
2. Atualizar nas variáveis de ambiente do Vercel
3. Fazer redeploy: `vercel --prod`
4. Invalidar sessões ativas (Auth.js invalidação automática ao mudar AUTH_SECRET)

## Observabilidade

Logs estruturados via `pino` em produção. Para Vercel: logs disponíveis no painel > Functions > Logs.
Sentry opcional: configurar `SENTRY_DSN` no `.env` e descomentar no `next.config.ts`.

## Performance Targets

| Métrica | Target | Como verificar |
|---|---|---|
| LCP | < 2.5s (3G) | Lighthouse CI |
| JS bundle inicial | < 180KB gzip | `pnpm build` output |
| Lighthouse mobile | ≥ 90 todas as categorias | `pnpm lighthouse` (após TASK-098) |
