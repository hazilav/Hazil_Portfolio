import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./client";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabasePublicConfig();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  // If Supabase config is missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "config_missing");
      return NextResponse.redirect(loginUrl);
    }
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

    if (pathname.startsWith("/admin")) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (pathname !== "/admin/login") {
        if (!user || (adminEmail && user.email?.toLowerCase() !== adminEmail)) {
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = "/admin/login";
          loginUrl.searchParams.set("error", "unauthorized");
          return NextResponse.redirect(loginUrl);
        }
      }

      if (pathname === "/admin/login" && user && (!adminEmail || user.email?.toLowerCase() === adminEmail)) {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        return NextResponse.redirect(adminUrl);
      }
    }

    return response;
  } catch (error) {
    console.error("[Middleware Session Error]:", error);
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "auth_error");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }
}
