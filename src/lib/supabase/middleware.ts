import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  // 1. Safety Guard: If Supabase env variables are missing or undefined
  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "config_missing");
      return NextResponse.redirect(loginUrl);
    }
    // Allow public pages (like "/") to continue without crashing middleware
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Only invoke Supabase auth check for /admin paths to avoid network calls on public pages
    if (pathname.startsWith("/admin")) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Protect /admin routes (except /admin/login)
      if (pathname !== "/admin/login") {
        if (!user || (adminEmail && user.email?.toLowerCase() !== adminEmail)) {
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = "/admin/login";
          loginUrl.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(loginUrl);
        }
      }

      // If logged in as authorized admin and accessing /admin/login, redirect to /admin
      if (pathname === "/admin/login" && user && (!adminEmail || user.email?.toLowerCase() === adminEmail)) {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        return NextResponse.redirect(adminUrl);
      }
    }

    return response;
  } catch (error) {
    console.error("[Middleware Error]:", error);
    // On any unexpected error, never crash public routes
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "auth_error");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }
}
