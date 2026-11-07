"use client";

import { useCallback } from "react";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import type { Build, BuildPage } from "@/types";

interface UserTabsProps {
  // 表示するユーザー
  userId: string;
  // 初回に取得した1ページ分の投稿
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// ユーザーページのタブ
export default function UserTabs({
  userId,
  initialBuilds,
  initialNextCursor,
}: UserTabsProps) {
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
    <div>
      {/* タブ */}
      <div className="flex items-center gap-6 border-b border-zinc-200">
        <span className="inline-flex h-11 items-center border-b-2 border-sky-600 px-1 text-sm font-bold text-sky-600">
          投稿
        </span>
      </div>

      <div className="pt-4 sm:pt-6">
        <InfiniteBuilds
          builds={builds}
          hasMore={hasMore}
          loading={loading}
          error={error}
          onRetry={() => void loadMore()}
          sentinelRef={sentinelRef}
          emptyMessage="まだ投稿がありません"
        />
      </div>
    </div>
  );
}
