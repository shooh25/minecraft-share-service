import Image from "next/image";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import UserTabs from "@/components/users/UserTabs";
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
      <section>
        <div className="flex items-center gap-4 sm:gap-6">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.nickname}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <User className="h-8 w-8" />
            </span>
          )}

          <div className="min-w-0 space-y-2">
            <h1 className="truncate text-xl font-bold text-zinc-900">
              {profile.nickname}
            </h1>

            {profile.bio && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-600">
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
      </section>

      {/* タブ */}
      <UserTabs
        userId={id}
        initialBuilds={page.builds}
        initialNextCursor={page.nextCursor}
      />
    </div>
  );
}
