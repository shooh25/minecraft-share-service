"use client";

import { useCallback, useState } from "react";
import { Bookmark } from "lucide-react";
import CollectionPickerDialog from "@/components/builds/CollectionPickerDialog";
import LoginDialog from "@/components/auth/LoginDialog";
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

  const closeDialog = useCallback(() => setDialogOpen(false), []);
  const handleSaved = useCallback((collectionId: string) => {
    setSavedIds((prev) =>
      prev.includes(collectionId) ? prev : [...prev, collectionId],
    );
  }, []);

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
        className="cursor-pointer text-zinc-500 transition"
      >
        <Bookmark
          className={`h-5 w-5 ${bookmarked ? "text-amber-400" : ""}`}
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
        onSaved={handleSaved}
      />

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}
