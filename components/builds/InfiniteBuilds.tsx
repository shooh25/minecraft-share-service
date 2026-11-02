"use client";

import type { RefObject } from "react";
import BuildGrid from "./BuildGrid";
import type { Build } from "@/types";

interface InfiniteBuildsProps {
  builds: Build[];
  // 続きがあるか
  hasMore: boolean;
  loading: boolean;
  error: boolean;
  // 読み込み失敗時の再試行
  onRetry: () => void;
  // 一覧末尾の要素。ここが見えたら次を読み込む
  sentinelRef: RefObject<HTMLDivElement | null>;
  emptyMessage?: string;
}

// 無限スクロールする作品グリッド。useInfiniteBuilds と組み合わせて使う。
export default function InfiniteBuilds({
  builds,
  hasMore,
  loading,
  error,
  onRetry,
  sentinelRef,
  emptyMessage,
}: InfiniteBuildsProps) {
  return (
    <>
      <BuildGrid builds={builds} emptyMessage={emptyMessage} />

      {/* ここが見えたら次のページを読み込む */}
      {hasMore && <div ref={sentinelRef} aria-hidden className="h-1" />}

      {loading && (
        <p aria-live="polite" className="py-4 text-center text-sm text-zinc-500">
          読み込み中...
        </p>
      )}

      {error && (
        <div className="py-4 text-center">
          <p className="text-sm text-zinc-500">読み込みに失敗しました。</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-zinc-900 underline"
          >
            再試行
          </button>
        </div>
      )}
    </>
  );
}
