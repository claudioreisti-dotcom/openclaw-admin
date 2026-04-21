import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { notas } from "@/lib/db/schema"

const bodySchema = z.object({
  titulo: z.string().max(200).optional(),
  conteudo: z.string().min(1, "Conteúdo obrigatório"),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const demandaId = parseInt(id)
  if (isNaN(demandaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const [nota] = await db
    .insert(notas)
    .values({ demandaId, titulo: parsed.data.titulo ?? null, conteudo: parsed.data.conteudo })
    .returning()

  return NextResponse.json(nota, { status: 201 })
}
