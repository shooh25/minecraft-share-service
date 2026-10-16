import type { ReactNode } from "react";

interface TagProps {
  /** 選択中はダークスタイルで強調表示する */
  active?: boolean;
  children: ReactNode;
}

const BASE =
  "inline-flex shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition";
const ACTIVE = "bg-zinc-950 text-white hover:bg-zinc-800";
const INACTIVE = "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100";

export default function Tag({ active = false, children }: TagProps) {
  return <span className={`${BASE} ${active ? ACTIVE : INACTIVE}`}>{children}</span>;
}
