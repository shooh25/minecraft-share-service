-- アバター画像(R2のオブジェクトキー)。未設定は NULL
alter table public.profiles
  add column avatar_key text
    check (avatar_key is null or btrim(avatar_key) <> '');

-- 本人が更新できる列をニックネームとアバターに限定する
revoke update on table public.profiles from authenticated;
grant update (nickname, avatar_key) on table public.profiles to authenticated;
