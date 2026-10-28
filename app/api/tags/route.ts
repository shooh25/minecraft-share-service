import type { NextRequest } from "next/server";
import { searchTags } from "@/lib/tags";

// 検索欄のタグ候補を返す
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (!query || query.length > 20) {
    return Response.json({ tags: [] });
  }

  return Response.json({ tags: await searchTags(query) });
}
