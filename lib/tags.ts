import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/types";

// DBに登録されているタグを最大15件取得する(登録順のまま返す)
export async function fetchTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, name").limit(15);

  return (data ?? []) as Tag[];
}

// 入力した記号がLIKEのワイルドカードや検索条件の区切りとして解釈されないよう除去を行う
export function escapeTagQuery(query: string): string {
  return query
    .replace(/[\\%_]/g, (char) => `\\${char}`)
    .replace(/[,()"*]/g, "");
}

// 検索語を含むタグを名前順で最大6件取得する
export async function searchTags(query: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .ilike("name", `%${escapeTagQuery(query)}%`)
    .order("name")
    .limit(6);

  if (error) throw error;

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
