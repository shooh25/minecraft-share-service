import { Suspense } from "react";
import BuildsContent from "@/components/builds/BuildsContent";
import { fetchTags } from "@/lib/tags";

export const instant = false;

// タグの一覧はDBから取得し、表示はクライアント側のBuildsContentが行う
export default async function BuildsPage() {
  const tags = await fetchTags();

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <BuildsContent tags={tags} />
    </Suspense>
  );
}
