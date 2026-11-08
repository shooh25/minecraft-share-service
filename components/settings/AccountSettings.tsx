"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// アカウント設定
export default function AccountSettings() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // サインアウトしてトップへ戻る
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-zinc-900">アカウント</h2>

      {/* サインアウト */}
      <section className="space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-zinc-900">サインアウト</h3>
          <p className="text-sm text-zinc-700">
            この端末からサインアウトします。いつでも再度サインインできます。
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-zinc-100 px-2 text-sm font-medium leading-none text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-3.5"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {signingOut ? "サインアウト中..." : "サインアウト"}
        </button>
      </section>

      {/* アカウント削除 */}
      <section className="space-y-3 rounded-md border border-red-200 bg-red-50 p-5">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-red-700">アカウント削除</h3>
          <p className="text-sm text-red-700">
            アカウントを削除すると、投稿した作品やコメントなどのデータがすべて削除され、元に戻すことはできません。
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-medium leading-none text-white transition hover:bg-red-700 sm:w-auto"
        >
          <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          アカウントを削除
        </button>
      </section>
    </div>
  );
}
