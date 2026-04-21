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
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import type { InferSelectModel } from "drizzle-orm"
import type { projetos } from "@/lib/db/schema"

type Projeto = Pick<InferSelectModel<typeof projetos>, "id" | "nome">

const schema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  descricao: z.string().optional(),
  status: z.string().min(1),
  prioridade: z.string().min(1),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function NewTaskForm({ projetos }: { projetos: Projeto[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "pendente", prioridade: "media" },
  })

  async function onSubmit(data: FormData) {
    setSaving(true)
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (res.ok) {
      const json = await res.json() as { id: number }
      toast.success("Demanda criada")
      router.push(`/tasks/${json.id}`)
    } else {
      toast.error("Erro ao criar demanda")
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="h-7 w-7" style={{ color: "var(--color-fg-3)" }}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
          Nova demanda
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label style={labelStyle}>Título *</Label>
          <Input {...register("titulo")} style={fieldStyle} placeholder="Descreva a demanda" />
          {errors.titulo && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{errors.titulo.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label style={labelStyle}>Descrição</Label>
          <textarea {...register("descricao")} rows={3} className="w-full rounded px-3 py-2 text-xs border resize-y" style={fieldStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label style={labelStyle}>Status</Label>
            <select {...register("status")} className="w-full h-8 rounded px-2 text-xs border" style={fieldStyle}>
              <option value="pendente">Pendente</option>
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
            {projetos.map((p) => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
          </select>
        </div>
        <Button type="submit" size="sm" className="h-7 text-xs gap-1.5" disabled={saving}
          style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)", border: "none" }}>
          <Plus className="h-3.5 w-3.5" />
          {saving ? "Criando…" : "Criar demanda"}
        </Button>
      </form>
    </div>
  )
}
