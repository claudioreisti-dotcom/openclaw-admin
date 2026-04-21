"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InferSelectModel } from "drizzle-orm"
import type { demandas, projetos } from "@/lib/db/schema"

type Demanda = InferSelectModel<typeof demandas>
type Projeto = Pick<InferSelectModel<typeof projetos>, "id" | "nome">

const statusConfig = {
  pendente: { label: "Pendente", color: "var(--color-warn)" },
  em_andamento: { label: "Em andamento", color: "var(--color-info)" },
  concluida: { label: "Concluída", color: "var(--color-ok)" },
  cancelada: { label: "Cancelada", color: "var(--color-fg-3)" },
} as const

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

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status ?? ""}
          onChange={(e) => updateParam("status", e.target.value || undefined)}
          className="h-7 text-xs rounded px-2 border"
          style={{
            background: "var(--color-bg-3)",
            borderColor: "var(--color-line)",
            color: "var(--color-fg-1)",
          }}
        >
          <option value="">Todos os status</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filters.prioridade ?? ""}
          onChange={(e) => updateParam("prioridade", e.target.value || undefined)}
          className="h-7 text-xs rounded px-2 border"
          style={{
            background: "var(--color-bg-3)",
            borderColor: "var(--color-line)",
            color: "var(--color-fg-1)",
          }}
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
          style={{
            background: "var(--color-bg-3)",
            borderColor: "var(--color-line)",
            color: "var(--color-fg-1)",
          }}
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

      {/* Table (desktop) */}
      <div
        className="hidden md:block rounded-[10px] border overflow-hidden"
        style={{ borderColor: "var(--color-line)" }}
      >
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--color-bg-1)", borderBottom: "1px solid var(--color-line)" }}>
              {["Título", "Status", "Prioridade", "Projeto", "Prazo"].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2 font-medium"
                  style={{ color: "var(--color-fg-3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demandas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center"
                  style={{ color: "var(--color-fg-3)" }}
                >
                  Nenhuma demanda encontrada
                </td>
              </tr>
            )}
            {demandas.map((d) => {
              const st = statusConfig[d.status as keyof typeof statusConfig] ?? statusConfig.pendente
              const pr = prioridadeConfig[d.prioridade as keyof typeof prioridadeConfig] ?? prioridadeConfig.media
              const projeto = projetos.find((p) => p.id === d.projetoId)
              return (
                <tr
                  key={d.id}
                  className="border-t hover:bg-[var(--color-bg-2)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--color-line)" }}
                  onClick={() => router.push(`/tasks/${d.id}`)}
                >
                  <td className="px-3 py-2" style={{ color: "var(--color-fg-1)" }}>
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
                    {d.dataLimite
                      ? format(new Date(d.dataLimite), "dd MMM", { locale: ptBR })
                      : "—"}
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
          const st = statusConfig[d.status as keyof typeof statusConfig] ?? statusConfig.pendente
          const pr = prioridadeConfig[d.prioridade as keyof typeof prioridadeConfig] ?? prioridadeConfig.media
          return (
            <Link
              key={d.id}
              href={`/tasks/${d.id}`}
              className="block rounded-[10px] border p-3 space-y-1.5"
              style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
            >
              <p className="text-xs font-medium line-clamp-2" style={{ color: "var(--color-fg)" }}>
                {d.titulo}
              </p>
              <div className="flex gap-3">
                <span className="text-[10px]" style={{ color: st.color }}>{st.label}</span>
                <span className="text-[10px]" style={{ color: pr.color }}>{pr.label}</span>
              </div>
            </Link>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs" style={{ color: "var(--color-fg-2)" }}>
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
