import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/features/app-sidebar"
import { AppHeader } from "@/components/features/app-header"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <AppSidebar user={session.user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader user={session.user} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:pb-6 md:p-6">{children}</main>
      </div>
    </div>
  )
}
