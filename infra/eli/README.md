# Elí — Assistente Financeiro Pessoal

Produto de controle de despesas pessoais via Telegram (fase 1).

## Banco de dados (Neon)
- **Connection string:** `postgresql://neondb_owner:npg_4fESb1ptLRZo@ep-wandering-tree-agq15mif-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Região:** eu-central-1 (Frankfurt)

## Tabelas
- `usuarios` — usuários do sistema
- `cartoes` — cartões de crédito/débito
- `categorias` — categorias de gastos (13 padrão)
- `orcamentos` — limite mensal por categoria
- `transacoes` — todos os lançamentos (gastos e entradas)
- `recorrentes` — assinaturas e cobranças fixas
- `parcelamentos` — compras parceladas

## Roadmap
- [x] Fase 1: uso pessoal via Telegram
- [ ] Fase 2: WhatsApp
- [ ] Fase 3: PWA
- [ ] Fase 4: multi-usuário / produto comercial
