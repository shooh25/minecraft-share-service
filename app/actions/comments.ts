"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// コメントの投稿。parentId を指定すると、そのコメントへの返信になる。
// 未ログインや入力が不正なときは false を返す。
export async function createComment(
  postId: string,
  body: string,
  parentId: string | null = null,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // DBの CHECK 制約と同じ条件(前後の空白を除いて1〜500文字)
  const content = body.trim();
  const length = [...content].length;
  if (length < 1 || length > 500) return false;

  // 返信先が別作品のコメントなら複合外部キーで失敗する
  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
    parent_id: parentId,
  });
  if (error) throw error;

  revalidatePath(`/builds/${postId}`);
  return true;
}
