import { Build } from "@/types";
import BuildCard from "./BuildCard";

interface BuildGridProps {
  builds: Build[];
  emptyMessage?: string;
}

export default function BuildGrid({
  builds,
  emptyMessage = "作品がまだありません",
}: BuildGridProps) {
  if (builds.length === 0) {
    return (
      <div className="py-20 text-center text-base text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
      {builds.map((build) => (
        <BuildCard key={build.id} build={build} />
      ))}
    </div>
  );
}
