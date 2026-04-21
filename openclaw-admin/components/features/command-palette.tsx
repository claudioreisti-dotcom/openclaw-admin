"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Bot,
  Settings,
  Plus,
} from "lucide-react"

interface SearchResult {
  id: number
  titulo: string
  status: string | null
  type: "demanda" | "projeto"
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: ListTodo, label: "Demandas" },
  { href: "/tasks/new", icon: Plus, label: "Nova demanda" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/activities", icon: Bot, label: "Atividades" },
  { href: "/settings", icon: Settings, label: "Configurações" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) setResults(await res.json() as SearchResult[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    setResults([])
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar demandas, projetos, páginas…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <span style={{ color: "var(--color-fg-3)" }}>Buscando…</span>
          ) : (
            <span style={{ color: "var(--color-fg-3)" }}>Nenhum resultado</span>
          )}
        </CommandEmpty>

        {results.length > 0 && (
          <>
            <CommandGroup heading="Resultados">
              {results.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  value={`${r.type}-${r.id}-${r.titulo}`}
                  onSelect={() => go(r.type === "demanda" ? `/tasks/${r.id}` : `/tasks?projeto=${r.id}`)}
                >
                  {r.type === "demanda" ? (
                    <ListTodo className="mr-2 h-3.5 w-3.5" style={{ color: "var(--color-fg-3)" }} />
                  ) : (
                    <FolderKanban className="mr-2 h-3.5 w-3.5" style={{ color: "var(--color-fg-3)" }} />
                  )}
                  <span>{r.titulo}</span>
                  {r.status && (
                    <span className="ml-auto text-[10px]" style={{ color: "var(--color-fg-4)" }}>
                      {r.status}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navegação">
          {navItems.map((item) => (
            <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
              <item.icon className="mr-2 h-3.5 w-3.5" style={{ color: "var(--color-fg-3)" }} />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
