import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, User } from "lucide-react";
import FollowButton from "@/components/follows/FollowButton";
import ProfileLinks from "@/components/users/ProfileLinks";
import UserPostsPanel from "@/components/users/UserPostsPanel";
import { fetchCurrentUser } from "@/lib/auth";
import { fetchFollowCounts, isFollowing } from "@/lib/follows";
import { fetchBuildsPage, fetchLikedBuildsPage } from "@/lib/posts";
import { fetchProfile, isUserId } from "@/lib/users";

export const instant = false;

// ユーザーページ
export default async function UserPage({
  params,
  searchParams,
}: PageProps<"/users/[id]">) {
  const { id } = await params;

  if (!isUserId(id)) notFound();

  const [profile, followCounts, user] = await Promise.all([
    fetchProfile(id),
    fetchFollowCounts(id),
    fetchCurrentUser(),
  ]);

  if (!profile) notFound();

  const isOwner = user?.id === id;
  const following =
    user && !isOwner ? await isFollowing(id, user.id) : false;

  // 自分のページでは「いいね」タブも開ける
  const { tab: tabParam } = await searchParams;
  const tab = isOwner && tabParam === "likes" ? "likes" : "posts";

  // 表示中のタブの1ページ目だけを取得する
  const page =
    tab === "likes"
      ? await fetchLikedBuildsPage({ userId: id })
      : await fetchBuildsPage({ authorId: id, sortBy: "recent" });

  const tabs = [
    { key: "posts", label: "投稿", href: `/users/${id}` },
    ...(isOwner
      ? [{ key: "likes", label: "いいね", href: `/users/${id}?tab=likes` }]
      : []),
  ];

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

            <div className="min-w-0 space-y-2">
              <h1 className="truncate text-2xl font-bold text-zinc-900">
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
                <ProfileLinks
                  xUsername={profile.xUsername}
                  websiteUrl={profile.websiteUrl}
                  youtubeUrl={profile.youtubeUrl}
                />
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
              <Link
                href="/settings/profile"
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 border border-zinc-200 rounded-md px-2 text-sm font-medium leading-none text-zinc-700 transition hover:bg-zinc-100 sm:w-auto sm:px-3.5"
              >
                <Pencil className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">編集</span>
                <span className="hidden sm:inline">プロフィールを編集</span>
              </Link>
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
          {tabs.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={tab === item.key ? "page" : undefined}
              className={`inline-flex h-11 items-center border-b-2 px-1 text-sm transition ${
                tab === item.key
                  ? "border-sky-600 font-bold text-sky-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 投稿・いいね一覧 */}
      <UserPostsPanel
        key={tab}
        userId={id}
        tab={tab}
        initialBuilds={page.builds}
        initialNextCursor={page.nextCursor}
      />
    </div>
  );
}
