import type { Metadata } from "next"
import { db } from "@/lib/db"
import { demandas, projetos } from "@/lib/db/schema"
import { eq, ilike, or, desc, count, and } from "drizzle-orm"
import { TasksTable } from "@/components/features/tasks-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = { title: "Demandas" }

interface PageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    prioridade?: string
    projeto?: string
    q?: string
  }>
}

const PAGE_SIZE = 50

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const offset = (page - 1) * PAGE_SIZE

  // Build where conditions
  const conditions = []
  if (params.status) conditions.push(eq(demandas.status, params.status))
  if (params.prioridade) conditions.push(eq(demandas.prioridade, params.prioridade))
  if (params.projeto) conditions.push(eq(demandas.projetoId, Number(params.projeto)))
  if (params.q) {
    conditions.push(
      or(
        ilike(demandas.titulo, `%${params.q}%`),
        ilike(demandas.descricao, `%${params.q}%`)
      )
    )
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined

  const [rows, totalRows, allProjetos] = await Promise.all([
    db
      .select()
      .from(demandas)
      .where(whereClause)
      .orderBy(desc(demandas.criadoEm))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(demandas).where(whereClause),
    db.select({ id: projetos.id, nome: projetos.nome }).from(projetos),
  ])

  const total = totalRows[0]?.value ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
            {total} demanda{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/tasks/new">
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-accent-fg)",
              border: "none",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova demanda
          </Button>
        </Link>
      </div>

      <TasksTable
        demandas={rows}
        projetos={allProjetos}
        page={page}
        totalPages={totalPages}
        filters={params}
      />
    </div>
  )
}
