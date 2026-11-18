import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";
import type { Collection } from "@/lib/bookmarks";

interface UserCollectionsProps {
  collections: Collection[];
  // コレクションの持ち主
  userId: string;
}

// コレクション一覧
export default function UserCollections({
  collections,
  userId,
}: UserCollectionsProps) {
  if (collections.length === 0) {
    return (
      <div className="py-20 text-center text-base text-zinc-500">
        コレクションがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-5">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/users/${userId}?tab=saved&collection=${collection.id}`}
          prefetch={false}
          aria-label={`${collection.name}の作品を見る`}
          className="relative aspect-square min-w-0 overflow-hidden rounded-md bg-zinc-200"
        >
          {collection.coverUrl ? (
            <Image
              src={collection.coverUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 25vw, 320px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-zinc-400">
              <Layers className="h-6 w-6" />
            </span>
          )}
          <span
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950/70 to-transparent"
            aria-hidden="true"
          />
          {/* コレクション名 */}
          <span className="absolute inset-x-0 bottom-0 truncate px-3 pb-3 text-sm font-bold text-white">
            {collection.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
