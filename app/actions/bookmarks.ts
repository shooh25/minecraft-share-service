"use server";

import { createClient } from "@/lib/supabase/server";

// ブックマークの登録・解除。成功したら true、未ログインなら false を返す。
export async function setBookmarked(
  postId: string,
  bookmarked: boolean,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  if (bookmarked) {
    // 二重ブックマークは主キーで弾く(すでに登録済みなら何もしない)
    const { error } = await supabase
      .from("bookmarks")
      .upsert(
        { post_id: postId, user_id: user.id },
        { onConflict: "post_id,user_id", ignoreDuplicates: true },
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) throw error;
  }

  return true;
}
