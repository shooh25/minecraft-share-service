import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Pencil, User } from "lucide-react";
import FollowButton from "@/components/follows/FollowButton";
import ProfileLinks from "@/components/users/ProfileLinks";
import UserCollectionDetail from "@/components/users/UserCollectionDetail";
import UserCollections from "@/components/users/UserCollections";
import UserPostsPanel from "@/components/users/UserPostsPanel";
import { fetchCurrentUser } from "@/lib/auth";
import {
  fetchCollection,
  fetchCollections,
  isCollectionId,
} from "@/lib/bookmarks";
import type { Collection } from "@/lib/bookmarks";
import { fetchFollowCounts, isFollowing } from "@/lib/follows";
import {
  fetchBuildsPage,
  fetchCollectionBuildsPage,
  fetchLikedBuildsPage,
} from "@/lib/posts";
import { fetchProfile, isUserId } from "@/lib/users";
import type { BuildPage } from "@/types";

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

  // クエリパラメータからタブを決定する
  const { tab: tabParam, collection: collectionParam } = await searchParams;
  type Tab = "posts" | "likes" | "saved";
  let tab: Tab = "posts";

  if (isOwner && tabParam === "likes") {
    tab = "likes";
  } else if (isOwner && tabParam === "saved") {
    tab = "saved";
  }

  // 各タブ下に表示するデータを取得する
  let buildPage: BuildPage | null = null;
  let collections: Collection[] = [];
  let selectedCollection: Pick<Collection, "id" | "name"> | null = null;

  if (tab === "saved") {
    const collectionId =
      typeof collectionParam === "string" && isCollectionId(collectionParam)
        ? collectionParam
        : null;

    // コレクションが指定されていれば、その中の作品一覧を取得する
    if (collectionId) {
      selectedCollection = await fetchCollection(collectionId, id);
      if (selectedCollection) {
        buildPage = await fetchCollectionBuildsPage({
          collectionId: selectedCollection.id,
          userId: id,
        });
      }
    }

    // コレクションが見つからないときは一覧を表示する
    if (!selectedCollection) {
      collections = await fetchCollections(id);
    }
  } else if (tab === "likes") {
    buildPage = await fetchLikedBuildsPage({ userId: id });
  } else {
    buildPage = await fetchBuildsPage({
      authorId: id,
      sortBy: "recent",
    });
  }

  // タブ一覧を生成する
  const tabs = [
    { key: "posts", label: "投稿", href: `/users/${id}` },
  ];

  if (isOwner) {
    tabs.push(
      { key: "likes", label: "いいね", href: `/users/${id}?tab=likes` },
      { key: "saved", label: "保存済み", href: `/users/${id}?tab=saved` },
    );
  }

  // タブごとに表示する内容
  let tabContent: ReactNode = null;

  if (tab === "saved") {
    // コレクションが選ばれていれば詳細、なければ一覧を表示する
    tabContent =
      selectedCollection && buildPage ? (
        <UserCollectionDetail
          key={selectedCollection.id}
          userId={id}
          collection={selectedCollection}
          initialBuilds={buildPage.builds}
          initialNextCursor={buildPage.nextCursor}
        />
      ) : (
        <UserCollections collections={collections} userId={id} />
      );
  } else if (buildPage) {
    // 投稿・いいね一覧
    tabContent = (
      <UserPostsPanel
        key={tab}
        userId={id}
        tab={tab}
        initialBuilds={buildPage.builds}
        initialNextCursor={buildPage.nextCursor}
      />
    );
  }

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

      {/* タブの内容 */}
      {tabContent}
    </div>
  );
}
