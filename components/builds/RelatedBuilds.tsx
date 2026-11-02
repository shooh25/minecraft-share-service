"use client";

import { useCallback } from "react";
import InfiniteBuilds from "./InfiniteBuilds";
import { useInfiniteBuilds } from "./useInfiniteBuilds";
import type { Build, BuildPage } from "@/types";

interface RelatedBuildsProps {
  // 関連作品の対象となる作品のID
  postId: string;
  // 初回に取得した1ページ分
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// 関連作品の一覧。一覧の末尾が見えたら続きを読み込む。
export default function RelatedBuilds({
  postId,
  initialBuilds,
  initialNextCursor,
}: RelatedBuildsProps) {
  const fetchPage = useCallback(
    async (cursor: string): Promise<BuildPage> => {
      const params = new URLSearchParams({ cursor });
      const response = await fetch(`/api/builds/${postId}/related?${params}`);
      if (!response.ok) throw new Error();
      return (await response.json()) as BuildPage;
    },
    [postId],
  );

  const { builds, loading, error, loadMore, sentinelRef, hasMore } =
    useInfiniteBuilds({ initialBuilds, initialNextCursor, fetchPage });

  return (
    <InfiniteBuilds
      builds={builds}
      hasMore={hasMore}
      loading={loading}
      error={error}
      onRetry={() => void loadMore()}
      sentinelRef={sentinelRef}
      emptyMessage="関連する作品はまだありません"
    />
  );
}
