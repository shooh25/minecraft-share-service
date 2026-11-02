import { createClient } from "@/lib/supabase/server";

// 指定したユーザーが、その相手をフォローしているか
export async function isFollowing(
  followeeId: string,
  followerId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}
