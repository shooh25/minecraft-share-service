import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/types";

// ログイン中のユーザーを取得する(未ログインなら null)。
export async function fetchCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { id: user.id } : null;
}
