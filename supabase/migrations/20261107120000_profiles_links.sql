-- プロフィールの外部リンク(X / Webサイト / YouTube)
-- - 未設定は NULL(空文字は不可)
-- - X は @ を除いたユーザーIDのみ保存する
-- - Webサイト / YouTube は https の絶対URLを保存する
alter table public.profiles
  add column x_username text
    check (
      x_username is null
      or x_username ~ '^[A-Za-z0-9_]{1,15}$'
    ),
  add column website_url text
    check (
      website_url is null
      or (
        char_length(website_url) <= 300
        and website_url ~ '^https://[^[:space:]]+$'
      )
    ),
  add column youtube_url text
    check (
      youtube_url is null
      or (
        char_length(youtube_url) <= 300
        and youtube_url ~ '^https://(www\.|m\.)?(youtube\.com|youtu\.be)/[^[:space:]]+$'
      )
    );

-- 本人が更新できる列に追加する
grant update (x_username, website_url, youtube_url) on table public.profiles to authenticated;
