"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Hash, Search } from "lucide-react";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import Tag from "@/components/tags/Tag";
import { parseFilters } from "@/lib/build-filters";
import type { Build, BuildPage, Tag as TagItem } from "@/types";

interface BuildsContentProps {
  // タグの一覧
  tags: TagItem[];
  // 初回に取得した1ページ分の作品一覧
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// 人気順 / 新着順の選択肢
const SORT_OPTIONS = [
  { value: "popular", label: "人気順" },
  { value: "recent", label: "新着順" },
] as const;

export default function BuildsContent({
  tags,
  initialBuilds,
  initialNextCursor,
}: BuildsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 絞り込み条件と並び順はURLから読み取る
  const { sortBy, tag, query } = parseFilters(searchParams);
  // 検索条件の表示に使う
  const keyword = query.trim();
  const activeTag = tag?.trim() ?? "";

  // カーソルから次のページを取得する(絞り込み条件はURLから引き継ぐ)
  const fetchPage = useCallback(
    async (cursor: string): Promise<BuildPage> => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("cursor", cursor);
      const response = await fetch(`/api/builds?${params}`);
      if (!response.ok) throw new Error();
      return (await response.json()) as BuildPage;
    },
    [searchParams],
  );

  const { builds, loading, error, loadMore, sentinelRef, hasMore } =
    useInfiniteBuilds({ initialBuilds, initialNextCursor, fetchPage });

  // 書き換えたパラメータをURLに反映する
  const syncUrl = (params: URLSearchParams) => {
    const qs = params.toString();
    router.replace(qs ? `/builds?${qs}` : "/builds", { scroll: false });
  };

  const handleSortChange = (newSort: "recent" | "popular") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    syncUrl(params);
  };

  const handleTagClick = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q"); // 検索ワードがあればURLから消す
    params.set("tag", name);
    syncUrl(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 sm:py-6 space-y-6">
      {/* 何の検索結果を見ているのかをタグ一覧の上に示す */}
      {(keyword || activeTag) && (
        <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 break-words text-lg font-bold tracking-tight sm:text-2xl">
          {keyword && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Search
                aria-hidden
                className="h-4 w-4 shrink-0 text-zinc-900 sm:h-5 sm:w-5"
              />
              <span className="break-words text-zinc-900">{keyword}</span>
            </span>
          )}
          {keyword && activeTag && (
            <span className="font-normal">/</span>
          )}
          {activeTag && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Hash
                aria-hidden
                className="h-4 w-4 shrink-0 text-zinc-900 sm:h-5 sm:w-5"
              />
              <span className="break-words text-zinc-900">{activeTag}</span>
            </span>
          )}
        </h1>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
        {/* タグフィルター(DBから取得した一覧) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tags.map((tagItem) => (
            <button key={tagItem.id} onClick={() => handleTagClick(tagItem.name)}>
              <Tag>#{tagItem.name}</Tag>
            </button>
          ))}
        </div>

        {/* 並び替えスイッチ */}
        <div className="flex items-center p-0.5 self-end sm:self-auto shrink-0">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSortChange(value)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition cursor-pointer ${
                sortBy === value
                  ? "text-zinc-950"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 作品グリッド(該当ゼロのときはBuildGridが案内文を出す) */}
      <InfiniteBuilds
        builds={builds}
        hasMore={hasMore}
        loading={loading}
        error={error}
        onRetry={() => void loadMore()}
        sentinelRef={sentinelRef}
        emptyMessage="該当する建築作品が見つかりませんでした。"
      />
    </div>
  );
}
