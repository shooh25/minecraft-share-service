import { createClient } from "@/lib/supabase/server";
import type { Build } from "@/types";

// posts と profilesを結合して取得したときの1行分
interface PostRow {
  id: string;
  description: string;
  images: string[];
  likes_count: number;
  created_at: string;
  author_id: string;
  profiles: { nickname: string } | null;
}

// DBの投稿を画面用の作品に変換する
function toBuild(row: PostRow): Build {
  const nickname = row.profiles?.nickname ?? "";

  return {
    id: row.id,
    description: row.description,
    images: row.images,
    author: {
      id: row.author_id,
      username: nickname,
      displayName: nickname,
      avatarUrl: "",
    },
    tags: [],
    likesCount: row.likes_count,
    commentsCount: 0,
    createdAt: row.created_at,
  };
}

// 投稿を新しい順に取得する
export async function fetchBuilds(): Promise<Build[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, description, images, likes_count, created_at, author_id, profiles ( nickname )",
    )
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as PostRow[]).map(toBuild);
}
