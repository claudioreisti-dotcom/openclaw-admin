#!/usr/bin/env python3
"""
Elí — Assistente Financeiro Pessoal
Bot Telegram para controle de gastos
"""

import re
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from config import TELEGRAM_TOKEN, DONO_CHAT_ID
import db
from ai import perguntar

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Helpers ───────────────────────────────────────────────────────────────────

def autorizado(update: Update) -> bool:
    return update.effective_user.id == DONO_CHAT_ID

def fmt_valor(v):
    return f"R${abs(float(v)):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

# ─── Comandos ──────────────────────────────────────────────────────────────────

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    await update.message.reply_text(
        "👋 Olá! Sou o *Elí*, seu assistente financeiro.\n\n"
        "Você pode me dizer coisas como:\n"
        "• _gastei 45 no mercado_\n"
        "• _almocei fora 38 no nubank_\n"
        "• _recebi salário 5000_\n\n"
        "Comandos disponíveis:\n"
        "/resumo — resumo do mês atual\n"
        "/categorias — gastos por categoria\n"
        "/ultimas — últimas transações\n"
        "/cartoes — seus cartões cadastrados\n"
        "/addcartao — cadastrar novo cartão\n"
        "/ajuda — mais informações",
        parse_mode='Markdown'
    )

async def resumo(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    r = db.resumo_mes()
    cats = db.gastos_por_categoria()

    txt = f"📊 *Resumo do mês*\n\n"
    txt += f"💸 Gastos: *{fmt_valor(r['total_gastos'])}* ({r['qtd_gastos']} transações)\n"
    txt += f"💰 Entradas: *{fmt_valor(r['total_entradas'])}*\n"
    saldo = float(r['total_entradas']) - float(r['total_gastos'])
    emoji = "✅" if saldo >= 0 else "⚠️"
    txt += f"{emoji} Saldo: *{fmt_valor(saldo)}*\n"

    if cats:
        txt += "\n*Top categorias:*\n"
        for c in cats[:5]:
            txt += f"{c['icone']} {c['categoria']}: {fmt_valor(c['total'])}\n"

    await update.message.reply_text(txt, parse_mode='Markdown')

async def categorias(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    cats = db.gastos_por_categoria()
    if not cats:
        await update.message.reply_text("Nenhum gasto registrado este mês.")
        return
    txt = "📂 *Gastos por categoria este mês:*\n\n"
    for c in cats:
        txt += f"{c['icone']} *{c['categoria']}*: {fmt_valor(c['total'])}\n"
    await update.message.reply_text(txt, parse_mode='Markdown')

async def ultimas(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    trans = db.ultimas_transacoes(limite=8)
    if not trans:
        await update.message.reply_text("Nenhuma transação encontrada.")
        return
    txt = "🕐 *Últimas transações:*\n\n"
    for t in trans:
        sinal = "💸" if float(t['valor']) < 0 else "💰"
        txt += f"{sinal} {t['descricao']} — *{fmt_valor(t['valor'])}*\n"
        txt += f"   📅 {t['data_gasto'].strftime('%d/%m')} | {t['categoria']}"
        if t['cartao']: txt += f" | {t['cartao']}"
        txt += "\n\n"
    await update.message.reply_text(txt, parse_mode='Markdown')

async def cartoes(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    lista = db.listar_cartoes()
    if not lista:
        await update.message.reply_text("Nenhum cartão cadastrado. Use /addcartao para adicionar.")
        return
    txt = "💳 *Seus cartões:*\n\n"
    for c in lista:
        tipo = "Crédito" if c['tipo'] == 'credito' else "Débito"
        txt += f"• *{c['nome']}* ({tipo})"
        if c['limite']: txt += f" — Limite: {fmt_valor(c['limite'])}"
        txt += "\n"
    await update.message.reply_text(txt, parse_mode='Markdown')

async def addcartao(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    await update.message.reply_text(
        "Para cadastrar um cartão, me envie no formato:\n\n"
        "`/novo_cartao Nome | credito | limite | dia_fechamento | dia_vencimento`\n\n"
        "Exemplo:\n"
        "`/novo_cartao Nubank | credito | 5000 | 18 | 25`\n"
        "`/novo_cartao Inter | debito`",
        parse_mode='Markdown'
    )

async def novo_cartao(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    texto = update.message.text.replace('/novo_cartao', '').strip()
    partes = [p.strip() for p in texto.split('|')]
    if len(partes) < 2:
        await update.message.reply_text("Formato inválido. Use: /novo_cartao Nome | tipo | limite | dia_fechamento | dia_vencimento")
        return
    nome = partes[0]
    tipo = partes[1].lower()
    limite = float(partes[2]) if len(partes) > 2 and partes[2] else None
    dia_fecha = int(partes[3]) if len(partes) > 3 and partes[3] else None
    dia_vence = int(partes[4]) if len(partes) > 4 and partes[4] else None

    db.cadastrar_cartao(nome, tipo, limite, dia_fecha, dia_vence)
    await update.message.reply_text(f"✅ Cartão *{nome}* cadastrado!", parse_mode='Markdown')

async def ajuda(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    await update.message.reply_text(
        "📖 *Como usar o Elí:*\n\n"
        "*Registrar gasto (linguagem natural):*\n"
        "• _gastei 45 no mercado_\n"
        "• _almocei fora 38 reais nubank_\n"
        "• _uber 22,50_\n"
        "• _netflix 55 assinatura_\n\n"
        "*Registrar entrada:*\n"
        "• _recebi salário 5000_\n"
        "• _entrada 1200 freelance_\n\n"
        "*Comandos:*\n"
        "/resumo — resumo financeiro do mês\n"
        "/categorias — breakdown por categoria\n"
        "/ultimas — últimas transações\n"
        "/cartoes — cartões cadastrados\n"
        "/addcartao — adicionar cartão\n",
        parse_mode='Markdown'
    )

# ─── Processamento de linguagem natural ────────────────────────────────────────

CATEGORIAS_KEYWORDS = {
    'mercado': 'Mercado', 'supermercado': 'Mercado',
    'restaurante': 'Refeição fora', 'almoço': 'Refeição fora', 'almocei': 'Refeição fora',
    'janta': 'Refeição fora', 'jantar': 'Refeição fora', 'pizza': 'Refeição fora',
    'lanche': 'Alimentação', 'café': 'Alimentação', 'padaria': 'Alimentação',
    'uber': 'Transporte', 'ônibus': 'Transporte', 'gasolina': 'Transporte', 'combustível': 'Transporte',
    'farmácia': 'Saúde', 'remédio': 'Saúde', 'médico': 'Saúde', 'consulta': 'Saúde',
    'netflix': 'Assinaturas', 'spotify': 'Assinaturas', 'assinatura': 'Assinaturas',
    'roupa': 'Vestuário', 'calçado': 'Vestuário', 'tênis': 'Vestuário',
    'cinema': 'Lazer', 'show': 'Lazer', 'lazer': 'Lazer',
    'escola': 'Educação', 'faculdade': 'Educação', 'curso': 'Educação',
    'salário': 'Salário', 'freelance': 'Salário',
    'viagem': 'Viagem', 'hotel': 'Viagem', 'passagem': 'Viagem',
    'aluguel': 'Casa', 'condomínio': 'Casa', 'luz': 'Casa', 'água': 'Casa', 'internet': 'Casa',
}

CARTOES_KEYWORDS = ['nubank', 'inter', 'itaú', 'bradesco', 'c6', 'caixa', 'santander', 'mercado pago']

def extrair_intencao(texto):
    texto_lower = texto.lower()
    
    # Verificar se é entrada
    eh_entrada = any(p in texto_lower for p in ['recebi', 'entrada', 'salário', 'renda', 'recebimento', 'ganhei'])
    
    # Extrair valor
    valor_match = re.search(r'(\d+(?:[,\.]\d{1,2})?)', texto_lower)
    if not valor_match:
        return None
    valor = float(valor_match.group(1).replace(',', '.'))
    if not eh_entrada:
        valor = -valor
    
    # Extrair cartão
    cartao = None
    for k in CARTOES_KEYWORDS:
        if k in texto_lower:
            cartao = k.title()
            break
    
    # Extrair categoria
    categoria = None
    for kw, cat in CATEGORIAS_KEYWORDS.items():
        if kw in texto_lower:
            categoria = cat
            break
    
    # Descrição limpa (remover palavras de controle)
    descricao = texto
    for palavra in ['gastei', 'comprei', 'paguei', 'recebi', 'entrada', 'reais', 'real', 'r$', 'no', 'na', 'em', 'pelo', 'pela']:
        descricao = re.sub(r'\b' + palavra + r'\b', '', descricao, flags=re.IGNORECASE)
    descricao = re.sub(r'\d+(?:[,\.]\d{1,2})?', '', descricao)
    descricao = ' '.join(descricao.split()).strip().title()
    if not descricao:
        descricao = "Gasto avulso"
    
    return {
        'valor': valor,
        'descricao': descricao[:100],
        'categoria': categoria,
        'cartao': cartao,
        'eh_entrada': eh_entrada
    }

async def processar_mensagem(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not autorizado(update): return
    
    texto = update.message.text.strip()
    intencao = extrair_intencao(texto)
    
    if intencao:
        # Registrar transação
        db.registrar_transacao(
            descricao=intencao['descricao'],
            valor=intencao['valor'],
            categoria_nome=intencao['categoria'],
            cartao_nome=intencao['cartao'],
            tipo='entrada' if intencao['eh_entrada'] else 'avulso'
        )
        emoji = "💰" if intencao['eh_entrada'] else "✅"
        tipo_txt = "Entrada" if intencao['eh_entrada'] else "Gasto"
        cartao_txt = f" | {intencao['cartao']}" if intencao['cartao'] else ""
        cat_txt = f" | {intencao['categoria']}" if intencao['categoria'] else ""
        await update.message.reply_text(
            f"{emoji} *{tipo_txt} registrado!*\n"
            f"📝 {intencao['descricao']}\n"
            f"💵 {fmt_valor(intencao['valor'])}{cartao_txt}{cat_txt}",
            parse_mode='Markdown'
        )
    else:
        # Pergunta em linguagem natural — responder com IA
        await update.message.reply_chat_action("typing")
        resposta = perguntar(texto, update.effective_user.id)
        await update.message.reply_text(resposta)

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("resumo", resumo))
    app.add_handler(CommandHandler("categorias", categorias))
    app.add_handler(CommandHandler("ultimas", ultimas))
    app.add_handler(CommandHandler("cartoes", cartoes))
    app.add_handler(CommandHandler("addcartao", addcartao))
    app.add_handler(CommandHandler("novo_cartao", novo_cartao))
    app.add_handler(CommandHandler("ajuda", ajuda))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, processar_mensagem))

    logger.info("Elí bot iniciado...")
    app.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
