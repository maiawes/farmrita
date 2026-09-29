import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const tokenHash = url.searchParams.get("token_hash");
  const requestedNext =
    url.searchParams.get("next") || "/reset-password";

  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/reset-password";

  if (!tokenHash) {
    return NextResponse.redirect(
      new URL("/login?error=link_invalid", url.origin),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=link_invalid", url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}