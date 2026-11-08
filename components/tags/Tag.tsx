import type { ReactNode } from "react";

interface TagProps {
  children: ReactNode;
}

const BASE =
  "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap border border-zinc-200 rounded-full border-sky-600 bg-white px-4 text-sm sm:text-sm font-medium leading-none text-sky-600 transition cursor-pointer";

export default function Tag({ children }: TagProps) {
  return <span className={BASE}>{children}</span>;
}
