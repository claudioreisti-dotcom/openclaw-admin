# HEARTBEAT.md

## Verificações periódicas

### 📬 Email
Execute: `python3 /home/claudioreis/.openclaw/workspace/scripts/check_email.py`

- Se retornar `NENHUM_IMPORTANTE` → HEARTBEAT_OK
- Se retornar emails importantes → me alertar com o conteúdo resumido

### 📬 Email NOXTEC (Microsoft 365)
Execute: `python3 /home/claudioreis/.openclaw/workspace/scripts/check_email_noxtec.py`

- Se retornar `NENHUM_IMPORTANTE` → HEARTBEAT_OK
- Se retornar emails importantes → alertar com o conteúdo resumido

### Frequência sugerida
- Email R4 (Gmail): a cada heartbeat (verifica apenas não lidos recentes)
- Email NOXTEC (M365): a cada heartbeat (verifica últimas 4 horas)
