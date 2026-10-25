import { describe, expect, it } from "vitest";
import type { Build } from "@/types";
import { filterBuilds, parseFilters, sortBuilds } from "@/lib/build-filters";

// テスト用の作品を作る(名前・説明・タグなどは、必要な場面だけ上書きする)
function makeBuild(id: string, overrides: Partial<Build> = {}): Build {
  return {
    id,
    description: "",
    images: [],
    author: {
      id: "u1",
      nickname: "Steve Redstone",
      avatarUrl: "",
    },
    tags: [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: "2024-06-01T00:00:00Z",
    ...overrides,
  };
}

describe("parseFilters: クエリパラメータを取得", () => {
  it("パラメータが無いときは「人気順・タグなし・検索なし」", () => {
    expect(parseFilters(new URLSearchParams(""))).toEqual({
      sortBy: "popular",
      tag: null,
      query: "",
    });
  });

  it("sort=recent のときは新着順", () => {
    expect(parseFilters(new URLSearchParams("sort=recent")).sortBy).toBe("recent");
  });

  it("sort に変な値が入っていても人気順にする", () => {
    expect(parseFilters(new URLSearchParams("sort=abc")).sortBy).toBe("popular");
  });

  it("sort・tag・q をまとめて読める", () => {
    expect(parseFilters(new URLSearchParams("sort=recent&tag=城&q=湖"))).toEqual({
      sortBy: "recent",
      tag: "城",
      query: "湖",
    });
  });

  it("q が空文字のときは検索なし扱い", () => {
    expect(parseFilters(new URLSearchParams("q=")).query).toBe("");
  });

  it("タグが複数指定されたときは、最初の1つだけを使う", () => {
    expect(parseFilters(new URLSearchParams("tag=城&tag=夜景")).tag).toBe("城");
  });
});

describe("filterBuilds: 絞り込み", () => {
  const builds: Build[] = [
    makeBuild("castle", {
      description: "サバイバルで3ヶ月かけて建築した湖上の城です。",
      tags: ["城", "夜景"],
      likesCount: 50,
    }),
    makeBuild("temple", {
      description: "和風の五重塔です。静かな空気が見どころ。",
      tags: ["和風"],
      likesCount: 30,
    }),
    makeBuild("ice", {
      description: "万年雪の峰に立つ氷の城塞です。",
      tags: ["城", "氷"],
      likesCount: 10,
      author: { id: "u2", nickname: "Alex Craft", avatarUrl: "" },
    }),
  ];

  it("タグを指定すると、そのタグを持つ作品だけになる", () => {
    expect(filterBuilds(builds, { tag: "城", query: "" }).map((b) => b.id)).toEqual([
      "castle",
      "ice",
    ]);
  });

  it("検索語が説明に含まれる作品に当たる", () => {
    expect(filterBuilds(builds, { tag: null, query: "五重塔" }).map((b) => b.id)).toEqual([
      "temple",
    ]);
  });

  it("検索語がタグに含まれる作品にも当たる", () => {
    expect(filterBuilds(builds, { tag: null, query: "夜景" }).map((b) => b.id)).toEqual(["castle"]);
  });

  it("検索語が作者名に当たるときも探せる(大小文字は区別しない)", () => {
    expect(filterBuilds(builds, { tag: null, query: "ALEX" }).map((b) => b.id)).toEqual(["ice"]);
  });

  it("タグと検索語を両方指定すると、両方に合う作品だけになる", () => {
    expect(filterBuilds(builds, { tag: "城", query: "氷" }).map((b) => b.id)).toEqual(["ice"]);
  });

  it("条件を1つも指定しないと、全作品が元の並び順で出る", () => {
    expect(filterBuilds(builds, { tag: null, query: "" }).map((b) => b.id)).toEqual([
      "castle",
      "temple",
      "ice",
    ]);
  });

  it("何も合わなければ空になる", () => {
    expect(filterBuilds(builds, { tag: null, query: "存在しない語" })).toEqual([]);
  });
});

describe("sortBuilds(並び替え)", () => {
  // a: 人気だが古い / b: 新しいが人気でない / c: どちらも中間
  const a = makeBuild("a", { likesCount: 50, createdAt: "2024-01-01T00:00:00Z" });
  const b = makeBuild("b", { likesCount: 10, createdAt: "2025-01-01T00:00:00Z" });
  const c = makeBuild("c", { likesCount: 30, createdAt: "2024-06-01T00:00:00Z" });

  it("人気順はいいねが多い作品から並ぶ", () => {
    expect(sortBuilds([a, b, c], "popular").map((x) => x.id)).toEqual(["a", "c", "b"]);
  });

  it("新着順は日付が新しい作品から並ぶ", () => {
    expect(sortBuilds([a, b, c], "recent").map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("いいねの数が同じ作品は、元の並び順を保つ", () => {
    const x = makeBuild("x", { likesCount: 20 });
    const y = makeBuild("y", { likesCount: 20 });
    expect(sortBuilds([x, y], "popular").map((s) => s.id)).toEqual(["x", "y"]);
  });

  it("並び替えても、渡した元の配列は変えない", () => {
    const input = [a, b, c];
    sortBuilds(input, "popular");
    expect(input.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});
