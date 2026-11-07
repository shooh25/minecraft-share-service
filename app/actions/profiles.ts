"use server";

import { revalidatePath } from "next/cache";
import {
  validateProfileInput,
  type ProfileInput,
  type ProfileUpdateResult,
} from "@/lib/profiles";
import { createClient } from "@/lib/supabase/server";

// プロフィールの保存。成功したら正規化後の値を返す。
export async function updateProfile(
  input: ProfileInput,
): Promise<ProfileUpdateResult> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, errors: {}, message: "ログインが必要です" };
  }

  const result = validateProfileInput(input);
  if (!result.ok) return result;

  const { nickname, bio, xUsername, websiteUrl, youtubeUrl } = result.values;

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname,
      bio: bio || null,
      x_username: xUsername || null,
      website_url: websiteUrl || null,
      youtube_url: youtubeUrl || null,
    })
    .eq("id", user.id);
  if (error) throw error;

  revalidatePath(`/users/${user.id}`);
  revalidatePath("/settings/profile");

  return { ok: true, values: result.values };
}
