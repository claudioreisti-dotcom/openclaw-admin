import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[10px]" style={{ background: "var(--color-bg-2)" }} />
        ))}
      </div>
      <Skeleton className="h-48 rounded-[10px]" style={{ background: "var(--color-bg-2)" }} />
    </div>
  )
}
