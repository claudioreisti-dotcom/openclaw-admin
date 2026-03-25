#!/usr/bin/env python3
"""
Bugou AutoPost — Monitor de Comentários QUERO
Verifica comentários nos posts do Instagram e envia DM com link para quem comentar "QUERO".

Uso:
  python3 comment_monitor.py           # verifica todos os posts recentes
  python3 comment_monitor.py --dry-run # simula sem enviar DM
"""

import csv
import json
import requests
import argparse
import time
from io import StringIO
from datetime import datetime
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "config.json"
DM_LOG_FILE = BASE_DIR / "dm_sent.json"

config = json.loads(CONFIG_FILE.read_text())
PAGE_TOKEN  = config["meta"]["page_token"]
IG_ACCOUNT  = config["meta"]["ig_account_id"]
SHEET_ID    = config["sheets"]["spreadsheet_id"]

TRIGGER_WORD = "QUERO"

# ─── Helpers ──────────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")

def load_dm_log() -> dict:
    """Carrega registro de DMs enviadas: {comment_id: user_id}"""
    if DM_LOG_FILE.exists():
        return json.loads(DM_LOG_FILE.read_text())
    return {}

def save_dm_log(dm_log: dict):
    DM_LOG_FILE.write_text(json.dumps(dm_log, indent=2))

def fetch_sheet_links() -> dict:
    """Retorna mapa {titulo_produto: link_afiliado} da planilha."""
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0"
    r = requests.get(url, timeout=15)
    r.encoding = "utf-8"
    rows = list(csv.DictReader(StringIO(r.text)))
    links = {}
    for row in rows:
        titulo = row.get("titulo_produto", "").strip()
        link   = row.get("link_produtos_afiliado", "").strip()
        if titulo and link:
            links[titulo] = link
    return links

def get_recent_posts(limit=20) -> list:
    """Busca posts recentes da conta."""
    url = f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media"
    params = {
        "fields": "id,caption,timestamp",
        "limit": limit,
        "access_token": PAGE_TOKEN
    }
    r = requests.get(url, params=params, timeout=15)
    return r.json().get("value", r.json().get("data", []))

def get_comments(post_id: str) -> list:
    """Busca comentários de um post."""
    url = f"https://graph.facebook.com/v19.0/{post_id}/comments"
    params = {
        "fields": "id,text,username,from,timestamp",
        "access_token": PAGE_TOKEN
    }
    r = requests.get(url, params=params, timeout=15)
    return r.json().get("data", [])

def send_dm(user_id: str, message: str, dry_run: bool = False) -> bool:
    """Envia mensagem direta ao usuário via Instagram."""
    if dry_run:
        log(f"  [DRY-RUN] DM para user_id={user_id}: {message[:80]}...")
        return True

    url = f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/messages"
    payload = {
        "recipient": json.dumps({"id": user_id}),
        "message": json.dumps({"text": message}),
        "access_token": PAGE_TOKEN
    }
    r = requests.post(url, data=payload, timeout=15)
    data = r.json()
    if "message_id" in data or "id" in data:
        return True
    log(f"  ❌ Erro DM: {data}")
    return False

def extract_link_from_caption(caption: str, sheet_links: dict) -> str | None:
    """Tenta encontrar o link da oferta baseado no título do post."""
    if not caption:
        return None
    caption_lower = caption.lower()
    for titulo, link in sheet_links.items():
        # Verifica se parte do título aparece na caption
        palavras = [p for p in titulo.lower().split() if len(p) > 4]
        matches = sum(1 for p in palavras if p in caption_lower)
        if matches >= 3:
            return link
    return None

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Monitor de comentários QUERO")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem enviar DM")
    parser.add_argument("--posts", type=int, default=20, help="Quantos posts verificar (padrão: 20)")
    args = parser.parse_args()

    dm_log = load_dm_log()
    log(f"📊 DMs enviadas até agora: {len(dm_log)}")

    log("📋 Carregando links da planilha...")
    sheet_links = fetch_sheet_links()
    log(f"  {len(sheet_links)} produtos com links carregados")

    log(f"📸 Buscando últimos {args.posts} posts...")
    posts = get_recent_posts(args.posts)
    log(f"  {len(posts)} posts encontrados")

    total_dms = 0

    for post in posts:
        post_id  = post["id"]
        caption  = post.get("caption", "")
        ts       = post.get("timestamp", "")[:10]

        # Descobre o link desta oferta
        link = extract_link_from_caption(caption, sheet_links)

        comments = get_comments(post_id)
        quero_comments = [
            c for c in comments
            if TRIGGER_WORD.lower() in c.get("text", "").lower()
        ]

        if quero_comments:
            log(f"\n📌 Post {post_id} ({ts}) — {len(quero_comments)} comentário(s) QUERO")

        for comment in quero_comments:
            comment_id = comment["id"]
            username   = comment.get("username", comment.get("from", {}).get("username", ""))
            user_id    = comment.get("from", {}).get("id", "")

            if comment_id in dm_log:
                log(f"  ↩️  @{username} já recebeu DM, pulando")
                continue

            if not user_id:
                log(f"  ⚠️  @{username}: sem user_id, não é possível enviar DM")
                dm_log[comment_id] = "no_user_id"
                continue

            if link:
                msg = (
                    f"Oi! 👋 Vi que você comentou QUERO na nossa oferta!\n\n"
                    f"Aqui está o link direto para você: {link}\n\n"
                    f"Aproveite enquanto a promoção durar! 🔥"
                )
            else:
                msg = (
                    f"Oi! 👋 Vi que você comentou QUERO na nossa oferta!\n\n"
                    f"Acesse nosso perfil para ver todas as ofertas disponíveis!\n"
                    f"Entre no nosso grupo do WhatsApp para receber ofertas em primeira mão: "
                    f"Link na Bio! 📲"
                )

            log(f"  📨 Enviando DM para @{username} (id={user_id})...")
            success = send_dm(user_id, msg, dry_run=args.dry_run)

            if success:
                dm_log[comment_id] = user_id
                save_dm_log(dm_log)
                total_dms += 1
                log(f"  ✅ DM enviada para @{username}")
                time.sleep(2)  # evita rate limit
            else:
                log(f"  ❌ Falha ao enviar DM para @{username}")

    log(f"\n🏁 Concluído: {total_dms} DM(s) enviada(s)")

if __name__ == "__main__":
    main()
