# Arquitetura — decisões técnicas

## Coexistência com o agent Python

O banco Neon é **fonte única de verdade** compartilhada entre:
- Agent OpenClaw (Python, Telegram) — **produtor/consumidor**
- Este painel web (Next.js) — **produtor/consumidor**

### Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Painel altera schema e quebra o agent | `CLAUDE.md` proíbe alterações de schema; usar introspecção apenas |
| Race condition em atualizações simultâneas | Usar `UPDATE ... WHERE updated_at = ?` (optimistic locking) nas mutações sensíveis |
| Campos criados pelo agent desconhecidos no painel | Drizzle introspect pega **tudo**; campos não usados ficam no schema sem quebrar |
| Enums novos adicionados pelo agent | Re-rodar `pnpm db:introspect` periodicamente; CI falha se `schema.ts` estiver desatualizado |

## Camadas de acesso a dados

```
page.tsx (RSC)
   └─> lib/db/queries/tasks.ts      (funções de leitura)
          └─> drizzle client (lib/db/index.ts)
                 └─> Neon pooled

"use server" action / api route
   └─> validação Zod (lib/validators)
         └─> lib/db/queries/tasks.ts (funções de escrita)
                └─> drizzle client
```

**Regra:** componentes nunca importam `drizzle` direto. Passam por `lib/db/queries/*`.

## Autenticação

- **Auth.js v5** com estratégia Credentials (email/senha bcrypt) por padrão
- Opcional: Telegram Login Widget → cria sessão vinculando `telegram_user_id` existente no banco
- Sessão JWT (sem tabela extra, simples pra começar)
- Middleware (`middleware.ts`) usa matcher para proteger `/dashboard`, `/tasks`, `/settings` (App Router usa path matchers, não estrutura de pastas)

## PWA

- `@serwist/next` (fork mantido do next-pwa, compatível com Next 15 + App Router)
- Manifest com `display: standalone`, ícones 192/512
- Precaching só de assets estáticos; dados sempre via rede (stale-while-revalidate opcional em `/dashboard`)

## Performance budget (mobile)

- LCP < 2.5s em 3G lento
- JS inicial < 180KB gzip
- Rota `/tasks` com 1000 itens: paginação server-side de 50 por página

## Observabilidade

- Logs estruturados via `pino` (produção) / console (dev)
- Erros em `app/error.tsx` + `app/global-error.tsx`
- Integração opcional com Sentry (comentada no `next.config.ts`)

## CI/CD

- GitHub Actions: typecheck + lint + build em PR
- Deploy automático na Vercel ao merge em `main`
- `drizzle-kit check` no CI pra detectar drift entre `schema.ts` e banco

## Dockerfile (multi-stage)

- `base` node:22-alpine
- `deps` instala com `pnpm install --frozen-lockfile`
- `builder` roda `pnpm build`
- `runner` com apenas `.next/standalone` (~150MB imagem final)
