#!/usr/bin/env python3
"""
Coleta uso de tokens do OpenClaw e registra no banco Neon.
Roda via cron diariamente para consolidar o dia anterior.
"""

import subprocess
import json
import psycopg2
from datetime import date, timedelta

DATABASE_URL = "postgresql://neondb_owner:npg_l3YFpsexZPD4@ep-proud-band-al415dko-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Preços Claude Sonnet 4.6 por 1M tokens (USD)
PRECO_INPUT_PER_M  = 3.00
PRECO_OUTPUT_PER_M = 15.00

def get_session_usage():
    """Busca uso de tokens das sessões do OpenClaw"""
    result = subprocess.run(
        ["openclaw", "sessions", "list", "--json"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return []
    try:
        data = json.loads(result.stdout)
        return data if isinstance(data, list) else data.get("sessions", [])
    except:
        return []

def registrar(data_ref, sessao, modelo, inp, out):
    total = inp + out
    custo = (inp / 1_000_000 * PRECO_INPUT_PER_M) + (out / 1_000_000 * PRECO_OUTPUT_PER_M)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO uso_tokens (data, sessao, modelo, tokens_entrada, tokens_saida, tokens_total, custo_usd)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (data_ref, sessao, modelo, inp, out, total, custo))
    conn.commit()
    cur.close()
    conn.close()

def main():
    sessoes = get_session_usage()
    hoje = date.today()
    
    if not sessoes:
        print("Nenhuma sessão encontrada.")
        return
    
    for s in sessoes:
        sessao_key = s.get("key", s.get("id", "unknown"))
        modelo = s.get("model", "unknown")
        usage = s.get("usage", s.get("tokens", {}))
        inp = usage.get("input_tokens", usage.get("input", 0))
        out = usage.get("output_tokens", usage.get("output", 0))
        
        if inp > 0 or out > 0:
            registrar(hoje, sessao_key, modelo, inp, out)
            print(f"Registrado: {sessao_key} | in:{inp} out:{out}")
    
    print("Concluído.")

if __name__ == "__main__":
    main()
