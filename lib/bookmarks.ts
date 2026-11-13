import { createClient } from "@/lib/supabase/server";

// ユーザーが作成したコレクション
export interface Collection {
  id: string;
  name: string;
  // 最初に保存した作品の画像。作品がなければ null
  coverUrl: string | null;
  // コレクションに入っている作品数
  clipCount: number;
}

// ユーザーのコレクション一覧
export async function fetchCollections(userId: string): Promise<Collection[]> {
  const supabase = await createClient();
  const { data: collections, error } = await supabase
    .from("collections")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;
  if (!collections?.length) return [];

  // 各コレクションで最初に保存した作品をサムネイルに使う
  const { data: memberships, error: membershipError } = await supabase
    .from("collection_clips")
    .select("collection_id, post_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .order("post_id", { ascending: true });

  if (membershipError) throw membershipError;

  const coverPostIds = new Map<string, string>();
  const clipCounts = new Map<string, number>();
  for (const membership of memberships ?? []) {
    clipCounts.set(
      membership.collection_id,
      (clipCounts.get(membership.collection_id) ?? 0) + 1,
    );
    if (!coverPostIds.has(membership.collection_id)) {
      coverPostIds.set(membership.collection_id, membership.post_id);
    }
  }

  const postIds = [...new Set(coverPostIds.values())];
  if (postIds.length === 0) {
    return collections.map((collection) => ({
      ...collection,
      coverUrl: null,
      clipCount: 0,
    }));
  }

  const { data: posts, error: postError } = await supabase
    .from("posts")
    .select("id, images")
    .in("id", postIds);

  if (postError) throw postError;

  const coverUrls = new Map(
    (posts ?? []).map((post) => [post.id, post.images[0] ?? null]),
  );

  return collections.map((collection) => ({
    ...collection,
    coverUrl: coverUrls.get(coverPostIds.get(collection.id) ?? "") ?? null,
    clipCount: clipCounts.get(collection.id) ?? 0,
  }));
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
