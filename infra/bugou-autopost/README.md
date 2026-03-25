# Bugou AutoPost — Instagram

Automação de posts no Instagram @bugouofertasbrasil a partir de planilha Google Sheets.

## Setup

### 1. Configurar a planilha

Edite `config.json` e preencha o `spreadsheet_id` (já está preenchido).

A planilha deve ter as colunas:
| Coluna | Descrição |
|--------|-----------|
| `Nomes Produtos` | Nome do produto |
| `Imagem Produtos` | URL pública da imagem |
| `mensagem` | Caption completo do post |
| `Plataforma` | Mercado Livre / Shopee |
| `finalizado` | Vazio = pendente / TRUE = já publicado |

### 2. Tornar a planilha pública

Planilha → Compartilhar → **"Qualquer pessoa com o link pode visualizar"**

### 3. Instalar dependências

```bash
pip3 install requests
```

### 4. Testar (sem publicar)

```bash
python3 autopost.py --dry-run
```

### 5. Publicar 1 post

```bash
python3 autopost.py
```

### 6. Publicar até 3 posts de uma vez

```bash
python3 autopost.py --max 3
```

---

## Cron — Frequência parametrizada

Edite com `crontab -e`:

```cron
# 1 post por dia às 10h
0 10 * * * /usr/bin/python3 /home/claudioreis/.openclaw/workspace/infra/bugou-autopost/autopost.py >> /home/claudioreis/.openclaw/workspace/infra/bugou-autopost/cron.log 2>&1

# 3 posts por dia (08h, 12h, 18h)
0 8,12,18 * * * /usr/bin/python3 /home/claudioreis/.openclaw/workspace/infra/bugou-autopost/autopost.py >> /home/claudioreis/.openclaw/workspace/infra/bugou-autopost/cron.log 2>&1
```

---

## Credenciais (em config.json)

- **App:** R4automation
- **Página:** Bugou Ofertas (ID: 1091845864004179)
- **Instagram:** @bugouofertasbrasil (ID: 17841445410766517)
- **Token:** Page Token permanente (não expira)

---

## Observações

- O script registra em `posted.json` quais linhas já foram publicadas
- Posts com `finalizado = TRUE/SIM` na planilha são ignorados automaticamente
- A API do Instagram exige que a **imagem seja acessível publicamente via URL**
- Imagens do Shopee/ML geralmente funcionam direto
