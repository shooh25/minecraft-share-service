"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BuildGrid from "@/components/builds/BuildGrid";
import Tag from "@/components/tags/Tag";
import { filterBuilds, parseFilters, sortBuilds } from "@/lib/build-filters";
import type { Build, Tag as TagItem } from "@/types";

interface BuildsContentProps {
  // タグの一覧
  tags: TagItem[];
  // DBから取得した作品の一覧
  builds: Build[];
}

// 人気順 / 新着順の選択肢
const SORT_OPTIONS = [
  { value: "popular", label: "人気順" },
  { value: "recent", label: "新着順" },
] as const;

export default function BuildsContent({ tags, builds }: BuildsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // クエリパラメータを取得する(sort / q)
  const { sortBy, query } = parseFilters(searchParams);

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

  // 検索語に合う作品だけにして、並び替えて返す
  const filteredBuilds = useMemo(
    () => sortBuilds(filterBuilds(builds, { tag: null, query }), sortBy),
    [builds, query, sortBy],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6 sm:py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
        {/* タグフィルター(DBから取得した一覧) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tags.map((tag) => (
            <button key={tag.id} onClick={() => handleTagClick(tag.name)}>
              <Tag>#{tag.name}</Tag>
            </button>
          ))}
        </div>

        {/* 並び替えスイッチ */}
        <div className="flex items-center p-0.5 self-end sm:self-auto shrink-0">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSortChange(value)}
              className={`rounded-md px-4 py-2 text-sm sm:text-base font-medium transition ${
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
      <BuildGrid
        builds={filteredBuilds}
        emptyMessage="該当する建築作品が見つかりませんでした。"
      />
    </div>
  );
}
