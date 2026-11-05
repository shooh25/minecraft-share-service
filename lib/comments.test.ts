import { describe, expect, it } from "vitest";
import { buildCommentThreads, type CommentRow } from "@/lib/comments";

const M = "11111111-1111-4111-8111-111111111111";
const S = "22222222-2222-4222-8222-222222222222";

// 1行分のコメントを作る
function row(
  id: string,
  user: string,
  createdAt: string,
  parentId: string | null = null,
  rootId: string | null = null,
): CommentRow {
  return {
    id,
    user_id: user,
    content: id,
    created_at: createdAt,
    parent_id: parentId,
    root_id: rootId,
    profiles: { nickname: user === M ? "みなと設計士" : "そらいろ建築士" },
  };
}

describe("buildCommentThreads: コメントをスレッドにまとめる", () => {
  it("トップレベルは新しい順、返信は古い順に並ぶ", () => {
    const threads = buildCommentThreads([
      row("old", M, "2026-11-01T00:00:00Z"),
      row("new", S, "2026-11-03T00:00:00Z"),
      row("reply-late", M, "2026-11-04T00:00:00Z", "new", "new"),
      row("reply-early", S, "2026-11-03T01:00:00Z", "new", "new"),
    ]);

    expect(threads.map((thread) => thread.id)).toEqual(["new", "old"]);
    expect(threads[0].replies.map((reply) => reply.id)).toEqual([
      "reply-early",
      "reply-late",
    ]);
    expect(threads[0].replies[0].author.nickname).toBe("そらいろ建築士");
  });

  it("返信への返信は同じスレッドに並び、返信先の名前を持つ", () => {
    const threads = buildCommentThreads([
      row("root", M, "2026-11-01T00:00:00Z"),
      row("reply", S, "2026-11-01T01:00:00Z", "root", "root"),
      row("nested", M, "2026-11-01T02:00:00Z", "reply", "root"),
    ]);

    expect(threads).toHaveLength(1);
    expect(threads[0].replies.map((reply) => reply.id)).toEqual([
      "reply",
      "nested",
    ]);
    // トップレベルへの返信には「@名前」を付けない
    expect(threads[0].replies[0].parentNickname).toBeNull();
    expect(threads[0].replies[1].parentNickname).toBe("そらいろ建築士");
  });

  it("親が見つからない返信は表示しない", () => {
    const threads = buildCommentThreads([
      row("root", M, "2026-11-01T00:00:00Z"),
      row("orphan", S, "2026-11-01T01:00:00Z", "missing", "missing"),
    ]);

    expect(threads).toHaveLength(1);
    expect(threads[0].replies).toHaveLength(0);
  });
});
