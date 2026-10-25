import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/types";

// ログイン中のユーザーを取得する(未ログインなら null)
export async function fetchCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 表示に使うニックネームはprofilesから取得する
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  return { id: user.id, nickname: profile?.nickname ?? "" };
}
