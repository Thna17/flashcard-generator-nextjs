import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/layout/shell";
import { pressStart } from "@/components/features/auth/auth-fonts";

const stats = [
  {
    label: "TOTAL DECKS",
    value: "12",
  },
  {
    label: "XP GAINED (CARDS)",
    value: "+ 342 XP",
    meta: "[HIGH SCORE]",
    metaIcon: "trophy",
  },
  {
    label: "BRAIN LEVEL",
    value: "LVL 85",
    meta: "SUPER USER",
    metaIcon: "bolt",
  },
];

const decks = [
  { name: "REACTJS", progress: 70, visibility: "locked" },
  { name: "HISTORY_101", progress: 80, visibility: "public" },
  { name: "ANATOMY_BONES", progress: 50, visibility: "locked" },
  { name: "JAPANESE_N5", progress: 80, visibility: "public" },
  { name: "AWS_SOLUTIONS", progress: 100, visibility: "locked" },
];

type DashboardHeaderProps = {
  query: string;
};

function DashboardHeader({ query }: DashboardHeaderProps) {
  return (
    <header className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] rounded-none border-0 bg-black px-4 py-4 text-white sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`${pressStart.className} text-base text-[#f28b1c] drop-shadow-[0_2px_0_rgba(0,0,0,0.7)] sm:text-lg`}
          >
            FLASHGEN
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-4 sm:w-auto">
          <form action="/" method="get" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="SEARCH_DECKS..."
              aria-label="Search decks"
              className={`${pressStart.className} w-40 bg-transparent text-right text-[0.55rem] uppercase tracking-[0.35em] text-white/80 placeholder:text-white/60 focus:outline-none sm:w-48`}
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
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
            </button>
          </form>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
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
          </button>
          <div className="flex items-center gap-2 text-white/90">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f28b1c] text-[0.6rem] font-bold text-black">
              T
            </span>
            <span
              className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.3em]`}
            >
              THNA
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

type HomeProps = {
  searchParams?: { q?: string; active?: string };
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const query =
    typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const activeDeck =
    typeof searchParams?.active === "string" ? searchParams.active : "";
  const normalizedQuery = query.toLowerCase();
  const filteredDecks = normalizedQuery
    ? decks.filter((deck) => deck.name.toLowerCase().includes(normalizedQuery))
    : decks;

  return (
    <Shell header={<DashboardHeader query={query} />} mainClassName="items-stretch gap-10">
      <section className="flex w-full flex-col gap-8">
        <div className="relative w-full overflow-hidden bg-[#d6d2c9] px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,rgba(0,0,0,0.18)_2px,transparent_2px),linear-gradient(45deg,rgba(0,0,0,0.12)_2px,transparent_2px),radial-gradient(circle,rgba(0,0,0,0.18)_1px,transparent_1px)] [background-size:48px_48px,64px_64px,20px_20px]" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-black uppercase tracking-[0.08em] text-black sm:text-4xl">
                GOOD AFTERNOON, PLAYER 1 (THNA)
              </h1>
              <p className="text-base font-medium text-slate-800 sm:text-lg">
                Ready to beat your high score?
              </p>
              {activeDeck ? (
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="rounded-md border border-black/30 bg-white/70 px-2 py-1 text-xs uppercase tracking-[0.3em]">
                    Active Deck
                  </span>
                  <span className={`${pressStart.className} text-[0.65rem] uppercase tracking-[0.25em]`}>
                    {activeDeck}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="auth-card flex flex-col gap-2 rounded-none px-4 py-3 shadow-[8px_8px_0px_#000]"
                >
                  <span
                    className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.35em] text-amber-700`}
                  >
                    {item.label}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.2em] text-zinc-800`}
                    >
                      {item.value}
                    </span>
                    {item.meta ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <span>{item.meta}</span>
                        {item.metaIcon === "trophy" ? (
                          <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 2h12v2h3v3a5 5 0 0 1-5 5h-1.1a6 6 0 0 1-4.9 2.9V18h4v2H8v-2h4v-3.1A6 6 0 0 1 7.1 12H6a5 5 0 0 1-5-5V4h3V2Zm-2 4v1a3 3 0 0 0 3 3h.4A8 8 0 0 1 6 6H4Zm16 0h-2a8 8 0 0 1-1.4 4H17a3 3 0 0 0 3-3V6Z" />
                          </svg>
                        ) : null}
                        {item.metaIcon === "bolt" ? (
                          <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-amber-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
                          </svg>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <details className="group w-full" open>
          <summary className="list-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3 rounded-none border-4 border-black bg-[#b07a54] px-5 py-3 shadow-[6px_6px_0px_#000]">
              <span className="text-base text-black transition-transform duration-200 group-open:rotate-180">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </span>
              <h2
                className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.35em] text-black/80 sm:text-[0.65rem]`}
              >
                DECK CONFIGURATION (METADATA)
              </h2>
            </div>
          </summary>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col items-center justify-center gap-6 border-4 border-black bg-[#f28b1c] px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
              <span
                className={`${pressStart.className} text-lg uppercase tracking-[0.2em] text-black`}
              >
                NEW GAME
              </span>
              <div className="flex h-20 w-20 items-center justify-center rounded-md border-2 border-dashed border-black/70 bg-white/20">
                <span className="text-4xl font-black text-black">+</span>
              </div>
              <span
                className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.35em] text-black`}
              >
                CREATE DECK
              </span>
            </div>

            {filteredDecks.length === 0 ? (
              <div className="auth-card col-span-full flex flex-col items-center justify-center gap-3 rounded-none px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
                <span className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.35em] text-zinc-700`}>
                  No decks found
                </span>
                <p className="text-sm text-slate-700">
                  Try another search keyword.
                </p>
              </div>
            ) : null}

            {filteredDecks.map((deck) => {
              const isActive = activeDeck === deck.name;
              return (
              <div
                key={deck.name}
                className={`flex flex-col gap-5 border-4 border-black bg-white px-6 py-6 shadow-[8px_8px_0px_#000] ${
                  isActive ? "bg-[#fff4e6] shadow-[12px_12px_0px_#000]" : ""
                }`}
              >
                {isActive ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border-2 border-black bg-[#f28b1c] px-2 py-1 text-[0.45rem] font-semibold uppercase tracking-[0.35em] text-black">
                      ACTIVE
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Ready to play
                    </span>
                  </div>
                ) : null}
                <div className="h-3 w-full rounded-md bg-slate-200" />
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
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-md border-2 border-black bg-white px-2 py-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, index) => {
                        const filled = Math.round(deck.progress / 10);
                        return (
                          <span
                            key={`${deck.name}-seg-${index}`}
                            className={`h-2 flex-1 rounded-[2px] ${
                              index < filled ? "bg-[#f28b1c]" : "bg-white"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span
                    className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.2em] text-slate-700`}
                  >
                    {deck.progress}%
                  </span>
                </div>
                <form action="/" method="get" className="self-center">
                  {query ? <input type="hidden" name="q" value={query} /> : null}
                  <input type="hidden" name="active" value={deck.name} />
                  <button
                    type="submit"
                    className={`${pressStart.className} w-full max-w-[180px] rounded-md border-2 border-black bg-[#f28b1c] px-4 py-2 text-[0.55rem] uppercase tracking-[0.35em] text-black shadow-[6px_6px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000]`}
                  >
                    START GAME
                  </button>
                </form>
              </div>
            )})}
          </div>
        </details>
      </section>
    </Shell>
  );
}
