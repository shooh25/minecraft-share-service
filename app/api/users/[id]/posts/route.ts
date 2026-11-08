import type { NextRequest } from "next/server";
import { fetchCurrentUser } from "@/lib/auth";
import {
  fetchBuildsPage,
  fetchLikedBuildsPage,
  isValidCursor,
  isValidLikedCursor,
} from "@/lib/posts";
import { isUserId } from "@/lib/users";

// ユーザーページの投稿・いいね一覧の続きを返す
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isUserId(id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");

  // いいね一覧は本人のみ閲覧できる
  if (request.nextUrl.searchParams.get("tab") === "likes") {
    const user = await fetchCurrentUser();
    if (!user) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    if (user.id !== id) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    if (cursor && !isValidLikedCursor(cursor)) {
      return Response.json({ error: "invalid cursor" }, { status: 400 });
    }

    return Response.json(await fetchLikedBuildsPage({ userId: id, cursor }));
  }

  if (cursor && !isValidCursor(cursor, "recent")) {
    return Response.json({ error: "invalid cursor" }, { status: 400 });
  }

  return Response.json(
    await fetchBuildsPage({ authorId: id, sortBy: "recent", cursor }),
  );
}
