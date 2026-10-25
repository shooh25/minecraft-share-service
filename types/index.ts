export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
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
}
