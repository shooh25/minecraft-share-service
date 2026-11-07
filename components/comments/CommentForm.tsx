"use client";

import { User } from "lucide-react";
import type { SessionUser } from "@/types";

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
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
  const clickable = !user || (!pending && value.trim().length > 0);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {!compact && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
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
      <span
        role="presentation"
        onClick={clickable ? onSubmit : undefined}
        className={`inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-medium leading-none text-white transition ${
          clickable
            ? "cursor-pointer hover:bg-sky-700"
            : "cursor-not-allowed"
        }`}
      >
        {compact ? "返信" : "コメント"}
      </span>
    </div>
  );
}
