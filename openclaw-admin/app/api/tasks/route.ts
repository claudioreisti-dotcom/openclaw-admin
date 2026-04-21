import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { demandas } from "@/lib/db/schema"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  status: z.string().default("pendente"),
  prioridade: z.string().default("media"),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json() as unknown
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const data = parsed.data
  const [inserted] = await db
    .insert(demandas)
    .values({
      titulo: data.titulo,
      descricao: data.descricao,
      status: data.status,
      prioridade: data.prioridade,
      responsavel: data.responsavel,
      projetoId: data.projeto_id ? Number(data.projeto_id) : null,
      dataLimite: data.data_limite || null,
    })
    .returning({ id: demandas.id })

  return NextResponse.json({ id: inserted?.id })
}
