import { redirect } from "next/navigation";
import ProfileForm from "@/components/settings/ProfileForm";
import { fetchCurrentUser } from "@/lib/auth";
import { fetchProfile } from "@/lib/users";

// プロフィール設定
export default async function SettingsProfilePage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/");

  const profile = await fetchProfile(user.id);
  if (!profile) redirect("/");

  return (
    <ProfileForm
      initialProfile={{
        nickname: profile.nickname,
        bio: profile.bio ?? "",
        xUsername: profile.xUsername ?? "",
        websiteUrl: profile.websiteUrl ?? "",
        youtubeUrl: profile.youtubeUrl ?? "",
      }}
    />
  );
}
