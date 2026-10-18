import { Build, Tag, User } from "@/types";

export const mockUsers: Record<string, User> = {
  alex: {
    id: "user-1",
    username: "alex_craft",
    displayName: "Alex Builder",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    bio: "中世・ファンタジー建築がメインです。サバイバルで作っています。",
  },
  steve: {
    id: "user-2",
    username: "steve_redstone",
    displayName: "Steve R.",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    bio: "和風建築と自動化機構の融合を目指しています。",
  },
  craft_queen: {
    id: "user-3",
    username: "craft_queen",
    displayName: "Queen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    bio: "モダン建築・内装インテリア専門です！",
  },
};

export const mockBuilds: Build[] = [
  {
    id: "build-1",
    slug: "fantasy-water-castle",
    description: "サバイバルで3ヶ月かけて建築した湖上の城です。夜景のライティングにこだわりました。",
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.alex,
    tags: ["城", "ファンタジー", "サバイバル", "大規模建築"],
    likesCount: 342,
    commentsCount: 28,
    createdAt: "2026-10-10",
    featured: true,
  },
  {
    id: "build-2",
    slug: "japanese-traditional-temple",
    description: "和風ブロックを中心に使用した寺院建築です。庭園の配置に工夫を凝らしました。",
    images: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.steve,
    tags: ["和風", "寺院", "庭園"],
    likesCount: 289,
    commentsCount: 15,
    createdAt: "2026-10-12",
    featured: true,
  },
  {
    id: "build-3",
    slug: "modern-minimalist-villa",
    description: "白のコンクリートと板ガラスを基調としたミニマルな高級別荘です。",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.craft_queen,
    tags: ["モダン", "別荘", "内装"],
    likesCount: 195,
    commentsCount: 9,
    createdAt: "2026-10-14",
    featured: true,
  },
  {
    id: "build-4",
    slug: "steampunk-airship-dock",
    description: "真鍮と銅のブロックを多用したレトロフューチャーな飛行船発着場です。",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.alex,
    tags: ["スチームパンク", "乗り物", "クリエイティブ"],
    likesCount: 142,
    commentsCount: 7,
    createdAt: "2026-10-15",
    featured: false,
  },
  {
    id: "build-5",
    slug: "cozy-forest-cabin",
    description: "サバイバル序盤にも作れるアットホームなログハウス。煙突から煙が出ます。",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.steve,
    tags: ["民家", "サバイバル", "小型建築"],
    likesCount: 88,
    commentsCount: 4,
    createdAt: "2026-10-15",
    featured: false,
  },
  {
    id: "build-6",
    slug: "cyberpunk-neon-district",
    description: "エンドロッドと色付きガラスを大量に配置した近未来のネオン街路です。",
    images: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    ],
    author: mockUsers.craft_queen,
    tags: ["近未来", "街並み", "夜景"],
    likesCount: 231,
    commentsCount: 19,
    createdAt: "2026-10-13",
    featured: false,
  },
];

export const mockTags: Tag[] = [
  { name: "城", count: 124 },
  { name: "和風", count: 98 },
  { name: "モダン", count: 85 },
  { name: "サバイバル", count: 72 },
  { name: "ファンタジー", count: 64 },
  { name: "民家", count: 53 },
  { name: "庭園", count: 39 },
  { name: "内装", count: 34 },
];
