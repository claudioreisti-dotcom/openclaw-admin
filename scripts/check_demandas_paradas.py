#!/usr/bin/env python3
"""
Verifica demandas pendentes/em_andamento sem atualização há mais de 5 dias.
Retorna NENHUMA_PARADA ou lista de demandas paradas.
"""

import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta

DATABASE_URL = "postgresql://neondb_owner:npg_l3YFpsexZPD4@ep-proud-band-al415dko-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIAS_LIMITE = 5

def main():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    cur = conn.cursor()
    cur.execute("""
        SELECT d.id, d.titulo, d.status, p.nome as projeto,
               d.atualizado_em,
               EXTRACT(DAY FROM NOW() - d.atualizado_em)::int AS dias_parada
        FROM demandas d
        LEFT JOIN projetos p ON p.id = d.projeto_id
        WHERE d.status IN ('pendente', 'em_andamento')
          AND d.atualizado_em < NOW() - INTERVAL '%s days'
        ORDER BY d.atualizado_em ASC
    """, (DIAS_LIMITE,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        print("NENHUMA_PARADA")
        return

    print(f"⚠️ {len(rows)} demanda(s) parada(s) há mais de {DIAS_LIMITE} dias:")
    for r in rows:
        print(f"  🔴 [#{r['id']}] {r['titulo']}")
        print(f"     Projeto: {r['projeto']} | Status: {r['status']} | {r['dias_parada']} dias sem atualização")

if __name__ == "__main__":
    main()
