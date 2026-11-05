import { createClient } from "@/lib/supabase/server";
import type { BuildComment } from "@/types";

// post_comments と作者プロフィールを結合して取得したときの1行分
export interface CommentRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  root_id: string | null;
  profiles: { nickname: string } | null;
}

const SELECT_COLUMNS =
  "id, user_id, content, created_at, parent_id, root_id, profiles ( nickname )";

// 日時→IDの順で比較する(同時刻でも並びが安定するように)
function compareAsc(a: CommentRow, b: CommentRow): number {
  return a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
}

// 1行を画面用のコメントに変換する
function toComment(row: CommentRow, parentNickname: string | null): BuildComment {
  return {
    id: row.id,
    body: row.content,
    createdAt: row.created_at,
    author: {
      id: row.user_id,
      nickname: row.profiles?.nickname ?? "",
      avatarUrl: "",
    },
    parentNickname,
    replies: [],
  };
}

// 返信をスレッドの親コメントにまとめる
// - トップレベルは新しい順
// - 返信はスレッド内で古い順(会話順)
// - 返信への返信も同じスレッドに並べ、返信先のニックネームを保持する
export function buildCommentThreads(rows: CommentRow[]): BuildComment[] {
  const rowsById = new Map(rows.map((row) => [row.id, row]));

  const threads = rows
    .filter((row) => row.root_id === null)
    .sort((a, b) => compareAsc(b, a))
    .map((row) => toComment(row, null));
  const threadById = new Map(threads.map((thread) => [thread.id, thread]));

  const replies = rows.filter((row) => row.root_id !== null).sort(compareAsc);
  for (const row of replies) {
    if (!row.root_id) continue;

    // 親コメントが取得できていない壊れた行は表示しない
    const thread = threadById.get(row.root_id);
    if (!thread) continue;

    const parent = row.parent_id ? rowsById.get(row.parent_id) : undefined;
    // トップレベルへの返信はスレッドの直下に並ぶため「@名前」を付けない
    const parentNickname =
      row.parent_id === row.root_id
        ? null
        : (parent?.profiles?.nickname ?? null);
    thread.replies.push(toComment(row, parentNickname));
  }

  return threads;
}

// 作品に付いたコメントをスレッド単位で取得する
export async function fetchComments(postId: string): Promise<BuildComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_comments")
    .select(SELECT_COLUMNS)
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;

  return buildCommentThreads((data ?? []) as unknown as CommentRow[]);
}
