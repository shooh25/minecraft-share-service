import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import BuildGrid from "@/components/builds/BuildGrid";
import { mockBuilds, mockTags } from "@/lib/mock-data";

export default function Home() {
  const featuredBuilds = mockBuilds.filter((b) => b.featured);
  const recentBuilds = mockBuilds.filter((b) => !b.featured);

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 sm:py-8 space-y-10">
      {/* メインビジュアル */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
            建築作品を探す
          </h1>
          <p className="mt-1 text-sm sm:text-base text-zinc-500">
            人気のMinecraft建築作品やワークスペースを探索しよう
          </p>
        </div>

        {/* 人気タグ */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/builds"
            className="rounded-full bg-zinc-950 px-3.5 py-1.5 text-sm font-medium text-white shrink-0 hover:bg-zinc-800 transition"
          >
            すべて
          </Link>
          {mockTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 shrink-0 hover:bg-zinc-100 transition"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 注目作品 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
              注目の建築
            </h2>
          </div>
          <Link
            href="/builds?sort=popular"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            もっと見る
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <BuildGrid builds={featuredBuilds} />
      </section>

      {/* 新着作品 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
              新着作品
            </h2>
          </div>
          <Link
            href="/builds?sort=recent"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            すべて見る
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <BuildGrid builds={recentBuilds} />
      </section>
    </div>
  );
}
