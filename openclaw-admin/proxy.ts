import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith(`${BASE}/login`)

  if (!isLoggedIn && !isAuthPage) {
    const redirectUrl = new URL(`${BASE}/login`, req.nextUrl.origin)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(`${BASE}/dashboard`, req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
}
