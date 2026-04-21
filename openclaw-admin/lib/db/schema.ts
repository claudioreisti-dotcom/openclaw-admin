import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const projetos = pgTable("projetos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  descricao: text("descricao"),
  status: varchar("status", { length: 50 }).default("ativo"),
  prioridade: varchar("prioridade", { length: 20 }).default("media"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
})

export const demandas = pgTable("demandas", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 300 }).notNull(),
  descricao: text("descricao"),
  projetoId: integer("projeto_id").references(() => projetos.id),
  status: varchar("status", { length: 50 }).default("pendente"),
  prioridade: varchar("prioridade", { length: 20 }).default("media"),
  responsavel: varchar("responsavel", { length: 100 }),
  dataLimite: date("data_limite"),
  dataConclusao: date("data_conclusao"),
  tags: text("tags").array(),
  criadoEm: timestamp("criado_em").default(sql`now()`),
  atualizadoEm: timestamp("atualizado_em").default(sql`now()`),
})

export const notas = pgTable("notas", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 200 }),
  conteudo: text("conteudo"),
  demandaId: integer("demanda_id").references(() => demandas.id),
  projetoId: integer("projeto_id").references(() => projetos.id),
  criadoEm: timestamp("criado_em").default(sql`now()`),
})

export const agentActivities = pgTable("agent_activities", {
  id: serial("id").primaryKey(),
  agent: varchar("agent", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descricao: text("descricao"),
  status: varchar("status", { length: 20 }).default("pendente").notNull(),
  prioridade: varchar("prioridade", { length: 10 }).default("media"),
  iniciadoEm: timestamp("iniciado_em"),
  concluidoEm: timestamp("concluido_em"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
  metadata: jsonb("metadata"),
})

export const usoTokens = pgTable("uso_tokens", {
  id: serial("id").primaryKey(),
  data: date("data").defaultNow(),
  sessao: varchar("sessao", { length: 100 }),
  modelo: varchar("modelo", { length: 100 }),
  tokensEntrada: integer("tokens_entrada").default(0),
  tokensSaida: integer("tokens_saida").default(0),
  tokensTotal: integer("tokens_total").default(0),
  custoUsd: numeric("custo_usd").default("0"),
  criadoEm: timestamp("criado_em").default(sql`now()`),
})
