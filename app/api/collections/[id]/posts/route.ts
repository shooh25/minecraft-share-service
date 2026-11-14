import type { NextRequest } from "next/server";
import { fetchCurrentUser } from "@/lib/auth";
import { isCollectionId } from "@/lib/bookmarks";
import {
  fetchCollectionBuildsPage,
  isValidCollectionClipCursor,
} from "@/lib/posts";

// コレクション内の作品一覧の続きを返す
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isCollectionId(id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const user = await fetchCurrentUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");
  if (cursor && !isValidCollectionClipCursor(cursor)) {
    return Response.json({ error: "invalid cursor" }, { status: 400 });
  }

  return Response.json(
    await fetchCollectionBuildsPage({
      collectionId: id,
      userId: user.id,
      cursor,
    }),
  );
}
