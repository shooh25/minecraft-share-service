import { createClient } from "@/lib/supabase/server";

// 指定したユーザーが、その投稿にいいねしているか
export async function isPostLiked(
  postId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}
