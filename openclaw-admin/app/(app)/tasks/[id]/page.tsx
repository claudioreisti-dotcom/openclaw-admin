import type { Metadata } from "next"
import { db } from "@/lib/db"
import { demandas, projetos, notas } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { TaskDetail } from "@/components/features/task-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const [demanda] = await db.select().from(demandas).where(eq(demandas.id, Number(id))).limit(1)
  return { title: demanda?.titulo ?? "Demanda" }
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params
  const numId = Number(id)

  const [demanda, allProjetos, demandaNotas] = await Promise.all([
    db.select().from(demandas).where(eq(demandas.id, numId)).limit(1),
    db.select({ id: projetos.id, nome: projetos.nome }).from(projetos),
    db.select().from(notas).where(eq(notas.demandaId, numId)),
  ])

  if (!demanda[0]) notFound()

  return <TaskDetail demanda={demanda[0]} projetos={allProjetos} notas={demandaNotas} />
}
