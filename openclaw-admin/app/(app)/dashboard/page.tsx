import type { Metadata } from "next"
import { db } from "@/lib/db"
import { demandas, projetos } from "@/lib/db/schema"
import { eq, count, or, desc } from "drizzle-orm"
import { DashboardStats } from "@/components/features/dashboard-stats"
import { RecentDemandas } from "@/components/features/recent-demandas"

export const metadata: Metadata = { title: "Dashboard" }

export const revalidate = 60

export default async function DashboardPage() {
  const [
    totalDemandas,
    demandasConcluidas,
    demandasPendentes,
    totalProjetos,
    ultimasDemandas,
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
  ])

  const stats = {
    total: totalDemandas[0]?.value ?? 0,
    concluidas: demandasConcluidas[0]?.value ?? 0,
    pendentes: demandasPendentes[0]?.value ?? 0,
    projetos: totalProjetos[0]?.value ?? 0,
  }

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />
      <RecentDemandas demandas={ultimasDemandas} />
    </div>
  )
}
