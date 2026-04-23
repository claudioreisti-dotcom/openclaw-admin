import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { demandas, projetos, agentActivities } from "@/lib/db/schema"
import { eq, count, or, desc, gte, and, isNotNull, sql } from "drizzle-orm"
import { DashboardV1, type TrendPoint, type StatusPoint } from "@/components/features/dashboard-v1"

export const metadata: Metadata = { title: "Dashboard" }
export const revalidate = 60

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function DashboardPage() {
  const session = await auth()
  const userName = session?.user?.name?.split(" ")[0] ?? "usuário"

  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const todayStr = toDateStr(now)
  const thirtyDaysAgoStr = toDateStr(thirtyDaysAgo)

  const [
    ativas,
    concluidasSemana,
    atrasadas,
    totalProjetos,
    criadasPorDia,
    concluidasPorDia,
    distribuicaoStatus,
    ultimasDemandas,
    ultimasAtividades,
  ] = await Promise.all([
    // Demandas ativas (não concluídas e não canceladas)
    db.select({ value: count() }).from(demandas).where(
      sql`status NOT IN ('concluida', 'concluido', 'cancelada', 'cancelado')`
    ),
    // Concluídas nos últimos 7 dias (via atualizado_em)
    db.select({ value: count() }).from(demandas).where(
      and(
        or(eq(demandas.status, "concluida"), eq(demandas.status, "concluido")),
        gte(demandas.atualizadoEm, sevenDaysAgo)
      )
    ),
    // Atrasadas: tem prazo, prazo < hoje, não finalizadas
    db.select({ value: count() }).from(demandas).where(
      and(
        isNotNull(demandas.dataLimite),
        sql`data_limite < ${todayStr}::date`,
        sql`status NOT IN ('concluida', 'concluido', 'cancelada', 'cancelado')`
      )
    ),
    db.select({ value: count() }).from(projetos),
    // Criadas por dia – últimos 30 dias
    db
      .select({ dia: sql<string>`DATE(criado_em)::text`, total: count() })
      .from(demandas)
      .where(gte(demandas.criadoEm, thirtyDaysAgo))
      .groupBy(sql`DATE(criado_em)`)
      .orderBy(sql`DATE(criado_em)`),
    // Concluídas por dia – últimos 30 dias
    db
      .select({ dia: demandas.dataConclusao, total: count() })
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
    // Últimas 6 demandas
    db.select().from(demandas).orderBy(desc(demandas.criadoEm)).limit(6),
    // Últimas 6 atividades do agent
    db.select().from(agentActivities).orderBy(desc(agentActivities.criadoEm)).limit(6),
  ])

  // Monta série de 30 dias
  const criadasMap = new Map(criadasPorDia.map(r => [r.dia, r.total]))
  const concluidasMap = new Map(concluidasPorDia.map(r => [r.dia ?? "", r.total]))
  const trend: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = toDateStr(d)
    const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`
    return { label, criadas: criadasMap.get(key) ?? 0, concluidas: concluidasMap.get(key) ?? 0 }
  })

  const statusDist: StatusPoint[] = distribuicaoStatus.map(r => ({
    status: r.status,
    total: r.total,
  }))

  const totalDemandas = statusDist.reduce((acc, r) => acc + r.total, 0)

  return (
    <DashboardV1
      userName={userName}
      hour={now.getHours()}
      stats={{
        ativas:           ativas[0]?.value          ?? 0,
        concluidasSemana: concluidasSemana[0]?.value ?? 0,
        atrasadas:        atrasadas[0]?.value        ?? 0,
        projetos:         totalProjetos[0]?.value    ?? 0,
      }}
      trend={trend}
      statusDist={statusDist}
      totalDemandas={totalDemandas}
      ultimasDemandas={ultimasDemandas}
      atividades={ultimasAtividades}
    />
  )
}
