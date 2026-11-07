import { redirect } from "next/navigation";

// /settings はプロフィール設定を開く
export default function SettingsPage() {
  redirect("/settings/profile");
}
