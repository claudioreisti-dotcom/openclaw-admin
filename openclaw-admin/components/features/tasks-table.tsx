"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition, useEffect, useRef } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ChevronLeft, ChevronRight, Trash2, CheckCheck, Loader2,
  Search, X, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { bulkUpdateStatus, bulkUpdatePrioridade, bulkDelete } from "@/lib/actions/tasks"
import type { InferSelectModel } from "drizzle-orm"
import type { demandas, projetos } from "@/lib/db/schema"

type Demanda = InferSelectModel<typeof demandas>
type Projeto = Pick<InferSelectModel<typeof projetos>, "id" | "nome">

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  aguardando:   { label: "Aguardando",   color: "#ffb547", bg: "rgba(255,181,71,.12)"  },
  backlog:      { label: "Backlog",      color: "#5f6875", bg: "rgba(95,104,117,.10)"  },
  em_andamento: { label: "Em andamento", color: "#7ab8ff", bg: "rgba(122,184,255,.12)" },
  concluida:    { label: "Concluída",    color: "#4ade80", bg: "rgba(74,222,128,.12)"  },
  concluido:    { label: "Concluída",    color: "#4ade80", bg: "rgba(74,222,128,.12)"  },
  cancelada:    { label: "Cancelada",    color: "#5f6875", bg: "rgba(95,104,117,.10)"  },
}

const statusFilterOptions = [
  { value: "aguardando",   label: "Aguardando" },
  { value: "backlog",      label: "Backlog" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida",    label: "Concluída" },
  { value: "cancelada",    label: "Cancelada" },
]

const prioridadeConfig = {
  baixa:   { label: "Baixa",   color: "#5f6875", bg: "rgba(95,104,117,.10)"  },
  media:   { label: "Média",   color: "#ffb547", bg: "rgba(255,181,71,.12)"  },
  alta:    { label: "Alta",    color: "#ff9a3c", bg: "rgba(255,154,60,.12)"  },
  urgente: { label: "Urgente", color: "#ff5c6a", bg: "rgba(255,92,106,.12)"  },
} as const

function StatusPill({ status }: { status: string | null }) {
  const st = status ? (statusConfig[status] ?? { label: status, color: "#5f6875", bg: "rgba(95,104,117,.10)" }) : null
  if (!st) return <span style={{ color: "var(--color-fg-4)" }}>—</span>
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
      style={{ color: st.color, background: st.bg }}
    >
      {st.label}
    </span>
  )
}

function PrioridadePill({ prioridade }: { prioridade: string | null }) {
  const pr = prioridade
    ? (prioridadeConfig[prioridade as keyof typeof prioridadeConfig] ?? prioridadeConfig.media)
    : prioridadeConfig.media
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
      style={{ color: pr.color, background: pr.bg }}
    >
      {pr.label}
    </span>
  )
}

interface TasksTableProps {
  demandas: Demanda[]
  projetos: Projeto[]
  page: number
  totalPages: number
  filters: { status?: string; prioridade?: string; projeto?: string; q?: string }
}

export function TasksTable({ demandas, projetos, page, totalPages, filters }: TasksTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  // Multi-status filter
  const activeStatuses = new Set((filters.status ?? "").split(",").filter(Boolean))

  const toggleStatus = (value: string) => {
    const next = new Set(activeStatuses)
    next.has(value) ? next.delete(value) : next.add(value)
    const params = new URLSearchParams(searchParams.toString())
    if (next.size > 0) params.set("status", [...next].join(","))
    else params.delete("status")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  // Search with debounce
  const [searchVal, setSearchVal] = useState(filters.q ?? "")
  const firstRender = useRef(true)

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const t = setTimeout(() => updateParam("q", searchVal || undefined), 350)
    return () => clearTimeout(t)
  }, [searchVal, updateParam])

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleAll = () => {
    if (selected.size === demandas.length) setSelected(new Set())
    else setSelected(new Set(demandas.map((d) => d.id)))
  }

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkStatus = (status: string) => {
    startTransition(async () => {
      await bulkUpdateStatus([...selected], status)
      setSelected(new Set())
      toast.success(`${selected.size} demanda(s) atualizada(s)`)
      router.refresh()
    })
  }

  const handleBulkPrioridade = (prioridade: string) => {
    startTransition(async () => {
      await bulkUpdatePrioridade([...selected], prioridade)
      setSelected(new Set())
      toast.success(`${selected.size} demanda(s) atualizada(s)`)
      router.refresh()
    })
  }

  const handleBulkDelete = () => {
    if (!confirm(`Excluir ${selected.size} demanda(s)?`)) return
    startTransition(async () => {
      await bulkDelete([...selected])
      setSelected(new Set())
      toast.success("Demandas excluídas")
      router.refresh()
    })
  }

  const handleQuickComplete = (id: number) => {
    setLoadingId(id)
    startTransition(async () => {
      await bulkUpdateStatus([id], "concluida")
      toast.success("Demanda concluída")
      router.refresh()
      setLoadingId(null)
    })
  }

  const selectStyle = {
    background: "var(--color-bg-3)",
    borderColor: "var(--color-line)",
    color: "var(--color-fg-1)",
  }

  const hasFilters = !!(filters.status || filters.prioridade || filters.projeto || filters.q)

  return (
    <div className="space-y-3">
      {/* Status toggle pills */}
      <div className="flex flex-wrap gap-1.5">
        {statusFilterOptions.map(({ value, label }) => {
          const active = activeStatuses.has(value)
          const st = statusConfig[value] ?? { color: "#5f6875", bg: "rgba(95,104,117,.10)" }
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleStatus(value)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
              style={active ? {
                color: st.color,
                background: st.bg,
                borderColor: st.color + "55",
              } : {
                color: "var(--color-fg-3)",
                background: "transparent",
                borderColor: "var(--color-line)",
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
            style={{ color: "var(--color-fg-4)" }}
          />
          <input
            type="text"
            placeholder="Buscar demandas…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="h-7 text-xs rounded px-2 pl-6 border w-full"
            style={selectStyle}
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => setSearchVal("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-fg-4)" }}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <select
          value={filters.prioridade ?? ""}
          onChange={(e) => updateParam("prioridade", e.target.value || undefined)}
          className="h-7 text-xs rounded px-2 border"
          style={selectStyle}
        >
          <option value="">Todas as prioridades</option>
          {Object.entries(prioridadeConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={filters.projeto ?? ""}
          onChange={(e) => updateParam("projeto", e.target.value || undefined)}
          className="h-7 text-xs rounded px-2 border"
          style={selectStyle}
        >
          <option value="">Todos os projetos</option>
          {projetos.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.nome}</option>
          ))}
        </select>

        {(filters.prioridade || filters.projeto || filters.q) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            style={{ color: "var(--color-fg-3)" }}
            onClick={() => {
              setSearchVal("")
              const params = new URLSearchParams(searchParams.toString())
              params.delete("prioridade")
              params.delete("projeto")
              params.delete("q")
              params.delete("page")
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[6px] border text-xs"
          style={{ background: "var(--color-bg-2)", borderColor: "rgba(201,240,74,.34)" }}
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" style={{ color: "var(--color-accent)" }} />}
          <span style={{ color: "var(--color-accent)" }} className="font-medium">
            {selected.size} selecionada{selected.size !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "var(--color-line-2)" }}>·</span>
          <select
            className="h-6 text-xs rounded px-1.5 border"
            style={selectStyle}
            defaultValue=""
            onChange={(e) => { if (e.target.value) handleBulkStatus(e.target.value) }}
          >
            <option value="" disabled>Mudar status</option>
            {statusFilterOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            className="h-6 text-xs rounded px-1.5 border"
            style={selectStyle}
            defaultValue=""
            onChange={(e) => { if (e.target.value) handleBulkPrioridade(e.target.value) }}
          >
            <option value="" disabled>Mudar prioridade</option>
            {Object.entries(prioridadeConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <Button
            variant="ghost" size="sm"
            className="h-6 text-xs gap-1 ml-auto"
            style={{ color: "#4ade80" }}
            onClick={() => handleBulkStatus("concluida")}
            disabled={isPending}
          >
            <CheckCheck className="h-3 w-3" />
            Concluir
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-6 text-xs gap-1"
            style={{ color: "var(--color-danger)" }}
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3 w-3" />
            Excluir
          </Button>
        </div>
      )}

      {/* Table (desktop) */}
      <div
        className="hidden md:block rounded-[10px] border overflow-hidden"
        style={{ borderColor: "var(--color-line)" }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--color-bg-1)", borderBottom: "1px solid var(--color-line)" }}>
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={selected.size === demandas.length && demandas.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-[var(--color-accent)] cursor-pointer"
                />
              </th>
              {["Título", "Status", "Prioridade", "Projeto", "Prazo"].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: "var(--color-fg-3)" }}>
                  {h}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {demandas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center" style={{ color: "var(--color-fg-3)" }}>
                  Nenhuma demanda encontrada
                </td>
              </tr>
            )}
            {demandas.map((d) => {
              const projeto = projetos.find((p) => p.id === d.projetoId)
              const isSelected = selected.has(d.id)
              const isDone = d.status === "concluida" || d.status === "concluido"
              const isLoading = loadingId === d.id
              return (
                <tr
                  key={d.id}
                  className="border-t group transition-colors"
                  style={{
                    borderColor: "var(--color-line)",
                    background: isSelected ? "var(--color-bg-2)" : undefined,
                  }}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(d.id)}
                      className="w-3.5 h-3.5 rounded accent-[var(--color-accent)] cursor-pointer"
                    />
                  </td>
                  <td
                    className="px-3 py-2 cursor-pointer hover:text-[var(--color-fg)] max-w-[280px]"
                    style={{ color: "var(--color-fg-1)" }}
                    onClick={() => router.push(`/tasks/${d.id}`)}
                  >
                    <span className={`line-clamp-1 ${isDone ? "line-through opacity-50" : ""}`}>{d.titulo}</span>
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="px-3 py-2">
                    <PrioridadePill prioridade={d.prioridade} />
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--color-fg-3)" }}>
                    {projeto?.nome ?? "—"}
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--color-fg-3)" }}>
                    {d.dataLimite ? format(new Date(d.dataLimite), "dd MMM", { locale: ptBR }) : "—"}
                  </td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    {!isDone && (
                      <button
                        type="button"
                        title="Concluir"
                        disabled={isLoading || isPending}
                        onClick={() => handleQuickComplete(d.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded hover:bg-[rgba(74,222,128,.15)]"
                        style={{ color: "#4ade80" }}
                      >
                        {isLoading
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-2">
        {demandas.map((d) => {
          const isSelected = selected.has(d.id)
          const isDone = d.status === "concluida" || d.status === "concluido"
          const isLoading = loadingId === d.id
          return (
            <div
              key={d.id}
              className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5"
              style={{
                background: isSelected ? "var(--color-bg-2)" : "var(--color-bg-1)",
                borderColor: isSelected ? "rgba(201,240,74,.34)" : "var(--color-line)",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(d.id)}
                className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
              />
              <Link
                href={`/tasks/${d.id}`}
                className="flex-1 min-w-0 space-y-1"
                onClick={(e) => { if (selected.size > 0) { e.preventDefault(); toggleOne(d.id) } }}
              >
                <p
                  className={`text-xs font-medium line-clamp-1 ${isDone ? "line-through opacity-50" : ""}`}
                  style={{ color: "var(--color-fg)" }}
                >
                  {d.titulo}
                </p>
                <div className="flex gap-2 items-center">
                  <StatusPill status={d.status} />
                  <PrioridadePill prioridade={d.prioridade} />
                </div>
              </Link>
              {!isDone && (
                <button
                  type="button"
                  title="Concluir"
                  disabled={isLoading || isPending}
                  onClick={() => handleQuickComplete(d.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                  style={{ background: "rgba(74,222,128,.12)", color: "#4ade80" }}
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          )
        })}
        {demandas.length === 0 && (
          <p className="text-sm text-center py-10" style={{ color: "var(--color-fg-3)" }}>
            Nenhuma demanda encontrada
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs" style={{ color: "var(--color-fg-2)" }}>{page} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
