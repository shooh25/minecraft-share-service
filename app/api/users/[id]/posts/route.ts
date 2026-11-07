import type { NextRequest } from "next/server";
import { fetchBuildsPage, isValidCursor } from "@/lib/posts";
import { isUserId } from "@/lib/users";

// ユーザーページの投稿一覧の続きを返す
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isUserId(id)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const cursor = request.nextUrl.searchParams.get("cursor");

  if (cursor && !isValidCursor(cursor, "recent")) {
    return Response.json({ error: "invalid cursor" }, { status: 400 });
  }

  return Response.json(
    await fetchBuildsPage({ authorId: id, sortBy: "recent", cursor }),
  );
}
