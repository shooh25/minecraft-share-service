import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
}

const BASE =
  "inline-flex shrink-0 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-zinc-700 hover:bg-zinc-100 transition";

export default function Tag({ children }: TagProps) {
  return <span className={BASE}>{children}</span>;
}
