# Contrato com o Agent OpenClaw

## Leitura obrigatória antes de qualquer mutação no banco

O painel Alfred compartilha o banco Neon com o agent Python OpenClaw. Este documento define o contrato de dados entre os dois sistemas.

## Princípio Geral

| Sistema | Papel | Regra |
|---|---|---|
| Agent OpenClaw (Python/Telegram) | Produtor primário | Cria, atualiza e lê demandas via Telegram |
| Painel Alfred (Next.js) | Produtor secundário | Lê e edita demandas via interface web |

**Regra de ouro:** Ambos os sistemas têm leitura/escrita. Nunca assumir que um campo é "só leitura" sem verificar no código do agent.

## Schema do Banco (extraído em 2026-04-21)

### `demandas` — entidade principal (44 linhas)

| Coluna | Tipo | Null | Observações |
|---|---|---|---|
| id | integer | NO | PK, auto-increment |
| titulo | varchar(300) | NO | Editável pelo painel |
| descricao | text | YES | Editável pelo painel |
| projeto_id | integer | YES | FK → projetos.id |
| status | varchar(50) | YES | Default 'pendente' — **⚠️ campo de sinal** |
| prioridade | varchar(20) | YES | Default 'media' — Editável |
| responsavel | varchar(100) | YES | Editável pelo painel |
| data_limite | date | YES | Editável pelo painel |
| data_conclusao | date | YES | Editável; agent pode setar ao concluir |
| tags | ARRAY | YES | Array de texto — editável |
| criado_em | timestamp | YES | Read-only |
| atualizado_em | timestamp | YES | Atualizar em toda mutação |

**Valores de status observados:** `pendente`, `concluida`, `em_andamento`

### `projetos` — projetos (10 linhas)

| Coluna | Tipo | Null | Observações |
|---|---|---|---|
| id | integer | NO | PK |
| nome | varchar(200) | NO | Editável |
| descricao | text | YES | Editável |
| status | varchar(50) | YES | Default 'ativo' |
| prioridade | varchar(20) | YES | Default 'media' |
| criado_em | timestamp | YES | Read-only |
| atualizado_em | timestamp | YES | Atualizar em toda mutação |

### `notas` — notas (27 linhas)

| Coluna | Tipo | Null | Observações |
|---|---|---|---|
| id | integer | NO | PK |
| titulo | varchar(200) | YES | Opcional |
| conteudo | text | YES | Corpo da nota |
| demanda_id | integer | YES | FK → demandas.id (mutuamente exclusivo com projeto_id) |
| projeto_id | integer | YES | FK → projetos.id |
| criado_em | timestamp | YES | Read-only |

### `agent_activities` — atividades do agent (10 linhas) ⚠️ READ-ONLY no painel

| Coluna | Tipo | Null | Observações |
|---|---|---|---|
| id | integer | NO | PK |
| agent | varchar(50) | NO | Nome do agent ('alfred', 'bugou', etc.) |
| titulo | varchar(200) | NO | Descrição da atividade |
| descricao | text | YES | Detalhe |
| status | varchar(20) | NO | Default 'pendente' |
| prioridade | varchar(10) | YES | Default 'media' |
| iniciado_em | timestamp | YES | Timestamp de início |
| concluido_em | timestamp | YES | Timestamp de conclusão |
| criado_em | timestamp | YES | Read-only |
| atualizado_em | timestamp | YES | Read-only |
| metadata | jsonb | YES | Dados estruturados do agent |

**O painel deve exibir esta tabela como read-only.** O agent grava aqui automaticamente.

### `uso_tokens` — custo LLM (0 linhas) — read-only no painel

| Coluna | Tipo | Observações |
|---|---|---|
| data | date | Data de uso |
| sessao | varchar(100) | ID de sessão |
| modelo | varchar(100) | Modelo usado |
| tokens_entrada / tokens_saida / tokens_total | integer | Contagens |
| custo_usd | numeric | Custo em USD |

### `admin_users` — utilizadores do painel *(a criar — prefixo admin_)*

Esta tabela **não existe no banco** e será criada pelo painel (única exceção permitida):
- `id`, `email`, `password_hash`, `name`, `telegram_user_id` (FK opcional), `created_at`

## Campos de Alto Risco ⚠️

| Campo | Tabela | Risco | Ação |
|---|---|---|---|
| `status` | demandas | Agent pode ler para decidir próximas ações | Expor com cautela; não usar valores não documentados |
| `data_conclusao` | demandas | Agent pode setar ao concluir via Telegram | Aceitar edição manual, mas usar optimistic locking |
| `agent_activities.*` | agent_activities | Toda a tabela é escrita pelo agent | **Read-only no painel** |
| `uso_tokens.*` | uso_tokens | Toda a tabela é escrita pelo agent | **Read-only no painel** |

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
