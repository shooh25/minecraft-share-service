import Image from "next/image";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import UserPostsPanel from "@/components/users/UserPostsPanel";
import { fetchFollowCounts } from "@/lib/follows";
import { fetchBuildsPage } from "@/lib/posts";
import { fetchProfile, isUserId } from "@/lib/users";

export const instant = false;

// ユーザーページ
export default async function UserPage({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;

  if (!isUserId(id)) notFound();

  const [profile, followCounts, page] = await Promise.all([
    fetchProfile(id),
    fetchFollowCounts(id),
    fetchBuildsPage({ authorId: id, sortBy: "recent" }),
  ]);

  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-6">
      {/* プロフィール */}
      <div className="rounded-md bg-white px-4 pt-6 sm:px-6 sm:pt-8">
        <section className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-5 sm:gap-6">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.nickname}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-22 w-22 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <User className="h-10 w-10" />
              </span>
            )}

            <div className="min-w-0 space-y-3">
              <h1 className="truncate text-xl font-bold text-zinc-900">
                {profile.nickname}
              </h1>

              {profile.bio && (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-900">
                  {profile.bio}
                </p>
              )}

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
            </div>
          </div>

          {/* 右カラム */}
          <div className="w-24 shrink-0 sm:w-70" />
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
