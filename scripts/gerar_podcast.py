#!/usr/bin/env python3
"""
Gera o podcast matinal Alfred + Eli
Combina voz Alfred (Algieba) e Eli (Aoede) em um único MP3
"""

import requests
import base64
import subprocess
import os
import json
import psycopg2
import psycopg2.extras
from datetime import date, timedelta

GOOGLE_API_KEY = "AIzaSyAycAfqtqUZdc2ZDmu_a_c8mwD0bXr-lSY"
ALFRED_VOICE = "pt-BR-Chirp3-HD-Algieba"
ELI_VOICE    = "pt-BR-Chirp3-HD-Aoede"

DB_ALFRED = "postgresql://neondb_owner:npg_l3YFpsexZPD4@ep-proud-band-al415dko-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DB_ELI    = "postgresql://neondb_owner:npg_4fESb1ptLRZo@ep-wandering-tree-agq15mif-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

OUTDIR = "/tmp/podcast"
os.makedirs(OUTDIR, exist_ok=True)

def sintetizar(texto, voz, arquivo, velocidade=1.4):
    payload = {
        "input": {"text": texto},
        "voice": {"languageCode": "pt-BR", "name": voz},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": velocidade}
    }
    r = requests.post(
        f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_API_KEY}",
        json=payload
    )
    with open(arquivo, "wb") as f:
        f.write(base64.b64decode(r.json()["audioContent"]))

def get_demandas_concluidas():
    with psycopg2.connect(DB_ALFRED, cursor_factory=psycopg2.extras.RealDictCursor) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT titulo FROM demandas WHERE data_conclusao = CURRENT_DATE")
            return [r["titulo"] for r in cur.fetchall()]

def get_demandas_hoje():
    with psycopg2.connect(DB_ALFRED, cursor_factory=psycopg2.extras.RealDictCursor) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT titulo, data_limite FROM demandas
                WHERE status != 'concluida' AND data_limite <= CURRENT_DATE + 1
                ORDER BY data_limite
            """)
            return cur.fetchall()

def get_resumo_eli():
    with psycopg2.connect(DB_ELI, cursor_factory=psycopg2.extras.RealDictCursor) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) AS gastos,
                    COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) AS entradas
                FROM transacoes WHERE usuario_id = 1
                AND EXTRACT(MONTH FROM data_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM data_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
            """)
            mes = cur.fetchone()
            cur.execute("""
                SELECT r.descricao, r.valor, r.dia_cobranca
                FROM recorrentes r
                WHERE r.usuario_id = 1 AND r.ativo = TRUE
                AND r.dia_cobranca >= EXTRACT(DAY FROM CURRENT_DATE)
                ORDER BY r.dia_cobranca LIMIT 3
            """)
            proximas = cur.fetchall()
            return mes, proximas

def fmt(v):
    return f"R$ {abs(float(v)):,.2f}".replace(",","X").replace(".",",").replace("X",".")

def main():
    hoje = date.today().strftime("%d de %B de %Y").replace("March","março").replace("April","abril").replace("May","maio")
    concluidas = get_demandas_concluidas()
    urgentes = get_demandas_hoje()
    mes, proximas = get_resumo_eli()

    # Texto Alfred — abertura + retrospecto + agenda
    txt_concluidas = ""
    if concluidas:
        nomes = ", ".join(concluidas[:3])
        txt_concluidas = f"Fechamos {len(concluidas)} demandas, incluindo {nomes}."
    else:
        txt_concluidas = "O dia foi mais de organização e planejamento do que de conclusões."

    txt_urgentes = ""
    if urgentes:
        for d in urgentes[:2]:
            txt_urgentes += f"{d['titulo']}, "
        txt_urgentes = f"Para hoje, atenção especial a {txt_urgentes.rstrip(', ')}."

    alfred_abertura = f"""Bom dia, Cláudio. Hoje é {hoje}, e este é o seu briefing matinal com Alfred e Eli.

Começando pelo retrospecto de ontem: {txt_concluidas} {txt_urgentes}

Agora passo a palavra para a Eli, que vai te dar o panorama financeiro do mês."""

    # Texto Eli — resumo financeiro
    gastos = fmt(mes["gastos"])
    entradas = fmt(mes["entradas"])
    saldo = float(mes["entradas"]) - float(mes["gastos"])
    saldo_txt = fmt(saldo)
    tendencia = "positivo" if saldo >= 0 else "negativo"

    txt_proximas = ""
    if proximas:
        for p in proximas:
            txt_proximas += f"{p['descricao']} de {fmt(p['valor'])} vence dia {p['dia_cobranca']}, "
        txt_proximas = f"Nos próximos dias: {txt_proximas.rstrip(', ')}."

    eli_fala = f"""Oi, Cláudio! Aqui é a Eli com o resumo financeiro.

Neste mês, os gastos estão em {gastos} e as entradas em {entradas}. O saldo está {tendencia}, em {saldo_txt}. {txt_proximas}

Tá de olho nisso, tá? Passando de volta pro Alfred."""

    # Texto Alfred — encerramento
    alfred_encerramento = """E assim encerra mais um briefing matinal. Lembre-se: uma agenda organizada não elimina imprevistos — apenas garante que você vai lidar com eles com mais elegância.

Tenha um excelente dia, Cláudio. A Batcaverna está em ordem."""

    # Gerar áudios
    sintetizar(alfred_abertura, ALFRED_VOICE, f"{OUTDIR}/parte1.mp3")
    sintetizar(eli_fala, ELI_VOICE, f"{OUTDIR}/parte2.mp3", velocidade=1.3)
    sintetizar(alfred_encerramento, ALFRED_VOICE, f"{OUTDIR}/parte3.mp3")

    # Concatenar com ffmpeg
    lista = f"{OUTDIR}/lista.txt"
    with open(lista, "w") as f:
        f.write(f"file '{OUTDIR}/parte1.mp3'\nfile '{OUTDIR}/parte2.mp3'\nfile '{OUTDIR}/parte3.mp3'\n")

    output = f"{OUTDIR}/podcast_matinal.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", lista, "-c", "copy", output
    ], capture_output=True)

    print(output)

if __name__ == "__main__":
    main()
