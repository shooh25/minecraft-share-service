"use client";

import { useState, useTransition, type FormEvent } from "react";
import Toast, { type ToastType } from "@/components/ui/Toast";
import { updateProfile } from "@/app/actions/profiles";
import type { ProfileFieldErrors, ProfileValues } from "@/lib/profiles";

const fieldClass =
  "w-full rounded-md bg-zinc-100 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:bg-zinc-200 focus:outline-none";
const inputClass = `${fieldClass} h-10`;

interface ProfileFormProps {
  // 現在保存されているプロフィール
  initialProfile: ProfileValues;
}

// プロフィール編集
export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [bio, setBio] = useState(initialProfile.bio);
  const [xUsername, setXUsername] = useState(initialProfile.xUsername);
  const [youtubeUrl, setYoutubeUrl] = useState(initialProfile.youtubeUrl);
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile.websiteUrl);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [message, setMessage] = useState<{
    type: ToastType;
    text: string;
  } | null>(null);

  const clearError = (field: keyof ProfileFieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    setMessage(null);
    setErrors({});

    startTransition(async () => {
      try {
        const result = await updateProfile({
          nickname,
          bio,
          xUsername,
          websiteUrl,
          youtubeUrl,
        });

        if (!result.ok) {
          setErrors(result.errors);
          if (result.message) {
            setMessage({ type: "error", text: result.message });
          }
          return;
        }

        // 保存された正規化後の値に表示を合わせる
        setNickname(result.values.nickname);
        setBio(result.values.bio);
        setXUsername(result.values.xUsername);
        setYoutubeUrl(result.values.youtubeUrl);
        setWebsiteUrl(result.values.websiteUrl);
        setMessage({ type: "success", text: "保存しました" });
      } catch {
        setMessage({
          type: "error",
          text: "保存に失敗しました。時間をおいて再度お試しください。",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* プロフィール */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-zinc-900">プロフィール</h2>
        <div className="space-y-2">
          <label
            htmlFor="nickname"
            className="flex items-center gap-2 text-sm font-medium text-zinc-900"
          >
            ニックネーム
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value);
              clearError("nickname");
            }}
            placeholder="表示名を入力"
            required
            aria-invalid={Boolean(errors.nickname)}
            className={inputClass}
          />
          {errors.nickname && (
            <p className="text-xs text-red-600">{errors.nickname}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="bio"
              className="text-sm font-medium text-zinc-900"
            >
              自己紹介
            </label>
            <span className="text-sm text-zinc-500">{bio.length} / 160</span>
          </div>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => {
              setBio(event.target.value);
              clearError("bio");
            }}
            maxLength={160}
            placeholder="建築の好みや活動について自由に書いてください"
            aria-invalid={Boolean(errors.bio)}
            className={`${fieldClass} min-h-32 resize-y py-3`}
          />
          {errors.bio && (
            <p className="text-xs text-red-600">{errors.bio}</p>
          )}
        </div>
      </section>

      {/* ソーシャルリンク */}
      <section className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="x-username"
            className="block text-sm font-medium text-zinc-900"
          >
            X（Twitter）ユーザー名
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              @
            </span>
            <input
              id="x-username"
              value={xUsername}
              onChange={(event) => {
                setXUsername(event.target.value);
                clearError("xUsername");
              }}
              maxLength={15}
              placeholder="username"
              aria-invalid={Boolean(errors.xUsername)}
              className={`${inputClass} pl-8`}
            />
          </div>
          {errors.xUsername && (
            <p className="text-xs text-red-600">{errors.xUsername}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-zinc-900"
          >
            YouTube
          </label>
          <input
            id="youtube-url"
            value={youtubeUrl}
            onChange={(event) => {
              setYoutubeUrl(event.target.value);
              clearError("youtubeUrl");
            }}
            placeholder="https://www.youtube.com/@username"
            aria-invalid={Boolean(errors.youtubeUrl)}
            className={inputClass}
          />
          {errors.youtubeUrl && (
            <p className="text-xs text-red-600">{errors.youtubeUrl}</p>
          )}
        </div>
      </section>

      {/* ウェブサイト */}
      <section>
        <div className="space-y-2">
          <label
            htmlFor="website-url"
            className="block text-sm font-medium text-zinc-900"
          >
            あなたのウェブサイト
          </label>
          <input
            id="website-url"
            value={websiteUrl}
            onChange={(event) => {
              setWebsiteUrl(event.target.value);
              clearError("websiteUrl");
            }}
            placeholder="https://example.com"
            aria-invalid={Boolean(errors.websiteUrl)}
            className={inputClass}
          />
          {errors.websiteUrl && (
            <p className="text-xs text-red-600">{errors.websiteUrl}</p>
          )}
        </div>
      </section>

      {/* 保存 */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-sky-600 px-5 text-sm font-medium leading-none text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? "保存中..." : "保存する"}
        </button>
      </div>

      {/* 保存結果のメッセージ */}
      <Toast
        message={message?.text ?? null}
        type={message?.type}
        onClose={() => setMessage(null)}
      />
    </form>
  );
}
