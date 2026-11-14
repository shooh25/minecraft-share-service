"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import type { Build, BuildPage } from "@/types";

interface UserCollectionDetailProps {
  // コレクションの持ち主
  userId: string;
  collection: {
    id: string;
    name: string;
  };
  // 初回に取得した1ページ分
  initialBuilds: Build[];
  // 続きの位置。なければ末尾
  initialNextCursor: string | null;
}

// 保存済みタブのコレクションの中身
export default function UserCollectionDetail({
  userId,
  collection,
  initialBuilds,
  initialNextCursor,
}: UserCollectionDetailProps) {
  // カーソルから次のページを取得する
  const fetchPage = useCallback(
    async (cursor: string): Promise<BuildPage> => {
      const params = new URLSearchParams({ cursor });
      const response = await fetch(
        `/api/collections/${collection.id}/posts?${params.toString()}`,
      );
      if (!response.ok) throw new Error();
      return (await response.json()) as BuildPage;
    },
    [collection.id],
  );

  const { builds, loading, error, loadMore, sentinelRef, hasMore } =
    useInfiniteBuilds({ initialBuilds, initialNextCursor, fetchPage });

  return (
    <div className="space-y-4">
      {/* 戻るボタンとコレクション名 */}
      <div className="flex items-center gap-3">
        <Link
          href={`/users/${userId}?tab=saved`}
          aria-label="戻る"
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
        </Link>
        <h2 className="min-w-0 truncate text-xl font-bold text-zinc-900">
          {collection.name}
        </h2>
      </div>

      <InfiniteBuilds
        builds={builds}
        hasMore={hasMore}
        loading={loading}
        error={error}
        onRetry={() => void loadMore()}
        sentinelRef={sentinelRef}
        emptyMessage="このコレクションにはまだ作品がありません"
      />
    </div>
  );
}
