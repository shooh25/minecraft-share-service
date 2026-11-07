interface ProfileLinksProps {
  // XのユーザーID
  xUsername: string | null;
  // ウェブサイトのURL
  websiteUrl: string | null;
  // YouTubeのURL
  youtubeUrl: string | null;
}

const linkClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100";

// プロフィールのX / ウェブサイト / YouTubeリンク
export default function ProfileLinks({
  xUsername,
  websiteUrl,
  youtubeUrl,
}: ProfileLinksProps) {
  if (!xUsername && !websiteUrl && !youtubeUrl) return null;

  return (
    <div className="flex items-center ">
      {xUsername && (
        <a
          href={`https://x.com/${xUsername}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="X"
          title="X"
          className={linkClass}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-4.5 w-4.5"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      )}

      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="ウェブサイト"
          title="ウェブサイト"
          className={linkClass}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4.5 w-4.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </a>
      )}

      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="YouTube"
          title="YouTube"
          className={linkClass}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      )}
    </div>
  );
}
