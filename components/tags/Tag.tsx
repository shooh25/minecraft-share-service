import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
}

const BASE =
  "inline-flex h-11 shrink-0 whitespace-nowrap rounded-full border-green-700 bg-white px-4 py-3 text-sm sm:text-sm font-medium text-green-700  transition cursor-pointer";

export default function Tag({ children }: TagProps) {
  return <span className={BASE}>{children}</span>;
}
