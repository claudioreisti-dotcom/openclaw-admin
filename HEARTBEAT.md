# HEARTBEAT.md

## Verificações periódicas

### 📬 Email
Execute: `python3 /home/claudioreis/.openclaw/workspace/scripts/check_email.py`

- Se retornar `NENHUM_IMPORTANTE` → HEARTBEAT_OK
- Se retornar emails importantes → me alertar com o conteúdo resumido

### Frequência sugerida
- Email: a cada heartbeat (verifica apenas não lidos recentes)
