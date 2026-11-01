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

  // 失敗時も元のページへ戻し、そこでログインダイアログを開かせる
  const redirectWithError = () => {
    const url = new URL(next, origin);
    url.searchParams.set("loginError", "1");
    return NextResponse.redirect(url);
  };

  if (!code) {
    return redirectWithError();
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithError();
  }

  return NextResponse.redirect(new URL(next, origin));
}
