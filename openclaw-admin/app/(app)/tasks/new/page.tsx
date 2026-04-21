import type { Metadata } from "next"
import { db } from "@/lib/db"
import { projetos } from "@/lib/db/schema"
import { NewTaskForm } from "@/components/features/new-task-form"

export const metadata: Metadata = { title: "Nova demanda" }

export default async function NewTaskPage() {
  const allProjetos = await db.select({ id: projetos.id, nome: projetos.nome }).from(projetos)
  return (
    <div className="max-w-2xl">
      <NewTaskForm projetos={allProjetos} />
    </div>
  )
}
