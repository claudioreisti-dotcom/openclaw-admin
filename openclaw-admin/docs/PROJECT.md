# OpenClaw Admin — Interface Web

> **Nomenclatura:** O painel é chamado internamente de **Alfred** (nome de código). O agent Telegram chama-se **OpenClaw**. Este repositório (`alfred/`) contém o workspace do projeto; o código da aplicação web fica em `openclaw-admin/`.

Painel web para administrar demandas/atividades que hoje são geridas pelo agent OpenClaw no Telegram. Compartilha o mesmo banco PostgreSQL (Neon) que o agent, então as alterações feitas no painel são refletidas no Telegram e vice-versa.

## Objetivo

Permitir ao usuário operar o mesmo conjunto de ações do agent do Telegram, porém numa interface visual: listar, criar, editar, concluir, filtrar, buscar e analisar as demandas, com dashboard de métricas e suporte a uso mobile (PWA instalável).

## Decisões arquiteturais

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Full-stack num projeto só, Server Components, deploy trivial na Vercel |
| Linguagem | **TypeScript (strict)** | Tipos ponta-a-ponta; o Claude Code gera código mais correto com types fortes |
| UI | **Tailwind CSS v4 + shadcn/ui** | Componentes copiados (não dependência), fácil de customizar. Tailwind v4 usa configuração via CSS (`@theme`), sem `tailwind.config.ts` |
| ORM | **Drizzle ORM + drizzle-kit** | Introspecção do banco existente sem alterá-lo; tipos gerados do schema real |
| Banco | **Neon PostgreSQL** (compartilhado com o agent) | Sem duplicação de dados; fonte única de verdade |
| Auth | **Auth.js v5 (NextAuth)** | Credencial email/senha + opcional login via Telegram widget |
| Estado servidor | **TanStack Query** | Cache, refetch, optimistic updates |
| Validação | **Zod** | Schemas reaproveitados entre API e forms |
| Forms | **react-hook-form + zodResolver** | Performance e DX |
| Tabelas | **TanStack Table** | Colunas flexíveis, ordenação, filtros, bulk selection |
| Charts | **Recharts** | Simples, responsivo, suficiente pro dashboard |
| PWA | **@serwist/next** (sucessor do next-pwa) | Compatível com Next 15 |
| Deploy | **Vercel** (app) + **Neon** (db) | Mesma região = latência baixa |
| Hosting alternativo | Railway, Render, self-host Docker | Dockerfile incluído |

## Arquitetura de alto nível

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   Telegram (OpenClaw)    │         │   Web App (Next.js)      │
│   agent Python existente │         │   este projeto           │
└─────────────┬────────────┘         └────────────┬─────────────┘
              │                                   │
              │  escreve/lê                       │  escreve/lê via Drizzle
              └──────────────┬────────────────────┘
                             ▼
                  ┌─────────────────────┐
                  │  Neon PostgreSQL    │
                  │  (fonte única)      │
                  └─────────────────────┘
```

**Regra de ouro:** o painel **não recria** o schema. Ele introspecta o banco do agent via `drizzle-kit introspect` e gera os tipos a partir dele. Qualquer migração estrutural precisa ser coordenada com o agent.

## Funcionalidades (escopo)

### Núcleo
- [ ] Login (email/senha; opcional Telegram)
- [ ] Dashboard com métricas (total de demandas, por status, por prioridade, últimas 7 dias)
- [ ] Listagem com **filtros** (status, prioridade, data, texto) e **busca full-text**
- [ ] CRUD completo de demandas
- [ ] **Bulk actions** (concluir, arquivar, mudar prioridade em massa)
- [ ] Mobile-first + **PWA instalável**
- [ ] Tema claro/escuro

### Extras (se o schema suportar)
- [ ] Histórico de conversas com o agent (read-only)
- [ ] Lembretes / reminders
- [ ] Tags / categorias
- [ ] Notas soltas
- [ ] Export CSV/JSON

> O conjunto final depende das tabelas que existirem no banco. Quando o schema for fornecido, `SPEC.md` e `TASKS.md` serão atualizados com a lista definitiva.

## Estrutura do repositório

```
openclaw-admin/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # rotas públicas (login)
│   ├── (app)/                    # rotas protegidas
│   │   ├── dashboard/
│   │   ├── tasks/                # ou o nome da entidade principal
│   │   └── settings/
│   ├── api/                      # route handlers
│   │   ├── auth/[...nextauth]/
│   │   └── trpc/                 # se optar por tRPC depois
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn
│   └── features/                 # componentes de domínio
├── lib/
│   ├── db/
│   │   ├── schema.ts             # gerado por drizzle-kit introspect
│   │   ├── index.ts              # cliente drizzle
│   │   └── queries/              # queries reutilizáveis
│   ├── auth.ts                   # config Auth.js
│   ├── validators/               # zod schemas
│   └── utils.ts
├── hooks/
├── public/
│   ├── manifest.json             # PWA
│   └── icons/
├── scripts/
│   ├── introspect.sh             # roda drizzle-kit introspect
│   └── seed-dev.ts               # dados fake pra dev local
├── docs/
│   ├── PROJECT.md                # este arquivo
│   ├── SPEC.md                   # spec funcional detalhada (a completar)
│   ├── TASKS.md                  # tarefas pro Claude Code (a completar)
│   └── ARCHITECTURE.md           # decisões técnicas
├── CLAUDE.md                     # instruções pro Claude Code
├── .env.example
├── .env.local                    # ignorado
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
├── README.md
└── .gitignore
```

## Fluxo de desenvolvimento (100% Claude Code)

1. Clonar repo vazio, abrir no Claude Code
2. Claude Code lê `CLAUDE.md` e `docs/TASKS.md`
3. Executa as tarefas em ordem, uma por commit
4. Testa localmente com `pnpm dev` (você confirma no browser)
5. Deploy via `vercel deploy` ou `docker build`

## Variáveis de ambiente

Ver `.env.example`. Principais:

- `DATABASE_URL` — connection string do Neon (pooled, com `?sslmode=require`)
- `DATABASE_URL_UNPOOLED` — para migrations
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` em dev
- `NEXT_PUBLIC_APP_URL` — URL pública
- `TELEGRAM_BOT_TOKEN` — (opcional) se usar login via Telegram widget

## Segurança

- Senha do Neon **nunca** no repo. Use `.env.local` (gitignored) ou o painel da Vercel.
- `AUTH_SECRET` gerado localmente, nunca commitado.
- Rate limit nas API routes (`@upstash/ratelimit` ou middleware simples).
- Validação Zod em toda entrada de API.
- CSP estrito em produção (configurado no `next.config.ts`).
- Rotacionar a senha do Neon imediatamente se ela já foi exposta.
