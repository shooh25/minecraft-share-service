"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // メニューの外側をクリックしたら閉じる
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

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
      {/* 戻るボタン・コレクション名・メニュー */}
      <div className="flex items-center gap-3">
        <Link
          href={`/users/${userId}?tab=saved`}
          aria-label="戻る"
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
        </Link>
        <h2 className="min-w-0 flex-1 truncate text-xl font-bold text-zinc-900">
          {collection.name}
        </h2>

        <div className="relative shrink-0">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="コレクションのメニュー"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="コレクションのメニュー"
              className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-header lg:w-52"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-[13px] text-left text-sm leading-none text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                <Pencil
                  className="h-4 w-4 shrink-0 text-zinc-500"
                  aria-hidden="true"
                />
                コレクションを編集
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-[13px] text-left text-sm leading-none text-red-500 transition-colors hover:bg-zinc-100"
              >
                <Trash2
                  className="h-4 w-4 shrink-0 text-red-500"
                  aria-hidden="true"
                />
                コレクションを削除
              </button>
            </div>
          )}
        </div>
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
