"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function XLogo({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 lg:h-16 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
        {/* ロゴ・ナビゲーション */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950 hover:opacity-80"
          >
            craftshare<span className="text-zinc-400">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-base font-medium text-zinc-600">
            <Link
              href="/builds"
              className="rounded-full px-3.5 py-1.5 text-sm lg:text-base hover:bg-zinc-100 hover:text-zinc-950 transition"
            >
              みんなの作品
            </Link>
          </nav>
        </div>

        {/* 検索バー */}
        <div className="flex-1 max-w-sm sm:max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="作品、タグ、作者を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-sm lg:text-base text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none transition"
            />
          </form>
        </div>

        {/* 投稿・ログインボタン */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/builds/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-sm lg:text-base font-medium text-white hover:bg-zinc-800 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">投稿する</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm lg:text-base font-medium text-zinc-700 hover:bg-zinc-50 transition"
          >
            <XLogo className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">ログイン</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
