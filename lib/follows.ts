import { createClient } from "@/lib/supabase/server";

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

// フォロー数・フォロワー数(未ログインでも取得できる)
export async function fetchFollowCounts(
  userId: string,
): Promise<FollowCounts> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("follow_counts", {
    target: userId,
  });

  if (error) throw error;

  const row = (
    data as { followers_count: number; following_count: number }[] | null
  )?.[0];

  return {
    followersCount: row?.followers_count ?? 0,
    followingCount: row?.following_count ?? 0,
  };
}

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
