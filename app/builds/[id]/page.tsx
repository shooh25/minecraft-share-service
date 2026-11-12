import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Share, User } from "lucide-react";
import BookmarkButton from "@/components/builds/BookmarkButton";
import BuildImageSlider from "@/components/builds/BuildImageSlider";
import RelatedBuilds from "@/components/builds/RelatedBuilds";
import LikeButton from "@/components/builds/LikeButton";
import CommentSection from "@/components/comments/CommentSection";
import FollowButton from "@/components/follows/FollowButton";
import { fetchCurrentUser } from "@/lib/auth";
import { fetchCollections, fetchPostCollectionIds } from "@/lib/bookmarks";
import { fetchComments } from "@/lib/comments";
import { formatDate } from "@/lib/date";
import { fetchFollowCounts, isFollowing } from "@/lib/follows";
import { isPostLiked } from "@/lib/likes";
import {
  fetchAuthorPosts,
  fetchBuild,
  fetchRelatedPostsPage,
} from "@/lib/posts";

export const instant = false;

// 作品詳細
export default async function BuildDetailPage({
  params,
}: PageProps<"/builds/[id]">) {
  const { id } = await params;
  const [build, user] = await Promise.all([fetchBuild(id), fetchCurrentUser()]);

  if (!build) notFound();

  const comments = await fetchComments(build.id);
  // 自分の投稿にはフォローボタンを出さない
  const isOwnPost = user?.id === build.author.id;
  const [
    authorPosts,
    liked,
    collections,
    savedCollectionIds,
    following,
    followCounts,
  ] = await Promise.all([
    fetchAuthorPosts(build.author.id, build.id),
    user ? isPostLiked(build.id, user.id) : Promise.resolve(false),
    user ? fetchCollections(user.id) : Promise.resolve([]),
    user ? fetchPostCollectionIds(build.id, user.id) : Promise.resolve([]),
    user && !isOwnPost
      ? isFollowing(build.author.id, user.id)
      : Promise.resolve(false),
    fetchFollowCounts(build.author.id),
  ]);
  const related = await fetchRelatedPostsPage(build.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          <article className="overflow-hidden rounded-md bg-white">
            {/* 画像(最初の1枚を表示し、スワイプで切り替え) */}
            <BuildImageSlider images={build.images} alt={build.description} />

            <div className="space-y-2 p-4 sm:p-6 sm:pt-2">
              {/* いいね・ブックマーク・共有 */}
              <div className="flex items-center justify-end">
                <LikeButton
                  postId={build.id}
                  count={build.likesCount}
                  initialLiked={liked}
                  loggedIn={Boolean(user)}
                />
                <BookmarkButton
                  postId={build.id}
                  initialSavedCollectionIds={savedCollectionIds}
                  collections={collections}
                  loggedIn={Boolean(user)}
                />
                <button
                  type="button"
                  aria-label="共有"
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100"
                >
                  <Share className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>

              {/* 説明 */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
                {build.description}こんにちはこんにこんにちはこんにこんにちはこんにこんにちはこんにこんにちはこんに
              </p>

              {/* タグ */}
              {build.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold text-sky-600">
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
              <p className="text-sm text-zinc-400">
                <time dateTime={build.createdAt}>
                  {formatDate(build.createdAt)}
                </time>
              </p>
            </div>
          </article>

          <div className="overflow-hidden rounded-md bg-white">
            <CommentSection
              postId={build.id}
              authorId={build.author.id}
              comments={comments}
              user={user}
            />
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
                  className="h-11 w-11 shrink-0 rounded-full border border-zinc-200 object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-sky-100 text-sky-600">
                  <User className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 truncate text-base font-bold text-zinc-900">
                {build.author.nickname}
              </span>
            </Link>

            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
              <span>
                フォロー{" "}
                <span className="font-bold text-zinc-900">
                  {followCounts.followingCount}
                </span>
              </span>
              <span>
                フォロワー{" "}
                <span className="font-bold text-zinc-900">
                  {followCounts.followersCount}
                </span>
              </span>
            </div>

            {!isOwnPost && (
              <div className="mt-3">
                <FollowButton
                  userId={build.author.id}
                  initialFollowing={following}
                  loggedIn={Boolean(user)}
                />
              </div>
            )}

            <h2 className="mt-4 text-sm font-bold text-zinc-900">
              このユーザーの投稿
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

      {/* 関連する作品(共通タグが多い順) */}
      {related.builds.length > 0 && (
        <section aria-labelledby="related-builds" className="mt-8">
          <h2
            id="related-builds"
            className="text-2xl font-bold text-zinc-900"
          >
            関連する投稿
          </h2>
          <div className="mt-4">
            <RelatedBuilds
              postId={build.id}
              initialBuilds={related.builds}
              initialNextCursor={related.nextCursor}
            />
          </div>
        </section>
      )}
    </div>
  );
}
