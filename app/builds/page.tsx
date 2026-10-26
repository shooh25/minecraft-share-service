import { Suspense } from "react";
import BuildsContent from "@/components/builds/BuildsContent";
import { fetchTags } from "@/lib/tags";
import { fetchBuilds } from "@/lib/posts";

export const instant = false;

// タグと作品の一覧はDBから取得し、表示はクライアント側のBuildsContentが行う
export default async function BuildsPage({
  searchParams,
}: PageProps<"/builds">) {
  const { tag } = await searchParams;
  const tagName = typeof tag === "string" ? tag : null;

  const [tags, builds] = await Promise.all([
    fetchTags(),
    fetchBuilds(tagName),
  ]);

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BuildsContent tags={tags} builds={builds} />
    </Suspense>
  );
}
