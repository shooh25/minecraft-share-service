import { describe, expect, it } from "vitest";
import { escapeTagQuery } from "@/lib/tags";

describe("escapeTagQuery", () => {
  it("通常の文字はそのまま返す", () => {
    expect(escapeTagQuery("和風")).toBe("和風");
  });

  it("LIKE のワイルドカードをエスケープする", () => {
    expect(escapeTagQuery("50%")).toBe("50\\%");
    expect(escapeTagQuery("a_b")).toBe("a\\_b");
    expect(escapeTagQuery("a\\b")).toBe("a\\\\b");
  });

  it("PostgREST のフィルター構文を壊す文字を除く", () => {
    expect(escapeTagQuery("a,b(c)\"d*e")).toBe("abcde");
  });
});
