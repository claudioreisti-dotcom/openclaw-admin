# Tarefas para o Claude Code

Execute em ordem. Um commit por tarefa. Marque `[x]` quando concluir.
Tarefas marcadas 🔶 dependem do schema real do banco; serão detalhadas quando `schema.txt` for fornecido.

## ESTADO ATUAL DO PROJETO

**Data:** 2026-04-21
**Status:** Pré-desenvolvimento — nenhuma task concluída.
**Localização do código:** `openclaw-admin/` (pasta vazia, aguardando TASK-001)
**Bloqueio ativo:** Schema do banco Neon não extraído — tarefas 🔶 aguardam `DATABASE_URL`

### O que existe hoje
- ✅ Documentação completa em `docs/`
- ✅ Mockups de design em `design-assets/`
- ✅ `.env.example` com variáveis necessárias
- ✅ `scripts/inspect_db.py` pronto para extrair schema
- ❌ Código Next.js — ainda não criado
- ❌ Schema do banco — aguarda introspect

### Próximo passo imediato
1. Criar `.env.local` em `openclaw-admin/` com `DATABASE_URL` do Neon
2. Rodar `python scripts/inspect_db.py` para gerar schema
3. Executar TASK-001

---

## FASE 0 — Bootstrap

- [ ] **TASK-001**: Inicializar projeto Next.js 15 com TypeScript, Tailwind v4, App Router, ESLint, src-less layout (app na raiz). Use pnpm.
- [ ] **TASK-002**: Configurar `tsconfig.json` com `strict: true`, `noUncheckedIndexedAccess: true`, paths `@/*`.
- [ ] **TASK-003**: Adicionar `.gitignore`, `.editorconfig`, `.nvmrc` (node 22), `.prettierrc` (tabWidth 2, singleQuote, semi false).
- [ ] **TASK-004**: Instalar e configurar shadcn/ui: `pnpm dlx shadcn@latest init` com base color neutral, CSS vars, RSC true.
- [ ] **TASK-005**: Instalar dependências core: `drizzle-orm @neondatabase/serverless drizzle-kit zod @tanstack/react-query @tanstack/react-table react-hook-form @hookform/resolvers next-auth@beta recharts lucide-react date-fns clsx tailwind-merge`.

## FASE 1 — Banco de dados

- [ ] **TASK-010**: Criar `drizzle.config.ts` lendo `DATABASE_URL_UNPOOLED`, schema em `./lib/db/schema.ts`, out em `./drizzle`.
- [ ] **TASK-011**: Criar `lib/db/index.ts` exportando cliente Drizzle usando `@neondatabase/serverless` (HTTP driver, edge-compatible) com `DATABASE_URL`.
- [ ] **TASK-012**: Rodar `pnpm db:introspect` (script npm: `drizzle-kit introspect`) para gerar `lib/db/schema.ts` a partir do banco real. **Não editar manualmente** depois.
- [ ] **TASK-013**: Revisar o schema gerado, anotar em `docs/ARCHITECTURE.md` qual tabela é a "demanda principal" e quais são auxiliares.
- [ ] **TASK-014**: Criar `lib/db/queries/` com um arquivo por agrupamento lógico (ex: `tasks.ts`, `metrics.ts`, `users.ts`).

## FASE 2 — Auth

- [ ] **TASK-020**: Criar `lib/auth.ts` com Auth.js v5, Credentials provider validando contra a tabela de usuários do banco. Se não houver tabela de usuários compatível com login web, criar tabela `admin_users` (prefixo `admin_` para isolar do agent) com `id`, `email`, `password_hash`, `name`, `telegram_user_id` (FK opcional), `created_at`. Esta é a única exceção autorizada à regra de "não criar tabelas".
- [ ] **TASK-021**: Criar `app/api/auth/[...nextauth]/route.ts`.
- [ ] **TASK-022**: Criar `middleware.ts` protegendo `/dashboard`, `/tasks`, `/settings`.
- [ ] **TASK-023**: Criar layout de auth `app/(auth)/layout.tsx` (centralizado, logo, sem header).
- [ ] **TASK-024**: Criar `app/(auth)/login/page.tsx` com form (shadcn Form + react-hook-form + zod).
- [ ] **TASK-025**: Criar script `scripts/create-admin.ts` (tsx) para criar o primeiro usuário admin via CLI (`pnpm admin:create`).

## FASE 3 — Layout do app

- [ ] **TASK-030**: Criar `app/(app)/layout.tsx` com:
  - Sidebar (desktop) / bottom nav + sheet (mobile)
  - Header com busca global, user menu, theme toggle
  - Container principal com padding responsivo
- [ ] **TASK-031**: Implementar theme toggle (claro/escuro/sistema) via `next-themes`.
- [ ] **TASK-032**: Criar componentes `components/features/app-sidebar.tsx`, `app-header.tsx`, `user-menu.tsx`.

## FASE 4 — Dashboard

- [ ] **TASK-040** 🔶: Criar `lib/db/queries/metrics.ts` com funções: `getActiveTasksCount`, `getCompletedLast7Days`, `getTasksByStatus`, `getTasksByPriority`, `getCreationTrend30Days`.
- [ ] **TASK-041**: Criar `app/(app)/dashboard/page.tsx` (Server Component) buscando métricas em paralelo com `Promise.all`.
- [ ] **TASK-042**: Implementar cards de KPI com Skeleton em loading.tsx.
- [ ] **TASK-043**: Implementar gráfico de linha (Recharts) "Criadas vs Concluídas / dia".
- [ ] **TASK-044**: Implementar donut "Distribuição por status".
- [ ] **TASK-045**: Implementar lista "Últimas 10 demandas" com link pro detalhe.

## FASE 5 — Lista de demandas

- [ ] **TASK-050** 🔶: Criar `lib/validators/task.ts` com schemas Zod (`taskFilterSchema`, `taskCreateSchema`, `taskUpdateSchema`).
- [ ] **TASK-051** 🔶: Criar `lib/db/queries/tasks.ts` com `listTasks(filters, page)`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `bulkUpdateTasks`.
- [ ] **TASK-052**: Criar `app/(app)/tasks/page.tsx` lendo filtros da URL (searchParams), passando para a query.
- [ ] **TASK-053**: Criar componente `TaskTable` (TanStack Table + shadcn Table) com colunas, ordenação, seleção.
- [ ] **TASK-054**: Criar componente `TaskCard` (versão mobile) com mesmos dados.
- [ ] **TASK-055**: Responsivo: `<hidden md:block>` para tabela, `<md:hidden>` para cards.
- [ ] **TASK-056**: Criar componente `TaskFilters` (sidebar desktop, sheet mobile) que atualiza URL ao mudar filtro (`useRouter().replace` com `nuqs` ou URLSearchParams).
- [ ] **TASK-057**: Implementar paginação server-side com componente `Pagination` shadcn.
- [ ] **TASK-058**: Implementar bulk actions bar com Server Actions (`markAsDone`, `archive`, `changePriority`, `deleteMany`).
- [ ] **TASK-059**: Toasts de sucesso/erro via sonner (shadcn).

## FASE 6 — CRUD de demanda

- [ ] **TASK-060** 🔶: Criar `app/(app)/tasks/new/page.tsx` com form completo.
- [ ] **TASK-061** 🔶: Criar `app/(app)/tasks/[id]/page.tsx` (detalhe com modo view/edit).
- [ ] **TASK-062**: Confirmação modal para exclusão (shadcn AlertDialog).
- [ ] **TASK-063** 🔶: Se houver tabela de histórico/logs, exibir timeline na página de detalhe.

## FASE 7 — Settings

- [ ] **TASK-070**: Criar `app/(app)/settings/page.tsx` com abas: Perfil, Preferências, Telegram, Dados.
- [ ] **TASK-071**: Form de perfil (nome, email, senha atual, nova senha).
- [ ] **TASK-072**: Export CSV/JSON via Server Action retornando `Response` com `Content-Disposition: attachment`.

## FASE 8 — PWA

- [ ] **TASK-080**: Instalar `@serwist/next`. Configurar `next.config.ts` com `withSerwist`.
- [ ] **TASK-081**: Criar `app/sw.ts` com precache e runtime caching strategies.
- [ ] **TASK-082**: Criar `public/manifest.json` com name, short_name, icons (192, 512, maskable), theme_color, background_color, display "standalone", start_url "/dashboard".
- [ ] **TASK-083**: Gerar ícones (192/512/maskable) — placeholder simples ok, usuário troca depois.
- [ ] **TASK-084**: Adicionar metadados PWA em `app/layout.tsx` (`metadata.manifest`, Apple touch icons).
- [ ] **TASK-085**: Criar `app/offline/page.tsx`.

## FASE 9 — Qualidade e deploy

- [ ] **TASK-090**: Configurar ESLint com `eslint-config-next` + `@typescript-eslint` + regras customizadas.
- [ ] **TASK-091**: Adicionar `vitest` + testes pros validadores Zod principais.
- [ ] **TASK-092**: Criar `.github/workflows/ci.yml` rodando typecheck, lint, test, build em push/PR.
- [ ] **TASK-093**: Criar `Dockerfile` multi-stage com Next standalone output.
- [ ] **TASK-094**: Criar `docker-compose.yml` para dev local (opcional, banco continua no Neon).
- [ ] **TASK-095**: Documentar deploy na Vercel em `docs/DEPLOY.md`.
- [ ] **TASK-096**: Rate limit simples via middleware em rotas `/api/*` (in-memory ou Upstash).
- [ ] **TASK-097**: Adicionar CSP em `next.config.ts` para produção.
- [ ] **TASK-098**: Rodar Lighthouse mobile; iterar até score ≥ 90 em todas as categorias.

## FASE 10 — Extras (se schema suportar) 🔶

- [ ] **TASK-100**: Página de histórico de conversas do agent (read-only, paginada)
- [ ] **TASK-101**: Página de reminders/lembretes
- [ ] **TASK-102**: Gerenciamento de tags/categorias
- [ ] **TASK-103**: Busca global (Cmd+K) via `cmdk`

---

## Instruções de execução

Peça ao Claude Code:

> Leia `CLAUDE.md` e `docs/TASKS.md`. Comece pela TASK-001 e vá em ordem. Pause após cada fase para eu validar. Use `pnpm` e commits pequenos.
