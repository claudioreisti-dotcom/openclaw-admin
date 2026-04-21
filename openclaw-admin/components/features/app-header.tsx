"use client"

import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Moon, Sun, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { CommandPalette } from "@/components/features/command-palette"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Demandas",
  "/projects": "Projetos",
  "/activities": "Atividades do Agent",
  "/settings": "Configurações",
}

interface AppHeaderProps {
  user?: { name?: string | null; email?: string | null }
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] ?? "Alfred"

  return (
    <header
      className="flex items-center gap-3 px-4 md:px-6 h-11 border-b shrink-0"
      style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
    >
      <h1 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
        {title}
      </h1>

      {/* Search trigger */}
      <button
        className="hidden md:flex flex-1 mx-4 items-center gap-2 px-3 h-7 rounded text-xs border max-w-48 cursor-text"
        style={{ background: "var(--color-bg-3)", borderColor: "var(--color-line)", color: "var(--color-fg-3)" }}
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
      >
        <Search className="h-3 w-3 shrink-0" />
        <span>Buscar…</span>
        <kbd className="ml-auto text-[10px] px-1 rounded" style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)" }}>⌘K</kbd>
      </button>

      <CommandPalette />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{ color: "var(--color-fg-2)" }}
      >
        {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs px-2"
            style={{ color: "var(--color-fg-2)" }}
          >
            <User className="h-3.5 w-3.5" />
            {user?.name ?? user?.email ?? "Admin"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
        >
          <DropdownMenuItem
            className="text-xs"
            style={{ color: "var(--color-fg-2)" }}
            disabled
          >
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ borderColor: "var(--color-line)" }} />
          <DropdownMenuItem
            className="text-xs cursor-pointer"
            style={{ color: "var(--color-danger)" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-3 w-3" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
