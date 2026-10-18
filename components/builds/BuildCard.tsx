import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Build } from "@/types";

interface BuildCardProps {
  build: Build;
}

export default function BuildCard({ build }: BuildCardProps) {
  return (
    <Link href={`/builds/${build.slug}`} className="group block">
      {/* 建築画像 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={build.images[0]}
          alt={build.description}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover transition duration-200 group-hover:scale-102"
        />
      </div>

      {/* 作品情報（作者・説明・いいね数） */}
      <div className="flex items-center justify-between gap-2 px-1 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={build.author.avatarUrl}
            alt={build.author.displayName}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover shrink-0"
          />
          <div className="truncate">
            <span className="block truncate text-sm text-zinc-900">
              {build.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-zinc-500 shrink-0">
          <Heart className="h-3.5 w-3.5 text-zinc-400 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />
          <span>{build.likesCount}</span>
        </div>
      </div>
    </Link>
  );
}
