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
  in: () => FakeChain;
  then: (
    resolve: (value: FakeResult) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

// テーブルごとの結果を返すSupabaseクライアントの代わり
function fakeClient(results: Record<string, FakeResult>) {
  let table = "";

  const chain: FakeChain = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    in: () => chain,
    then: (resolve, reject) =>
      Promise.resolve(
        results[table] ?? { data: null, error: null },
      ).then(resolve, reject),
  };

  return {
    from: (name: string) => {
      table = name;
      return chain;
    },
  };
}

describe("fetchCollections: コレクション一覧", () => {
  it("取得したコレクションを返す", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collections: {
          data: [{ id: "collection-1", name: "保存した作品" }],
          error: null,
        },
        collection_clips: {
          data: [
            { collection_id: "collection-1", post_id: "post-1" },
            { collection_id: "collection-1", post_id: "post-2" },
          ],
          error: null,
        },
        posts: {
          data: [
            {
              id: "post-1",
              images: ["https://example.com/cover.jpg"],
            },
            {
              id: "post-2",
              images: ["https://example.com/second.jpg"],
            },
          ],
          error: null,
        },
      }) as never,
    );

    await expect(fetchCollections(USER_ID)).resolves.toEqual([
      {
        id: "collection-1",
        name: "保存した作品",
        coverUrl: "https://example.com/cover.jpg",
        clipCount: 2,
      },
    ]);
  });

  it("作品が入っていなければサムネイルは null", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collections: {
          data: [{ id: "collection-1", name: "保存した作品" }],
          error: null,
        },
        collection_clips: { data: [], error: null },
      }) as never,
    );

    await expect(fetchCollections(USER_ID)).resolves.toEqual([
      {
        id: "collection-1",
        name: "保存した作品",
        coverUrl: null,
        clipCount: 0,
      },
    ]);
  });

  it("コレクションがなければ空配列", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collections: { data: null, error: null },
      }) as never,
    );

    await expect(fetchCollections(USER_ID)).resolves.toEqual([]);
  });

  it("DBエラーはそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collections: { data: null, error: { message: "boom" } },
      }) as never,
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
        collection_clips: {
          data: [
            { collection_id: "collection-1" },
            { collection_id: "collection-2" },
          ],
          error: null,
        },
      }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).resolves.toEqual([
      "collection-1",
      "collection-2",
    ]);
  });

  it("どのコレクションにも入っていなければ空配列", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collection_clips: { data: [], error: null },
      }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).resolves.toEqual([]);
  });

  it("DBエラーはそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({
        collection_clips: { data: null, error: { message: "boom" } },
      }) as never,
    );

    await expect(fetchPostCollectionIds(POST_ID, USER_ID)).rejects.toEqual({
      message: "boom",
    });
  });
});
