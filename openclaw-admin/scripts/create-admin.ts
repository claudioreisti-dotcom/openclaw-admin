#!/usr/bin/env tsx
/**
 * Cria o primeiro utilizador admin.
 * Uso: pnpm admin:create email@exemplo.com "Nome Completo" senha123
 */
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { config } from "dotenv"

config({ path: ".env.local" })

const db = drizzle(neon(process.env.DATABASE_URL!))

async function main() {
  const [, , email, name, password] = process.argv
  if (!email || !name || !password) {
    console.error("Uso: pnpm admin:create email@exemplo.com 'Nome Completo' senha123")
    process.exit(1)
  }

  // Cria tabela se não existir
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      telegram_user_id BIGINT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const hash = await bcrypt.hash(password, 12)
  await db.execute(
    sql`INSERT INTO admin_users (email, password_hash, name) VALUES (${email}, ${hash}, ${name}) ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, name = ${name}`
  )
  console.log(`Admin criado: ${email}`)
}

main().catch(console.error)
