import type { NextRequest } from "next/server";
import { fetchRelatedPostsPage, isValidRelatedCursor } from "@/lib/posts";

// 関連作品の続きを返す
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cursor = request.nextUrl.searchParams.get("cursor");

  if (cursor && !isValidRelatedCursor(cursor)) {
    return Response.json({ error: "invalid cursor" }, { status: 400 });
  }

  return Response.json(await fetchRelatedPostsPage(id, cursor));
}
