export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
}

export interface Build {
  id: string;
  slug: string;
  description: string;
  images: string[];
  author: User;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  featured?: boolean;
}

export interface Tag {
  name: string;
  count: number;
}
