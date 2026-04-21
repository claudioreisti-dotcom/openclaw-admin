import { CheckCircle2, Clock, FolderOpen, ListTodo } from "lucide-react"

interface Stats {
  total: number
  concluidas: number
  pendentes: number
  projetos: number
}

const cards = (stats: Stats) => [
  {
    label: "Total de demandas",
    value: stats.total,
    icon: ListTodo,
    color: "var(--color-info)",
  },
  {
    label: "Concluídas",
    value: stats.concluidas,
    icon: CheckCircle2,
    color: "var(--color-ok)",
  },
  {
    label: "Pendentes",
    value: stats.pendentes,
    icon: Clock,
    color: "var(--color-warn)",
  },
  {
    label: "Projetos ativos",
    value: stats.projetos,
    icon: FolderOpen,
    color: "var(--color-accent)",
  },
]

export function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards(stats).map((card) => (
        <div
          key={card.label}
          className="rounded-[10px] border p-4 space-y-3"
          style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
              {card.label}
            </p>
            <card.icon className="h-3.5 w-3.5" style={{ color: card.color }} />
          </div>
          <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--color-fg)" }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
