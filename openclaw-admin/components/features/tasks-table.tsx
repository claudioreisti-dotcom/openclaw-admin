"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Trash2, CheckCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { bulkUpdateStatus, bulkUpdatePrioridade, bulkDelete } from "@/lib/actions/tasks"
import type { InferSelectModel } from "drizzle-orm"
import type { demandas, projetos } from "@/lib/db/schema"

type Demanda = InferSelectModel<typeof demandas>
type Projeto = Pick<InferSelectModel<typeof projetos>, "id" | "nome">

const statusConfig: Record<string, { label: string; color: string }> = {
  aguardando:  { label: "Aguardando",  color: "var(--color-warn)" },
  backlog:     { label: "Backlog",     color: "var(--color-fg-3)" },
  em_andamento:{ label: "Em andamento",color: "var(--color-info)" },
  concluida:   { label: "Concluída",   color: "var(--color-ok)" },
  concluido:   { label: "Concluída",   color: "var(--color-ok)" }, // alias do bot
  cancelada:   { label: "Cancelada",   color: "var(--color-fg-3)" },
}

// Status únicos para o filtro (sem duplicatas)
const statusFilterOptions = [
  { value: "aguardando",   label: "Aguardando" },
  { value: "backlog",      label: "Backlog" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida",    label: "Concluída" },
  { value: "cancelada",    label: "Cancelada" },
]

const prioridadeConfig = {
  baixa: { label: "Baixa", color: "var(--color-fg-3)" },
  media: { label: "Média", color: "var(--color-warn)" },
  alta: { label: "Alta", color: "#ff9a3c" },
  urgente: { label: "Urgente", color: "var(--color-danger)" },
} as const

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

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleAll = () => {
    if (selected.size === demandas.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(demandas.map((d) => d.id)))
    }
  }

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
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

  const selectStyle = {
    background: "var(--color-bg-3)",
    borderColor: "var(--color-line)",
    color: "var(--color-fg-1)",
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status ?? ""}
          onChange={(e) => updateParam("status", e.target.value || undefined)}
          className="h-7 text-xs rounded px-2 border"
          style={selectStyle}
        >
          <option value="">Todos os status</option>
          {statusFilterOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
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
        {(filters.status || filters.prioridade || filters.projeto) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            style={{ color: "var(--color-fg-3)" }}
            onClick={() => {
              const params = new URLSearchParams()
              if (filters.q) params.set("q", filters.q)
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
          style={{ background: "var(--color-bg-2)", borderColor: "var(--color-accent-line, rgba(201,240,74,.34))" }}
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
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
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
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 ml-auto"
            style={{ color: "var(--color-ok)" }}
            onClick={() => handleBulkStatus("concluida")}
            disabled={isPending}
          >
            <CheckCheck className="h-3 w-3" />
            Concluir
          </Button>
          <Button
            variant="ghost"
            size="sm"
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
            </tr>
          </thead>
          <tbody>
            {demandas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center" style={{ color: "var(--color-fg-3)" }}>
                  Nenhuma demanda encontrada
                </td>
              </tr>
            )}
            {demandas.map((d) => {
              const st = statusConfig[d.status ?? ""] ?? { label: d.status ?? "—", color: "var(--color-fg-3)" }
              const pr = prioridadeConfig[d.prioridade as keyof typeof prioridadeConfig] ?? prioridadeConfig.media
              const projeto = projetos.find((p) => p.id === d.projetoId)
              const isSelected = selected.has(d.id)
              return (
                <tr
                  key={d.id}
                  className="border-t transition-colors"
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
                    className="px-3 py-2 cursor-pointer hover:text-[var(--color-fg)]"
                    style={{ color: "var(--color-fg-1)" }}
                    onClick={() => router.push(`/tasks/${d.id}`)}
                  >
                    <span className="line-clamp-1">{d.titulo}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span style={{ color: st.color }}>{st.label}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span style={{ color: pr.color }}>{pr.label}</span>
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--color-fg-3)" }}>
                    {projeto?.nome ?? "—"}
                  </td>
                  <td className="px-3 py-2" style={{ color: "var(--color-fg-3)" }}>
                    {d.dataLimite ? format(new Date(d.dataLimite), "dd MMM", { locale: ptBR }) : "—"}
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
          const st = statusConfig[d.status ?? ""] ?? { label: d.status ?? "—", color: "var(--color-fg-3)" }
          const pr = prioridadeConfig[d.prioridade as keyof typeof prioridadeConfig] ?? prioridadeConfig.media
          const isSelected = selected.has(d.id)
          return (
            <div
              key={d.id}
              className="flex items-start gap-2.5 rounded-[10px] border p-3"
              style={{
                background: isSelected ? "var(--color-bg-2)" : "var(--color-bg-1)",
                borderColor: isSelected ? "var(--color-accent-line, rgba(201,240,74,.34))" : "var(--color-line)",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(d.id)}
                className="mt-0.5 w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
              />
              <Link
                href={`/tasks/${d.id}`}
                className="flex-1 min-w-0 space-y-1.5"
                onClick={(e) => { if (selected.size > 0) e.preventDefault(); toggleOne(d.id) }}
              >
                <p className="text-xs font-medium line-clamp-2" style={{ color: "var(--color-fg)" }}>
                  {d.titulo}
                </p>
                <div className="flex gap-3">
                  <span className="text-[10px]" style={{ color: st.color }}>{st.label}</span>
                  <span className="text-[10px]" style={{ color: pr.color }}>{pr.label}</span>
                </div>
              </Link>
            </div>
          )
        })}
        {demandas.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-fg-3)" }}>
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
