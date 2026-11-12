"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { setLiked as saveLike } from "@/app/actions/likes";
import LoginDialog from "@/components/auth/LoginDialog";

interface LikeButtonProps {
  postId: string;
  // いいね数
  count: number;
  // ログイン中のユーザーがすでにいいねしているか
  initialLiked: boolean;
  // ログインしているか
  loggedIn: boolean;
}

// いいねボタン。未ログイン時は押すとログインダイアログを開く。
export default function LikeButton({
  postId,
  count,
  initialLiked,
  loggedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [loginOpen, setLoginOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleClick = () => {
    if (!loggedIn) {
      setLoginOpen(true);
      return;
    }

    const next = !liked;
    // 先に表示を切り替え、失敗したら元に戻す
    setLiked(next);

    startTransition(async () => {
      try {
        const saved = await saveLike(postId, next);
        if (!saved) setLiked(!next);
      } catch {
        setLiked(!next);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={`いいね ${count}件`}
        aria-pressed={liked}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 leading-none text-zinc-500 transition hover:bg-zinc-100"
      >
        <Heart
          className={`h-5 w-5 ${liked ? "text-rose-500" : ""}`}
          fill={liked ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
        <span className="text-sm font-semibold">{count}</span>
      </button>

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}
