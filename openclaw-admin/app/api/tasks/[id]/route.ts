import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { demandas } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  status: z.string().optional(),
  prioridade: z.string().optional(),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json() as unknown
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const data = parsed.data
  await db
    .update(demandas)
    .set({
      ...(data.titulo !== undefined && { titulo: data.titulo }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.prioridade !== undefined && { prioridade: data.prioridade }),
      ...(data.responsavel !== undefined && { responsavel: data.responsavel }),
      ...(data.projeto_id !== undefined && {
        projetoId: data.projeto_id ? Number(data.projeto_id) : null,
      }),
      ...(data.data_limite !== undefined && { dataLimite: data.data_limite || null }),
      atualizadoEm: new Date(),
    })
    .where(eq(demandas.id, Number(id)))

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.delete(demandas).where(eq(demandas.id, Number(id)))
  return NextResponse.json({ ok: true })
}
