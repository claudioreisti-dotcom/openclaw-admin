import type { Metadata } from "next"
import { db } from "@/lib/db"
import { demandas, projetos } from "@/lib/db/schema"
import { eq, count, or, desc, gte, and, isNotNull, sql } from "drizzle-orm"
import { DashboardStats } from "@/components/features/dashboard-stats"
import { RecentDemandas } from "@/components/features/recent-demandas"
import { DashboardCharts, type TrendPoint, type StatusPoint } from "@/components/features/dashboard-charts"

export const metadata: Metadata = { title: "Dashboard" }

export const revalidate = 60

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  const thirtyDaysAgoStr = toDateStr(thirtyDaysAgo)

  const [
    totalDemandas,
    demandasConcluidas,
    demandasPendentes,
    totalProjetos,
    ultimasDemandas,
    criadasPorDia,
    concluidasPorDia,
    distribuicaoStatus,
  ] = await Promise.all([
    db.select({ value: count() }).from(demandas),
    db.select({ value: count() }).from(demandas).where(
      or(eq(demandas.status, "concluida"), eq(demandas.status, "concluido"))
    ),
    db.select({ value: count() }).from(demandas).where(
      or(eq(demandas.status, "aguardando"), eq(demandas.status, "pendente"), eq(demandas.status, "backlog"))
    ),
    db.select({ value: count() }).from(projetos),
    db.select().from(demandas).orderBy(desc(demandas.criadoEm)).limit(10),
    // Criadas por dia (últimos 30 dias)
    db
      .select({
        dia: sql<string>`DATE(criado_em)::text`,
        total: count(),
      })
      .from(demandas)
      .where(gte(demandas.criadoEm, thirtyDaysAgo))
      .groupBy(sql`DATE(criado_em)`)
      .orderBy(sql`DATE(criado_em)`),
    // Concluídas por dia (últimos 30 dias)
    db
      .select({
        dia: demandas.dataConclusao,
        total: count(),
      })
      .from(demandas)
      .where(
        and(
          isNotNull(demandas.dataConclusao),
          sql`data_conclusao >= ${thirtyDaysAgoStr}::date`
        )
      )
      .groupBy(demandas.dataConclusao)
      .orderBy(demandas.dataConclusao),
    // Distribuição por status
    db
      .select({ status: demandas.status, total: count() })
      .from(demandas)
      .groupBy(demandas.status),
  ])

  const stats = {
    total: totalDemandas[0]?.value ?? 0,
    concluidas: demandasConcluidas[0]?.value ?? 0,
    pendentes: demandasPendentes[0]?.value ?? 0,
    projetos: totalProjetos[0]?.value ?? 0,
  }

  // Monta array de 30 dias com dados reais
  const criadasMap = new Map(criadasPorDia.map((r) => [r.dia, r.total]))
  const concluidasMap = new Map(
    concluidasPorDia.map((r) => [r.dia ?? "", r.total])
  )
  const trendData: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = toDateStr(d)
    const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`
    return {
      label,
      criadas: criadasMap.get(key) ?? 0,
      concluidas: concluidasMap.get(key) ?? 0,
    }
  })

  const statusDist: StatusPoint[] = distribuicaoStatus.map((r) => ({
    status: r.status,
    total: r.total,
  }))

  return (
    <div className="space-y-4">
      <DashboardStats stats={stats} />
      <DashboardCharts
        trend={trendData}
        statusDist={statusDist}
        total={stats.total}
      />
      <RecentDemandas demandas={ultimasDemandas} />
    </div>
  )
}
