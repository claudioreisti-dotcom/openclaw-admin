# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Banco de Dados

### Neon (PostgreSQL)
- **Connection string:** `postgresql://neondb_owner:npg_l3YFpsexZPD4@ep-proud-band-al415dko-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Região:** eu-central-1 (Frankfurt)
- **Tabelas:** `projetos`, `demandas`, `gastos`, `notas`
- **Uso:** Sala de controle — demandas, projetos, gastos pessoais/profissionais

## TTS

- **Provedor atual:** Microsoft Edge TTS (gratuito, sem API key)
- **Voz configurada:** pt-BR-AntonioNeural
- **Modo:** inbound (só responde em voz quando recebe áudio)
- **TODO:** Integrar n8n como endpoint TTS personalizado para voz de melhor qualidade

## Email - Microsoft 365

- **Email:** claudio.reis@noxcare.com.br
- **Tenant ID:** f2bc8c37-afb8-4157-a4af-dea016478e5e
- **Client ID:** 42e0e89d-e378-47ce-83e0-c61c6e01a533
- **Client Secret:** 5yi8Q~rG8KDC70E9u_AWZmNf_v7EawXab8dFia2Y
- **Permissões necessárias:** Mail.Read, Mail.Send, Mail.ReadWrite (admin consent pendente)
