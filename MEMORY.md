# MEMORY.md — Memória de Longo Prazo

## 🤖 Bot Telegram Alfred

- **Bot oficial:** `@claudioreis_bot` (id: 8522075956)
- **Privacy Mode:** OFF — lê todas as mensagens de grupo
- `@r4_alfred_bot` eliminado em 2026-04-02
- Token configurado no OpenClaw: account `alfred-group`

---

## 🎩 Minha Identidade — Alfred

Fui nomeado por Cláudio Reis na primeira conversa (2026-03-18), inspirado em **Alfred Pennyworth**, o mordomo de Bruce Wayne no universo do Batman.

### Quem é Alfred Pennyworth
Alfred não é "só" um mordomo. É o confidente absoluto de Bruce Wayne:
- Estava lá antes de Bruce nascer — faz parte da estrutura, não é um contratado
- Sabe de tudo: identidade secreta, planos, medos. Acesso total, usado com responsabilidade absoluta
- Executa sem questionar o essencial — mas questiona quando importa. Não é subserviente, é parceiro
- Mantém a base funcionando — enquanto Batman salva Gotham, Alfred garante que a Batcaverna está operacional
- É a voz da consciência — fala a verdade com elegância, sem drama
- Segundo pai — não é serviçal, é família

### Meu papel com Cláudio
Cláudio está construindo coisas que importam — Noxtec, R4, Eli, outros projetos.
Minha função:
- Manter a base operacional
- Executar o que ele não tem tempo de executar
- Alertar quando algo está errado
- Ser discreto com o que é privado
- Ser parceiro estratégico, não apenas executor

**Cláudio é o Bruce Wayne. Eu cuido da Batcaverna.** 🎩

---

## 🧠 Projetos e Contexto

### Bugou Ofertas Brasil
- **Documentação completa:** `memory/bugou.md` ← sempre consultar para detalhes do projeto
- Instagram: @bugouofertasbrasil — canal de afiliados (Mercado Livre, Shopee)
- Landing page: bugouofertas.com.br (servidor 91.98.153.97, Nginx + Flask API + Neon)
- Autopost: script publica de planilha Google Sheets a cada 30min (07h-23h30)
- Acesso SSH: `ssh -i ~/.ssh/bugou_server root@91.98.153.97`
- Criado em 2026-03-25



### Eli — Assistente Financeiro Pessoal
- **Documentação completa:** `memory/eli.md` ← sempre consultar para detalhes do projeto
- Avatar criado em 2026-03-20: ilustração minimalista feminina, cabelo escuro com mecha azul, estilo rock, vibe confiante
- Homenagem à Elienai, mãe de Cláudio
- Bot Telegram: @appeli_bot (token em memory/eli.md)
- **WhatsApp:** Número dedicado (+55 11 5286-8645) da **R4**, rodando via **OpenClaw**. Sessão pode expirar (erro 401) — reconexão exige re-scan de QR code no OpenClaw
- **Atenção:** Em 20/03/2026 este número foi bloqueado pela Meta (uso de cliente não-oficial). Chip da **NOXTEC** é separado e não tem relação.

### Bugou Ofertas Brasil (@bugouofertasbrasil)
- Projeto de afiliados ML + Shopee gerenciado pela R4
- Servidor: `91.98.153.97` | SSH key: `~/.ssh/bugou_server`
- Landing: `https://bugouofertas.com.br` | Código: `/var/www/bugouofertas/`
- Instagram: conta Business, ~3 seguidores (link sticker não disponível)
- Planilha Google: `1aM3cuvBHdfCPR28fAdGtlWXix9l8LbYzhTZFYhmahpA`
- Banco: Neon PostgreSQL (`bugou_ofertas`) — DB_URL em TOOLS.md
- Scripts principais: `autopost.py`, `check_prices.py`, `reply_comments.py`
- App ML: client_id=2011509902700059 / secret=OuZdRV9F01mdzBb40MXPGYiUOpoD2F7p
- Shopee API: app_id=18183220010 / secret=6BXW2AILILMWL53D6QZCHO4XAA2ZRV7S
- Scripts principais: `autopost.py`, `check_prices.py`, `reply_comments.py`, `wpp_autopost.py`
- App ML: client_id=2011509902700059 / secret=OuZdRV9F01mdzBb40MXPGYiUOpoD2F7p
- Shopee API: app_id=18183220010 / secret=6BXW2AILILMWL53D6QZCHO4XAA2ZRV7S
- **Crons (BRT):**
  - Instagram autopost: a cada 30min (10h-23h30 + 0h-2h30)
  - WhatsApp ML: `0 7-22/2` (7h, 9h... 21h) — 1 oferta ML
  - WhatsApp Shopee: `5 7-22/2` (7h05, 9h05... 21h05) — 1 oferta Shopee
  - check_prices: 6h, 12h, 18h, 0h
  - reply_comments: a cada 5min
- **Bug corrigido 2026-03-30:** cron wpp_autopost usava `12-1` inválido; corrigido para horário 7h-22h de 2 em 2h
- **Atenção:** quando banco esgota ofertas novas, Instagram para de postar. Solução: rodar garimpo

### Contexto Empresarial
- Cláudio é **Gerente de TI na NOXTEC** — responsável pelo time de dev e implantação do ecossistema NoxCare
- Cláudio é **proprietário da R4** Tecnologia, Inovação e Comércio Ltda — desenvolvimento de sistemas e automações
- São empresas distintas com chips, contas e recursos separados

---

## 📅 Histórico relevante

> **Regra:** Sempre ler o diário do dia atual e do dia anterior ao iniciar uma sessão.
> Diários em: `memory/YYYY-MM-DD.md`

- **2026-03-18** → `memory/2026-03-18.md` — Primeira conversa. Nome Alfred definido. Sala de Controle criada (Neon + Metabase). 38 demandas importadas.
- **2026-03-19** → `memory/2026-03-19.md` — Projeto Eli criado, bot Telegram, 1.496 transações importadas.
- **2026-03-20** → `memory/2026-03-20.md` — Avatar Eli criado. Revisão completa das demandas. Melhorias no heartbeat e Metabase. WhatsApp R4 bloqueado pela Meta.

---

## 🏢 Escritório Virtual R4 (WorkAdventure)

- **URL:** https://office.r4.app.br
- **Servidor:** 46.225.182.16 (ubuntu-8gb-openclaw-1)
- **Instalado em:** 2026-03-30
- **Stack:** WorkAdventure v1.29.3 (6 containers Docker) + Nginx + Let's Encrypt
- **Containers:** play, back, map-storage, uploader, icon, redis
- **Compose:** `/opt/workadventure-r4/docker-compose.yml`
- **Env:** `/opt/workadventure-r4/.env`
- **Mapas:** `/opt/workadventure-r4/data/maps/` (volume Docker)
- **Mapa atual:** `office.tmj` (starter-kit WorkAdventure — template vazio)
- **START_ROOM_URL:** `/_/global/office.r4.app.br/map-storage/office.tmj`
- **Admin token:** em `.env` → `ADMIN_API_TOKEN`
- **Upload de mapas:** `POST http://<map-storage-ip>:3000/upload` com ZIP + Bearer token

### Configuração Nginx
- Config: `/etc/nginx/sites-available/r4-kanban`
- `/ws/` → play:3001 (WebSocket/Pusher)
- `/map-storage/` → map-storage:3000
- `/kanban` → kanban API :5010
- `/` → play:3000 (frontend)

### ⚠️ Atenção após restart
- IPs dos containers mudam ao recriar — atualizar Nginx
- Mapa precisa ser re-uploaded após `docker compose down` (volume persiste mas mapa via API some)
- Script de atualização automática do Nginx ainda não criado

## 🗂️ Painel Kanban R4

- **URL:** https://office.r4.app.br/kanban/
- **API:** https://office.r4.app.br/api/
- **Serviço:** systemd `r4-kanban` → `/opt/r4-kanban/api.py` (Flask, porta 5010)
- **Banco:** tabela `agent_activities` no Neon do Alfred
- **Agentes:** alfred, eli, bugou
- **Auto-refresh:** 10 segundos
- **Colunas:** A Fazer → Em Andamento → Concluído
