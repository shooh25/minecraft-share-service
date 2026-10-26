import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import BuildImageSlider from "@/components/builds/BuildImageSlider";
import CommentSection from "@/components/comments/CommentSection";
import { fetchCurrentUser } from "@/lib/auth";
import { fetchBuild } from "@/lib/posts";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <article className="overflow-hidden rounded-md bg-white">
        {/* 画像(最初の1枚を表示し、スワイプで切り替え) */}
        <BuildImageSlider images={build.images} alt={build.description} />

        <div className="space-y-4 p-4 sm:p-6">
          {/* いいね数 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex shrink-0 items-center gap-1 text-md text-zinc-500">
              <Heart className="h-4 w-4 text-zinc-400" />
              <span>{build.likesCount}</span>
            </div>
          </div>

          {/* 説明 */}
          <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
            {build.description}
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
        </div>
      </article>

      {/* コメント入力欄・コメント一覧 */}
      <CommentSection comments={comments} user={user} />
    </div>
  );
}
