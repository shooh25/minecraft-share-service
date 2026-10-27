import { describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  buildPage,
  cursorCondition,
  fetchBuildsPage,
  isValidCursor,
  toBuild,
  type PostRow,
} from "@/lib/posts";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const CREATED_AT = "2026-10-13T12:00:00+00:00";
const ID = "3f2a1b4c-5d6e-7f80-9a1b-2c3d4e5f6a7b";
const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";
const ID_C = "33333333-3333-4333-8333-333333333333";

type FakeResult = {
  data: PostRow[] | null;
  error: { message: string } | null;
};

interface FakeBuilder {
  from: () => FakeBuilder;
  select: () => FakeBuilder;
  eq: () => FakeBuilder;
  ilike: () => FakeBuilder;
  or: () => FakeBuilder;
  order: () => FakeBuilder;
  limit: () => Promise<FakeResult>;
}

// クエリの結果だけを返すSupabaseクライアントの代わり
function fakeClient(result: FakeResult): FakeBuilder {
  const builder: FakeBuilder = {
    from: () => builder,
    select: () => builder,
    eq: () => builder,
    ilike: () => builder,
    or: () => builder,
    order: () => builder,
    limit: () => Promise.resolve(result),
  };

  return builder;
}

// テスト用のDB行を作る
function makeRow(overrides: Partial<PostRow> = {}): PostRow {
  return {
    id: ID,
    description: "石の家",
    images: ["a.png"],
    likes_count: 5,
    comments_count: 2,
    created_at: CREATED_AT,
    author_id: "u1",
    profiles: { nickname: "Steve" },
    post_tags: [{ tags: { name: "家" } }],
    ...overrides,
  };
}

describe("toBuild: DBの行を作品に変換", () => {
  it("各項目を作品の形に詰め替える", () => {
    expect(toBuild(makeRow())).toEqual({
      id: ID,
      description: "石の家",
      images: ["a.png"],
      author: {
        id: "u1",
        nickname: "Steve",
        avatarUrl: "",
      },
      tags: ["家"],
      likesCount: 5,
      commentsCount: 2,
      createdAt: CREATED_AT,
    });
  });

  it("ニックネームが空なら空文字にする", () => {
    expect(toBuild(makeRow({ profiles: { nickname: "" } })).author.nickname).toBe("");
  });

  it("作者が無いときはニックネームを空文字にする", () => {
    expect(toBuild(makeRow({ profiles: null })).author.nickname).toBe("");
  });

  it("タグの紐付けが無いときは空配列にする", () => {
    expect(toBuild(makeRow({ post_tags: null })).tags).toEqual([]);
  });

  it("タグが null の紐付けは無視する", () => {
    const row = makeRow({
      post_tags: [{ tags: null }, { tags: { name: "家" } }],
    });

    expect(toBuild(row).tags).toEqual(["家"]);
  });
});

describe("cursorCondition: カーソルの検証と条件生成", () => {
  it("カーソルが無いときは条件を返さない", () => {
    expect(cursorCondition(null, "popular")).toBeNull();
  });

  it("いいね数が数字でないときは条件を返さない", () => {
    expect(cursorCondition(`x_${CREATED_AT}_${ID}`, "popular")).toBeNull();
  });

  it("日時が形式外のときは条件を返さない", () => {
    expect(cursorCondition(`5_2026-10-13_${ID}`, "popular")).toBeNull();
  });

  it("日時が実在しないときは条件を返さない", () => {
    expect(cursorCondition(`5_2026-99-99T99:99:99Z_${ID}`, "popular")).toBeNull();
  });

  it("いいね数がintegerの範囲外なら条件を返さない", () => {
    expect(cursorCondition(`2147483648_${CREATED_AT}_${ID}`, "popular")).toBeNull();
  });

  it("いいね数が安全な整数でないときは条件を返さない", () => {
    expect(cursorCondition(`99999999999999999999_${CREATED_AT}_${ID}`, "popular")).toBeNull();
  });

  it("いいね数がintegerの最大値なら条件を返す", () => {
    expect(cursorCondition(`2147483647_${CREATED_AT}_${ID}`, "popular")).not.toBeNull();
  });

  it("IDがUUIDでないときは条件を返さない", () => {
    expect(cursorCondition(`5_${CREATED_AT}_abc`, "popular")).toBeNull();
  });

  it("人気順はいいね数・日時・IDの順で比較する", () => {
    expect(cursorCondition(`5_${CREATED_AT}_${ID}`, "popular")).toBe(
      `likes_count.lt.5,and(likes_count.eq.5,created_at.lt.${CREATED_AT}),and(likes_count.eq.5,created_at.eq.${CREATED_AT},id.lt.${ID})`,
    );
  });

  it("新着順は日時とIDだけで比較する", () => {
    expect(cursorCondition(`5_${CREATED_AT}_${ID}`, "recent")).toBe(
      `created_at.lt.${CREATED_AT},and(created_at.eq.${CREATED_AT},id.lt.${ID})`,
    );
  });
});

describe("isValidCursor: カーソルの形式判定", () => {
  it("正しい形式なら true", () => {
    expect(isValidCursor(`5_${CREATED_AT}_${ID}`, "popular")).toBe(true);
  });

  it("カーソルが無ければ false", () => {
    expect(isValidCursor(null, "popular")).toBe(false);
  });

  it("壊れた形式なら false", () => {
    expect(isValidCursor("broken", "recent")).toBe(false);
  });
});

describe("buildPage: 行を1ページ分にまとめる", () => {
  it("行が無いときは空のページを返す", () => {
    expect(buildPage([], 12)).toEqual({ builds: [], nextCursor: null });
  });

  it("件数が上限未満なら続きなしにする", () => {
    const page = buildPage([makeRow({ id: ID_A }), makeRow({ id: ID_B })], 12);

    expect(page.builds.map((build) => build.id)).toEqual([ID_A, ID_B]);
    expect(page.nextCursor).toBeNull();
  });

  it("件数が上限と同じなら続きなしにする", () => {
    const page = buildPage([makeRow({ id: ID_A }), makeRow({ id: ID_B })], 2);

    expect(page.builds).toHaveLength(2);
    expect(page.nextCursor).toBeNull();
  });

  it("上限より1件多いときは余分を除き、最後の作品をカーソルにする", () => {
    const rows = [
      makeRow({ id: ID_A, likes_count: 9 }),
      makeRow({ id: ID_B, likes_count: 7 }),
      makeRow({ id: ID_C, likes_count: 3 }),
    ];

    const page = buildPage(rows, 2);

    expect(page.builds.map((build) => build.id)).toEqual([ID_A, ID_B]);
    expect(page.nextCursor).toBe(`7_${CREATED_AT}_${ID_B}`);
  });
});

describe("fetchBuildsPage: DBエラー", () => {
  it("DBのエラーをそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never,
    );

    await expect(fetchBuildsPage()).rejects.toEqual({ message: "boom" });
  });
});
