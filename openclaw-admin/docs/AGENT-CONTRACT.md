# Contrato com o Agent OpenClaw

## Leitura obrigatória antes de qualquer mutação no banco

O painel Alfred compartilha o banco Neon com o agent Python OpenClaw. Este documento define o contrato de dados entre os dois sistemas.

## Princípio Geral

| Sistema | Papel | Regra |
|---|---|---|
| Agent OpenClaw (Python/Telegram) | Produtor primário | Cria, atualiza e lê demandas via Telegram |
| Painel Alfred (Next.js) | Produtor secundário | Lê e edita demandas via interface web |

**Regra de ouro:** Ambos os sistemas têm leitura/escrita. Nunca assumir que um campo é "só leitura" sem verificar no código do agent.

## Schema do Banco

> Aguarda execução de `scripts/inspect_db.py`.
>
> Quando o schema for extraído, documentar aqui:
> - Quais tabelas o agent **cria** registos
> - Quais tabelas o agent **lê** para tomar decisões
> - Campos que o agent usa como **sinais** (ex: mudar `status` para X pode disparar ação no Telegram)
> - Campos que o painel pode editar **com segurança**
> - Campos que o painel **não deve editar** (usados como flags pelo agent)

## Campos de Alto Risco (a verificar)

Antes de expor um campo para edição no painel, verificar se:
- [ ] O agent usa este campo como condição de trigger
- [ ] Mudar o valor pode disparar mensagem no Telegram
- [ ] O campo tem semântica especial no fluxo do agent

## Sincronização

- Não há sincronização em tempo real (sem webhooks/websockets na v1)
- Atualizações mútuas são detectadas via `updated_at` (optimistic locking nas mutações)
- Se houver conflito: o painel mostra erro "registo atualizado recentemente, recarregue"

## Re-introspectar o Schema

Quando o agent for atualizado com novas tabelas/colunas:
1. Rodar `pnpm db:introspect` em `openclaw-admin/`
2. Revisar diff do `lib/db/schema.ts`
3. Atualizar este documento com novos campos de risco
4. Verificar se alguma query existente precisa de ajuste
