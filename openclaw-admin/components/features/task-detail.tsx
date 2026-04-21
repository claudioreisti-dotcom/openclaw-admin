"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, Save, Trash2, Plus, Loader2, CheckCircle2, RotateCcw } from "lucide-react"
import Link from "next/link"
import type { InferSelectModel } from "drizzle-orm"
import type { demandas, projetos, notas } from "@/lib/db/schema"
import { apiUrl } from "@/lib/api"

type Demanda = InferSelectModel<typeof demandas>
type Projeto = Pick<InferSelectModel<typeof projetos>, "id" | "nome">
type Nota = InferSelectModel<typeof notas>

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  aguardando:   { label: "Aguardando",   color: "#ffb547", bg: "rgba(255,181,71,.12)"  },
  backlog:      { label: "Backlog",      color: "#5f6875", bg: "rgba(95,104,117,.10)"  },
  em_andamento: { label: "Em andamento", color: "#7ab8ff", bg: "rgba(122,184,255,.12)" },
  concluida:    { label: "Concluída",    color: "#4ade80", bg: "rgba(74,222,128,.12)"  },
  concluido:    { label: "Concluída",    color: "#4ade80", bg: "rgba(74,222,128,.12)"  },
  cancelada:    { label: "Cancelada",    color: "#5f6875", bg: "rgba(95,104,117,.10)"  },
}

function StatusPill({ status }: { status: string | null }) {
  if (!status) return null
  const st = statusConfig[status] ?? { label: status, color: "#5f6875", bg: "rgba(95,104,117,.10)" }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
      style={{ color: st.color, background: st.bg }}
    >
      {st.label}
    </span>
  )
}

const schema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  status: z.string(),
  prioridade: z.string(),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface TaskDetailProps {
  demanda: Demanda
  projetos: Projeto[]
  notas: Nota[]
}

export function TaskDetail({ demanda, projetos, notas }: TaskDetailProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(demanda.status ?? "aguardando")

  const [notasList, setNotasList] = useState<Nota[]>(notas)
  const [addingNota, setAddingNota] = useState(false)
  const [savingNota, setSavingNota] = useState(false)
  const [notaForm, setNotaForm] = useState({ titulo: "", conteudo: "" })

  const isDone = currentStatus === "concluida" || currentStatus === "concluido"
  const isCancelled = currentStatus === "cancelada"

  const { register, handleSubmit, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo:      demanda.titulo,
      descricao:   demanda.descricao ?? "",
      status:      demanda.status ?? "aguardando",
      prioridade:  demanda.prioridade ?? "media",
      responsavel: demanda.responsavel ?? "",
      projeto_id:  demanda.projetoId ? String(demanda.projetoId) : "",
      data_limite: demanda.dataLimite ?? "",
    },
  })

  async function handleQuickStatus(newStatus: string) {
    setCompleting(true)
    const res = await fetch(apiUrl(`/api/tasks/${demanda.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setCompleting(false)
    if (res.ok) {
      setCurrentStatus(newStatus)
      setValue("status", newStatus)
      const msg = newStatus === "concluida" ? "Demanda concluída!" : "Demanda reaberta"
      toast.success(msg)
      router.refresh()
    } else {
      toast.error("Erro ao atualizar status")
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true)
    const res = await fetch(apiUrl(`/api/tasks/${demanda.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (res.ok) {
      setCurrentStatus(data.status)
      toast.success("Demanda atualizada")
      router.refresh()
    } else {
      toast.error("Erro ao salvar")
    }
  }

  async function onDelete() {
    if (!confirm("Excluir esta demanda?")) return
    const res = await fetch(apiUrl(`/api/tasks/${demanda.id}`), { method: "DELETE" })
    if (res.ok) {
      toast.success("Demanda excluída")
      router.push("/tasks")
    } else {
      toast.error("Erro ao excluir")
    }
  }

  async function handleAddNota(e: React.FormEvent) {
    e.preventDefault()
    if (!notaForm.conteudo.trim()) return
    setSavingNota(true)
    const res = await fetch(apiUrl(`/api/tasks/${demanda.id}/notes`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: notaForm.titulo || undefined, conteudo: notaForm.conteudo }),
    })
    setSavingNota(false)
    if (res.ok) {
      const nova = await res.json() as Nota
      setNotasList((prev) => [nova, ...prev])
      setNotaForm({ titulo: "", conteudo: "" })
      setAddingNota(false)
      toast.success("Nota adicionada")
    } else {
      toast.error("Erro ao salvar nota")
    }
  }

  const fieldStyle = {
    background: "var(--color-bg-3)",
    borderColor: "var(--color-line)",
    color: "var(--color-fg)",
    fontSize: 12,
  }
  const labelStyle = { color: "var(--color-fg-2)", fontSize: 11 }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="h-7 w-7 mt-0.5" style={{ color: "var(--color-fg-3)" }}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0 space-y-1.5">
          <h2 className="text-sm font-semibold leading-snug" style={{ color: "var(--color-fg)" }}>
            {demanda.titulo}
          </h2>
          <StatusPill status={currentStatus} />
        </div>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 mt-0.5 shrink-0"
          style={{ color: "var(--color-danger)" }}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Quick action bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-[10px] border"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        {!isDone && !isCancelled ? (
          <>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs gap-2"
              disabled={completing}
              onClick={() => handleQuickStatus("concluida")}
              style={{
                background: "rgba(74,222,128,.15)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,.25)",
                flex: 1,
              }}
            >
              {completing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCircle2 className="h-3.5 w-3.5" />}
              Concluir demanda
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-2"
              disabled={completing}
              onClick={() => handleQuickStatus("em_andamento")}
              style={{ color: "#7ab8ff" }}
            >
              Em andamento
            </Button>
          </>
        ) : (
          <>
            <div
              className="flex items-center gap-1.5 text-xs flex-1"
              style={{ color: isDone ? "#4ade80" : "#5f6875" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {isDone ? "Demanda concluída" : "Demanda cancelada"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={completing}
              onClick={() => handleQuickStatus("aguardando")}
              style={{ color: "var(--color-fg-3)" }}
            >
              {completing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RotateCcw className="h-3.5 w-3.5" />}
              Reabrir
            </Button>
          </>
        )}
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label style={labelStyle}>Título</Label>
          <Input {...register("titulo")} style={fieldStyle} />
        </div>
        <div className="space-y-1.5">
          <Label style={labelStyle}>Descrição</Label>
          <textarea
            {...register("descricao")}
            rows={3}
            className="w-full rounded px-3 py-2 text-xs border resize-y"
            style={fieldStyle}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Status</Label>
            <select {...register("status")} className="w-full h-8 rounded px-2 text-xs border" style={fieldStyle}>
              <option value="aguardando">Aguardando</option>
              <option value="backlog">Backlog</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label style={labelStyle}>Prioridade</Label>
            <select {...register("prioridade")} className="w-full h-8 rounded px-2 text-xs border" style={fieldStyle}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Responsável</Label>
            <Input {...register("responsavel")} style={fieldStyle} />
          </div>
          <div className="space-y-1.5">
            <Label style={labelStyle}>Prazo</Label>
            <Input type="date" {...register("data_limite")} style={fieldStyle} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label style={labelStyle}>Projeto</Label>
          <select {...register("projeto_id")} className="w-full h-8 rounded px-2 text-xs border" style={fieldStyle}>
            <option value="">Sem projeto</option>
            {projetos.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.nome}</option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-7 text-xs gap-1.5"
          disabled={saving}
          style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)", border: "none" }}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Salvando…" : "Salvar alterações"}
        </Button>
      </form>

      {/* Notes */}
      <div
        className="rounded-[10px] border"
        style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-line)" }}>
          <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
            Notas {notasList.length > 0 && `(${notasList.length})`}
          </span>
          <Button
            variant="ghost" size="sm"
            className="h-6 text-xs gap-1"
            style={{ color: "var(--color-accent)" }}
            onClick={() => setAddingNota((v) => !v)}
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </Button>
        </div>

        {addingNota && (
          <form onSubmit={handleAddNota} className="px-4 py-3 space-y-2 border-b" style={{ borderColor: "var(--color-line)" }}>
            <input
              placeholder="Título (opcional)"
              value={notaForm.titulo}
              onChange={(e) => setNotaForm((f) => ({ ...f, titulo: e.target.value }))}
              className="w-full rounded px-3 py-1.5 text-xs border"
              style={{ background: "var(--color-bg-3)", borderColor: "var(--color-line)", color: "var(--color-fg)" }}
            />
            <textarea
              placeholder="Conteúdo…"
              rows={3}
              required
              value={notaForm.conteudo}
              onChange={(e) => setNotaForm((f) => ({ ...f, conteudo: e.target.value }))}
              className="w-full rounded px-3 py-1.5 text-xs border resize-y"
              style={{ background: "var(--color-bg-3)", borderColor: "var(--color-line)", color: "var(--color-fg)" }}
            />
            <div className="flex gap-2">
              <Button
                type="submit" size="sm"
                className="h-6 text-xs gap-1"
                disabled={savingNota}
                style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)", border: "none" }}
              >
                {savingNota ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Salvar
              </Button>
              <Button
                type="button" variant="ghost" size="sm"
                className="h-6 text-xs"
                style={{ color: "var(--color-fg-3)" }}
                onClick={() => { setAddingNota(false); setNotaForm({ titulo: "", conteudo: "" }) }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y" style={{ borderColor: "var(--color-line)" }}>
          {notasList.length === 0 && !addingNota && (
            <p className="px-4 py-6 text-xs text-center" style={{ color: "var(--color-fg-3)" }}>
              Nenhuma nota ainda
            </p>
          )}
          {notasList.map((n) => (
            <div key={n.id} className="px-4 py-3 space-y-1">
              {n.titulo && <p className="text-xs font-medium" style={{ color: "var(--color-fg-1)" }}>{n.titulo}</p>}
              <p className="text-xs" style={{ color: "var(--color-fg-2)" }}>{n.conteudo}</p>
              <p className="text-[10px]" style={{ color: "var(--color-fg-4)" }}>
                {n.criadoEm ? format(new Date(n.criadoEm), "dd MMM yyyy HH:mm", { locale: ptBR }) : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
