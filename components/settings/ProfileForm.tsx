"use client";

import { useState } from "react";

const fieldClass =
  "w-full rounded-md bg-zinc-100 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition focus:bg-zinc-200 focus:outline-none";
const inputClass = `${fieldClass} h-10`;

// プロフィール編集
export default function ProfileForm() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [xUsername, setXUsername] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="space-y-5"
    >
      {/* プロフィール */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-zinc-900">プロフィール</h2>
        <div className="space-y-2">
          <label
            htmlFor="nickname"
            className="flex items-center gap-2 text-sm font-medium text-zinc-900"
          >
            ニックネーム
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="表示名を入力"
            required
            className={inputClass}
          />
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
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={160}
            rows={4}
            placeholder="建築の好みや活動について自由に書いてください"
            className={`${fieldClass} min-h-32 resize-y py-3`}
          />
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
              name="x_username"
              type="text"
              value={xUsername}
              onChange={(event) => setXUsername(event.target.value)}
              maxLength={15}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`${inputClass} pl-8`}
            />
          </div>
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
            name="youtube_url"
            type="url"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/@username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass}
          />
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
            name="website_url"
            type="url"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://example.com"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={inputClass}
          />
        </div>
      </section>

      {/* 保存 */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-sky-600 px-5 text-sm font-medium leading-none text-white transition hover:bg-sky-700 sm:w-auto"
        >
          保存する
        </button>
      </div>
    </form>
  );
}
