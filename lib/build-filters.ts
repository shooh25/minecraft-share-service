import type { Build } from "@/types";

// 作品一覧ページ(builds)で使う、URL条件の読み取り・絞り込み・並び替え。
// 状態や表示はページ側に置き、ここには計算だけを置く。

export type SortBy = "popular" | "recent";

export interface BuildFilters {
  sortBy: SortBy;
  tag: string | null;
  query: string;
}

type FilterSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function read(source: FilterSource, key: string): string | null {
  if (source instanceof URLSearchParams) return source.get(key);
  const value = source[key];
  return typeof value === "string" ? value : null;
}

// URLの「?以降」から現在の条件を読み取る
export function parseFilters(source: FilterSource): BuildFilters {
  return {
    sortBy: read(source, "sort") === "recent" ? "recent" : "popular",
    tag: read(source, "tag"),
    query: read(source, "q") ?? "",
  };
}

// タグ・検索語に合う作品だけにする(検索は説明・タグ・作者名のどこか、大小文字は区別しない)
export function filterBuilds(
  builds: Build[],
  { tag, query }: { tag: string | null; query: string },
): Build[] {
  const searchWord = query.toLowerCase();
  return builds.filter((b) => {
    // タグ指定があるときは、そのタグを持たない作品を外す
    if (tag && !b.tags.includes(tag)) return false;
    // 検索語がないときは、タグが合っていれば残す
    if (!searchWord) return true;
    // 検索語があるときは、説明・タグ・作者名のどこかに入っていれば残す
    const texts = [b.description, ...b.tags, b.author.nickname];
    return texts.some((t) => t.toLowerCase().includes(searchWord));
  });
}

// 並び替える
export function sortBuilds(builds: Build[], sortBy: SortBy): Build[] {
  return [...builds].sort((a, b) =>
    sortBy === "recent"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : b.likesCount - a.likesCount,
  );
}
