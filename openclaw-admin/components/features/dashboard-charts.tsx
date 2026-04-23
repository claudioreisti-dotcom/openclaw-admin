"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export type TrendPoint = { label: string; criadas: number; concluidas: number }
export type StatusPoint = { status: string | null; total: number }

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pendente:     { label: "Pendente",     color: "#ffb547" },
  aguardando:   { label: "Aguardando",   color: "#ffb547" },
  backlog:      { label: "Backlog",      color: "#5f6875" },
  em_andamento: { label: "Em andamento", color: "#7ab8ff" },
  concluida:    { label: "Concluída",    color: "#4ade80" },
  concluido:    { label: "Concluído",    color: "#4ade80" },
  cancelada:    { label: "Cancelada",    color: "#3e4550" },
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-bg-2)",
    border: "1px solid var(--color-line-2)",
    borderRadius: 6,
    fontSize: 11,
    color: "var(--color-fg)",
    padding: "6px 10px",
  },
  labelStyle: { color: "var(--color-fg-2)", marginBottom: 2 },
  itemStyle: { color: "var(--color-fg-1)" },
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
    >
      <div className="flex items-baseline gap-2.5 mb-3 flex-wrap">
        <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
          Criadas vs. concluídas
        </span>
        <span className="text-[10.5px]" style={{ color: "var(--color-fg-3)" }}>
          últimos 30 dias
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--color-fg-2)" }}>
            <span className="inline-block w-4 h-0.5 rounded" style={{ background: "#c9f04a" }} />
            criadas
          </span>
          <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "var(--color-fg-2)" }}>
            <span className="inline-block w-4 h-0.5 rounded" style={{ background: "#4ade80" }} />
            concluídas
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ left: -16, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="2 3"
            stroke="var(--color-line)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "var(--color-fg-3)" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--color-fg-3)" }}
            tickLine={false}
            axisLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip {...tooltipStyle} />
          <Line
            type="monotone"
            dataKey="criadas"
            name="Criadas"
            stroke="#c9f04a"
            strokeWidth={1.75}
            dot={false}
            activeDot={{ r: 3, fill: "#c9f04a", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="concluidas"
            name="Concluídas"
            stroke="#4ade80"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatusDonut({ data, total }: { data: StatusPoint[]; total: number }) {
  const enriched = data
    .map((d) => {
      const key = d.status ?? ""
      const cfg = STATUS_CONFIG[key] ?? { label: key || "Outro", color: "#5f6875" }
      return {
        status: key,
        total: d.total,
        label: cfg.label,
        color: cfg.color,
        pct: total > 0 ? Math.round((d.total / total) * 100) : 0,
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
    >
      <div className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
        Distribuição por status
      </div>
      <div className="text-[10.5px] mb-3" style={{ color: "var(--color-fg-3)" }}>
        {total} demandas no total
      </div>
      <div className="flex items-center gap-4">
        <div className="shrink-0" style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enriched}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={34}
                outerRadius={54}
                strokeWidth={2}
                stroke="var(--color-bg-1)"
                paddingAngle={2}
              >
                {enriched.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                itemStyle={tooltipStyle.itemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {enriched.map((s) => (
            <div key={s.status} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="shrink-0 rounded-sm"
                style={{ width: 7, height: 7, background: s.color }}
              />
              <span className="flex-1 truncate" style={{ color: "var(--color-fg-1)" }}>
                {s.label}
              </span>
              <span
                className="tabular-nums"
                style={{ color: "var(--color-fg-3)" }}
              >
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardCharts({
  trend,
  statusDist,
  total,
}: {
  trend: TrendPoint[]
  statusDist: StatusPoint[]
  total: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-3">
      <TrendChart data={trend} />
      <StatusDonut data={statusDist} total={total} />
    </div>
  )
}
