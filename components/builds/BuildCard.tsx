import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  MessageCircleQuestion,
  User,
} from "lucide-react";
import { Build } from "@/types";

interface BuildCardProps {
  build: Build;
}

const ADVICE_TAG = "アドバイス求む!";

export default function BuildCard({ build }: BuildCardProps) {
  return (
    <Link href={`/builds/${build.id}`} className="group block bg-white rounded-md">
      {/* 建築画像 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-white">
        <Image
          src={build.images[0]}
          alt={build.description}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition duration-200 group-hover:scale-102"
        />

        {/* アドバイス求む!付きの作品は、画像の左上に目印を出す */}
        {build.tags.includes(ADVICE_TAG) && (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-xs font-bold text-zinc-950 shadow-sm">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            アドバイス求む!
          </div>
        )}
      </div>

      {/* 作品情報(1段目: 説明 / 2段目: 作者・いいね) */}
      <div className="px-4 py-3 space-y-1">
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <User className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="truncate text-sm text-zinc-700">
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
  );
}
