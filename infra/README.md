# Infraestrutura

Documentação e configs de todos os serviços em produção.

## Serviços

| Serviço   | URL                          | Stack         | Status |
|-----------|------------------------------|---------------|--------|
| Metabase  | http://46.225.182.16:3000    | Docker        | ✅ ativo |
| Neon DB   | neon.tech (eu-central-1)     | PostgreSQL     | ✅ ativo |

## Servidor
- **IP:** 46.225.182.16
- **OS:** Ubuntu (Linux 6.8.0)
- **RAM:** 7.6GB | **Disco:** 150GB | **CPU:** 4 cores

## Convenção
Cada serviço tem sua própria pasta com:
- `docker-compose.yml` ou config equivalente
- `README.md` com instruções de restore
