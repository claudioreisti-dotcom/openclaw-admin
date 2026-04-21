# Instruções para o Claude Code

Este arquivo é lido pelo Claude Code sempre que ele abre este repositório. Siga estas regras em todo trabalho neste projeto.

## Contexto

Você está construindo um painel administrativo web em Next.js 15 para complementar um agent Telegram chamado **OpenClaw**. O agent já existe (Python) e escreve num banco PostgreSQL no Neon. Este painel **compartilha** o mesmo banco — não cria um novo.

Leia sempre antes de começar uma sessão:
1. `docs/PROJECT.md` — visão geral
2. `docs/SPEC.md` — o que precisa ser construído
3. `docs/TASKS.md` — tarefas em ordem
4. `docs/ARCHITECTURE.md` — decisões técnicas

## Regras de ouro

### 1. NUNCA modifique o schema do banco sem confirmação explícita
O banco é compartilhado com o agent Python. Alterações destrutivas quebram o agent.
- ✅ Pode: rodar `drizzle-kit introspect` (leitura)
- ✅ Pode: criar **views** ou **novas tabelas** isoladas com prefixo `admin_` se realmente necessário
- ❌ Não pode: alterar/dropar colunas, renomear tabelas, mexer em tipos
- Se achar que precisa alterar algo, pare e pergunte ao usuário

### 2. Sempre use tipos estritos
`tsconfig.json` tem `strict: true`. Nada de `any`. Se um tipo for desconhecido, use `unknown` + validação Zod.

### 3. Validação Zod em toda API route
Toda `app/api/**/route.ts` valida entrada com Zod antes de tocar o banco. Schemas ficam em `lib/validators/`.

### 4. Queries no servidor, mutações via Server Actions ou API routes
- Páginas `page.tsx` (Server Components) buscam dados direto via `lib/db/queries/*`
- Mutações usam Server Actions (`"use server"`) ou POST em `/api/*`
- Nunca importe `lib/db` em Client Components

### 5. Componentes UI vêm do shadcn, não reinvente
Precisa de botão? `pnpm dlx shadcn@latest add button`. Só crie componente próprio em `components/features/`.

### 6. Commits pequenos e descritivos
Um commit por tarefa de `TASKS.md`. Formato: `feat(tasks): add bulk complete action` / `fix(auth): handle expired session`.

### 7. Testes só onde dão ROI
Não escreva testes unitários para componentes triviais. Teste:
- Validadores Zod complexos
- Queries com lógica de negócio
- Auth flow (happy path)
Use `vitest`.

### 8. Performance no mobile é prioridade
- Imagens via `next/image`
- Use Server Components por padrão; `"use client"` só quando precisar de interatividade
- Listas grandes: paginação server-side, nunca carregar tudo
- Checar Lighthouse mobile antes de marcar tarefa como feita

## Stack fixada (não trocar sem perguntar)

```
next@^15
react@^19
typescript@^5.6
tailwindcss@^4
drizzle-orm + drizzle-kit
@neondatabase/serverless
next-auth@beta (v5)
@tanstack/react-query@^5
@tanstack/react-table@^8
react-hook-form + @hookform/resolvers
zod@^3
recharts@^2
@serwist/next  (PWA)
lucide-react   (ícones)
date-fns
```

Package manager: **pnpm**.

## Comandos essenciais

```bash
pnpm install
pnpm dev                          # dev server
pnpm db:introspect                # gera lib/db/schema.ts do banco atual
pnpm db:studio                    # abre Drizzle Studio
pnpm typecheck                    # tsc --noEmit
pnpm lint
pnpm build
pnpm test
```

## Quando travar

Se você estiver em dúvida sobre:
- Qual tabela representa "demandas" → pergunte
- Se deve criar uma coluna nova → pergunte
- Como o agent processa X campo → pergunte, não adivinhe
- Estilo visual → siga shadcn default + paleta neutra

Não assuma nada sobre o domínio. O usuário é a fonte de verdade.

## Checklist antes de marcar uma tarefa como concluída

- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] Funciona em viewport 375px (iPhone SE)
- [ ] Funciona em dark mode
- [ ] Não fez mudança no schema do banco
- [ ] Commit feito com mensagem clara
- [ ] Atualizou `TASKS.md` marcando `[x]`
