"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Bookmark, Layers, Plus, X } from "lucide-react";
import {
  createCollection,
  removePostFromCollection,
  savePostToCollection,
} from "@/app/actions/bookmarks";
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
  // 保存状態が変わったときに、そのコレクションのIDと新しい状態を受け取る
  onSavedChange: (collectionId: string, saved: boolean) => void;
  // コレクションを作成できたときに受け取る
  onCollectionCreated: (collection: Collection) => void;
}

// 投稿を保存するコレクションを選ぶダイアログ
export default function CollectionPickerDialog({
  open,
  postId,
  collections,
  savedIds,
  onClose,
  onSavedChange,
  onCollectionCreated,
}: CollectionPickerDialogProps) {
  const [error, setError] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  useDialogScrollLock(open);

  if (!open) return null;

  const handleClose = () => {
    setCreating(false);
    setCreateError(false);
    setName("");
    onClose();
  };

  const handleSaveCollection = () => {
    if (isPending) return;

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setCreateError(true);
      return;
    }

    setCreateError(false);

    startTransition(async () => {
      try {
        const created = await createCollection(trimmed);
        if (!created) {
          setCreateError(true);
          return;
        }

        onCollectionCreated({
          ...created,
          coverUrl: null,
          clipCount: 0,
        });
        setCreating(false);
        setName("");
      } catch {
        setCreateError(true);
      }
    });
  };

  const handleToggle = (collectionId: string, saved: boolean) => {
    setError(false);

    startTransition(async () => {
      try {
        const changed = saved
          ? await removePostFromCollection(postId, collectionId)
          : await savePostToCollection(postId, collectionId);
        if (!changed) {
          setError(true);
          return;
        }

        onSavedChange(collectionId, !saved);
      } catch {
        setError(true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-950/40"
        aria-hidden="true"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-dialog-title"
        className="relative w-full max-w-md rounded-md p-6 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2
            id="collection-dialog-title"
            className="text-xl font-bold text-zinc-900"
          >
            {creating ? "コレクションを作成" : "コレクションに保存"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="閉じる"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {creating ? (
          <div className="pt-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setCreateError(false);
                }}
                aria-label="コレクション名"
                placeholder="コレクション名"
                maxLength={50}
                className="h-10 min-w-0 flex-1 rounded-md bg-zinc-100 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:bg-zinc-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveCollection}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                保存
              </button>
            </div>

            {createError && (
              <p role="alert" className="pt-2 text-sm text-red-600">
                コレクションを作成できませんでした。
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto pt-4">
              {collections.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-zinc-500">
                  コレクションがありません
                </p>
              ) : (
                <ul className="space-y-2">
                  {collections.map((collection) => {
                    const saved = savedIds.includes(collection.id);

                    return (
                      <li
                        key={collection.id}
                        className="flex items-center gap-3 rounded-md"
                      >
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                          {collection.coverUrl ? (
                            <Image
                              src={collection.coverUrl}
                              alt=""
                              fill
                              sizes="60px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-zinc-400">
                              <Layers className="h-4 w-4" />
                            </span>
                          )}
                        </span>

                        <span className="min-w-0 flex-1 truncate font-bold text-sm text-zinc-900">
                          {collection.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggle(collection.id, saved)}
                          aria-label={
                            saved
                              ? `${collection.name}から保存を解除`
                              : `${collection.name}に保存`
                          }
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md cursor-pointer transition ${
                            saved
                              ? "text-sky-600 hover:bg-zinc-100"
                              : "text-zinc-500 hover:bg-zinc-100"
                          }`}
                        >
                          <Bookmark
                            className="h-5 w-5"
                            fill={saved ? "currentColor" : "none"}
                            strokeWidth={1.8}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {error && (
                <p role="alert" className="px-3 pt-2 text-sm text-red-600">
                  保存状態を変更できませんでした。もう一度お試しください。
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setCreateError(false);
                  setCreating(true);
                }}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                <Plus className="h-4 w-4" />
                コレクションを作成
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
