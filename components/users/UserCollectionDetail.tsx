"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { deleteCollection } from "@/app/actions/bookmarks";
import InfiniteBuilds from "@/components/builds/InfiniteBuilds";
import { useInfiniteBuilds } from "@/components/builds/useInfiniteBuilds";
import { useDialogScrollLock } from "@/components/ui/useDialogScrollLock";
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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useDialogScrollLock(deleteOpen);

  const closeDeleteDialog = () => {
    if (isPending) return;

    setDeleteOpen(false);
  };

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

  // コレクションを削除して一覧に戻る
  const handleDelete = () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const deleted = await deleteCollection(collection.id);
        if (!deleted) {
          window.alert("コレクションを削除できませんでした");
          return;
        }

        setDeleteOpen(false);
        // 一覧側でトーストを表示する
        router.push(`/users/${userId}?tab=saved&deleted=1`);
      } catch {
        window.alert("コレクションを削除できませんでした");
      }
    });
  };

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
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
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

      {/* コレクション削除の確認ダイアログ */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/40"
            aria-hidden="true"
            onClick={closeDeleteDialog}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-collection-title"
            className="relative w-full max-w-sm rounded-md border border-zinc-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-collection-title"
              className="text-lg font-bold text-zinc-900"
            >
              コレクションを削除しますか？
            </h2>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isPending}
                className="inline-flex h-10 cursor-pointer items-center justify-center border border-zinc-200 rounded-md px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
