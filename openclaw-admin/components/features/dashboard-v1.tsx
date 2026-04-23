"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts"
import { List, CheckCircle2, AlertTriangle, FolderOpen } from "lucide-react"
import type { InferSelectModel } from "drizzle-orm"
import type { demandas, agentActivities } from "@/lib/db/schema"

type Demanda = InferSelectModel<typeof demandas>
type Atividade = InferSelectModel<typeof agentActivities>

export type TrendPoint = { label: string; criadas: number; concluidas: number }
export type StatusPoint = { status: string | null; total: number }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const
const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"] as const

function greeting(hour: number) {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `há ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  return `há ${Math.floor(hours / 24)}d`
}

// ─── Design tokens maps ──────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pendente:     { label: "Pendente",     color: "#a0aab8", bg: "var(--color-bg-2)",           border: "var(--color-line)" },
  aguardando:   { label: "Aguardando",   color: "#a0aab8", bg: "var(--color-bg-2)",           border: "var(--color-line)" },
  backlog:      { label: "Backlog",      color: "#5f6875", bg: "var(--color-bg-2)",           border: "var(--color-line)" },
  em_andamento: { label: "Em andamento", color: "#7ab8ff", bg: "rgba(122,184,255,.12)",       border: "transparent" },
  concluida:    { label: "Concluída",    color: "#4ade80", bg: "rgba(74,222,128,.12)",        border: "transparent" },
  concluido:    { label: "Concluído",    color: "#4ade80", bg: "rgba(74,222,128,.12)",        border: "transparent" },
  cancelada:    { label: "Cancelada",    color: "#5f6875", bg: "transparent",                 border: "transparent" },
  cancelado:    { label: "Cancelado",    color: "#5f6875", bg: "transparent",                 border: "transparent" },
}

const PRIORITY_MAP: Record<string, { label: string; color: string; bars: number }> = {
  urgente: { label: "Urgente", color: "#ff5c6a", bars: 4 },
  alta:    { label: "Alta",    color: "#ff9a3c", bars: 3 },
  media:   { label: "Média",   color: "#ffd34d", bars: 2 },
  baixa:   { label: "Baixa",   color: "#7a8290", bars: 1 },
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "#ffb547", aguardando: "#ffb547", backlog: "#5f6875",
  em_andamento: "#7ab8ff", concluida: "#4ade80", concluido: "#4ade80",
  cancelada: "#3e4550", cancelado: "#3e4550",
}

// ─── Micro components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  const s = STATUS_MAP[status ?? ""] ?? {
    label: status ?? "—", color: "#5f6875", bg: "var(--color-bg-2)", border: "var(--color-line)"
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      height: 18, padding: "0 6px", borderRadius: 3, whiteSpace: "nowrap",
      fontSize: 10.5, fontWeight: 500, letterSpacing: "0.02em",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textDecoration: (status === "cancelada" || status === "cancelado") ? "line-through" : "none",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }}/>
      {s.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = PRIORITY_MAP[priority ?? ""] ?? { label: priority ?? "—", color: "#5f6875", bars: 1 }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      height: 18, padding: "0 6px", borderRadius: 3, whiteSpace: "nowrap",
      fontSize: 10.5, fontWeight: 500, letterSpacing: "0.02em",
      border: "1px solid var(--color-line)", background: "var(--color-bg-2)", color: p.color,
    }}>
      <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5, height: 11 }}>
        {[1, 2, 3, 4].map(i => (
          <span key={i} style={{
            width: 3, height: 3 + i * 2, borderRadius: 1,
            background: i <= p.bars ? "currentColor" : "var(--color-line-2)",
          }}/>
        ))}
      </span>
      {p.label}
    </span>
  )
}

function Stat({
  label, value, sub, delta, icon: Ic, accent, href,
}: {
  label: string; value: string | number; sub?: string
  delta?: number; icon?: React.ElementType; accent?: string; href?: string
}) {
  const inner = (
    <div style={{
      padding: "10px 12px", background: "var(--color-bg-1)",
      border: "1px solid var(--color-line)", borderRadius: 8,
      position: "relative", overflow: "hidden",
      cursor: href ? "pointer" : "default",
      transition: href ? "border-color 0.15s, background 0.15s" : undefined,
    }}
      onMouseEnter={href ? (e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-line-2)" } : undefined}
      onMouseLeave={href ? (e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-line)" } : undefined}
    >
      {accent && (
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: accent }}/>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, fontSize: 10.5,
        fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em",
        color: "var(--color-fg-3)",
      }}>
        {Ic && <Ic size={11}/>}
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.8px", color: "var(--color-fg)" }}>
          {value}
        </span>
        {delta !== undefined && (
          <span style={{
            fontSize: 10.5, fontWeight: 600,
            color: delta > 0 ? "var(--color-ok)" : delta < 0 ? "var(--color-danger)" : "var(--color-fg-3)",
          }}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "·"} {Math.abs(delta)}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 10.5, color: "var(--color-fg-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
  return inner
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-bg-2)", border: "1px solid var(--color-line-2)",
    borderRadius: 6, fontSize: 11, color: "var(--color-fg)", padding: "6px 10px",
  },
  labelStyle: { color: "var(--color-fg-2)", marginBottom: 2 },
  itemStyle: { color: "var(--color-fg-1)" },
}

const TIME_FILTERS = ["7 dias", "30 dias", "90 dias", "ano"]

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardV1({
  userName, hour, stats, trend, statusDist, totalDemandas, ultimasDemandas, atividades,
}: {
  userName: string
  hour: number
  stats: { ativas: number; concluidasSemana: number; atrasadas: number; projetos: number }
  trend: TrendPoint[]
  statusDist: StatusPoint[]
  totalDemandas: number
  ultimasDemandas: Demanda[]
  atividades: Atividade[]
}) {
  const [timeFilter, setTimeFilter] = useState(1)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const now = new Date()
  const dayName = DAYS_PT[now.getDay()] ?? ""
  const monthName = MONTHS_PT[now.getMonth()] ?? ""
  const dateStr = `${now.getDate()} ${monthName}`

  const enrichedStatus = statusDist
    .map(d => ({
      status: d.status,
      total: d.total,
      label: STATUS_MAP[d.status ?? ""]?.label ?? (d.status ?? "Outro"),
      color: STATUS_COLORS[d.status ?? ""] ?? "#5f6875",
      pct: totalDemandas > 0 ? Math.round((d.total / totalDemandas) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="flex flex-col gap-3">

      {/* ── Greeting + time filter ── */}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.4px", color: "var(--color-fg)" }}>
            {greeting(hour)}, {userName}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--color-fg-3)", marginTop: 1 }}>
            {dayName}, {dateStr} · {stats.ativas} ativas · {stats.atrasadas} atrasadas
          </div>
        </div>
        <div className="flex-1"/>
        <div style={{
          display: "flex", gap: 2,
          border: "1px solid var(--color-line)", borderRadius: 6, padding: 2,
        }}>
          {TIME_FILTERS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTimeFilter(i)}
              style={{
                height: 22, padding: "0 8px", fontSize: 11, border: "none",
                background: i === timeFilter ? "var(--color-bg-2)" : "transparent",
                color: i === timeFilter ? "var(--color-fg)" : "var(--color-fg-2)",
                borderRadius: 4, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Stat label="Ativas"        value={stats.ativas}           sub="demandas abertas"  icon={List}          accent="var(--color-accent)"  href="/tasks?filter=ativas"/>
        <Stat label="Concluídas 7d" value={stats.concluidasSemana} sub="última semana"     icon={CheckCircle2}  accent="var(--color-ok)"      href="/tasks?status=concluida"/>
        <Stat label="Atrasadas"     value={stats.atrasadas}        sub="exigem atenção"    icon={AlertTriangle} accent="var(--color-danger)"   href="/tasks?filter=atrasadas"/>
        <Stat label="Projetos"      value={stats.projetos}         sub="workspaces ativos" icon={FolderOpen}    accent="var(--color-cyan)"    href="/projects"/>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-2.5">

        {/* Line chart */}
        <div style={{
          background: "var(--color-bg-1)", border: "1px solid var(--color-line)",
          borderRadius: 10, padding: 12, minHeight: 220,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg)" }}>Criadas vs. concluídas</span>
            <span style={{ fontSize: 10.5, color: "var(--color-fg-3)" }}>últimos 30 dias</span>
            <div style={{ flex: 1 }}/>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--color-fg-2)" }}>
              <span style={{ width: 16, height: 2, background: "var(--color-accent)", display: "inline-block", borderRadius: 1 }}/>
              criadas
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--color-fg-2)", marginLeft: 8 }}>
              <span style={{ width: 16, height: 2, background: "#4ade80", display: "inline-block", borderRadius: 1 }}/>
              concluídas
            </span>
          </div>
          {mounted && <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={trend} margin={{ left: -16, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCriadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9f04a" stopOpacity={0.14}/>
                  <stop offset="100%" stopColor="#c9f04a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 3" stroke="var(--color-line)" vertical={false}/>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "var(--color-fg-3)" }}
                tickLine={false} axisLine={false} interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--color-fg-3)" }}
                tickLine={false} axisLine={false} width={32} allowDecimals={false}
              />
              <Tooltip {...tooltipStyle}/>
              <Area
                type="monotone" dataKey="criadas" name="Criadas"
                stroke="#c9f04a" strokeWidth={1.75}
                fill="url(#gradCriadas)" dot={false}
                activeDot={{ r: 3, fill: "#c9f04a", strokeWidth: 0 }}
              />
              <Line
                type="monotone" dataKey="concluidas" name="Concluídas"
                stroke="#4ade80" strokeWidth={1.5}
                dot={false} activeDot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>}
        </div>

        {/* Donut chart */}
        <div style={{
          background: "var(--color-bg-1)", border: "1px solid var(--color-line)",
          borderRadius: 10, padding: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg)" }}>
            Distribuição por status
          </div>
          <div style={{ fontSize: 10.5, color: "var(--color-fg-3)", marginBottom: 6 }}>
            {totalDemandas} demandas no total
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 120, height: 120, flexShrink: 0 }}>
              {mounted && (
                <PieChart width={120} height={120}>
                  <Pie
                    data={enrichedStatus} dataKey="total" nameKey="label"
                    cx="50%" cy="50%" innerRadius={32} outerRadius={52}
                    strokeWidth={2} stroke="var(--color-bg-1)" paddingAngle={2}
                  >
                    {enrichedStatus.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle}/>
                </PieChart>
              )}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              {enrichedStatus.map(s => (
                <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1, color: "var(--color-fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                  <span style={{ color: "var(--color-fg-3)", fontVariantNumeric: "tabular-nums" }}>
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: últimas demandas + atividade ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-2.5">

        {/* Últimas demandas table */}
        <div style={{
          background: "var(--color-bg-1)", border: "1px solid var(--color-line)",
          borderRadius: 10, overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 12px", display: "flex", alignItems: "center",
            borderBottom: "1px solid var(--color-line)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg)" }}>Últimas demandas</span>
            <div style={{ flex: 1 }}/>
            <Link href="/tasks" style={{ fontSize: 10.5, color: "var(--color-accent)", textDecoration: "none" }}>
              ver todas →
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            {ultimasDemandas.length === 0 ? (
              <p style={{ padding: "20px 12px", fontSize: 12, color: "var(--color-fg-3)", textAlign: "center" }}>
                Nenhuma demanda ainda
              </p>
            ) : ultimasDemandas.map((d, i) => (
              <Link
                key={d.id}
                href={`/tasks/${d.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr auto auto 76px",
                  alignItems: "center", gap: 10,
                  padding: "6px 12px", minWidth: 540,
                  borderTop: i === 0 ? "none" : "1px solid var(--color-line)",
                  fontSize: 12, textDecoration: "none",
                }}
                className="hover:bg-[var(--color-bg-2)] transition-colors"
              >
                <span style={{ fontSize: 10.5, color: "var(--color-fg-3)", fontFamily: "var(--font-mono)" }}>
                  #{d.id}
                </span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-fg)" }}>
                  {d.titulo}
                </span>
                <StatusBadge status={d.status}/>
                <PriorityBadge priority={d.prioridade}/>
                <span style={{ fontSize: 10.5, color: d.dataLimite ? "var(--color-warn)" : "var(--color-fg-3)", textAlign: "right" }}>
                  {d.dataLimite ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Atividade feed */}
        <div style={{
          background: "var(--color-bg-1)", border: "1px solid var(--color-line)",
          borderRadius: 10, padding: "10px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg)" }}>Atividade do agent</span>
            <div style={{ flex: 1 }}/>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 8px 3px 7px",
              border: "1px solid var(--color-line)", borderRadius: 999,
              fontSize: 10.5, color: "var(--color-fg-2)",
            }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-cyan)" }}/>
              </span>
              Alfred sync
            </span>
          </div>
          {atividades.length === 0 ? (
            <p style={{ fontSize: 11, color: "var(--color-fg-3)", textAlign: "center", padding: "12px 0" }}>
              Sem atividade recente
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {atividades.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    fontSize: 11.5, paddingBottom: 6,
                    borderBottom: i === atividades.length - 1 ? "none" : "1px dashed var(--color-line)",
                  }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: "var(--color-accent)", color: "#0b0d10",
                    fontSize: 8, fontWeight: 700,
                  }}>
                    {a.agent.slice(0, 2).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--color-fg-2)" }}>
                      <span style={{ fontWeight: 500, color: "var(--color-fg)" }}>{a.agent}</span>
                      {" · "}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{a.status}</span>
                    </div>
                    <div style={{
                      fontSize: 11.5, color: "var(--color-fg-1)", marginTop: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {a.titulo}
                    </div>
                    <div style={{ color: "var(--color-fg-3)", fontSize: 10, marginTop: 1 }}>
                      {timeAgo(a.criadoEm)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
