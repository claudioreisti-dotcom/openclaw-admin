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

### 📊 Relatório Bugou 24h
- **Entregar em:** 2026-04-03 22:00 BRT (01:00 UTC 04/04)
- Execute: verificar posts publicados nas últimas 24h, stories publicados, fila pendente
- Comparar: posts de hoje vs ontem, hashtags ativas
- Enviar resumo pro Cláudio via Telegram
