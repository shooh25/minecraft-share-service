import { describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { isPostLiked } from "@/lib/likes";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const POST_ID = "3f2a1b4c-5d6e-7f80-9a1b-2c3d4e5f6a7b";
const USER_ID = "11111111-1111-4111-8111-111111111111";

type FakeResult = {
  data: { post_id: string } | null;
  error: { message: string } | null;
};

// クエリの結果だけを返すSupabaseクライアントの代わり
function fakeClient(result: FakeResult) {
  const builder = {
    from: () => builder,
    select: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve(result),
  };

  return builder;
}

describe("isPostLiked: いいね済みかどうか", () => {
  it("行があれば true", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: { post_id: POST_ID }, error: null }) as never,
    );

    await expect(isPostLiked(POST_ID, USER_ID)).resolves.toBe(true);
  });

  it("行がなければ false", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: null }) as never,
    );

    await expect(isPostLiked(POST_ID, USER_ID)).resolves.toBe(false);
  });

  it("DBエラーはそのまま投げる", async () => {
    vi.mocked(createClient).mockResolvedValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never,
    );

    await expect(isPostLiked(POST_ID, USER_ID)).rejects.toEqual({
      message: "boom",
    });
  });
});
