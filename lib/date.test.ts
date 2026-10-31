import { describe, expect, it } from "vitest";
import { formatDate } from "@/lib/date";

describe("formatDate", () => {
  it("UTCの日時をJSTの年月日にする", () => {
    expect(formatDate("2026-10-18T12:00:00+00:00")).toBe("2026年10月18日");
  });

  it("JSTで日付をまたぐ場合は翌日になる", () => {
    expect(formatDate("2026-10-18T20:00:00+00:00")).toBe("2026年10月19日");
  });

  it("Dateも受け取れる", () => {
    expect(formatDate(new Date("2026-01-05T00:00:00+00:00"))).toBe(
      "2026年1月5日",
    );
  });
});
