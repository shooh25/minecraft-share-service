"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Settings, User } from "lucide-react";

const items = [
  { href: "/settings/profile", label: "プロフィール", Icon: User },
  { href: "/settings/account", label: "アカウント", Icon: Settings },
  { href: "/settings/support", label: "サポート", Icon: CircleHelp },
];

// 設定ページの左側タブ
export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="設定"
      className="scrollbar-none flex shrink-0 gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible"
    >
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm leading-none transition ${
              active
                ? "bg-white text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
          >
            <item.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
