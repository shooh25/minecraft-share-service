import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Pencil, User } from "lucide-react";
import { Build } from "@/types";

interface BuildCardProps {
  build: Build;
  // ホバー時に編集ボタンを出すか
  showEditButton?: boolean;
  // 編集ボタンを押したとき
  onEdit?: (build: Build) => void;
}

const ADVICE_TAG = "アドバイス求む!";

export default function BuildCard({
  build,
  showEditButton = false,
  onEdit,
}: BuildCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/builds/${build.id}`}
        className="block bg-white rounded-md"
      >
        {/* 建築画像 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-md bg-white">
          <Image
            src={build.images[0]}
            alt={build.description}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition duration-200 group-hover:scale-102"
          />

          {/* アドバイス求む!付きの作品は、画像の左上に目印を出す */}
          {build.tags.includes(ADVICE_TAG) && (
            <div className="absolute left-0 top-0 inline-flex h-7 pb-0.4 items-center rounded-tl-md rounded-br-md bg-sky-600 px-3 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              アドバイス求む!
            </div>
          )}
        </div>

        {/* 作品情報(1段目: 説明 / 2段目: 作者・いいね) */}
        <div className="px-4 py-3 space-y-2">
          {/* 1段目: 説明 */}
          <span className="block truncate text-sm font-bold text-zinc-900">
            {build.description}
          </span>

          {/* 2段目: 左に作者・右にいいね */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {/* アバターが未設定のユーザーはアイコンを出す */}
              {build.author.avatarUrl ? (
                <Image
                  src={build.author.avatarUrl}
                  alt={build.author.nickname}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <User className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="truncate text-sm text-zinc-900">
                {build.author.nickname}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-sm text-zinc-500">
              {/* いいね数 */}
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-zinc-400" />
                <span>{build.likesCount}</span>
              </div>

              {/* コメント数 */}
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-zinc-400" />
                <span>{build.commentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 編集ボタン */}
      {showEditButton && (
        <button
          type="button"
          aria-label="作品を保存するコレクションを選ぶ"
          onClick={() => onEdit?.(build)}
          className="pointer-events-none absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/90 text-zinc-600 opacity-0 shadow-sm transition hover:bg-white hover:text-zinc-900 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
