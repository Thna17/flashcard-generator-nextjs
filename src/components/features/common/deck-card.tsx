import { pressStart } from "@/components/font";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "./progress";

export type DeckItem = {
  name: string;
  progress: number;
  visibility: "public" | "locked";
};

type DeckCardProps = {
  deck: DeckItem;
  isActive?: boolean;
  query?: string;
  actionPath?: string;
  actionLabel?: string;
};

export function DeckCard({
  deck,
  isActive = false,
  query,
  actionPath = "/",
  actionLabel = "START GAME",
}: DeckCardProps) {
  const editPath = `/decks/${encodeURIComponent(deck.name)}/edit`;
  const missionPath = `/missions/${encodeURIComponent(deck.name)}`;

  return (
    <div
      className={`flex flex-col gap-5 border-4 border-black bg-white px-6 py-6 shadow-[8px_8px_0px_#000] ${
        isActive ? "bg-[#fff4e6] shadow-[12px_12px_0px_#000]" : ""
      }`}
    >
      <div className="h-3 w-full rounded-md bg-slate-300" />
      <div className="flex items-center justify-between rounded-md border-2 border-black bg-black px-4 py-2 text-white">
        <span
          className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.3em]`}
        >
          {deck.name}
        </span>
        {deck.visibility === "public" ? (
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-white/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="h-4 w-4 text-white/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        )}
      </div>
      <Progress name={deck.name} progress={deck.progress} />
      <div className="flex items-center justify-center gap-3">
        <form action={actionPath} method="get">
          {query ? <input type="hidden" name="q" value={query} /> : null}
          <input type="hidden" name="active" value={deck.name} />
          <Button
            type="submit"
            variant="cta"
            size="sm"
            className="w-full max-w-[180px]"
          >
            <Link href={missionPath}>{actionLabel}</Link>
          </Button>
        </form>
        <Button asChild variant="outline" size="sm">
          <Link href={editPath}>EDIT</Link>
        </Button>
      </div>
    </div>
  );
}
