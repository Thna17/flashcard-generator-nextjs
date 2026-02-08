import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const protectedPaths = ["/"]

const isProtectedRoute = (pathname: string) =>
  protectedPaths.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  });

export async function middleware(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value, options}) => {
          res.cookies.set(name, value, options)
        })
      }
    }
  })

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session && isProtectedRoute(req.nextUrl.pathname)) {
    const redirectUrl = req.nextUrl.clone()

    redirectUrl.pathname = "/login"
    return NextResponse.redirect(redirectUrl)
  }

  return res;

}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
