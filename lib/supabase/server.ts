import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// サーバー(Server Components / Server Actions / Route Handlers)用の Supabase クライアント。
// セッションは Cookie から読み取り、更新時は Cookie へ書き戻す。
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からは Cookie を書き込めない。
            // セッションの更新は proxy.ts が担うため、ここでは何もしない。
          }
        },
      },
    },
  );
}
