-- 自己紹介文(プロフィール)
-- - 未設定は NULL(空文字は不可)
-- - 160文字まで。前後の空白は除いて判定する(1〜160文字)
alter table public.profiles
  add column bio text
    check (bio is null or char_length(btrim(bio)) between 1 and 160);

-- 本人が更新できる列に自己紹介文を追加する
grant update (bio) on table public.profiles to authenticated;
