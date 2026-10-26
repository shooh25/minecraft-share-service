import { createClient } from "@/lib/supabase/server";
import type { Build } from "@/types";

// posts と profiles・タグを結合して取得したときの1行分
interface PostRow {
  id: string;
  description: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_id: string;
  profiles: { nickname: string } | null;
  post_tags: { tags: { name: string } | null }[] | null;
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
    tags: (row.post_tags ?? []).flatMap((postTag) =>
      postTag.tags ? [postTag.tags.name] : [],
    ),
    likesCount: row.likes_count,
    commentsCount: row.comments_count,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, description, images, likes_count, comments_count, created_at, author_id, profiles ( nickname ), post_tags ( tags ( name ) )";

// 投稿を新しい順に取得する
export async function fetchBuilds(tag: string | null = null): Promise<Build[]> {
  const supabase = await createClient();

  // タグで絞り込むときだけ、条件用の内部結合を足す
  const select = tag
    ? `${SELECT_COLUMNS}, tag_filter:post_tags!inner ( tags!inner ( name ) )`
    : SELECT_COLUMNS;

  let request = supabase.from("posts").select(select);
  if (tag) request = request.eq("tag_filter.tags.name", tag);

  const { data } = await request.order("created_at", { ascending: false });

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

  return toBuild(data as unknown as PostRow);
}
