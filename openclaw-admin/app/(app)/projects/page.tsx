import type { Metadata } from "next"
import { db } from "@/lib/db"
import { projetos, demandas } from "@/lib/db/schema"
import { count } from "drizzle-orm"
import Link from "next/link"

export const metadata: Metadata = { title: "Projetos" }

export default async function ProjectsPage() {
  const projetosList = await db.select().from(projetos).orderBy(projetos.criadoEm)

  const demandasPorProjeto = await db
    .select({ projetoId: demandas.projetoId, total: count() })
    .from(demandas)
    .groupBy(demandas.projetoId)

  const countMap = new Map(demandasPorProjeto.map((r) => [r.projetoId, r.total]))

  const statusColor: Record<string, string> = {
    ativo: "var(--color-ok)",
    concluido: "var(--color-fg-3)",
    cancelado: "var(--color-danger)",
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
        {projetosList.length} projeto{projetosList.length !== 1 ? "s" : ""}
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {projetosList.map((p) => {
          const total = countMap.get(p.id) ?? 0
          const stColor = statusColor[p.status ?? "ativo"] ?? "var(--color-fg-3)"
          return (
            <Link
              key={p.id}
              href={`/tasks?projeto=${p.id}`}
              className="rounded-[10px] border p-4 space-y-2 block hover:bg-[var(--color-bg-2)] transition-colors"
              style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-medium" style={{ color: "var(--color-fg)" }}>
                  {p.nome}
                </h3>
                <span className="text-[10px] shrink-0" style={{ color: stColor }}>
                  {p.status ?? "ativo"}
                </span>
              </div>
              {p.descricao && (
                <p className="text-xs line-clamp-2" style={{ color: "var(--color-fg-3)" }}>
                  {p.descricao}
                </p>
              )}
              <p className="text-[10px]" style={{ color: "var(--color-fg-4)" }}>
                {total} demanda{total !== 1 ? "s" : ""}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
