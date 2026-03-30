# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Git / Backup

- **Repositório:** https://github.com/claudioreisti-dotcom/alfred.git
- **Token:** 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
- **Branch:** main

## Metabase — Sala de Controle

- **URL:** http://46.225.182.16:3000
- **Admin:** admin@r4tecnologias.com.br
- **Senha:** 214833Oidu@lc
- **Dashboard ID:** 2 (Sala de Controle)
- **Database ID:** 2 (Sala de Controle — Neon PostgreSQL)

## Banco de Dados

### Neon (PostgreSQL)
- **Connection string:** `postgresql://neondb_owner:npg_l3YFpsexZPD4@ep-proud-band-al415dko-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Região:** eu-central-1 (Frankfurt)
- **Tabelas:** `projetos`, `demandas`, `gastos`, `notas`
- **Uso:** Sala de controle — demandas, projetos, gastos pessoais/profissionais

## WhatsApp Alfred
- **Número:** +55 11 52868645 → (11) 5286-8645
- **Uso:** Número dedicado para Alfred atender via WhatsApp
- **Status:** chip recebido — configuração pendente

## TTS

- **Provedor atual:** Microsoft Edge TTS (gratuito, sem API key)
- **Voz configurada:** pt-BR-AntonioNeural
- **Modo:** inbound (só responde em voz quando recebe áudio)
- **Google Cloud TTS (ativo):**
  - API Key: AIzaSyAycAfqtqUZdc2ZDmu_a_c8mwD0bXr-lSY
  - Voz: pt-BR-Chirp3-HD-Algieba (masculina, grave)
  - Velocidade: 1.5x
  - Proxy: http://127.0.0.1:5050 (systemd: tts-proxy)
  - Limite gratuito: 1M caracteres/mês

## Email - Gmail (R4 Tecnologias)

- **Email:** admin@r4tecnologias.com.br (alias: claudio.reis@r4tecnologias.com.br)
- **App Password:** lrfo pxzu bomh vnvo
- **Protocolo:** IMAP (imap.gmail.com:993) / SMTP (smtp.gmail.com:587)

## Email - Microsoft 365

- **Email:** claudio.reis@noxtec.com.br
- **Tenant ID:** f2bc8c37-afb8-4157-a4af-dea016478e5e
- **Client ID:** 42e0e89d-e378-47ce-83e0-c61c6e01a533
- **Client Secret:** 5yi8Q~rG8KDC70E9u_AWZmNf_v7EawXab8dFia2Y
- **Permissões necessárias:** Mail.Read, Mail.Send, Mail.ReadWrite (admin consent pendente)

## HetrixTools

- **URL:** https://hetrixtools.com/login/
- **Usuário:** creys2005@gmail.com
- **Senha:** 214833Oidu@lc
- **Uso:** Monitoramento externo + blacklist monitoring
- **Monitores:** R4 Frota e R4 Telemetria
- **Ajuste pendente:** Trocar URL de `/` para `/health/ready` nos monitores do Frota/Telemetria

## Gmail Pessoal (Cláudio)

- **Email:** creys2005@gmail.com
- **Senha:** 214833Oidu@lc
- **Nota:** App Password para IMAP não configurada ainda
