import { redirect } from "next/navigation";
import AccountSettings from "@/components/settings/AccountSettings";
import { fetchCurrentUser } from "@/lib/auth";

// アカウント設定
export default async function SettingsAccountPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/");

  return <AccountSettings />;
}
