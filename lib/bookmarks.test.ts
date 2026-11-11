import { describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { fetchCollections, fetchPostCollectionIds } from "@/lib/bookmarks";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const POST_ID = "3f2a1b4c-5d6e-7f80-9a1b-2c3d4e5f6a7b";
const USER_ID = "11111111-1111-4111-8111-111111111111";

type FakeResult = {
  data: unknown;
  error: { message: string } | null;
};

type FakeChain = {
  select: () => FakeChain;
  eq: () => FakeChain;
  order: () => FakeChain;
  then: (
    resolve: (value: FakeResult) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

// クエリの結果だけを返すSupabaseクライアントの代わり
function fakeClient(result: FakeResult) {
  const chain: FakeChain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  return { from: () => chain };
}

describe("fetchCollections: コレクション一覧", () => {
  it("取得したコレクションを返す", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        data: [{ id: "collection-1", name: "保存した作品" }],
        error: null,
      }) as never,
    );

    await expect(fetchCollections(USER_ID)).resolves.toEqual([
      { id: "collection-1", name: "保存した作品" },
    ]);
  });

  it("コレクションがなければ空配列", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: null }) as never,
    );

    await expect(fetchCollections(USER_ID)).resolves.toEqual([]);
  });

  it("DBエラーはそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never,
    );

    await expect(fetchCollections(USER_ID)).rejects.toEqual({
      message: "boom",
    });
  });
});

describe("fetchPostCollectionIds: 投稿が入っているコレクション", () => {
  it("コレクションIDだけを返す", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        data: [
          { collection_id: "collection-1" },
          { collection_id: "collection-2" },
        ],
        error: null,
      }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).resolves.toEqual([
      "collection-1",
      "collection-2",
    ]);
  });

  it("どのコレクションにも入っていなければ空配列", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: [], error: null }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).resolves.toEqual([]);
  });

  it("DBエラーはそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).rejects.toEqual({
      message: "boom",
    });
  });
});
