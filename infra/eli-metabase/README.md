# Eli — Metabase

Dashboard financeiro dedicado ao Eli.

## Acesso
- URL: http://46.225.182.16:3001
- Admin: (configurar no primeiro acesso)

## Banco de dados Eli (Neon)
Connection string para configurar no Metabase:
```
postgresql://neondb_owner:npg_4fESb1ptLRZo@ep-wandering-tree-agq15mif-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Restore
```bash
cd /home/claudioreis/.openclaw/workspace/infra/eli-metabase
docker compose up -d
```

## Dashboards planejados
- Resumo mensal (competência + caixa)
- Gastos por categoria
- Evolução mensal
- Parcelamentos em aberto
- Projeção futura

## Credenciais
- Admin: admin@r4tecnologias.com.br
- Senha: 214833Oi
