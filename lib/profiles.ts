// プロフィール編集の入力値
export interface ProfileInput {
  nickname: string;
  bio: string;
  xUsername: string;
  websiteUrl: string;
  youtubeUrl: string;
}

// 正規化後のプロフィール編集の入力値(未設定は空文字)
export type ProfileValues = ProfileInput;

// プロフィール編集の入力項目
export type ProfileField = keyof ProfileInput;

// 入力項目ごとのエラー
export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

// プロフィール編集の検証結果
export type ProfileValidation =
  | { ok: true; values: ProfileValues }
  | { ok: false; errors: ProfileFieldErrors };

// プロフィール更新の結果
export type ProfileUpdateResult =
  | { ok: true; values: ProfileValues }
  | { ok: false; errors: ProfileFieldErrors; message?: string };

const X_USERNAME = /^[A-Za-z0-9_]{1,15}$/;
const URL_MAX_LENGTH = 300;

// httpsの絶対URLに正規化する
function normalizeUrl(value: string): string | null {
  let candidate = value.trim();
  if (!candidate) return null;

  if (/^http:\/\//i.test(candidate)) {
    candidate = `https://${candidate.slice(7)}`;
  } else if (!/^https:\/\//i.test(candidate)) {
    // https以外のスキームは許可しない
    if (/^[a-z][a-z0-9+.-]*:/i.test(candidate)) return null;
    candidate = `https://${candidate}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || !url.hostname) return null;
  if (url.href.length > URL_MAX_LENGTH) return null;

  return url.href;
}

// YouTubeのチャンネル・動画URLか
function isYoutubeUrl(value: string): boolean {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();

  if (
    host !== "youtube.com" &&
    host !== "www.youtube.com" &&
    host !== "m.youtube.com" &&
    host !== "youtu.be"
  ) {
    return false;
  }

  // ドメイン直下だけのURLは許可しない
  return url.pathname.length > 1;
}

// 入力値をDBの制約に合わせて検証・正規化する
export function validateProfileInput(input: ProfileInput): ProfileValidation {
  const errors: ProfileFieldErrors = {};

  const nickname = input.nickname.trim();
  if (!nickname) {
    errors.nickname = "ニックネームを入力してください";
  }

  const bio = input.bio.trim();
  if ([...bio].length > 160) {
    errors.bio = "自己紹介は160文字以内で入力してください";
  }

  // 先頭の @ は除いてユーザーIDだけを保存する
  const xUsername = input.xUsername.trim().replace(/^@+/, "");
  if (xUsername && !X_USERNAME.test(xUsername)) {
    errors.xUsername =
      "XのユーザーIDは半角英数字とアンダースコア15文字以内で入力してください";
  }

  const websiteUrl = normalizeUrl(input.websiteUrl);
  if (input.websiteUrl.trim() && !websiteUrl) {
    errors.websiteUrl = "ウェブサイトはhttpsのURLを入力してください";
  }

  const youtubeUrl = normalizeUrl(input.youtubeUrl);
  if (input.youtubeUrl.trim() && (!youtubeUrl || !isYoutubeUrl(youtubeUrl))) {
    errors.youtubeUrl = "YouTubeのURLを入力してください";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    values: {
      nickname,
      bio,
      xUsername,
      websiteUrl: websiteUrl ?? "",
      youtubeUrl: youtubeUrl ?? "",
    },
  };
}
