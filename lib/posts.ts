import { createClient } from "@/lib/supabase/server";
import { fetchBuildTagNames } from "@/lib/tags";
import type { Build } from "@/types";

// posts と profilesを結合して取得したときの1行分
interface PostRow {
  id: string;
  description: string;
  images: string[];
  likes_count: number;
  comments_count: number;
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
      nickname,
      avatarUrl: "",
    },
    tags: [],
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, description, images, likes_count, comments_count, created_at, author_id, profiles ( nickname )";

// 投稿を新しい順に取得する
export async function fetchBuilds(): Promise<Build[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as PostRow[]).map(toBuild);
}

// 投稿を1件取得する(見つからなければ null)
export async function fetchBuild(id: string): Promise<Build | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const build = toBuild(data as unknown as PostRow);
  build.tags = await fetchBuildTagNames(id);

  return build;
}
