"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { setFollowing as saveFollow } from "@/app/actions/follows";
import LoginDialog from "@/components/auth/LoginDialog";

interface FollowButtonProps {
  // フォローする相手のユーザーID
  userId: string;
  // ログイン中のユーザーがすでにフォローしているか
  initialFollowing: boolean;
  // ログインしているか
  loggedIn: boolean;
}

// フォローボタン。未ログイン時は押すとログインダイアログを開く。
export default function FollowButton({
  userId,
  initialFollowing,
  loggedIn,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!loggedIn) {
      setLoginOpen(true);
      return;
    }

    const next = !following;
    // 先に表示を切り替え、失敗したら元に戻す
    setFollowing(next);

    startTransition(async () => {
      try {
        const saved = await saveFollow(userId, next);
        if (!saved) setFollowing(!next);
      } catch {
        setFollowing(!next);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={following}
        className={`mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium leading-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          following
            ? "bg-white text-green-700"
            : "bg-green-700 text-white hover:bg-green-800"
        }`}
      >
        {following && <Check className="h-4 w-4" strokeWidth={2.5} />}
        {following ? "フォロー中" : "フォロー"}
      </button>

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}
