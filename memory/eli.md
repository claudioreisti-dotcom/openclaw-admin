# Projeto Elí — Assistente Financeiro Pessoal

## Origem do nome
Eli — homenagem à mãe de Cláudio Reis, **Elienai**.

## Visão geral
Assistente financeiro via Telegram para controle de gastos, receitas, recorrentes e parcelados.
Fase atual: uso pessoal de Cláudio Reis. Futuro: produto comercial.

## Repositório
https://github.com/claudioreisti-dotcom/eli.git

## Bot Telegram
- **Username:** @appeli_bot
- **Token:** `8668345383:AAHXd2sOziSVCuuUfLuKR9K7geh4cDOLuFg`

## Banco de dados
- **Neon PostgreSQL:** `postgresql://neondb_owner:npg_4fESb1ptLRZo@ep-wandering-tree-agq15mif-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Tabelas:** usuarios, cartoes, categorias, orcamentos, transacoes, recorrentes, parcelamentos

## IA
- **Provedor:** Anthropic Claude
- **Modelo:** claude-haiku-4-5
- **API Key:** `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`

## Serviço
- Rodando como systemd: `systemctl status eli`
- Código em: `/home/claudioreis/eli/`

## Histórico importado
- 1.496 transações do Organizze/sistema anterior (2023-2026)
- Contas: Nubank CR, Inter PJ, Itaú NOX, C6 CR, Inter Black, Rico, Caixa, Mercado Pago

## Funcionalidades implementadas
- [x] Lançamento de gastos em linguagem natural
- [x] Lançamento de entradas
- [x] Perguntas livres respondidas por IA com contexto do banco
- [x] /resumo — resumo mensal
- [x] /categorias — gastos por categoria
- [x] /ultimas — últimas transações
- [x] /cartoes — cartões cadastrados
- [x] /addcartao / /novo_cartao — cadastrar cartão
- [x] Histórico de conversa em memória

## Roadmap
- [ ] Alertas proativos (fatura fechando, orçamento estourando)
- [ ] Cadastro de recorrentes via chat
- [ ] Cadastro de parcelamentos via chat
- [ ] Dashboard Metabase dedicado
- [ ] Migração para Agno framework (quando escalar)
- [ ] WhatsApp (fase 2)
- [ ] PWA (fase 3)
- [ ] Multi-usuário / produto comercial (fase 4)

## Decisões técnicas
- Bot Python puro (python-telegram-bot) — mais controle que OpenClaw para produto comercial
- Agno avaliado mas adiado — bot atual funciona, migrar quando escalar
- Sem ADs — monetização por assinatura R$9,90/mês + afiliados contextuais
- WhatsApp: usar número dedicado para evitar bloqueio Meta

## Scripts de importação
- `/home/claudioreis/eli/import_nubank.py` — CSV do Nubank (automático, detecção de duplicatas)
- `/home/claudioreis/eli/import_itau_manual.py` — Itaú NOX (manual, extraído do PDF)
- `/home/claudioreis/eli/import_mp.py` — Mercado Pago (manual, extraído do PDF)
- `/home/claudioreis/eli/eli_api.py` — API para Alfred usar no WhatsApp

## Fluxo mensal
1. Exportar faturas dos cartões → importar com os scripts
2. Exportar extratos conta corrente Nubank + Itaú (pendente)
3. Baixar recorrentes/parcelamentos pagos no mês

## Importações realizadas (março/2026)
- Nubank CR: 69 lançamentos (fev/mar)
- Itaú NOX: 39 lançamentos (fev/mar)
- Mercado Pago: 21 lançamentos (fev/mar)
- Inter Black: já estava no banco (Medcof - Tati 1/12)

## Pendente
- Extratos conta corrente Nubank + Itaú (Cláudio vai exportar)

## Roadmap revisado (19/03/2026)

### Fase 1 — Consolidação (agora)
- [x] Bot Telegram funcionando
- [x] Banco com histórico importado
- [x] Recorrentes e parcelamentos cadastrados
- [x] Categorias organizadas
- [x] Visão competência + caixa
- [x] eli_api.py para WhatsApp/Alfred
- [ ] /resumo_caixa no bot Telegram
- [ ] Alertas proativos (fatura fechando, orçamento estourando)
- [ ] Cadastro de recorrentes/parcelamentos via chat
- [ ] Automação importação faturas (menos manual)

### Fase 2 — Dashboard
- [ ] Metabase conectado ao banco Eli
- [ ] Painéis: mensal, categorias, fluxo de caixa, parcelamentos

### Fase 3 — PWA
- Após 2-3 meses de dados confiáveis e fluxo estável

### Fase 4 — Produto comercial / Multi-usuário
