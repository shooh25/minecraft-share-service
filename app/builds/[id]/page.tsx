import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Bookmark, Heart, Share, User } from "lucide-react";
import BuildImageSlider from "@/components/builds/BuildImageSlider";
import CommentSection from "@/components/comments/CommentSection";
import { fetchCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { fetchAuthorPosts, fetchBuild } from "@/lib/posts";
import type { BuildComment } from "@/types";

export const instant = false;

// コメント機能を実装するまでの表示確認用データ
const MOCK_COMMENTS: BuildComment[] = [
  {
    id: "mock-1",
    body: "屋根の曲線がきれいですね。使っているブロックを教えてほしいです!",
    createdAt: "2026-10-20",
    author: {
      id: "mock-user-1",
      nickname: "Alex Builder",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "mock-2",
    body: "苔の量が絶妙で、森に馴染んで見えます。参考にさせてもらいます。",
    createdAt: "2026-10-21",
    author: {
      id: "mock-user-2",
      nickname: "Steve R.",
      avatarUrl:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "mock-3",
    body: "内装も見てみたいです!",
    createdAt: "2026-10-22",
    author: {
      id: "mock-user-3",
      nickname: "Queen",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
  },
];

// 作品詳細
export default async function BuildDetailPage({
  params,
}: PageProps<"/builds/[id]">) {
  const { id } = await params;
  const [build, user] = await Promise.all([fetchBuild(id), fetchCurrentUser()]);

  if (!build) notFound();

  const comments = MOCK_COMMENTS;
  const authorPosts = await fetchAuthorPosts(build.author.id, build.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="min-w-0 overflow-hidden rounded-md bg-white lg:col-start-1 lg:row-start-1">
          <article>
            {/* 画像(最初の1枚を表示し、スワイプで切り替え) */}
            <BuildImageSlider images={build.images} alt={build.description} />

            <div className="space-y-2 p-4 sm:p-6 sm:pt-4">
              {/* いいね・ブックマーク・共有 */}
              <div className="flex items-center justify-end gap-4 pb-2">
                <button
                  type="button"
                  aria-label={`いいね ${build.likesCount}件`}
                  className="inline-flex cursor-pointer items-center gap-2 text-zinc-900 transition"
                >
                  <Heart className="h-6 w-6" strokeWidth={1.8} />
                  <span className="text-sm font-semibold">
                    {build.likesCount}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="ブックマーク"
                  className="cursor-pointer text-zinc-900 transition"
                >
                  <Bookmark className="h-6 w-6" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label="共有"
                  className="cursor-pointer text-zinc-900 transition"
                >
                  <Share className="h-6 w-6" strokeWidth={1.8} />
                </button>
              </div>

              {/* 説明 */}
              <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
                {build.description}こんにちはこんに
              </p>

              {/* タグ */}
              {build.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-base font-bold text-green-700">
                  {build.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/builds?tag=${encodeURIComponent(tag)}`}
                      className="hover:underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* 投稿日時 */}
              <p className="text-sm text-zinc-500">
                <time dateTime={build.createdAt}>
                  {formatDate(build.createdAt)}
                </time>
              </p>
            </div>
          </article>

          <div className="border-t border-zinc-200">
            <CommentSection comments={comments} user={user} />
          </div>
        </div>

        {/* 右カラム: 投稿者と、その投稿者の他の作品 */}
        <aside
          aria-label="投稿者情報"
          className="lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1"
        >
          <div>
            <Link
              href={`/users/${build.author.id}`}
              className="flex items-center gap-3"
            >
              {build.author.avatarUrl ? (
                <Image
                  src={build.author.avatarUrl}
                  alt={build.author.nickname}
                  width={40}
                  height={40}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-400">
                  <User className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 truncate text-base font-bold text-zinc-900">
                {build.author.nickname}らうねん
              </span>
            </Link>

            <h2 className="mt-4 text-sm font-bold text-zinc-900">
              このユーザーの作品
            </h2>
            {authorPosts.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {authorPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/builds/${post.id}`}
                    className="group relative block aspect-square overflow-hidden rounded-md bg-zinc-100"
                  >
                    <Image
                      src={post.images[0]}
                      alt={post.description}
                      fill
                      sizes="(max-width: 1024px) 50vw, 140px"
                      className="object-cover transition duration-200 group-hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">他の投稿はありません</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
