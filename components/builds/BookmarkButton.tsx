"use client";

import { useCallback, useState } from "react";
import { Bookmark } from "lucide-react";
import CollectionPickerDialog from "@/components/builds/CollectionPickerDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import Toast from "@/components/ui/Toast";
import type { Collection } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  postId: string;
  // その投稿が保存されているコレクションのID達
  initialSavedCollectionIds: string[];
  // ログイン中のユーザーのコレクション
  collections: Collection[];
  // ログインしているか
  loggedIn: boolean;
}

// ブックマークボタン
export default function BookmarkButton({
  postId,
  initialSavedCollectionIds,
  collections,
  loggedIn,
}: BookmarkButtonProps) {
  const [savedIds, setSavedIds] = useState(initialSavedCollectionIds);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const handleSavedChange = useCallback(
    (collectionId: string, saved: boolean) => {
      setSavedIds((prev) => {
        if (saved) {
          return prev.includes(collectionId)
            ? prev
            : [...prev, collectionId];
        }

        return prev.filter((id) => id !== collectionId);
      });

      setToast(
        saved
          ? "コレクションに保存しました"
          : "コレクションから削除しました",
      );
    },
    [],
  );

  const handleClick = () => {
    if (!loggedIn) {
      setLoginOpen(true);
      return;
    }

    setDialogOpen(true);
  };

  // いずれかのコレクションに入っていれば保存済み
  const bookmarked = savedIds.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          bookmarked ? "コレクションに保存済み" : "コレクションに保存"
        }
        aria-haspopup="dialog"
        className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100"
      >
        <Bookmark
          className={`h-5 w-5 ${bookmarked ? "text-sky-600" : ""}`}
          fill={bookmarked ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      </button>

      <CollectionPickerDialog
        open={dialogOpen}
        postId={postId}
        collections={collections}
        savedIds={savedIds}
        onClose={closeDialog}
        onSavedChange={handleSavedChange}
      />

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
