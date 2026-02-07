import { redirect } from "next/navigation";

import { HomeDeckSection } from "@/components/features/home/home-deck-section";
import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { HomeHero } from "@/components/features/home/home-hero";
import type { DeckItem } from "@/components/features/common/deck-card";
import type { StatsCardProps } from "@/components/features/common/stats-card";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";

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

        <HomeDeckSection
          decks={filteredDecks}
          query={query}
          activeDeck={activeDeck}
          actionPath="/"
        />
      </section>
    </Shell>
  );
}
