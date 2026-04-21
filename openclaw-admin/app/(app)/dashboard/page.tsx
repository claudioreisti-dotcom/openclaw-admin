import type { Metadata } from "next"
import { db } from "@/lib/db"
import { demandas, projetos } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
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
    db.select({ value: count() }).from(demandas).where(eq(demandas.status, "concluida")),
    db.select({ value: count() }).from(demandas).where(eq(demandas.status, "pendente")),
    db.select({ value: count() }).from(projetos),
    db.select().from(demandas).orderBy(demandas.criadoEm).limit(10),
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
