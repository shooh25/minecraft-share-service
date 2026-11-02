"use server";

import { createClient } from "@/lib/supabase/server";

// いいねの登録・解除。成功したら true、未ログインなら false を返す。
export async function setLiked(
  postId: string,
  liked: boolean,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  if (liked) {
    // 二重いいねは主キーで弾く(すでに登録済みなら何もしない)
    const { error } = await supabase
      .from("likes")
      .upsert(
        { post_id: postId, user_id: user.id },
        { onConflict: "post_id,user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) throw error;
  }

  return true;
}
