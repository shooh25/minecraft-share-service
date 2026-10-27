import { createClient } from "@/lib/supabase/server";
import type { SortBy } from "@/lib/build-filters";
import type { Build, BuildPage } from "@/types";

// posts と profiles・タグを結合して取得したときの1行分
export interface PostRow {
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

// 投稿と作者・タグを結合して取得するときのカラム指定
const SELECT_COLUMNS =
  "id, description, images, likes_count, comments_count, created_at, author_id, profiles ( nickname ), post_tags ( tags ( name ) )";

// カーソルが壊れていないか検証
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

// DBから作品一覧を取得する際に指定できる条件
type PageOptions = Partial<{ tag: string | null; query: string; sortBy: SortBy; cursor: string | null; limit: number }>;

// DBの投稿を画面用の作品に変換する
export function toBuild(row: PostRow): Build {
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

// 壊れたカーソルは null にする。形式はいいね数_日時_id
export function cursorCondition(value: string | null, sortBy: SortBy): string | null {
  const [likes, createdAt, id] = (value ?? "").split("_");
  // 巨大な数値をDBに送らないよう、いいね数が安全な整数かつintegerの範囲内か確認する
  const likeCount = Number(likes);
  if (
    !/^\d+$/.test(likes) ||
    !Number.isSafeInteger(likeCount) ||
    likeCount > 2_147_483_647 ||
    !TIMESTAMP.test(createdAt) ||
    Number.isNaN(Date.parse(createdAt)) ||
    !UUID.test(id)
  ) {
    return null;
  }

  return sortBy === "recent"
    ? `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`
    : `likes_count.lt.${likes},and(likes_count.eq.${likes},created_at.lt.${createdAt}),and(likes_count.eq.${likes},created_at.eq.${createdAt},id.lt.${id})`;
}

// 取得した行を1ページ分の作品に変換する
export function buildPage(rows: PostRow[], limit: number): BuildPage {
  const last = rows[limit - 1];
  return {
    builds: rows.slice(0, limit).map(toBuild),
    nextCursor: rows.length > limit && last ? `${last.likes_count}_${last.created_at}_${last.id}` : null,
  };
}

// API が壊れたカーソルを先頭ページとして返さないようにする
export const isValidCursor = (value: string | null, sortBy: SortBy) =>
  cursorCondition(value, sortBy) !== null;

// タグ・検索語・並び順・カーソルを条件にDBを検索し、1ページ分の作品を取得する
export async function fetchBuildsPage({
  tag = null, query = "", sortBy = "popular", cursor = null, limit = 12,
}: PageOptions = {}): Promise<BuildPage> {
  const supabase = await createClient();
  let request = supabase
    .from("posts")
    .select(tag ? `${SELECT_COLUMNS}, tag_filter:post_tags!inner ( tags!inner ( name ) )` : SELECT_COLUMNS);
  if (tag) request = request.eq("tag_filter.tags.name", tag);

  const word = query.trim();
  if (word) request = request.ilike("search_text", `%${word.replace(/[\\%_]/g, "\\$&")}%`);

  const condition = cursorCondition(cursor, sortBy);
  if (condition) request = request.or(condition);

  const orderBy = sortBy === "recent"
    ? ["created_at", "id"]
    : ["likes_count", "created_at", "id"];
  for (const column of orderBy) request = request.order(column, { ascending: false });

  // 次ページがあるか知るために1件多く取る
  const { data, error } = await request.limit(limit + 1);
  if (error) throw error;

  return buildPage((data ?? []) as unknown as PostRow[], limit);
}

// 投稿を1件取得する(見つからなければ null)
export async function fetchBuild(id: string): Promise<Build | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return toBuild(data as unknown as PostRow);
}
