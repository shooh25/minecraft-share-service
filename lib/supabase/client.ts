import { createBrowserClient } from "@supabase/ssr";

// ブラウザ用の Supabase クライアント。
// 公開キー(anon)のみを使い、サーバー専用のキーには触れない。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
