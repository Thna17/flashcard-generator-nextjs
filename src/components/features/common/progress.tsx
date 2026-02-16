import { pressStart } from "@/components/font";
import { useMemo } from "react";


type ProgressProps = {
    name: string;
    progress: number;
}
export function Progress({ name, progress }: ProgressProps) {
  const filledSegments = useMemo(() => {
    return Math.min(10, Math.max(0, Math.round(progress / 10)));
  }, [progress]);
  return (
    <div className="flex items-center gap-3 max-w-xs">
      <div className="flex-1 rounded-md border-2 border-black bg-white px-2 py-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={`${name}-seg-${index}`}
              className={`h-2 flex-1 rounded-[2px] ${
                index < filledSegments ? "bg-[#f28b1c]" : "bg-white"
              }`}
            />
          ))}
        </div>
      </div>
      <span
        className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.2em] text-slate-700`}
      >
        {progress}%
      </span>
    </div>
  );
}
