"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { demandas } from "@/lib/db/schema"
import { inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
}

export async function bulkUpdateStatus(ids: number[], status: string) {
  await requireAuth()
  if (ids.length === 0) return
  await db
    .update(demandas)
    .set({ status, atualizadoEm: new Date() })
    .where(inArray(demandas.id, ids))
  revalidatePath("/tasks")
}

export async function bulkUpdatePrioridade(ids: number[], prioridade: string) {
  await requireAuth()
  if (ids.length === 0) return
  await db
    .update(demandas)
    .set({ prioridade, atualizadoEm: new Date() })
    .where(inArray(demandas.id, ids))
  revalidatePath("/tasks")
}

export async function bulkDelete(ids: number[]) {
  await requireAuth()
  if (ids.length === 0) return
  await db.delete(demandas).where(inArray(demandas.id, ids))
  revalidatePath("/tasks")
}
