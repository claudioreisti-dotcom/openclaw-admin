import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: `${BASE}/api/auth`,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const rows = await db.execute(
          sql`SELECT id, email, name, password_hash FROM admin_users WHERE email = ${email} LIMIT 1`
        )
        const user = rows.rows[0] as
          | { id: number; email: string; name: string; password_hash: string }
          | undefined

        if (!user) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return { id: String(user.id), email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: `${BASE}/login`,
  },
})
