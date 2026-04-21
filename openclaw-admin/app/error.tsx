"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-sm font-medium" style={{ color: "var(--color-danger)" }}>
        Algo correu mal
      </p>
      <p className="text-xs" style={{ color: "var(--color-fg-3)" }}>
        {error.message}
      </p>
      <button
        onClick={reset}
        className="text-xs px-3 py-1.5 rounded border"
        style={{
          background: "var(--color-bg-2)",
          borderColor: "var(--color-line)",
          color: "var(--color-fg-1)",
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
