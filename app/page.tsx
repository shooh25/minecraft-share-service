import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BuildGrid from "@/components/builds/BuildGrid";
import Tag from "@/components/tags/Tag";
import { mockBuilds, mockTags } from "@/lib/mock-data";

export default function Home() {
  const featuredBuilds = mockBuilds.filter((b) => b.featured);
  const recentBuilds = mockBuilds.filter((b) => !b.featured);

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-6 sm:py-6 space-y-6 sm:space-y-8">
      {/* 人気タグ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {mockTags.map((tag) => (
          <Link key={tag.name} href={`/builds?tag=${encodeURIComponent(tag.name)}`}>
            <Tag>#{tag.name}</Tag>
          </Link>
        ))}
      </div>

      {/* 注目作品 */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900">
            注目の作品
          </h2>
          <Link
            href="/builds?sort=popular"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            もっと見る
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <BuildGrid builds={featuredBuilds} />
      </section>

      {/* 新着作品 */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900">
            新着作品
          </h2>
          <Link
            href="/builds?sort=recent"
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            もっと見る
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <BuildGrid builds={recentBuilds} />
      </section>
    </div>
  );
}
