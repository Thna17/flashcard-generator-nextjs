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

const isSupabaseAuthCookie = (name: string) =>
  name.startsWith("sb-") ||
  name.startsWith("__Host-sb-") ||
  name.includes("supabase-auth-token");

function clearSupabaseAuthCookies(req: NextRequest, res: NextResponse) {
  req.cookies
    .getAll()
    .filter((cookie) => isSupabaseAuthCookie(cookie.name))
    .forEach((cookie) => {
      res.cookies.delete(cookie.name);
    });
}

export async function middleware(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  if (!isProtectedRoute(req.nextUrl.pathname)) {
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

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    user = data.user;
  } catch {
    clearSupabaseAuthCookies(req, res);
  }

  if (!user) {
    const redirectUrl = req.nextUrl.clone()

    redirectUrl.pathname = "/login"
    const redirectResponse = NextResponse.redirect(redirectUrl);
    clearSupabaseAuthCookies(req, redirectResponse);
    return redirectResponse;
  }

  return res;

}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
