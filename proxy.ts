import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseConfig } from "./lib/supabase/config";
import { isDevelopmentAuthBypassEnabled } from "./lib/development";

const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (isDevelopmentAuthBypassEnabled()) {
    return response;
  }

  const config = getSupabaseConfig();

  if (publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return response;
  }

  if (!config) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
