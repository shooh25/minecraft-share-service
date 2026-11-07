import { createClient } from "@/lib/supabase/server";

// ユーザーページに表示するプロフィール
export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl: string;
  bio: string | null;
}

const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

// URLのユーザーIDとして使える形式か
export function isUserId(value: string): boolean {
  return UUID.test(value);
}

// ユーザーのプロフィールを取得する
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, bio")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    nickname: data.nickname,
    avatarUrl: "",
    bio: data.bio,
  };
}
