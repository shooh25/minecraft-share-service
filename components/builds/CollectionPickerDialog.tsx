"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { savePostToCollection } from "@/app/actions/bookmarks";
import { useDialogScrollLock } from "@/components/ui/useDialogScrollLock";
import type { Collection } from "@/lib/bookmarks";

interface CollectionPickerDialogProps {
  open: boolean;
  postId: string;
  // ログイン中のユーザーのコレクション
  collections: Collection[];
  // その投稿が保存されているコレクションのID
  savedIds: string[];
  onClose: () => void;
  // 保存できたコレクションのIDを受け取る
  onSaved: (collectionId: string) => void;
}

// 投稿を保存するコレクションを選ぶダイアログ
export default function CollectionPickerDialog({
  open,
  postId,
  collections,
  savedIds,
  onClose,
  onSaved,
}: CollectionPickerDialogProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [, startTransition] = useTransition();

  useDialogScrollLock(open);

  if (!open) return null;

  const handleSave = (collectionId: string) => {
    if (savingId) return;

    setSavingId(collectionId);
    setError(false);

    startTransition(async () => {
      try {
        const saved = await savePostToCollection(postId, collectionId);
        if (!saved) {
          setError(true);
          return;
        }

        onSaved(collectionId);
      } catch {
        setError(true);
      } finally {
        setSavingId(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/40"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-dialog-title"
        className="relative w-full max-w-xl rounded-md p-6 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2
            id="collection-dialog-title"
            className="text-xl font-bold text-zinc-900"
          >
            コレクションに保存
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto pt-3">
          {collections.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-zinc-500">
              コレクションがありません
            </p>
          ) : (
            <ul className="space-y-1">
              {collections.map((collection) => {
                const saved = savedIds.includes(collection.id);
                const saving = savingId === collection.id;

                return (
                  <li
                    key={collection.id}
                    className="flex items-center gap-3 rounded-md hover:bg-zinc-50"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-900">
                      {collection.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSave(collection.id)}
                      disabled={saved || Boolean(savingId)}
                      className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-3 text-xs font-bold transition ${
                        saved
                          ? "bg-zinc-100 text-zinc-400"
                          : "bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
                      }`}
                    >
                      {saved ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          保存済み
                        </>
                      ) : saving ? (
                        "保存中..."
                      ) : (
                        "保存"
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <p role="alert" className="px-3 pt-2 text-sm text-red-600">
              保存に失敗しました。もう一度お試しください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
