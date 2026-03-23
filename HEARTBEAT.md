# HEARTBEAT.md

## Verificações periódicas

> ⚠️ Emails são verificados por cron dedicado (a cada hora). NÃO verificar no heartbeat para evitar duplicatas.
> ⚠️ Alertas de email: NÃO notificar proativamente. Cláudio lê quando quiser.

### 📋 Demandas paradas
Execute: `python3 /home/claudioreis/.openclaw/workspace/scripts/check_demandas_paradas.py`

- Se retornar `NENHUMA_PARADA` → HEARTBEAT_OK
- Se retornar demandas → alertar com a lista

### Frequência sugerida
- Demandas paradas: a cada heartbeat
