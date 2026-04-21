import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Lazy init: only throw at runtime, not at build time
function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return drizzle(neon(url))
}

let _db: ReturnType<typeof getDb> | undefined

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_, prop) {
    if (!_db) _db = getDb()
    return (_db as unknown as Record<string | symbol, unknown>)[prop]
  },
})
