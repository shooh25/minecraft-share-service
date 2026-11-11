import { createClient } from "@/lib/supabase/server";

// ユーザーが作成したコレクション
export interface Collection {
  id: string;
  name: string;
}

// ユーザーのコレクション一覧
export async function fetchCollections(userId: string): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

// 指定した投稿が保存されているコレクションのID
export async function fetchPostCollectionIds(
  postId: string,
  userId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_clips")
    .select("collection_id")
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((row) => row.collection_id);
}
