# タスク

- [ ] エラーページを実装する
- [x] ログイン後にもとにいたページに遷移する
- [x] ブックマーク機能
- [ ] ユーザーページの投稿ピン留め
- [ ] ユーザーの属性追加
- [ ] アカウント削除処理
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

# 課題

| # | 画面・操作 | 呼び出し箇所 | 対象の処理 | リロード先 |
|---|---|---|---|---|
| 1 | コレクション削除 | `components/users/UserCollectionDetail.tsx:110` | `deleteCollection` | 対応済み（`/users/{id}?tab=saved&deleted=1`） |
| 2 | コレクション名変更 | `components/users/UserCollectionDetail.tsx:90` | `updateCollectionName` | `/users/{id}?tab=saved&collection={collectionId}` |
| 3 | コレクション作成 | `components/builds/CollectionPickerDialog.tsx:68` | `createCollection` | 現在の投稿ページ |
| 4 | 投稿をコレクションに保存・解除 | `components/builds/CollectionPickerDialog.tsx:93-94` | `savePostToCollection` / `removePostFromCollection` | 現在の投稿ページ |
| 5 | いいね | `components/builds/LikeButton.tsx:41` | `setLiked` | 現在の投稿ページ |
| 6 | フォロー・解除 | `components/follows/FollowButton.tsx:42` | `setFollowing` | 現在のページ（投稿ページ or ユーザーページ） |
| 7 | コメント・返信 | `components/comments/CommentSection.tsx:48` | `createComment` | 現在の投稿ページ |
| 8 | プロフィール保存 | `components/settings/ProfileForm.tsx:73` | `updateProfile` | 対応済み（`/settings/profile` をフルリロード） |
| 9 | サインアウト | `components/settings/AccountSettings.tsx:18` | `supabase.auth.signOut` | 対応済み（`/` をフルリロード） |

