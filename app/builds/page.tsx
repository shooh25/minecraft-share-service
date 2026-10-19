"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BuildGrid from "@/components/builds/BuildGrid";
import Tag from "@/components/tags/Tag";
import type { Build } from "@/types";
import { filterBuilds, parseFilters, sortBuilds } from "@/lib/build-filters";
import { mockBuilds, mockTags } from "@/lib/mock-data";

// 人気順 / 新着順の選択肢
const SORT_OPTIONS = [
  { value: "popular", label: "人気順" },
  { value: "recent", label: "新着順" },
] as const;

function BuildsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // クエリパラメータを取得する(sort / tag / q)
  const { sortBy, tag: selectedTag, query } = parseFilters(searchParams);
 
  // 条件が変わったら、最初から表示し直す
  const filterKey = `${sortBy}|${selectedTag ?? ""}|${query}`;

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
    params.set("tag", name);
    syncUrl(params);
  };

  // 条件に合う作品だけにして、並び替えて返す
  const filteredBuilds = useMemo(
    () => sortBuilds(filterBuilds(mockBuilds, { tag: selectedTag, query }), sortBy),
    [selectedTag, query, sortBy],
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 sm:py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
        {/* タグフィルター */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {mockTags.map((tag) => (
            <button key={tag.name} onClick={() => handleTagClick(tag.name)}>
              <Tag>#{tag.name}</Tag>
            </button>
          ))}
        </div>

        {/* 並び替えスイッチ */}
        <div className="flex items-center gap-1 p-0.5 self-end sm:self-auto shrink-0">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSortChange(value)}
              className={`rounded-full px-4 py-2 text-sm sm:text-base font-medium transition ${
                sortBy === value
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 作品グリッド */}
      <PagedGrid key={filterKey} builds={filteredBuilds} />
    </div>
  );
}

/** 10件ずつ表示して、残りは「さらに読み込む」ボタンで追加していく */
function PagedGrid({ builds }: { builds: Build[] }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const displayedBuilds = builds.slice(0, visibleCount);
  const hasMore = visibleCount < builds.length;

  return (
    <>
      <BuildGrid
        builds={displayedBuilds}
        emptyMessage="該当する建築作品が見つかりませんでした。"
      />

      {/* 追加読み込みボタン */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-2 text-sm sm:text-base font-medium text-zinc-800 hover:bg-zinc-50 transition"
          >
            さらに読み込む
          </button>
        </div>
      )}
    </>
  );
}

export default function BuildsPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BuildsContent />
    </Suspense>
  );
}
