# MEMORY.md — Memória de Longo Prazo

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
- Crons: autopost a cada 30min (7h-23h30), check_prices diário 9h UTC, reply_comments a cada 5min

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
