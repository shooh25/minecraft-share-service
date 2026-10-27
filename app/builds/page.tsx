import { Suspense } from "react";
import BuildsContent from "@/components/builds/BuildsContent";
import { parseFilters } from "@/lib/build-filters";
import { fetchTags } from "@/lib/tags";
import { fetchBuildsPage } from "@/lib/posts";

export const instant = false;

// タグと初回の作品一覧はDBから直接取得し、続きはAPI経由で読み込む
export default async function BuildsPage({
  searchParams,
}: PageProps<"/builds">) {
  const { sortBy, tag, query } = parseFilters(await searchParams);

  const [tags, page] = await Promise.all([
    fetchTags(),
    fetchBuildsPage({ tag, query, sortBy }),
  ]);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BuildsContent
        // 条件が変わったら、読み込み済みの一覧を先頭から作り直す
        key={JSON.stringify({ tag, sortBy, query })}
        tags={tags}
        initialBuilds={page.builds}
        initialNextCursor={page.nextCursor}
      />
    </Suspense>
  );
}
