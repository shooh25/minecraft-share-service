export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
}

export interface Build {
  id: string;
  description: string;
  images: string[];
  author: User;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

// 作品一覧の1ページ分。nextCursor が null なら末尾
export interface BuildPage {
  builds: Build[];
  nextCursor: string | null;
}

// ログイン中のユーザー
export interface SessionUser {
  id: string;
  nickname: string;
}

export interface BuildComment {
  id: string;
  body: string;
  createdAt: string;
  author: User;
  // 返信先のニックネーム(トップレベルは null)。返信の「@名前」表示に使う
  parentNickname: string | null;
  // このコメントに付いた返信(スレッド内で古い順)
  replies: BuildComment[];
}
