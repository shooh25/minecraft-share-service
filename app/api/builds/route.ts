import type { NextRequest } from "next/server";
import { parseFilters } from "@/lib/build-filters";
import { fetchBuildsPage, isValidCursor } from "@/lib/posts";

// 作品一覧の続きを返す
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { sortBy, tag, query } = parseFilters(params);
  const cursor = params.get("cursor");

  if (cursor && !isValidCursor(cursor, sortBy)) {
    return Response.json({ error: "invalid cursor" }, { status: 400 });
  }

  return Response.json(await fetchBuildsPage({ tag, query, sortBy, cursor }));
}
