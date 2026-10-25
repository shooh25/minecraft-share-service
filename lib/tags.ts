import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/types";

// DBに登録されているタグの一覧を取得する(登録順のまま返す)
export async function fetchTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, name");

  return (data ?? []) as Tag[];
}

// 投稿に紐付いているタグ名を取得する(紐付けがなければ空配列)
export async function fetchBuildTagNames(postId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_tags")
    .select("tags ( name )")
    .eq("post_id", postId);

  if (error) {
    console.error("投稿のタグ取得に失敗しました", error);
    return [];
  }

  return ((data ?? []) as unknown as { tags: { name: string } | null }[]).flatMap(
    (row) => (row.tags ? [row.tags.name] : []),
  );
}
