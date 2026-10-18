"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BuildGrid from "@/components/builds/BuildGrid";
import Tag from "@/components/tags/Tag";
import type { Build } from "@/types";
import { mockBuilds, mockTags } from "@/lib/mock-data";

function BuildsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 状態はURLパラメータを唯一の真実とする(sort / tag / q)
  const sortBy = searchParams.get("sort") === "recent" ? "recent" : "popular";
  const selectedTag = searchParams.get("tag");
  const query = searchParams.get("q") ?? "";

  // フィルタ条件が変わったらグリッドごと初期化(追加読み込み件数リセット)
  const filterKey = `${sortBy}|${selectedTag ?? ""}|${query}`;

  // 現在のパラメータをコピーして書き換え、URLと同期する
  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `/builds?${qs}` : "/builds", { scroll: false });
  };

  const handleSortChange = (newSort: "recent" | "popular") => {
    updateParams((params) => params.set("sort", newSort));
  };

  const handleTagClick = (name: string) => {
    updateParams((params) => {
      if (searchParams.get("tag") === name) {
        params.delete("tag");
      } else {
        params.set("tag", name);
      }
    });
  };

  // フィルタリングと並び替え
  const filteredBuilds = useMemo(() => {
    let result = [...mockBuilds];

    // タグ絞り込み
    if (selectedTag) {
      result = result.filter((b) => b.tags.includes(selectedTag));
    }

    // 検索語: 概要・タグ・作者名の部分一致(case-insensitive)
    if (query) {
      const needle = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.description.toLowerCase().includes(needle) ||
          b.tags.some((t) => t.toLowerCase().includes(needle)) ||
          b.author.displayName.toLowerCase().includes(needle) ||
          b.author.username.toLowerCase().includes(needle)
      );
    }

    // ソート
    if (sortBy === "popular") {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [selectedTag, query, sortBy]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 sm:py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
        {/* タグフィルター */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {mockTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagClick(tag.name)}
            >
              <Tag>#{tag.name}</Tag>
            </button>
          ))}
        </div>

        {/* 並び替えスイッチ */}
        <div className="flex items-center gap-1 p-0.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => handleSortChange("popular")}
            className={`rounded-full px-4 py-2 text-sm sm:text-base font-medium transition ${
              sortBy === "popular"
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            人気順
          </button>
          <button
            onClick={() => handleSortChange("recent")}
            className={`rounded-full px-4 py-2 text-sm sm:text-base font-medium transition ${
              sortBy === "recent"
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            新着順
          </button>
        </div>
      </div>

      {/* 作品グリッド */}
      <PagedGrid key={filterKey} builds={filteredBuilds} />
    </div>
  );
}

/** タグ・検索語・ソートごとに remount(key 付与)され、表示件数がリセットされる */
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
