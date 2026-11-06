"use client";

import { User } from "lucide-react";
import type { SessionUser } from "@/types";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  // 送信中はボタンを押せなくする
  pending: boolean;
  placeholder: string;
  user: SessionUser | null;
  // 返信フォームではアバターを省いて横幅を詰める
  compact?: boolean;
}

// コメント・返信の入力欄。
export default function CommentForm({
  value,
  onChange,
  onSubmit,
  pending,
  placeholder,
  user,
  compact = false,
}: CommentFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 sm:gap-3">
      {!compact && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <User className="h-4 w-4" />
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={500}
        className="min-w-0 h-10 flex-1 rounded-md bg-zinc-100 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:bg-zinc-200 focus:outline-none"
      />
      <button
        type="submit"
        disabled={Boolean(user) && (!value.trim() || pending)}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-green-700 px-4 text-sm font-medium leading-none text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:hover:bg-green-700"
      >
        {compact ? "返信" : "コメント"}
      </button>
    </form>
  );
}
