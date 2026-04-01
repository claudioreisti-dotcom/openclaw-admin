# memory/bugou.md — Projeto Bugou Ofertas Brasil

## 📌 Visão Geral
Canal de divulgação de ofertas de programas afiliados (Mercado Livre, Shopee).
Instagram: [@bugouofertasbrasil](https://www.instagram.com/bugouofertasbrasil)
Landing page: https://bugouofertas.com.br (DNS em propagação em 25/03/2026)

---

## 🏗️ Arquitetura

```
Google Sheets (planilha de produtos)
       ↓ a cada 30min (cron)
autopost.py (servidor 91.98.153.97)
       ↓ publica
Instagram Graph API (@bugouofertasbrasil)
       ↓ salva oferta
Neon PostgreSQL (banco bugou)
       ↓ serve
API Flask (http://bugouofertas.com.br/api/ofertas)
       ↓ consome
Landing Page (bugouofertas.com.br)
```

---

## 📁 Arquivos locais
- `/home/claudioreis/.openclaw/workspace/infra/bugou-autopost/`
  - `autopost.py` — publica posts do Instagram a partir da planilha
  - `comment_monitor.py` — monitor de comentários QUERO (aguarda aprovação Meta)
  - `config.json` — credenciais Meta + ID da planilha
  - `posted.json` — controle de linhas já publicadas
  - `logo.jpg` — logo do Bugou

## 🖥️ Servidor
- **IP:** 91.98.153.97
- **Acesso:** `ssh -i ~/.ssh/bugou_server root@91.98.153.97`
- **Web root:** `/var/www/bugouofertas/`
- **API:** systemd service `bugou-api` (Flask, porta 5051)
- **Cron:** a cada 30min, entre 07h-23h30 (horário Brasília)
- **Log:** `/var/log/bugou-autopost.log`

---

## 🗄️ Banco de Dados (Neon)
- **Connection string:** `postgresql://neondb_owner:npg_UK1mNe4CDfSz@ep-purple-glade-agniwcc8-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Tabela:** `bugou_ofertas`
- **Campos:** id, ig_post_id, nome, titulo, imagem_url, link_afiliado, preco, plataforma, caption, publicado_em, ativo

---

## 📊 Meta / Instagram
- **App:** R4automation (ID: 2276630942865660)
- **App Secret:** 6e8d3c9bf6990e4ead242976f08a2485
- **Página Facebook:** Bugou Ofertas (ID: 1091845864004179)
- **Page Token:** permanente (não expira) — salvo em config.json
- **IG Account ID:** 17841445410766517
- **Permissões ativas:** instagram_basic, instagram_content_publish, pages_read_engagement
- **Permissões pendentes (revisão Meta):** instagram_manage_comments, instagram_manage_messages

---

## 📋 Google Sheets
- ~~**DESCONTINUADA em 2026-04-01**~~ — planilha não é mais usada para nada
- Toda a alimentação de produtos agora é feita diretamente no banco Neon (`bugou_ofertas`)

---

## 🖥️ Landing Page — Comportamento Obrigatório

> ⚠️ NÃO ALTERAR sem autorização explícita de Cláudio.

**API (`/api/ofertas`):**
- Retorna **TODOS** os produtos — ativos E esgotados
- Ordenação: `publicado_em DESC NULLS LAST, id DESC` (mais recente primeiro)
- Filtragem por plataforma e busca: OK
- **NÃO filtrar por `ativo = TRUE`** — a landing exibe tudo, com badge "⛔ ESGOTADO" visual nos inativos

**Numeração dos anúncios:**
- Usar `o.id` do banco (não `i+1` do array)
- É incremental, estável e igual em landing + stories Instagram
- Não muda com filtros, ordenação ou remoções

**Produtos vs Instagram:**
- Produtos entram no banco ANTES de publicar no Instagram (landing exibe imediatamente)
- `ig_post_id` pode ser `NULL` — isso é normal e esperado
- Nunca inserir duplicatas — verificar por `imagem_url` antes de inserir

---

## 💬 Estratégia de engajamento
- Caption dos posts: remove link direto, substitui por "Comente QUERO"
- CTA: *"Comente QUERO que te enviamos o link da oferta!"*
- Link do grupo WhatsApp na Bio do Instagram
- **Landing page** lista todas as ofertas publicadas com link direto
- **Stories** (futuro): link direto do produto via API

## 🔗 WhatsApp grupo
`https://chat.whatsapp.com/C03nHeoBsr59h9dhH81yu8?mode=gi_t`

---

## 🤖 WhatsApp Autopost (wpp_autopost.py)
- **Script:** `/var/www/bugouofertas/wpp_autopost.py`
- **Crons (BRT):**
  - `0 7-22/2 * * *` → 1 oferta do **ML** (7h, 9h, 11h, 13h, 15h, 17h, 19h, 21h)
  - `5 7-22/2 * * *` → 1 oferta da **Shopee** (7h05, 9h05, ..., 21h05)
- **Total:** 16 posts/dia no WhatsApp (8 ML + 8 Shopee)
- **Log:** `/var/log/bugou-wpp-autopost.log`
- **Grupo WPP:** `https://chat.whatsapp.com/C03nHeoBsr59h9dhH81yu8`
- **Correção 2026-03-30:** Bug no cron `12-1` era inválido — corrigido para horário correto

## ⚠️ Problema recorrente — Banco sem ofertas novas
- O `autopost.py` posta apenas ofertas com `ig_post_id IS NULL`
- Quando o banco esgota ofertas novas, o script para de postar ("0 post(s) pendente(s)")
- Solução: rodar garimpo (ML/Shopee) para abastecer com produtos novos

## 📅 Histórico
- **2026-03-25** — Projeto criado. Configuração completa: Meta API, planilha, autopost, banco, landing page, cron. DNS bugouofertas.com.br em propagação.
- **2026-03-30** — Diagnóstico e correção de posts parados. Bug no cron do wpp_autopost corrigido. WhatsApp ajustado para 1 ML + 1 Shopee a cada 2h (7h-22h).

---

## 📅 2026-03-25 — Sessão de implantação completa

### O que foi feito:
- Configuração completa da Meta Graph API (app R4automation)
- Token de longa duração gerado e salvo
- Script `autopost.py` criado e funcional
- Planilha Google Sheets integrada (ID: 1aM3cuvBHdfCPR28fAdGtlWXix9l8LbYzhTZFYhmahpA)
- Banco Neon exclusivo criado para o Bugou
- API Flask no servidor (systemd: bugou-api, porta 5051)
- Landing page criada com design dark + verde neon harmonizado com a logo
- Nginx configurado para bugouofertas.com.br + proxy /api/
- 481 ofertas importadas para a landing page
- 5 últimos posts publicados no Instagram
- 5 Stories publicados
- Cron configurado: a cada 30min entre 07h-23h30 (Brasília)
- DNS bugouofertas.com.br configurado no Registro.br (aguardando propagação)
- SSL pendente (rodar Certbot após DNS propagar)

### Próximos passos:
1. ✅ SSL — assim que DNS propagar, rodar: `certbot --nginx -d bugouofertas.com.br -d www.bugouofertas.com.br`
2. Adicionar Story automático no `autopost.py` para cada novo post
3. Solicitar revisão Meta para `instagram_manage_comments` e `instagram_manage_messages`
4. Configurar ManyChat ou resposta automática nos comentários QUERO
5. Atualizar script `posted.json` no servidor a cada alteração local
