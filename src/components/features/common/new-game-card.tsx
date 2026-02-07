import { pressStart } from "@/components/font";
import Link from "next/link";

type NewGameCardProps = {
  title?: string;
  actionLabel?: string;
  helperLabel?: string;
  href?: string;
};

export function NewGameCard({
  title = "NEW GAME",
  actionLabel = "CREATE DECK",
  helperLabel = "+",
  href = "/decks/new",
}: NewGameCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-6 border-4 border-black bg-[#f28b1c] px-6 py-10 text-center shadow-[8px_8px_0px_#000] transition hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      <span
        className={`${pressStart.className} text-lg uppercase tracking-[0.2em] text-black`}
      >
        {title}
      </span>
      <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-black/70 bg-white/20">
        <span className="text-4xl font-black text-black">{helperLabel}</span>
      </div>
      <span
        className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.35em] text-black`}
      >
        {actionLabel}
      </span>
    </Link>
  );
}
