import { describe, it, expect } from "vitest"
import { z } from "zod"

// Replicate the schemas from API routes for isolated testing
const createDemandaSchema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  status: z.string().default("pendente"),
  prioridade: z.string().default("media"),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})

const updateDemandaSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional(),
  status: z.string().optional(),
  prioridade: z.string().optional(),
  responsavel: z.string().optional(),
  projeto_id: z.string().optional(),
  data_limite: z.string().optional(),
})

describe("createDemandaSchema", () => {
  it("aceita payload mínimo válido", () => {
    const result = createDemandaSchema.safeParse({ titulo: "Demanda de teste" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe("pendente")
      expect(result.data.prioridade).toBe("media")
    }
  })

  it("rejeita título vazio", () => {
    const result = createDemandaSchema.safeParse({ titulo: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita payload sem título", () => {
    const result = createDemandaSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("aceita todos os campos opcionais", () => {
    const result = createDemandaSchema.safeParse({
      titulo: "Demanda completa",
      descricao: "Descrição detalhada",
      status: "em_andamento",
      prioridade: "alta",
      responsavel: "João",
      projeto_id: "5",
      data_limite: "2026-12-31",
    })
    expect(result.success).toBe(true)
  })
})

describe("updateDemandaSchema", () => {
  it("aceita payload parcial (sem campos obrigatórios)", () => {
    const result = updateDemandaSchema.safeParse({ status: "concluida" })
    expect(result.success).toBe(true)
  })

  it("rejeita título explicitamente vazio", () => {
    const result = updateDemandaSchema.safeParse({ titulo: "" })
    expect(result.success).toBe(false)
  })

  it("aceita payload vazio (nenhum campo para atualizar)", () => {
    const result = updateDemandaSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe("rateLimit", () => {
  it("permite requisições dentro do limite", async () => {
    const { rateLimit } = await import("@/lib/rate-limit")
    const result = rateLimit("test-ip-unique-1", 5, 60_000)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("bloqueia ao atingir o limite", async () => {
    const { rateLimit } = await import("@/lib/rate-limit")
    const ip = "test-ip-unique-2"
    for (let i = 0; i < 3; i++) rateLimit(ip, 3, 60_000)
    const result = rateLimit(ip, 3, 60_000)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })
})
