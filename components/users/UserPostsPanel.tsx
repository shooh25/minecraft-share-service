"use client";

import { useCallback } from "react";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import type { Build, BuildPage } from "@/types";

interface UserPostsPanelProps {
  // 表示するユーザー
  userId: string;
  // 初回に取得した1ページ分の投稿
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// ユーザーページの投稿タブの中身
export default function UserPostsPanel({
  userId,
  initialBuilds,
  initialNextCursor,
}: UserPostsPanelProps) {
  // カーソルから次のページを取得する
  const fetchPage = useCallback(
    async (cursor: string): Promise<BuildPage> => {
      const response = await fetch(
        `/api/users/${userId}/posts?cursor=${encodeURIComponent(cursor)}`,
      );
      if (!response.ok) throw new Error();
      return (await response.json()) as BuildPage;
    },
    [userId],
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
      emptyMessage="まだ投稿がありません"
    />
  );
}
