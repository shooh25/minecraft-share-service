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

// ログイン中のユーザー(Headerの表示に利用)
export interface SessionUser {
  id: string;
  nickname: string;
}

export interface BuildComment {
  id: string;
  body: string;
  createdAt: string;
  author: User;
}
