import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = requestUrl.searchParams.get("next")
  const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : "/"

  let response = NextResponse.redirect(new URL(safeNextPath, request.url))

  if (!code) {
    return response
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.exchangeCodeForSession(code)
  return response
}
