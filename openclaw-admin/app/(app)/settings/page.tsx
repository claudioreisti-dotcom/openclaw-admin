import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { usoTokens } from "@/lib/db/schema"
import { sum, count } from "drizzle-orm"

export const metadata: Metadata = { title: "Configurações" }

export default async function SettingsPage() {
  const session = await auth()

  const [tokenStats] = await db
    .select({
      total_tokens: sum(usoTokens.tokensTotal),
      total_custo: sum(usoTokens.custoUsd),
      total_sessoes: count(usoTokens.id),
    })
    .from(usoTokens)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Perfil */}
      <section
        className="rounded-[10px] border p-4 space-y-3"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        <h2 className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Perfil</h2>
        <div className="space-y-1">
          <p className="text-xs" style={{ color: "var(--color-fg-2)" }}>Nome</p>
          <p className="text-xs" style={{ color: "var(--color-fg)" }}>{session?.user?.name ?? "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs" style={{ color: "var(--color-fg-2)" }}>Email</p>
          <p className="text-xs" style={{ color: "var(--color-fg)" }}>{session?.user?.email ?? "—"}</p>
        </div>
      </section>

      {/* Uso de IA */}
      <section
        className="rounded-[10px] border p-4 space-y-3"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        <h2 className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Uso de IA (OpenClaw)</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total de tokens", value: tokenStats?.total_tokens?.toString() ?? "0" },
            { label: "Sessões registradas", value: tokenStats?.total_sessoes?.toString() ?? "0" },
            { label: "Custo total (USD)", value: `$${Number(tokenStats?.total_custo ?? 0).toFixed(4)}` },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-[10px]" style={{ color: "var(--color-fg-3)" }}>{s.label}</p>
              <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--color-fg)" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section
        className="rounded-[10px] border p-4 space-y-2"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        <h2 className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>Sobre</h2>
        <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
          Alfred Admin v1.0 — Painel para o agent OpenClaw (Telegram)
        </p>
        <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
          Banco de dados: Neon PostgreSQL (partilhado com o agent)
        </p>
      </section>
    </div>
  )
}
