"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const res = await signIn("credentials", { ...data, redirect: false })
    setLoading(false)
    if (res?.error) {
      toast.error("Email ou senha incorretos")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div
      className="rounded-[10px] border p-8 space-y-6"
      style={{ background: "var(--color-bg-1)", borderColor: "var(--color-line)" }}
    >
      {/* Logo / Brand */}
      <div className="text-center space-y-1">
        <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-accent)" }}>
          Alfred
        </div>
        <p className="text-sm" style={{ color: "var(--color-fg-2)" }}>
          Painel administrativo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" style={{ color: "var(--color-fg-1)", fontSize: 12 }}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            {...register("email")}
            style={{
              background: "var(--color-bg-3)",
              borderColor: errors.email ? "var(--color-danger)" : "var(--color-line)",
              color: "var(--color-fg)",
            }}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" style={{ color: "var(--color-fg-1)", fontSize: 12 }}>
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            {...register("password")}
            style={{
              background: "var(--color-bg-3)",
              borderColor: errors.password ? "var(--color-danger)" : "var(--color-line)",
              color: "var(--color-fg)",
            }}
          />
          {errors.password && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={loading}
          style={{
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            borderColor: "var(--color-accent)",
          }}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </div>
  )
}
