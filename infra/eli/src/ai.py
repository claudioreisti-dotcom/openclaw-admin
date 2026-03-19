"""
Módulo de IA do Elí — processa perguntas em linguagem natural
usando Claude Haiku com acesso ao banco de dados
"""

import anthropic
import json
import psycopg2
import psycopg2.extras
from config import ANTHROPIC_API_KEY, CLAUDE_MODEL, DATABASE_URL

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def get_contexto_financeiro():
    """Busca contexto financeiro atual do banco para enviar à IA"""
    with psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor) as conn:
        with conn.cursor() as cur:
            # Resumo do mês atual
            cur.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) AS total_gastos,
                    COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) AS total_entradas,
                    COUNT(CASE WHEN valor < 0 THEN 1 END) AS qtd_gastos
                FROM transacoes WHERE usuario_id = 1
                AND EXTRACT(MONTH FROM data_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM data_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
            """)
            mes = dict(cur.fetchone())

            # Top categorias do mês
            cur.execute("""
                SELECT COALESCE(c.nome, 'Sem categoria') AS categoria,
                       ROUND(SUM(ABS(t.valor)), 2) AS total
                FROM transacoes t
                LEFT JOIN categorias c ON c.id = t.categoria_id
                WHERE t.usuario_id = 1 AND t.valor < 0
                AND EXTRACT(MONTH FROM t.data_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM t.data_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY c.nome ORDER BY total DESC LIMIT 5
            """)
            categorias = [dict(r) for r in cur.fetchall()]

            # Recorrentes ativos
            cur.execute("""
                SELECT r.descricao, r.valor, r.dia_cobranca, COALESCE(c.nome,'') AS categoria
                FROM recorrentes r
                LEFT JOIN categorias c ON c.id = r.categoria_id
                WHERE r.usuario_id = 1 AND r.ativo = TRUE
                ORDER BY r.dia_cobranca
            """)
            recorrentes = [dict(r) for r in cur.fetchall()]

            # Parcelamentos ativos
            cur.execute("""
                SELECT p.descricao, p.valor_parcela, p.total_parcelas, p.parcelas_pagas,
                       p.dia_cobranca, COALESCE(c.nome,'') AS categoria
                FROM parcelamentos p
                LEFT JOIN categorias c ON c.id = p.categoria_id
                WHERE p.usuario_id = 1 AND p.ativo = TRUE
            """)
            parcelamentos = [dict(r) for r in cur.fetchall()]

            # Cartões
            cur.execute("SELECT nome, tipo, limite FROM cartoes WHERE usuario_id = 1 AND ativo = TRUE")
            cartoes = [dict(r) for r in cur.fetchall()]

            # Últimas 10 transações
            cur.execute("""
                SELECT t.descricao, t.valor, t.data_gasto::text,
                       COALESCE(c.nome,'') AS categoria
                FROM transacoes t
                LEFT JOIN categorias c ON c.id = t.categoria_id
                WHERE t.usuario_id = 1
                ORDER BY t.criado_em DESC LIMIT 10
            """)
            ultimas = [dict(r) for r in cur.fetchall()]

    return {
        "mes_atual": mes,
        "categorias_mes": categorias,
        "recorrentes": recorrentes,
        "parcelamentos": parcelamentos,
        "cartoes": cartoes,
        "ultimas_transacoes": ultimas
    }

# Histórico de conversa por usuário (em memória)
historico = {}

def perguntar(pergunta: str, usuario_id: int = 880111781) -> str:
    """Processa pergunta em linguagem natural com contexto financeiro"""
    
    contexto = get_contexto_financeiro()
    
    system_prompt = f"""Você é o Elí, um assistente financeiro pessoal simpático e direto.
Você está ajudando Cláudio Reis a controlar suas finanças pessoais via Telegram.

DADOS FINANCEIROS ATUAIS:
{json.dumps(contexto, ensure_ascii=False, default=str, indent=2)}

INSTRUÇÕES:
- Responda sempre em português brasileiro informal
- Seja conciso — respostas curtas e diretas
- Use emojis com moderação
- Se a pergunta for sobre lançar um gasto, diga que entendeu e que vai registrar
- Se não tiver dados suficientes para responder, diga honestamente
- Valores em reais no formato R$ X.XXX,XX
- Não invente dados que não estão no contexto acima
"""

    # Manter histórico de até 10 mensagens
    if usuario_id not in historico:
        historico[usuario_id] = []
    
    historico[usuario_id].append({"role": "user", "content": pergunta})
    
    # Limitar histórico
    if len(historico[usuario_id]) > 10:
        historico[usuario_id] = historico[usuario_id][-10:]

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=500,
        system=system_prompt,
        messages=historico[usuario_id]
    )
    
    resposta = response.content[0].text
    historico[usuario_id].append({"role": "assistant", "content": resposta})
    
    return resposta
