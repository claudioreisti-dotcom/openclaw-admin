#!/usr/bin/env python3
"""
inspect_db.py — extrai o schema do banco Neon para alimentar o SPEC/TASKS do painel.

Uso:
    pip install psycopg2-binary
    python inspect_db.py "postgresql://USER:PASS@HOST/DB?sslmode=require" > schema.txt

Ou via env var:
    export DATABASE_URL="..."
    python inspect_db.py > schema.txt
"""
import os
import sys
import psycopg2


def main() -> None:
    dsn = os.environ.get("DATABASE_URL") or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not dsn:
        print("ERRO: forneça DATABASE_URL via env ou argv.", file=sys.stderr)
        sys.exit(1)

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    def run(sql, params=()):
        cur.execute(sql, params)
        return cur.fetchall()

    print("# OpenClaw DB — schema snapshot\n")

    # --- Schemas ---
    print("## SCHEMAS\n")
    for (s,) in run(
        """
        SELECT schema_name FROM information_schema.schemata
        WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast')
        ORDER BY 1;
        """
    ):
        print(f"- {s}")

    # --- Tabelas ---
    print("\n## TABELAS\n")
    tables = run(
        """
        SELECT table_schema, table_name FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog','information_schema')
          AND table_type='BASE TABLE'
        ORDER BY 1, 2;
        """
    )
    for s, t in tables:
        print(f"- {s}.{t}")

    # --- Detalhes por tabela ---
    print("\n## DETALHES POR TABELA\n")
    for s, t in tables:
        print(f"\n### `{s}.{t}`\n")

        cols = run(
            """
            SELECT column_name, data_type, is_nullable, column_default,
                   character_maximum_length, udt_name
            FROM information_schema.columns
            WHERE table_schema=%s AND table_name=%s
            ORDER BY ordinal_position;
            """,
            (s, t),
        )
        print("**Colunas:**")
        print("| Coluna | Tipo | Null | Default |")
        print("|---|---|---|---|")
        for c in cols:
            tipo = c[1]
            if c[4]:
                tipo += f"({c[4]})"
            if c[1] == "USER-DEFINED":
                tipo = f"{c[5]} (enum/udt)"
            print(f"| {c[0]} | {tipo} | {c[2]} | {c[3] or ''} |")

        try:
            cnt = run(f'SELECT COUNT(*) FROM "{s}"."{t}"')[0][0]
            print(f"\n**Linhas:** {cnt}")
        except Exception as e:
            print(f"\n**Linhas:** erro — {e}")

        # PK / constraints
        cons = run(
            """
            SELECT tc.constraint_type, tc.constraint_name,
                   string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position)
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name=kcu.constraint_name
             AND tc.table_schema=kcu.table_schema
            WHERE tc.table_schema=%s AND tc.table_name=%s
            GROUP BY tc.constraint_type, tc.constraint_name;
            """,
            (s, t),
        )
        if cons:
            print("\n**Constraints:**")
            for ctype, cname, ccols in cons:
                print(f"- {ctype}: `{cname}` ({ccols})")

        # FKs
        fks = run(
            """
            SELECT kcu.column_name,
                   ccu.table_schema, ccu.table_name, ccu.column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name=kcu.constraint_name
             AND tc.table_schema=kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name=tc.constraint_name
            WHERE tc.constraint_type='FOREIGN KEY'
              AND tc.table_schema=%s AND tc.table_name=%s;
            """,
            (s, t),
        )
        if fks:
            print("\n**FKs:**")
            for fk in fks:
                print(f"- `{fk[0]}` → `{fk[1]}.{fk[2]}.{fk[3]}`")

        # Índices
        idxs = run(
            """
            SELECT indexname, indexdef FROM pg_indexes
            WHERE schemaname=%s AND tablename=%s;
            """,
            (s, t),
        )
        if idxs:
            print("\n**Índices:**")
            for name, ddl in idxs:
                print(f"- `{name}`: `{ddl}`")

        # Amostra
        try:
            rows = run(f'SELECT * FROM "{s}"."{t}" LIMIT 3')
            colnames = [d[0] for d in cur.description]
            print(f"\n**Amostra (3 linhas):** colunas = {colnames}")
            for r in rows:
                # Truncar valores longos para não poluir
                safe = tuple(
                    (str(x)[:120] + "…") if x is not None and len(str(x)) > 120 else x
                    for x in r
                )
                print(f"- {safe}")
        except Exception as e:
            print(f"\n**Amostra:** erro — {e}")

    # --- Enums ---
    print("\n## ENUMS / TIPOS CUSTOM\n")
    enums = run(
        """
        SELECT n.nspname, t.typname,
               string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder)
        FROM pg_type t
        JOIN pg_enum e ON t.oid=e.enumtypid
        JOIN pg_namespace n ON t.typnamespace=n.oid
        GROUP BY 1, 2
        ORDER BY 1, 2;
        """
    )
    if not enums:
        print("(nenhum)")
    for s, name, vals in enums:
        print(f"- `{s}.{name}`: {vals}")

    # --- Views ---
    print("\n## VIEWS\n")
    views = run(
        """
        SELECT table_schema, table_name FROM information_schema.views
        WHERE table_schema NOT IN ('pg_catalog','information_schema')
        ORDER BY 1, 2;
        """
    )
    if not views:
        print("(nenhuma)")
    for s, v in views:
        print(f"- `{s}.{v}`")

    # --- Funções (apenas nomes) ---
    print("\n## FUNÇÕES CUSTOM\n")
    fns = run(
        """
        SELECT n.nspname, p.proname, pg_get_function_arguments(p.oid)
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace=n.oid
        WHERE n.nspname NOT IN ('pg_catalog','information_schema')
          AND p.prokind='f'
        ORDER BY 1, 2;
        """
    )
    if not fns:
        print("(nenhuma)")
    for s, fn, args in fns:
        print(f"- `{s}.{fn}({args})`")

    conn.close()
    print("\n---\n_Fim do snapshot._")


if __name__ == "__main__":
    main()
