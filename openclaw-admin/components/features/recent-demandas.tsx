import Link from "next/link"
import type { demandas } from "@/lib/db/schema"
import type { InferSelectModel } from "drizzle-orm"

type Demanda = InferSelectModel<typeof demandas>

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente:    { label: "Pendente",    color: "var(--color-warn)" },
  aguardando:  { label: "Aguardando",  color: "var(--color-warn)" },
  backlog:     { label: "Backlog",     color: "var(--color-fg-3)" },
  em_andamento:{ label: "Em andamento",color: "var(--color-info)" },
  concluida:   { label: "Concluída",   color: "var(--color-ok)" },
  concluido:   { label: "Concluído",   color: "var(--color-ok)" },
  cancelada:   { label: "Cancelada",   color: "var(--color-fg-3)" },
}

export function RecentDemandas({ demandas }: { demandas: Demanda[] }) {
  return (
    <div
      className="rounded-[10px] border"
      style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-line)" }}
      >
        <h2 className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
          Demandas recentes
        </h2>
        <Link
          href="/tasks"
          className="text-xs"
          style={{ color: "var(--color-accent)" }}
        >
          Ver todas →
        </Link>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--color-line)" }}>
        {demandas.length === 0 && (
          <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--color-fg-3)" }}>
            Nenhuma demanda ainda
          </p>
        )}
        {demandas.map((d) => {
          const st = statusConfig[d.status ?? ""] ?? { label: d.status ?? "—", color: "var(--color-fg-3)" }
          return (
            <Link
              key={d.id}
              href={`/tasks/${d.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-2)] transition-colors"
            >
              <span className="flex-1 text-xs truncate" style={{ color: "var(--color-fg-1)" }}>
                {d.titulo}
              </span>
              <span className="text-[10px] shrink-0" style={{ color: st.color }}>
                {st.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
