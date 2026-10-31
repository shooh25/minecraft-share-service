"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Search, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginDialog from "@/components/auth/LoginDialog";
import { createClient } from "@/lib/supabase/client";
import type { SessionUser, Tag } from "@/types";

interface HeaderProps {
  // ログイン中のユーザー(未ログインなら null)
  user: SessionUser | null;
}

// ?loginError=1 はサーバーでは読めないため、ブラウザで描画が始まってから URL を確認する
const emptySubscribe = () => () => {};

const hasLoginError = () =>
  new URLSearchParams(window.location.search).has("loginError");

const getServerLoginError = () => false;

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
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

  // ログアウトして、サーバー側のログイン状態を読み直す
  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } finally {
      setMenuOpen(false);
      setSigningOut(false);
    }
  };

  // ユーザーメニューの外側をクリックしたら閉じる
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (avatarRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  // 候補のタグを選んだら、そのタグで作品一覧を絞り込む
  const selectTag = (name: string) => {
    setSearchQuery("");
    setTagSuggestions([]);
    setSuggestOpen(false);
    router.push(`/builds?tag=${encodeURIComponent(name)}`);
  };

  // 入力が落ち着いてからタグ候補を取得する
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/tags?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;

        const data = (await response.json()) as { tags: Tag[] };
        setTagSuggestions(data.tags);
        setSuggestOpen(data.tags.length > 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("タグ候補の取得に失敗しました", error);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // 検索欄の外側をクリックしたら候補を閉じる
  useEffect(() => {
    if (!suggestOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (searchRef.current?.contains(event.target as Node)) return;
      setSuggestOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [suggestOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white shadow-header">
        <div className="mx-auto flex h-14 lg:h-20 max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
          {/* ロゴ */}
          <Link
            href="/"
            className="shrink-0 text-xl lg:text-2xl font-bold tracking-tight text-zinc-950 hover:opacity-80"
          >
            craftshare<span className="text-zinc-400">.</span>
          </Link>

          {/* 検索バー */}
          <div ref={searchRef} className="flex-1 max-w-sm sm:max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="作品・タグを検索"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSuggestOpen(false);
                }}
                onFocus={() => {
                  if (searchQuery.trim() && tagSuggestions.length > 0) {
                    setSuggestOpen(true);
                  }
                }}
                className="w-full rounded-md bg-zinc-100 py-2.5 pl-9 pr-4 text-sm lg:text-base text-zinc-900 placeholder-zinc-400 focus:bg-zinc-200 focus:outline-none transition"
              />

              {suggestOpen && tagSuggestions.length > 0 && (
                <ul
                  aria-label="タグ候補"
                  className="absolute left-0 right-0 py-2 top-full z-50 mt-2 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-header"
                >
                  {tagSuggestions.map((tag) => (
                    <li
                      key={tag.id}
                      onClick={() => selectTag(tag.name)}
                      className="flex cursor-pointer items-center px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100"
                    >
                      <span className="text-green-700">#</span>
                      <span className="ml-1 truncate text-zinc-900">
                        {tag.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>

          {/* 投稿・ログインボタン */}
          <div
            className={`flex shrink-0 items-center gap-2 ${
              user ? "sm:gap-4" : "sm:gap-3"
            }`}
          >
            <Link
              href="/builds/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3.5 py-2.5 text-sm lg:text-base font-medium text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">投稿する</span>
            </Link>
            {/* ログイン時はユーザーアイコン、未ログイン時はログインボタン */}
            {user ? (
              <div className="relative">
                <button
                  ref={avatarRef}
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="ユーザーメニュー"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition hover:bg-zinc-200"
                >
                  <User className="h-5 w-5" />
                </button>

                {menuOpen && (
                  <div
                    ref={menuRef}
                    role="menu"
                    aria-label="ユーザーメニュー"
                    className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white py-2 shadow-header lg:w-44"
                  >
                    <Link
                      href={`/users/${user.id}`}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-100"
                    >
                      マイページ
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="flex w-full cursor-pointer items-center px-3 py-2.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="inline-flex items-center justify-center rounded-md bg-zinc-100 px-3.5 py-2.5 text-sm lg:text-base font-medium text-zinc-700 hover:bg-zinc-200 transition cursor-pointer"
              >
                <span>ログイン</span>
              </button>
            )}
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
