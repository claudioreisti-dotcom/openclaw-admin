import psycopg2
import psycopg2.extras
from config import DATABASE_URL

def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)

def registrar_transacao(descricao, valor, categoria_nome=None, cartao_nome=None, data=None, tipo='avulso', usuario_id=1):
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Buscar categoria
            cat_id = None
            if categoria_nome:
                cur.execute("SELECT id FROM categorias WHERE LOWER(nome) LIKE %s LIMIT 1", (f"%{categoria_nome.lower()}%",))
                row = cur.fetchone()
                if row:
                    cat_id = row['id']

            # Buscar cartão
            cartao_id = None
            if cartao_nome:
                cur.execute("SELECT id FROM cartoes WHERE LOWER(nome) LIKE %s AND usuario_id = %s LIMIT 1", (f"%{cartao_nome.lower()}%", usuario_id))
                row = cur.fetchone()
                if row:
                    cartao_id = row['id']

            data_sql = data or 'CURRENT_DATE'
            cur.execute("""
                INSERT INTO transacoes (usuario_id, descricao, valor, categoria_id, cartao_id, data_gasto, tipo)
                VALUES (%s, %s, %s, %s, %s, CURRENT_DATE, %s)
                RETURNING id
            """, (usuario_id, descricao, valor, cat_id, cartao_id, tipo))
            return cur.fetchone()['id']

def resumo_mes(usuario_id=1):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END), 0) AS total_gastos,
                    COALESCE(SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END), 0) AS total_entradas,
                    COUNT(CASE WHEN valor < 0 THEN 1 END) AS qtd_gastos
                FROM transacoes
                WHERE usuario_id = %s
                  AND EXTRACT(MONTH FROM data_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM data_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
            """, (usuario_id,))
            return cur.fetchone()

def gastos_por_categoria(usuario_id=1):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    COALESCE(c.nome, 'Sem categoria') AS categoria,
                    COALESCE(c.icone, '📦') AS icone,
                    ROUND(SUM(ABS(t.valor)), 2) AS total
                FROM transacoes t
                LEFT JOIN categorias c ON c.id = t.categoria_id
                WHERE t.usuario_id = %s
                  AND t.valor < 0
                  AND EXTRACT(MONTH FROM t.data_gasto) = EXTRACT(MONTH FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM t.data_gasto) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY c.nome, c.icone
                ORDER BY total DESC
                LIMIT 8
            """, (usuario_id,))
            return cur.fetchall()

def ultimas_transacoes(usuario_id=1, limite=5):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT t.descricao, t.valor, t.data_gasto,
                       COALESCE(c.nome, 'Sem categoria') AS categoria,
                       COALESCE(ca.nome, '') AS cartao
                FROM transacoes t
                LEFT JOIN categorias c ON c.id = t.categoria_id
                LEFT JOIN cartoes ca ON ca.id = t.cartao_id
                WHERE t.usuario_id = %s
                ORDER BY t.criado_em DESC
                LIMIT %s
            """, (usuario_id, limite))
            return cur.fetchall()

def listar_cartoes(usuario_id=1):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, nome, tipo, limite FROM cartoes WHERE usuario_id = %s AND ativo = TRUE ORDER BY nome", (usuario_id,))
            return cur.fetchall()

def cadastrar_cartao(nome, tipo, limite=None, dia_fechamento=None, dia_vencimento=None, usuario_id=1):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO cartoes (usuario_id, nome, tipo, limite, dia_fechamento, dia_vencimento)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (usuario_id, nome, tipo, limite, dia_fechamento, dia_vencimento))
            return cur.fetchone()['id']
