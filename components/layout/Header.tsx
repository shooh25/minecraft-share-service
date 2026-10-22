"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginDialog from "@/components/auth/LoginDialog";

// ?loginError=1 はサーバーでは読めないため、ブラウザで描画が始まってから URL を確認する
const emptySubscribe = () => () => {};

const hasLoginError = () =>
  new URLSearchParams(window.location.search).has("loginError");

const getServerLoginError = () => false;

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const router = useRouter();

  const errorFromUrl = useSyncExternalStore(
    emptySubscribe,
    hasLoginError,
    getServerLoginError,
  );

  const dialogOpen = loginOpen || (errorFromUrl && !closed);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/builds?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setClosed(true);

    // 認証失敗のパラメータをURLから取り除く
    if (errorFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete("loginError");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  }, [errorFromUrl]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white shadow-header">
        <div className="mx-auto flex h-14 lg:h-20 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          {/* ロゴ */}
          <Link
            href="/"
            className="shrink-0 text-xl lg:text-2xl font-bold tracking-tight text-zinc-950 hover:opacity-80"
          >
            craftshare<span className="text-zinc-400">.</span>
          </Link>

          {/* 検索バー */}
          <div className="flex-1 max-w-sm sm:max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-9 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="作品、タグ、作者を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-zinc-100 py-2.5 pl-[58px] pr-4 text-sm lg:text-base text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none transition"
              />
            </form>
          </div>

          {/* 投稿・ログインボタン */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/builds/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2.5 text-sm lg:text-base font-medium text-white hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">投稿する</span>
            </Link>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-3.5 py-2.5 text-sm lg:text-base font-medium text-zinc-700 hover:bg-zinc-200 transition"
            >
              <span>ログイン</span>
            </button>
          </div>
        </div>
      </header>

      <LoginDialog
        open={dialogOpen}
        error={errorFromUrl && !closed}
        onClose={closeLogin}
      />
    </>
  );
}
