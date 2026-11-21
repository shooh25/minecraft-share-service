import { beforeEach, describe, expect, it, vi } from "vitest";
import { imageUrl } from "@/lib/r2";

describe("imageUrl", () => {
  beforeEach(() => {
    vi.stubEnv("R2_PUBLIC_URL", "https://images.example.com");
  });

  it("キーを公開URLに変換する", () => {
    expect(imageUrl("posts/user-id/image.jpg")).toBe(
      "https://images.example.com/posts/user-id/image.jpg",
    );
  });

  it("ベースURLとキーのスラッシュを重複させない", () => {
    vi.stubEnv("R2_PUBLIC_URL", "https://images.example.com/");

    expect(imageUrl("/posts/user-id/image.jpg")).toBe(
      "https://images.example.com/posts/user-id/image.jpg",
    );
  });
});
