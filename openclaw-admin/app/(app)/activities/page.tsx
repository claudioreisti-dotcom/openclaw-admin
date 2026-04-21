import type { Metadata } from "next"
import { db } from "@/lib/db"
import { agentActivities } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const metadata: Metadata = { title: "Atividades do Agent" }

export default async function ActivitiesPage() {
  const activities = await db
    .select()
    .from(agentActivities)
    .orderBy(desc(agentActivities.criadoEm))
    .limit(100)

  const statusColor: Record<string, string> = {
    pendente: "var(--color-warn)",
    em_andamento: "var(--color-info)",
    concluido: "var(--color-ok)",
  }

  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
        Histórico read-only gerado pelo agent OpenClaw
      </p>
      <div
        className="rounded-[10px] border divide-y"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        {activities.length === 0 && (
          <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--color-fg-3)" }}>
            Nenhuma atividade registrada
          </p>
        )}
        {activities.map((a) => (
          <div key={a.id} className="px-4 py-3 flex items-start gap-3">
            <div
              className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: statusColor[a.status] ?? "var(--color-fg-4)" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: "var(--color-fg-1)" }}>
                  {a.titulo}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--color-bg-2)",
                    color: "var(--color-fg-3)",
                    border: "1px solid var(--color-line)",
                  }}
                >
                  {a.agent}
                </span>
              </div>
              {a.descricao && (
                <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-3)" }}>
                  {a.descricao}
                </p>
              )}
            </div>
            <span className="text-[10px] shrink-0" style={{ color: "var(--color-fg-4)" }}>
              {a.criadoEm
                ? format(new Date(a.criadoEm), "dd MMM HH:mm", { locale: ptBR })
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
