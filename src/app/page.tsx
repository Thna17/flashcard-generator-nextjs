import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { HomeHero } from "@/components/features/home/home-hero";
import { DeckCard, type DeckItem } from "@/components/features/common/deck-card";
import type { StatsCardProps } from "@/components/features/common/stats-card";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { NewGameCard } from "@/components/features/common/new-game-card";
import { pressStart } from "@/components/font";
import { RetroDropdown } from "@/components/features/common/retro-dropdown";

const stats: StatsCardProps[] = [
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

const decks: DeckItem[] = [
  { name: "REACTJS", progress: 70, visibility: "locked" },
  { name: "HISTORY_101", progress: 80, visibility: "public" },
  { name: "ANATOMY_BONES", progress: 50, visibility: "locked" },
  { name: "JAPANESE_N5", progress: 80, visibility: "public" },
  { name: "AWS_SOLUTIONS", progress: 100, visibility: "locked" },
];

type HomeProps = {
  searchParams?: Promise<{ q?: string; active?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sp = (await searchParams) ?? {};
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const activeDeck = typeof sp.active === "string" ? sp.active : "";

  const normalizedQuery = query.toLowerCase();
  const filteredDecks = normalizedQuery
    ? decks.filter((deck) => deck.name.toLowerCase().includes(normalizedQuery))
    : decks;

  return (
    <Shell
      header={<DashboardHeader query={query} playerName="THNA" />}
      mainClassName="items-stretch gap-10"
    >
      <section className="flex w-full flex-col gap-8">
        <HomeHero
          title="GOOD AFTERNOON, PLAYER 1 (THNA)"
          tagline="Ready to beat your high score?"
          stats={stats}
          activeDeck={activeDeck}
        />

        <div className="flex justify-start">
          <Button asChild variant="cta" size="cta">
            <Link href="/missions/reactjs-interview">PLAY CURRENT MISSION</Link>
          </Button>
        </div>

      <RetroDropdown title="DECK CONFIGURATION (METADATA)" defaultOpen={false} >
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <NewGameCard />

          {decks.length === 0 ? (
            <div className="auth-card col-span-full flex flex-col items-center justify-center gap-3 rounded-none px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
              <span
                className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.35em] text-zinc-700`}
              >
                No decks found
              </span>
              <p className="text-sm text-slate-700">
                Try another search keyword.
              </p>
            </div>
          ) : null}

          {decks.map((deck) => (
            <DeckCard
              key={deck.name}
              deck={deck}
              isActive={activeDeck === deck.name}
              query={query}
              actionPath={"/missions/"}
            />
          ))}
        </div>
      </RetroDropdown>
      </section>
    </Shell>
  );
}
