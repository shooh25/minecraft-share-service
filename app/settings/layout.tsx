import SettingsNav from "@/components/settings/SettingsNav";

// 設定ページの共通レイアウト
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-bold text-zinc-900">設定</h1>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
        <SettingsNav />
        <div className="min-h-96 min-w-0 flex-1 rounded-md bg-white p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
