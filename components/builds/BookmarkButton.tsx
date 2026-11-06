"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { setBookmarked as saveBookmark } from "@/app/actions/bookmarks";
import LoginDialog from "@/components/auth/LoginDialog";

interface BookmarkButtonProps {
  postId: string;
  // ログイン中のユーザーがすでにブックマークしているか
  initialBookmarked: boolean;
  // ログインしているか
  loggedIn: boolean;
}

// ブックマークボタン。未ログイン時は押すとログインダイアログを開く。
export default function BookmarkButton({
  postId,
  initialBookmarked,
  loggedIn,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loginOpen, setLoginOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleClick = () => {
    if (!loggedIn) {
      setLoginOpen(true);
      return;
    }

    const next = !bookmarked;
    // 先に表示を切り替え、失敗したら元に戻す
    setBookmarked(next);

    startTransition(async () => {
      try {
        const saved = await saveBookmark(postId, next);
        if (!saved) setBookmarked(!next);
      } catch {
        setBookmarked(!next);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="ブックマーク"
        aria-pressed={bookmarked}
        className="cursor-pointer text-zinc-500 transition"
      >
        <Bookmark
          className={`h-5 w-5 ${bookmarked ? "text-amber-400" : ""}`}
          fill={bookmarked ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      </button>

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}
