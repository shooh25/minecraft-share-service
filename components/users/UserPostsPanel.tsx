"use client";

import { useCallback } from "react";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import type { Build, BuildPage } from "@/types";

interface UserPostsPanelProps {
  // 一覧を取得するユーザー
  userId: string;
  // 投稿といいねのどちらの一覧か
  tab: "posts" | "likes";
  // 初回に取得した1ページ分
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// ユーザーページの投稿・いいねタブの中身
export default function UserPostsPanel({
  userId,
  tab,
  initialBuilds,
  initialNextCursor,
}: UserPostsPanelProps) {
  // カーソルから次のページを取得する
  const fetchPage = useCallback(
    async (cursor: string): Promise<BuildPage> => {
      const params = new URLSearchParams({ cursor });
      // いいね一覧は同じAPIの tab=likes で取得する
      if (tab === "likes") params.set("tab", "likes");

      const response = await fetch(
        `/api/users/${userId}/posts?${params.toString()}`,
      );
      if (!response.ok) throw new Error();
      return (await response.json()) as BuildPage;
    },
    [userId, tab],
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
