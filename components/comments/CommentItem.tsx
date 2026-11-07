"use client";

import { User } from "lucide-react";
import { formatDate } from "@/lib/date";
import type { BuildComment } from "@/types";

interface CommentItemProps {
  comment: BuildComment;
  // 作品の投稿者によるコメントか
  isPostAuthor: boolean;
  onReply: () => void;
  // このコメントへの返信フォームを開いているか
  replyOpen: boolean;
  // 開いているときだけ渡す返信フォーム
  replyForm?: React.ReactNode;
}

// コメント1件
export default function CommentItem({
  comment,
  isPostAuthor,
  onReply,
  replyOpen,
  replyForm,
}: CommentItemProps) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        <User className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold text-zinc-900">
            {comment.author.nickname}
          </span>
          {isPostAuthor && (
            <span className="inline-flex shrink-0 items-center rounded-sm bg-sky-100 px-1 py-1 text-xs font-medium leading-none text-sky-600">
              投稿者
            </span>
          )}
          <time
            dateTime={comment.createdAt}
            className="shrink-0 text-sm text-zinc-400"
          >
            {formatDate(comment.createdAt)}
          </time>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {/* 返信先がいる場合は「@ニックネーム」を本文の前に出す */}
          {comment.parentNickname && (
            <span className="mr-1 font-medium text-sky-600">
              @{comment.parentNickname}
            </span>
          )}
          {comment.body}
        </p>

        <button
          type="button"
          onClick={onReply}
          aria-expanded={replyOpen}
          className="cursor-pointer text-sm font-bold text-sky-600 transition hover:text-sky-700"
        >
          {replyOpen ? "キャンセル" : "返信"}
        </button>

        {replyOpen && replyForm}
      </div>
    </div>
  );
}
