import Image from "next/image";
import { notFound } from "next/navigation";
import { Pencil, User } from "lucide-react";
import FollowButton from "@/components/follows/FollowButton";
import UserPostsPanel from "@/components/users/UserPostsPanel";
import { fetchCurrentUser } from "@/lib/auth";
import { fetchFollowCounts, isFollowing } from "@/lib/follows";
import { fetchBuildsPage } from "@/lib/posts";
import { fetchProfile, isUserId } from "@/lib/users";

export const instant = false;

// ユーザーページ
export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;

  if (!isUserId(id)) notFound();

  const [profile, followCounts, page, user] = await Promise.all([
    fetchProfile(id),
    fetchFollowCounts(id),
    fetchBuildsPage({ authorId: id, sortBy: "recent" }),
    fetchCurrentUser(),
  ]);

  if (!profile) notFound();

  const isOwner = user?.id === id;
  const following =
    user && !isOwner ? await isFollowing(id, user.id) : false;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      {/* プロフィール */}
      <div className="rounded-md bg-white px-6 pt-6 sm:px-8 sm:pt-8">
        <section className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-5 sm:gap-6">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.nickname}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover"
              />
            ) : (
              <span className="flex h-22 w-22 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-sky-100 text-sky-600">
                <User className="h-10 w-10" />
              </span>
            )}

            <div className="min-w-0 space-y-3">
              <h1 className="truncate text-xl font-bold text-zinc-900">
                {profile.nickname}
              </h1>

              <div className="flex items-center gap-4 text-sm text-zinc-500">
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
              
              {profile.bio && (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-900">
                  {profile.bio}
                </p>
              )}

            </div>
          </div>

          {/* 右カラム */}
          <div className="flex w-24 shrink-0 justify-end sm:w-70">
            {isOwner ? (
              <button
                type="button"
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-zinc-100 px-2 text-sm font-medium leading-none text-zinc-700 transition hover:bg-zinc-200 sm:w-auto sm:px-3.5"
              >
                <Pencil className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">編集</span>
                <span className="hidden sm:inline">プロフィールを編集</span>
              </button>
            ) : (
              <div className="w-full sm:w-40">
                <FollowButton
                  userId={id}
                  initialFollowing={following}
                  loggedIn={Boolean(user)}
                  variant="soft"
                />
              </div>
            )}
          </div>
        </section>

        {/* タブ */}
        <div className="mt-6 flex items-center gap-6">
          <span className="inline-flex h-11 items-center border-b-2 border-sky-600 px-1 text-sm font-bold text-sky-600">
            投稿
          </span>
        </div>
      </div>

      {/* 投稿一覧 */}
      <UserPostsPanel
        userId={id}
        initialBuilds={page.builds}
        initialNextCursor={page.nextCursor}
      />
    </div>
  );
}
