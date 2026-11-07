import { describe, expect, it } from "vitest";
import { validateProfileInput } from "@/lib/profiles";

const base = {
  nickname: "そらいろ建築士",
  bio: "湖上の城を作っています。",
  xUsername: "sorairo_arch",
  websiteUrl: "https://example.com/portfolio",
  youtubeUrl: "https://www.youtube.com/@sorairo_arch",
};

describe("validateProfileInput: プロフィール入力の検証", () => {
  it("正しい入力をそのまま通す", () => {
    const result = validateProfileInput(base);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.values).toEqual(base);
  });

  it("前後の空白を除き、Xの@を外す", () => {
    const result = validateProfileInput({
      ...base,
      nickname: "  そらいろ建築士  ",
      bio: "  自己紹介  ",
      xUsername: " @sorairo_arch ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.nickname).toBe("そらいろ建築士");
      expect(result.values.bio).toBe("自己紹介");
      expect(result.values.xUsername).toBe("sorairo_arch");
    }
  });

  it("任意項目が空なら空文字を返す", () => {
    const result = validateProfileInput({
      nickname: "name",
      bio: "",
      xUsername: "",
      websiteUrl: "",
      youtubeUrl: "",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.bio).toBe("");
      expect(result.values.xUsername).toBe("");
      expect(result.values.websiteUrl).toBe("");
      expect(result.values.youtubeUrl).toBe("");
    }
  });

  it("ニックネームが空ならエラー", () => {
    const result = validateProfileInput({ ...base, nickname: "   " });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.nickname).toBeTruthy();
  });

  it("自己紹介が160文字を超えたらエラー", () => {
    const result = validateProfileInput({ ...base, bio: "あ".repeat(161) });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.bio).toContain("160文字");
  });

  it("XのユーザーIDが不正ならエラー", () => {
    for (const xUsername of ["sorairo-arch", "a".repeat(16), "@sorairo-arch"]) {
      const result = validateProfileInput({ ...base, xUsername });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.xUsername).toBeTruthy();
    }
  });

  it("ウェブサイトのスキームがなければhttpsを補完する", () => {
    const result = validateProfileInput({
      ...base,
      websiteUrl: "example.com/portfolio",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.websiteUrl).toBe("https://example.com/portfolio");
    }
  });

  it("httpはhttpsに置き換える", () => {
    const result = validateProfileInput({
      ...base,
      websiteUrl: "http://example.com",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.websiteUrl).toBe("https://example.com/");
    }
  });

  it("https以外のスキームはエラー", () => {
    const result = validateProfileInput({
      ...base,
      websiteUrl: "ftp://example.com",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.websiteUrl).toBeTruthy();
  });

  it("YouTube以外のURLはエラー", () => {
    for (const youtubeUrl of [
      "https://vimeo.com/123",
      "https://www.youtube.com",
      "https://www.youtube.com/",
    ]) {
      const result = validateProfileInput({ ...base, youtubeUrl });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.youtubeUrl).toBeTruthy();
    }
  });

  it("複数の項目のエラーをまとめて返す", () => {
    const result = validateProfileInput({
      nickname: "",
      bio: "あ".repeat(161),
      xUsername: "bad-name",
      websiteUrl: "ftp://example.com",
      youtubeUrl: "https://vimeo.com/123",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "bio",
        "nickname",
        "websiteUrl",
        "xUsername",
        "youtubeUrl",
      ]);
    }
  });

  it("youtu.beの動画URLは通す", () => {
    const result = validateProfileInput({
      ...base,
      youtubeUrl: "https://youtu.be/abc123",
    });

    expect(result.ok).toBe(true);
  });
});
