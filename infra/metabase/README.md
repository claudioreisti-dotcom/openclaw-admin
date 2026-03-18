# Metabase

Dashboard da Sala de Controle.

## Acesso
- URL: http://46.225.182.16:3000
- Admin: admin@r4tecnologias.com.br

## Restore
```bash
cd /home/claudioreis/metabase
docker compose up -d
```

## Notas
- Banco de dados interno: H2 (volume Docker `metabase_metabase-data`)
- Fonte de dados: Neon PostgreSQL (Sala de Controle)
- Dashboard principal ID: 2
