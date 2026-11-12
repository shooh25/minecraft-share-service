"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 投稿をコレクションへ保存する。成功したら true、未ログインなら false を返す。
export async function savePostToCollection(
  postId: string,
  collectionId: string,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 自分のコレクションにだけ追加できる(RLS・複合外部キーでも検証される)。
  // すでに入っている場合は主キーで弾く。
  const { error } = await supabase.from("collection_clips").upsert(
    {
      collection_id: collectionId,
      user_id: user.id,
      post_id: postId,
    },
    { onConflict: "collection_id,post_id", ignoreDuplicates: true },
  );
  if (error) throw error;

  revalidatePath(`/builds/${postId}`);
  return true;
}

// 投稿をコレクションから外す。成功したら true、未ログインなら false を返す。
export async function removePostFromCollection(
  postId: string,
  collectionId: string,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 自分のコレクションの所属だけを削除する。
  // 最後の所属が消えたらトリガーで clips も削除される。
  const { error } = await supabase
    .from("collection_clips")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", user.id)
    .eq("post_id", postId);
  if (error) throw error;

  revalidatePath(`/builds/${postId}`);
  return true;
}
