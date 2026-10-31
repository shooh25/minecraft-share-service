"use client";

import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";
import LoginDialog from "@/components/auth/LoginDialog";
import type { BuildComment, SessionUser } from "@/types";

interface CommentSectionProps {
  // 表示するコメント
  comments: BuildComment[];
  // ログイン中のユーザー
  user: SessionUser | null;
}

// コメント入力欄とコメント一覧。
export default function CommentSection({ comments, user }: CommentSectionProps) {
  const [items, setItems] = useState(comments);
  const [body, setBody] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const trimmed = body.trim();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !trimmed) return;

    setItems((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        body: trimmed,
        createdAt: new Date().toISOString(),
        author: { id: user.id, nickname: user.nickname, avatarUrl: "" },
      },
    ]);
    setBody("");
  };

  return (
    <section className="p-4 sm:p-6">
      <h2 className=" text-lg font-bold text-zinc-900">
        コメント
      </h2>

      {user ? (
        // ログイン時: 自分のアバター・入力欄・送信ボタン
        <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <User className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="コメントする"
            aria-label="コメント"
            className="min-w-0 flex-1 rounded-md bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:bg-zinc-200 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!trimmed}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed"
          >
            送信
          </button>
        </form>
      ) : (
        // 未ログイン時: ログインを促す
        <div className="mt-4 flex flex-col items-center gap-3 rounded-md bg-zinc-50 px-4 py-6 text-center">
          <p className="text-sm text-zinc-600">
            ログインしてからコメントできます。
          </p>
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-green-700 px-3.5 py-2.5 text-sm font-medium text-white transition"
          >
            ログイン
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">
          コメントはまだありません
        </p>
      ) : (
        <ul className="mt-4">
          {items.map((comment) => (
            <li key={comment.id} className="flex gap-3 py-3">
              {/* アバター(未設定のユーザーはアイコンを出す) */}
              {comment.author.avatarUrl ? (
                <Image
                  src={comment.author.avatarUrl}
                  alt={comment.author.nickname}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                  <User className="h-4 w-4" />
                </span>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-zinc-900">
                    {comment.author.nickname}
                  </span>
                  <time className="shrink-0 text-sm text-zinc-400">
                    {comment.createdAt.slice(0, 10).replaceAll("-", "/")}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-700">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </section>
  );
}
