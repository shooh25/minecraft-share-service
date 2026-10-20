import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// すべてのリクエストで Supabase セッションを更新する(期限切れトークンのリフレッシュ)。
// Server Components からは Cookie を書き換えられないため、ここで更新する。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ユーザー取得により、必要に応じてセッションが更新される。
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // 静的アセットを除くすべてのパスで実行する
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
