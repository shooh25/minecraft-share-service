import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google認可後のコールバック。
// 認可コードをセッションへ交換し、Cookie に保存してから遷移先へリダイレクトする。
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // 外部URLへのオープンリダイレクトを防ぐ(アプリ内パスのみ許可)
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/?loginError=1`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?loginError=1`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
