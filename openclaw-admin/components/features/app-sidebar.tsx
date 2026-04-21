"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Bot,
  Settings,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: ListTodo, label: "Demandas" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/activities", icon: Bot, label: "Atividades" },
  { href: "/settings", icon: Settings, label: "Configurações" },
]

interface AppSidebarProps {
  user?: { name?: string | null; email?: string | null }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 border-r"
        style={{
          background: "var(--color-bg-1)",
          borderColor: "var(--color-line)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: "var(--color-line)" }}
        >
          <Zap className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--color-fg)" }}>
            Alfred
          </span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(201,240,74,.12)",
              color: "var(--color-accent)",
            }}
          >
            admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                  active
                    ? "text-[var(--color-fg)]"
                    : "text-[var(--color-fg-3)] hover:text-[var(--color-fg-1)] hover:bg-[var(--color-bg-2)]"
                )}
                style={
                  active
                    ? {
                        background: "var(--color-bg-2)",
                        color: "var(--color-fg)",
                      }
                    : undefined
                }
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
                {active && (
                  <span
                    className="ml-auto w-1 h-1 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div
          className="px-3 py-3 border-t text-xs truncate"
          style={{ borderColor: "var(--color-line)", color: "var(--color-fg-3)" }}
        >
          {user?.name ?? user?.email ?? "Admin"}
        </div>
      </aside>
    </>
  )
}
