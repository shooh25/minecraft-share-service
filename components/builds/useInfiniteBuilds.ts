"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Build, BuildPage } from "@/types";

interface UseInfiniteBuildsOptions {
  // 初回に取得した1ページ分
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
  // カーソルから次の1ページ分を取得する
  fetchPage: (cursor: string) => Promise<BuildPage>;
}

// 作品一覧の無限スクロール。一覧の末尾が見えたら次のページを読み込む。
export function useInfiniteBuilds({
  initialBuilds,
  initialNextCursor,
  fetchPage,
}: UseInfiniteBuildsOptions) {
  const [builds, setBuilds] = useState(initialBuilds);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
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
      const page = await fetchPage(nextCursor);
      setBuilds((current) => {
        // 取得中に並び順が変わると同じ作品が返ることがあるため、IDで重複を除く
        const seen = new Set(current.map((build) => build.id));
        return [...current, ...page.builds.filter((b) => !seen.has(b.id))];
      });
      // 空のページが返ったら終端として扱う
      setNextCursor(page.builds.length ? page.nextCursor : null);
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchPage, nextCursor]);

  // 一覧の末尾が見えたら次を読み込む
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor || error) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [error, loadMore, nextCursor]);

  return {
    builds,
    loading,
    error,
    loadMore,
    sentinelRef,
    hasMore: nextCursor !== null,
  };
}
