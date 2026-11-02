"use server";

import { createClient } from "@/lib/supabase/server";

// フォロー・フォロー解除。成功したら true、未ログインや自分自身なら false を返す。
export async function setFollowing(
  followeeId: string,
  following: boolean,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 自分自身はフォローできない
  if (user.id === followeeId) return false;

  if (following) {
    // 二重フォローは主キーで弾く(すでに登録済みなら何もしない)
    const { error } = await supabase
      .from("follows")
      .upsert(
        { follower_id: user.id, followee_id: followeeId },
        { onConflict: "follower_id,followee_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);
    if (error) throw error;
  }

  return true;
}
