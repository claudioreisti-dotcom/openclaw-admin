import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--color-bg)" }}
    >
      <p className="text-4xl font-bold" style={{ color: "var(--color-accent)" }}>404</p>
      <p className="text-sm" style={{ color: "var(--color-fg-2)" }}>Página não encontrada</p>
      <Link
        href="/dashboard"
        className="text-xs underline"
        style={{ color: "var(--color-fg-3)" }}
      >
        Voltar ao dashboard
      </Link>
    </div>
  )
}
