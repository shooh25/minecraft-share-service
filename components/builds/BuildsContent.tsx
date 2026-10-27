"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BuildGrid from "@/components/builds/BuildGrid";
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

  // 並び順はURLから読み取る
  const { sortBy } = parseFilters(searchParams);

  // 画面に表示する作品一覧。追加読み込みの結果は末尾に足す
  const [builds, setBuilds] = useState(initialBuilds);
  // 次ページの取得位置。ないときは続きなし
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  // 追加読み込み中かどうか。「読み込み中...」の表示に使う
  const [loading, setLoading] = useState(false);
  // 追加読み込みに失敗したかどうか。「再試行」ボタンの表示に使う
  const [error, setError] = useState(false);
  // 追加読み込み中かどうか。2回以上連続で読み込むのを防ぐ
  const loadingRef = useRef(false);
  // 一覧末尾の要素
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 次のページを読み込んで末尾に足す
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("cursor", nextCursor);
      const response = await fetch(`/api/builds?${params}`);
      if (!response.ok) throw new Error();
      const page = (await response.json()) as BuildPage;
      setBuilds((current) => {
        // 取得中にいいね数が変わると同じ作品が返ることがあるため、IDで重複を除く
        const seen = new Set(current.map((build) => build.id));
        return [...current, ...page.builds.filter((b) => !seen.has(b.id))];
      });
      setNextCursor(page.builds.length ? page.nextCursor : null);
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [nextCursor, searchParams]);

  // 一覧の末尾が見えたら次を読み込む
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor || error) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void loadMore();
    }, { rootMargin: "200px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [error, loadMore, nextCursor]);

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
        builds={builds}
        emptyMessage="該当する建築作品が見つかりませんでした。"
      />

      {/* ここが見えたら次のページを読み込む */}
      {nextCursor && <div ref={sentinelRef} aria-hidden className="h-1" />}

      {loading && (
        <p aria-live="polite" className="py-4 text-center text-sm text-zinc-500">読み込み中...</p>
      )}

      {error && (
        <div className="py-4 text-center">
          <p className="text-sm text-zinc-500">読み込みに失敗しました。</p>
          <button type="button" onClick={() => void loadMore()} className="mt-2 text-sm font-medium text-zinc-900 underline">
            再試行
          </button>
        </div>
      )}
    </div>
  );
}
