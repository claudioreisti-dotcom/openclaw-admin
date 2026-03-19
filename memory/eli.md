# Projeto Elí — Assistente Financeiro Pessoal

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
