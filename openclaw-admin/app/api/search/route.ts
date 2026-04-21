import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { demandas, projetos } from "@/lib/db/schema"
import { ilike, or } from "drizzle-orm"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

export async function GET(req: Request) {
  const hdrs = await headers()
  const ip = hdrs.get("x-forwarded-for") ?? "anonymous"
  const rl = rateLimit(`search:${ip}`, 60)
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const pattern = `%${q}%`

  const [demResults, projResults] = await Promise.all([
    db
      .select({ id: demandas.id, titulo: demandas.titulo, status: demandas.status })
      .from(demandas)
      .where(or(ilike(demandas.titulo, pattern), ilike(demandas.descricao, pattern)))
      .limit(8),
    db
      .select({ id: projetos.id, titulo: projetos.nome, status: projetos.status })
      .from(projetos)
      .where(ilike(projetos.nome, pattern))
      .limit(4),
  ])

  const results = [
    ...demResults.map((r) => ({ ...r, type: "demanda" as const })),
    ...projResults.map((r) => ({ ...r, type: "projeto" as const })),
  ]

  return NextResponse.json(results)
}
