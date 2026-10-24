import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/types";

// DBに登録されているタグの一覧を取得する(登録順のまま返す)
export async function fetchTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, name");

  return (data ?? []) as Tag[];
}
