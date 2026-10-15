import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-10 text-sm text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">CraftShare</span>
            <span>&copy; 2026 Minecraft Share Service</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/about" className="hover:text-zinc-800">
              About
            </Link>
            <Link href="/terms" className="hover:text-zinc-800">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-zinc-800">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:text-zinc-800">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
