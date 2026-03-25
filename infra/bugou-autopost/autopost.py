#!/usr/bin/env python3
"""
Bugou Ofertas - AutoPost Instagram
Lê planilha Google Sheets e publica posts pendentes no Instagram.

Uso:
  python3 autopost.py           # publica 1 post pendente
  python3 autopost.py --max 3   # publica até 3 posts pendentes
  python3 autopost.py --dry-run # simula sem publicar
"""

import csv
import json
import requests
import argparse
import sys
import time
import psycopg2
from io import StringIO
from datetime import datetime
from pathlib import Path

DB_URL = "postgresql://neondb_owner:npg_UK1mNe4CDfSz@ep-purple-glade-agniwcc8-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def save_offer_to_db(ig_post_id, row, caption):
    """Salva oferta publicada no banco de dados."""
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bugou_ofertas
              (ig_post_id, nome, titulo, imagem_url, link_afiliado, preco, plataforma, caption)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ig_post_id) DO NOTHING
        """, (
            ig_post_id,
            row.get("Nomes Produtos", ""),
            row.get("titulo_produto", ""),
            row.get("Imagem Produtos", ""),
            row.get("link_produtos_afiliado", ""),
            row.get("preco", ""),
            row.get("Plataforma", ""),
            caption,
        ))
        conn.commit()
        conn.close()
        log(f"  💾 Oferta salva no banco (post_id={ig_post_id})")
    except Exception as e:
        log(f"  ⚠️  Erro ao salvar no banco: {e}")

# ─── Config ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "config.json"
LOG_FILE = BASE_DIR / "posted.json"

config = json.loads(CONFIG_FILE.read_text())

PAGE_TOKEN   = config["meta"]["page_token"]
IG_ACCOUNT   = config["meta"]["ig_account_id"]
SHEET_ID     = config["sheets"]["spreadsheet_id"]
SHEET_GID    = config["sheets"].get("gid", "0")

# ─── Helpers ──────────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")

def load_posted() -> set:
    """Carrega índices de linhas já publicadas."""
    if LOG_FILE.exists():
        return set(json.loads(LOG_FILE.read_text()).get("posted", []))
    return set()

def save_posted(posted: set):
    LOG_FILE.write_text(json.dumps({"posted": sorted(list(posted))}, indent=2))

def fetch_sheet() -> list[dict]:
    """Busca planilha como CSV público."""
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_GID}"
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    r.encoding = "utf-8"
    reader = csv.DictReader(StringIO(r.text))
    return list(reader)

def get_pending(rows: list[dict], posted: set) -> list[tuple[int, dict]]:
    """Retorna linhas pendentes (finalizado vazio e não publicadas antes)."""
    pending = []
    for i, row in enumerate(rows):
        finalizado = row.get("finalizado", "").strip().upper()
        if finalizado == "" and i not in posted:
            pending.append((i, row))
    return pending

def create_media_container(image_url: str, caption: str) -> str | None:
    """Cria container de mídia no Instagram."""
    url = f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media"
    params = {
        "image_url": image_url,
        "caption": caption,
        "access_token": PAGE_TOKEN,
    }
    r = requests.post(url, data=params, timeout=30)
    data = r.json()
    if "id" in data:
        return data["id"]
    log(f"❌ Erro ao criar container: {data}")
    return None

def publish_media(container_id: str) -> str | None:
    """Publica o container criado. Retorna o post_id ou None."""
    url = f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media_publish"
    params = {
        "creation_id": container_id,
        "access_token": PAGE_TOKEN,
    }
    r = requests.post(url, data=params, timeout=30)
    data = r.json()
    if "id" in data:
        return data["id"]
    log(f"❌ Erro ao publicar: {data}")
    return None

def post_to_instagram(image_url: str, caption: str, dry_run: bool = False) -> str | None:
    """Fluxo completo: cria container → aguarda → publica. Retorna post_id ou None."""
    if dry_run:
        log(f"[DRY-RUN] Publicaria: {image_url[:60]}...")
        log(f"[DRY-RUN] Caption: {caption[:100]}...")
        return "DRY_RUN"

    log(f"📸 Criando container para: {image_url[:60]}...")
    container_id = create_media_container(image_url, caption)
    if not container_id:
        return None

    log("⏳ Aguardando processamento (10s)...")
    time.sleep(10)

    log(f"🚀 Publicando container {container_id}...")
    return publish_media(container_id)

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Bugou AutoPost Instagram")
    parser.add_argument("--max", type=int, default=1, help="Máx de posts por execução (padrão: 1)")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem publicar")
    args = parser.parse_args()

    if not SHEET_ID:
        log("❌ SHEET_ID não configurado em config.json")
        sys.exit(1)

    log("📊 Buscando planilha...")
    try:
        rows = fetch_sheet()
    except Exception as e:
        log(f"❌ Erro ao buscar planilha: {e}")
        sys.exit(1)

    posted = load_posted()
    pending = get_pending(rows, posted)
    log(f"📋 {len(pending)} post(s) pendente(s) encontrado(s)")

    if not pending:
        log("✅ Nada a publicar.")
        return

    publicados = 0
    for idx, row in pending[:args.max]:
        nome     = row.get("Nomes Produtos", row.get("titulo_produto", "Oferta"))
        imagem   = row.get("Imagem Produtos", "")
        mensagem = row.get("mensagem", "")
        plataforma = row.get("Plataforma", "")

        if not imagem:
            log(f"⚠️  Linha {idx}: sem URL de imagem, pulando.")
            posted.add(idx)
            continue

        # Monta caption — remove link direto e substitui por CTA
        caption_base = mensagem.strip() if mensagem.strip() else nome

        # Remove linha com 🔗 (link direto)
        linhas = caption_base.splitlines()
        linhas = [l for l in linhas if not l.strip().startswith("🔗")]

        # Adiciona CTA e grupo WhatsApp
        cta = (
            "\n\n💬 Comente QUERO que te enviamos o link da oferta!"
            "\n\n📲 Entre no nosso grupo do WhatsApp para não perder nenhuma oferta!"
            "\n👉 Link do grupo na Bio!"
        )

        caption = "\n".join(linhas).strip() + cta

        log(f"\n▶️  [{idx}] {nome[:60]}")
        post_id = post_to_instagram(imagem, caption, dry_run=args.dry_run)

        if post_id:
            posted.add(idx)
            save_posted(posted)
            publicados += 1
            # Salva no banco para a landing page
            if post_id != "DRY_RUN":
                save_offer_to_db(post_id, row, caption)
            log(f"✅ Post {publicados}/{args.max} publicado com sucesso! (id={post_id})")
            if publicados < args.max:
                log("⏳ Aguardando 5s antes do próximo...")
                time.sleep(5)
        else:
            log(f"❌ Falha ao publicar linha {idx}")

    log(f"\n🏁 Concluído: {publicados} post(s) publicado(s)")

if __name__ == "__main__":
    main()
