"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BuildGrid from "@/components/builds/BuildGrid";
import Tag from "@/components/tags/Tag";
import { mockBuilds, mockTags } from "@/lib/mock-data";

function BuildsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortParam = searchParams.get("sort");
  const initialSort = sortParam === "recent" ? "recent" : "popular";

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "popular">(initialSort);
  const [visibleCount, setVisibleCount] = useState(10);

  // ソートの切り替えとURL同期
  const handleSortChange = (newSort: "recent" | "popular") => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.replace(`/builds?${params.toString()}`, { scroll: false });
  };

  // フィルタリングと並び替え
  const filteredBuilds = useMemo(() => {
    let result = [...mockBuilds];

    // タグ絞り込み
    if (selectedTag) {
      result = result.filter((b) => b.tags.includes(selectedTag));
    }

    // ソート
    if (sortBy === "popular") {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [selectedTag, sortBy]);

  const displayedBuilds = filteredBuilds.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBuilds.length;

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* タグフィルター */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button onClick={() => setSelectedTag(null)}>
            <Tag active={selectedTag === null}>すべて</Tag>
          </button>
          {mockTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
            >
              <Tag active={selectedTag === tag.name}>#{tag.name}</Tag>
            </button>
          ))}
        </div>

        {/* 並び替えスイッチ */}
        <div className="flex items-center gap-1 text-sm self-end sm:self-auto border border-zinc-200 rounded-full p-1 bg-zinc-50 shrink-0">
          <button
            onClick={() => handleSortChange("popular")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              sortBy === "popular"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            人気順
          </button>
          <button
            onClick={() => handleSortChange("recent")}
            className={`rounded-full px-3 py-1 font-medium transition ${
              sortBy === "recent"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            新着順
          </button>
        </div>
      </div>

      {/* 作品グリッド */}
      <BuildGrid
        builds={displayedBuilds}
        emptyMessage="該当する建築作品が見つかりませんでした。"
      />

      {/* 追加読み込みボタン */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2 text-sm sm:text-base font-medium text-zinc-800 hover:bg-zinc-50 transition"
          >
            さらに読み込む
          </button>
        </div>
      )}
    </div>
  );
}

export default function BuildsPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BuildsContent />
    </Suspense>
  );
}
