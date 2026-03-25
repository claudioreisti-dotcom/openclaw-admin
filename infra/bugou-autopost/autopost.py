#!/usr/bin/env python3
"""
Bugou Ofertas - AutoPost Instagram
Lê planilha Google Sheets e publica posts + stories pendentes no Instagram.

Uso:
  python3 autopost.py           # publica 1 post+story pendente
  python3 autopost.py --max 3   # publica até 3
  python3 autopost.py --dry-run # simula sem publicar
"""

import csv
import json
import re
import os
import io
import sys
import time
import requests
import argparse
import psycopg2
import urllib.request
from io import StringIO
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_OK = True
except ImportError:
    PIL_OK = False

DB_URL = "postgresql://neondb_owner:npg_UK1mNe4CDfSz@ep-purple-glade-agniwcc8-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

BASE_DIR    = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "config.json"
LOG_FILE    = BASE_DIR / "posted.json"
LOGO_PATH   = BASE_DIR / "logo.jpg"

config     = json.loads(CONFIG_FILE.read_text())
PAGE_TOKEN = config["meta"]["page_token"]
IG_ACCOUNT = config["meta"]["ig_account_id"]
SHEET_ID   = config["sheets"]["spreadsheet_id"]
SHEET_GID  = config["sheets"].get("gid", "0")

FONT_BOLD  = "/usr/share/fonts/truetype/lato/Lato-Bold.ttf"
FONT_REG   = "/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
FONT_BLACK = "/usr/share/fonts/truetype/lato/Lato-Black.ttf"
if not os.path.exists(FONT_BOLD):  FONT_BOLD  = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
if not os.path.exists(FONT_REG):   FONT_REG   = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
if not os.path.exists(FONT_BLACK): FONT_BLACK = FONT_BOLD

# ─── Helpers ──────────────────────────────────────────────────────────────────
def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def load_posted() -> set:
    if LOG_FILE.exists():
        return set(json.loads(LOG_FILE.read_text()).get("posted", []))
    return set()

def save_posted(posted: set):
    LOG_FILE.write_text(json.dumps({"posted": sorted(list(posted))}, indent=2))

def fetch_sheet() -> list[dict]:
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_GID}"
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    r.encoding = "utf-8"
    return list(csv.DictReader(StringIO(r.text)))

def get_pending(rows, posted):
    return [(i, r) for i, r in enumerate(rows)
            if r.get("finalizado", "").strip().upper() == "" and i not in posted]

def formatar_caption(mensagem: str, nome: str) -> str:
    caption_base = mensagem.strip() if mensagem.strip() else nome
    linhas = [l for l in caption_base.splitlines() if not l.strip().startswith("🔗")]
    texto = "\n".join(linhas)

    def fmt_preco(m):
        old = m.group(1).replace("~","").strip()
        new = m.group(2).replace("*","").strip()
        return f"por apenas {new}" if old == new else f"de: {old} por apenas {new}"

    texto = re.sub(r'~(R\$[^~]+)~\s*[→➝-]+\s*\*(R\$[^*]+)\*', fmt_preco, texto)
    texto = re.sub(r'\*([^*]+)\*', r'\1', texto)
    texto = re.sub(r'~([^~]+)~', r'\1', texto)

    cta = (
        "\n\n💬 Comente QUERO que te enviamos o link da oferta!"
        "\n\n📲 Entre no nosso grupo do WhatsApp para não perder nenhuma oferta!"
        "\n👉 Link do grupo na Bio!"
    )
    return texto.strip() + cta

# ─── Story Generator ──────────────────────────────────────────────────────────
def load_image_from_url(url: str):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return Image.open(io.BytesIO(resp.read())).convert("RGBA")
    except Exception as e:
        log(f"  ⚠️  Erro ao baixar imagem: {e}")
        return None

def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines, line = [], []
    for word in words:
        test = " ".join(line + [word])
        bbox = draw.textbbox((0,0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            line.append(word)
        else:
            if line: lines.append(" ".join(line))
            line = [word]
    if line: lines.append(" ".join(line))
    return lines

def generate_story_image(nome: str, preco: str, imagem_url: str, output_path: str) -> bool:
    if not PIL_OK:
        log("  ⚠️  Pillow não disponível, story sem imagem gerada")
        return False
    try:
        W, H = 1080, 1920
        canvas = Image.new("RGB", (W, H), (10, 10, 10))
        draw = ImageDraw.Draw(canvas)

        # Gradiente sutil
        for y in range(H):
            v = int(y / H * 25)
            draw.line([(0,y),(W,y)], fill=(v//4, v, v//2))

        # Logo
        if LOGO_PATH.exists():
            logo = Image.open(LOGO_PATH).convert("RGBA")
            lh = 100
            lw = int(logo.width * lh / logo.height)
            logo = logo.resize((lw, lh), Image.LANCZOS)
            canvas.paste(logo, ((W-lw)//2, 80), logo)

        # Badge
        f_badge = ImageFont.truetype(FONT_BLACK, 46)
        badge = "🔥 BUGOU! Ofertas Brasil"
        bw = draw.textbbox((0,0), badge, font=f_badge)[2]
        draw.text(((W-bw)//2, 210), badge, font=f_badge, fill=(0,255,136))

        # Card produto
        cy, ch, cp = 320, 900, 40
        draw.rounded_rectangle([cp, cy, W-cp, cy+ch], radius=32, fill=(20,20,20))

        prod = load_image_from_url(imagem_url)
        if prod:
            prod.thumbnail((W-cp*2-40, ch-80), Image.LANCZOS)
            bg = Image.new("RGBA", prod.size, (20,20,20,255))
            if prod.mode == "RGBA":
                bg.paste(prod, mask=prod.split()[3])
            else:
                bg.paste(prod)
            prod = bg.convert("RGB")
            canvas.paste(prod, ((W-prod.width)//2, cy+(ch-prod.height)//2))

        # Nome
        f_nome = ImageFont.truetype(FONT_BOLD, 42)
        nome_s = (nome[:77]+"...") if len(nome)>80 else nome
        y_n = cy + ch + 40
        for line in wrap_text(nome_s, f_nome, W-80, draw)[:2]:
            lw = draw.textbbox((0,0), line, font=f_nome)[2]
            draw.text(((W-lw)//2, y_n), line, font=f_nome, fill=(240,240,240))
            y_n += 52

        # Preço — pega linha com R$ e sem OFF
        f_preco = ImageFont.truetype(FONT_BLACK, 64)
        preco_linhas = (preco or "").split("\n")
        preco_show = ""
        for pl in preco_linhas:
            pl = pl.strip()
            m = re.search(r'R\$\s*[\d.,]+', pl)
            if m and "OFF" not in pl:
                preco_show = re.sub(r'[~*_]', '', pl).strip()
                break
        if not preco_show and preco_linhas:
            preco_show = re.sub(r'[~*_]', '', preco_linhas[0]).strip()

        y_p = y_n + 20
        pw = draw.textbbox((0,0), preco_show, font=f_preco)[2]
        draw.text(((W-pw)//2, y_p), preco_show, font=f_preco, fill=(0,255,136))

        # CTA
        f_cta = ImageFont.truetype(FONT_BOLD, 36)
        cta = "💬 Comente QUERO para receber o link!"
        y_cta = y_p + 90
        cw = draw.textbbox((0,0), cta, font=f_cta)[2]
        draw.rounded_rectangle([40, y_cta-10, W-40, y_cta+58], radius=16, fill=(0,80,50))
        draw.text(((W-cw)//2, y_cta), cta, font=f_cta, fill=(240,240,240))

        # Bio
        f_bio = ImageFont.truetype(FONT_REG, 34)
        bio = "🔗 Link da oferta na Bio!"
        bw = draw.textbbox((0,0), bio, font=f_bio)[2]
        draw.text(((W-bw)//2, y_cta+88), bio, font=f_bio, fill=(255,215,0))

        canvas.save(output_path, "JPEG", quality=92)
        return True
    except Exception as e:
        log(f"  ❌ Erro ao gerar story: {e}")
        return False

# ─── Instagram API ─────────────────────────────────────────────────────────────
def publish_story(image_path: str, dry_run: bool = False) -> str | None:
    """Faz upload da imagem para o servidor e publica como Story."""
    if dry_run:
        log("  [DRY-RUN] Publicaria story")
        return "DRY_RUN"

    # Serve a imagem localmente via URL pública
    story_url = f"http://91.98.153.97/stories/{Path(image_path).name}"

    log(f"  📤 Criando container do story...")
    r = requests.post(
        f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media",
        data={"image_url": story_url, "media_type": "STORIES", "access_token": PAGE_TOKEN},
        timeout=30
    )
    data = r.json()
    if "id" not in data:
        log(f"  ❌ Erro container story: {data}")
        return None

    time.sleep(10)
    r2 = requests.post(
        f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media_publish",
        data={"creation_id": data["id"], "access_token": PAGE_TOKEN},
        timeout=30
    )
    data2 = r2.json()
    if "id" in data2:
        return data2["id"]
    log(f"  ❌ Erro publish story: {data2}")
    return None

def create_media_container(image_url: str, caption: str) -> str | None:
    r = requests.post(
        f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media",
        data={"image_url": image_url, "caption": caption, "access_token": PAGE_TOKEN},
        timeout=30
    )
    data = r.json()
    return data.get("id")

def publish_media(container_id: str) -> str | None:
    r = requests.post(
        f"https://graph.facebook.com/v19.0/{IG_ACCOUNT}/media_publish",
        data={"creation_id": container_id, "access_token": PAGE_TOKEN},
        timeout=30
    )
    data = r.json()
    return data.get("id")

def post_to_instagram(image_url: str, caption: str, dry_run: bool = False) -> str | None:
    if dry_run:
        log(f"[DRY-RUN] Post: {image_url[:60]}...")
        return "DRY_RUN"
    log(f"📸 Criando container: {image_url[:60]}...")
    cid = create_media_container(image_url, caption)
    if not cid:
        log("❌ Erro ao criar container")
        return None
    log("⏳ Aguardando 10s...")
    time.sleep(10)
    log(f"🚀 Publicando...")
    return publish_media(cid)

def save_offer_to_db(ig_post_id, row, caption):
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bugou_ofertas
              (ig_post_id, nome, titulo, imagem_url, link_afiliado, preco, plataforma, caption)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (ig_post_id) DO NOTHING
        """, (ig_post_id,
              row.get("Nomes Produtos",""), row.get("titulo_produto",""),
              row.get("Imagem Produtos",""), row.get("link_produtos_afiliado",""),
              row.get("preco",""), row.get("Plataforma",""), caption))
        conn.commit()
        conn.close()
        log(f"  💾 Banco atualizado")
    except Exception as e:
        log(f"  ⚠️  Erro banco: {e}")

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--max", type=int, default=1)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    log("📊 Buscando planilha...")
    try:
        rows = fetch_sheet()
    except Exception as e:
        log(f"❌ {e}"); sys.exit(1)

    posted  = load_posted()
    pending = get_pending(rows, posted)
    log(f"📋 {len(pending)} post(s) pendente(s)")

    if not pending:
        log("✅ Nada a publicar."); return

    stories_dir = BASE_DIR / "stories"
    stories_dir.mkdir(exist_ok=True)

    publicados = 0
    for idx, row in pending[:args.max]:
        nome    = row.get("Nomes Produtos", row.get("titulo_produto", "Oferta"))
        imagem  = row.get("Imagem Produtos", "")
        preco   = row.get("preco", "")

        if not imagem:
            log(f"⚠️  Linha {idx}: sem imagem, pulando.")
            posted.add(idx); continue

        caption = formatar_caption(row.get("mensagem",""), nome)

        log(f"\n▶️  [{idx}] {nome[:60]}")

        # 1. Publica post
        post_id = post_to_instagram(imagem, caption, dry_run=args.dry_run)

        if post_id:
            posted.add(idx)
            save_posted(posted)
            publicados += 1
            if post_id != "DRY_RUN":
                save_offer_to_db(post_id, row, caption)
            log(f"✅ Post publicado (id={post_id})")

            # 2. Gera e publica story
            story_file = stories_dir / f"story_{idx}.jpg"
            log("🎨 Gerando imagem do story...")
            ok = generate_story_image(nome, preco, imagem, str(story_file))

            if ok:
                # Copia para pasta pública do servidor
                if not args.dry_run:
                    import shutil
                    server_stories = Path("/var/www/bugouofertas/stories")
                    server_stories.mkdir(exist_ok=True)
                    shutil.copy(str(story_file), str(server_stories / story_file.name))

                story_id = publish_story(str(story_file), dry_run=args.dry_run)
                if story_id:
                    log(f"✅ Story publicado (id={story_id})")
                else:
                    log("❌ Falha ao publicar story")
            else:
                log("⚠️  Story não gerado")

            if publicados < args.max:
                log("⏳ 10s antes do próximo...")
                time.sleep(10)
        else:
            log(f"❌ Falha ao publicar linha {idx}")

    log(f"\n🏁 Concluído: {publicados} post(s) publicado(s)")

if __name__ == "__main__":
    main()
