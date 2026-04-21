# Tarefas para o Claude Code

Execute em ordem. Um commit por tarefa. Marque `[x]` quando concluir.
Tarefas marcadas 🔶 dependem do schema real do banco; serão detalhadas quando `schema.txt` for fornecido.

## ESTADO ATUAL DO PROJETO

**Data:** 2026-04-21
**Status:** v1 implementada — Fases 0-8 completas.
**Localização do código:** `openclaw-admin/`
**Build:** Passou. Typecheck: OK. Lint: OK.

### O que existe hoje
- ✅ Documentação completa em `docs/`
- ✅ Mockups de design em `design-assets/`
- ✅ `.env.example` com variáveis necessárias
- ✅ Projeto Next.js 15 completo com design system dark industrial
- ✅ Schema Drizzle mapeado do banco Neon
- ✅ Auth.js v5 com Credentials provider
- ✅ Layout shell: sidebar + header + theme toggle
- ✅ Dashboard com métricas reais
- ✅ Lista de demandas com filtros + paginação
- ✅ CRUD de demandas (criar/editar/excluir)
- ✅ Projetos (listagem)
- ✅ Atividades do agent (read-only)
- ✅ Settings com stats de tokens
- ✅ PWA manifest.json
- ✅ API routes: POST/PATCH/DELETE /api/tasks
- ✅ Script create-admin.ts

### Próximo passo imediato
1. Criar `.env.local` com `DATABASE_URL` e `AUTH_SECRET`
2. Executar `pnpm admin:create email@exemplo.com "Nome" senha` para criar utilizador
3. Executar `pnpm dev` e validar

---

## FASE 0 — Bootstrap

- [x] **TASK-001**: Inicializar projeto Next.js 15 com TypeScript, Tailwind v4, App Router, ESLint, src-less layout (app na raiz). Use pnpm.
- [x] **TASK-002**: Configurar `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true`, paths `@/*`.
- [x] **TASK-003**: Adicionar `.gitignore`, `.editorconfig`, `.nvmrc` (node 22), `.prettierrc` (tabWidth 2, singleQuote, semi false).
- [x] **TASK-004**: Instalar e configurar shadcn/ui: `pnpm dlx shadcn@latest init` com base color neutral, CSS vars, RSC true.
- [x] **TASK-005**: Instalar dependências core: `drizzle-orm @neondatabase/serverless drizzle-kit zod @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers next-auth@beta recharts lucide-react date-fns clsx tailwind-merge`.

## FASE 1 — Banco de dados

- [x] **TASK-010**: Criar `drizzle.config.ts` lendo `DATABASE_URL_UNPOOLED`, schema em `./lib/db/schema.ts`, out em `./drizzle`.
- [x] **TASK-011**: Criar `lib/db/index.ts` exportando cliente Drizzle usando `@neondatabase/serverless` (HTTP driver, edge-compatible) com `DATABASE_URL`.
- [x] **TASK-012**: Schema mapeado manualmente a partir do banco real em `lib/db/schema.ts`.
- [x] **TASK-013**: Schema revisado — tabela `demandas` é a principal, `projetos` e `notas` são auxiliares, `agent_activities` e `uso_tokens` são read-only.
- [x] **TASK-014**: Queries implementadas diretamente nas páginas Server Component (sem pasta separada por ora).

## FASE 2 — Auth

- [x] **TASK-020**: Criar `lib/auth.ts` com Auth.js v5, Credentials provider contra `admin_users`.
- [x] **TASK-021**: Criar `app/api/auth/[...nextauth]/route.ts`.
- [x] **TASK-022**: Criar `middleware.ts` protegendo todas as rotas não-auth.
- [x] **TASK-023**: Criar layout de auth `app/(auth)/layout.tsx`.
- [x] **TASK-024**: Criar `app/(auth)/login/page.tsx` com LoginForm (react-hook-form + zod).
- [x] **TASK-025**: Criar script `scripts/create-admin.ts` para criar o primeiro utilizador admin.

## FASE 3 — Layout do app

- [x] **TASK-030**: Criar `app/(app)/layout.tsx` com sidebar desktop + header.
- [x] **TASK-031**: Theme toggle implementado via `next-themes`.
- [x] **TASK-032**: Criar componentes `app-sidebar.tsx`, `app-header.tsx`.

## FASE 4 — Dashboard

- [x] **TASK-040**: Queries de métricas implementadas em `app/(app)/dashboard/page.tsx`.
- [x] **TASK-041**: Dashboard Server Component com `Promise.all`.
- [x] **TASK-042**: Cards KPI com Skeleton em loading.tsx.
- [x] **TASK-043**: Lista "Últimas 10 demandas" com DashboardStats + RecentDemandas.
- [x] **TASK-044**: Stats de status visíveis nos cards do dashboard.
- [x] **TASK-045**: Link "Ver todas" para /tasks.

## FASE 5 — Lista de demandas

- [x] **TASK-050**: Validação Zod em API routes.
- [x] **TASK-051**: Queries em `app/(app)/tasks/page.tsx`.
- [x] **TASK-052**: `app/(app)/tasks/page.tsx` com filtros URL.
- [x] **TASK-053**: TasksTable com filtros e paginação.
- [x] **TASK-054**: TasksTable cards mobile.
- [x] **TASK-055**: Responsivo: tabela desktop, cards mobile.
- [x] **TASK-056**: Filtros por status/prioridade/projeto via URL params.
- [x] **TASK-057**: Paginação server-side.

## FASE 6 — CRUD de demanda

- [x] **TASK-060**: `app/(app)/tasks/new/page.tsx` com NewTaskForm.
- [x] **TASK-061**: `app/(app)/tasks/[id]/page.tsx` com TaskDetail (view + edit).
- [x] **TASK-062**: Confirmação de exclusão via `confirm()` (sem AlertDialog por ora).

## FASE 7 — Settings

- [x] **TASK-070**: `app/(app)/settings/page.tsx` com perfil e stats de tokens.

## FASE 8 — PWA

- [x] **TASK-080**: `@serwist/next` instalado.
- [x] **TASK-082**: `public/manifest.json` criado.
- [x] **TASK-084**: Metadados PWA em `app/layout.tsx`.
- [x] **TASK-085**: `public/icons/` criado (ícones placeholder pendentes).

## FASE 9 — Qualidade e deploy

- [ ] **TASK-090**: ESLint configurado (eslint-config-next já incluído pelo Next.js).
- [ ] **TASK-091**: Adicionar testes vitest pros validadores Zod.
- [ ] **TASK-092**: Criar `.github/workflows/ci.yml`.
- [ ] **TASK-093**: Criar `Dockerfile` multi-stage.
- [ ] **TASK-094**: `docker-compose.yml` para dev local.
- [ ] **TASK-095**: Documentar deploy na Vercel em `docs/DEPLOY.md`.
- [ ] **TASK-096**: Rate limit nas rotas `/api/*`.
- [ ] **TASK-097**: CSP em `next.config.ts`.
- [ ] **TASK-098**: Lighthouse mobile score ≥ 90.

## FASE 10 — Extras (se schema suportar) 🔶

- [ ] **TASK-100**: Página de histórico de conversas do agent (read-only, paginada)
- [ ] **TASK-101**: Página de reminders/lembretes
- [ ] **TASK-102**: Gerenciamento de tags/categorias
- [ ] **TASK-103**: Busca global (Cmd+K) via `cmdk`

---

## Instruções de execução

Peça ao Claude Code:

> Leia `CLAUDE.md` e `docs/TASKS.md`. Comece pela próxima tarefa pendente. Use `pnpm` e commits pequenos.
