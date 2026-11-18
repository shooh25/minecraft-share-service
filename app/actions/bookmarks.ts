"use server";

import { revalidatePath } from "next/cache";
import {
  fetchCollections,
  fetchPostCollectionIds,
  isCollectionId,
  type Collection,
} from "@/lib/bookmarks";
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

// コレクションを削除する。成功したら true、未ログイン・対象なしなら false を返す。
export async function deleteCollection(
  collectionId: string,
): Promise<boolean> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;
  if (!isCollectionId(collectionId)) return false;

  // 自分のコレクションだけを削除する
  const { data, error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .select("id");
  if (error) throw error;

  // 削除対象がなければ false
  if (!data || data.length === 0) return false;

  revalidatePath("/users/[id]", "page");
  revalidatePath("/builds/[id]", "page");
  return true;
}

// コレクション名を変更する。成功したら新しい名前、未ログイン・対象なしなら null を返す。
export async function updateCollectionName(
  collectionId: string,
  name: string,
): Promise<string | null> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (!isCollectionId(collectionId)) return null;

  // 前後の空白を除き、DBの制約(1〜50文字)に合わせて検証する
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;

  const { data, error } = await supabase
    .from("collections")
    .update({ name: trimmed })
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .select("name")
    .maybeSingle();
  if (error) throw error;

  // 自分のコレクションが見つからなければ失敗
  if (!data) return null;

  revalidatePath("/users/[id]", "page");
  return data.name;
}

// コレクションを作成する。成功したら作成したコレクション、未ログインなら null を返す。
export async function createCollection(
  name: string,
): Promise<{ id: string; name: string } | null> {
  // Server Action は直接 POST でも呼べるため、サーバー側でも認証を確認する
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 前後の空白を除き、DBの制約(1〜50文字)に合わせて検証する
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return null;

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: user.id, name: trimmed })
    .select("id, name")
    .single();
  if (error) throw error;

  // コレクション一覧を表示する投稿詳細ページを次回表示時に更新する
  revalidatePath("/builds/[id]", "page");

  return data;
}

// コレクション選択ダイアログに表示する、自分のコレクションと保存済みのID。
// 未ログインなら null を返す。
export async function fetchCollectionPickerData(postId: string): Promise<{
  collections: Collection[];
  savedIds: string[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [collections, savedIds] = await Promise.all([
    fetchCollections(user.id),
    fetchPostCollectionIds(postId, user.id),
  ]);

  return { collections, savedIds };
}
