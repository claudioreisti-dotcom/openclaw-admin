# OpenClaw Admin

Painel web para administrar demandas do agent OpenClaw (Telegram), compartilhando o mesmo banco Neon PostgreSQL.

## Quickstart

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar ambiente
cp .env.example .env.local
# edite .env.local com DATABASE_URL e AUTH_SECRET

# 3. Introspectar o banco existente (gera lib/db/schema.ts)
pnpm db:introspect

# 4. Rodar em dev
pnpm dev
```

Abra http://localhost:3000.

## Desenvolvido por Claude Code

Este projeto foi planejado para ser executado **100% pelo Claude Code**. Leia:
- `CLAUDE.md` — instruções que o Claude Code segue
- `docs/PROJECT.md` — visão geral e arquitetura
- `docs/SPEC.md` — especificação funcional
- `docs/TASKS.md` — roteiro de tarefas

Para reproduzir: abra o repo no Claude Code e diga "leia CLAUDE.md e comece pela TASK-001 em docs/TASKS.md".

## Stack

Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui · Drizzle ORM · Neon Postgres · Auth.js v5 · TanStack Query/Table · Zod · Recharts · Serwist (PWA)

## Deploy

- **Vercel** (recomendado): `vercel` e configure env vars
- **Docker**: `docker build -t openclaw-admin . && docker run -p 3000:3000 openclaw-admin`

## Licença

Privado.
