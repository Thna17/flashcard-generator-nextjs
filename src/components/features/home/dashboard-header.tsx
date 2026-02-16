import { pressStart } from "@/components/font";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  query?: string;
  playerName?: string;
  brand?: string;
  searchPlaceholder?: string;
  actionPath?: string;
};

export function DashboardHeader({
  query = "",
  playerName = "PLAYER",
  brand = "FLASHGEN",
  searchPlaceholder = "SEARCH_DECKS...",
  actionPath = "/",
}: DashboardHeaderProps) {
  const initial = playerName.trim().slice(0, 1) || "P";

  return (
    <header className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] rounded-none border-0 bg-black px-4 py-4 text-white sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`${pressStart.className} text-base text-[#f28b1c] drop-shadow-[0_2px_0_rgba(0,0,0,0.7)] sm:text-lg`}
          >
            {brand}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-4 sm:w-auto">
          <form action={actionPath} method="get" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder={searchPlaceholder}
              aria-label="Search decks"
              className={`${pressStart.className} w-40 bg-transparent text-right text-[0.55rem] uppercase tracking-[0.35em] text-white/80 placeholder:text-white/60 focus:outline-none sm:w-48`}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="text-white/80 hover:text-white"
              aria-label="Submit search"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.3-4.3m1.8-4.7a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                />
              </svg>
            </Button>
          </form>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white/80 hover:text-white"
            aria-label="Notifications"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0"
              />
            </svg>
          </Button>
          <div className="flex items-center gap-2 text-white/90">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f28b1c] text-[0.6rem] font-bold text-black">
              {initial}
            </span>
            <span
              className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.3em]`}
            >
              {playerName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
