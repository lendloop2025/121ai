import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register", "/verify-email", "/forgot-password",
    "/how-it-works", "/help", "/risk-warning", "/privacy-policy", "/terms"];
  const isPublic = publicPaths.some(p => path === p || path.startsWith(p + "/"));
  const isApi = path.startsWith("/api/");

  if (!user && !isPublic && !isApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && path.startsWith("/admin")) {
    // Read the role with the service-role client, not the RLS-bound `supabase`
    // client above. The users_select RLS policy recurses through is_admin()/
    // community_id() (both read public.users), so an RLS-enforced self-read of
    // `role` fails with "stack depth limit exceeded" and returns null — which
    // would bounce even genuine admins to /dashboard. The rest of the app reads
    // profiles via the service role for the same reason.
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: profile } = await service
      .from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
