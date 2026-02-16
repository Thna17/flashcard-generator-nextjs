import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { MissionBoard } from "@/components/features/mission/mission-board";
import { Shell } from "@/components/layout/shell";
import { getMissionCardsByDeckId, getMissionDeckBySlug, toMissionSlug } from "@/lib/mission-decks";
import { createClient } from "@/lib/supabase/server";
import { getPlayerName } from "@/lib/user-display-name";

type MissionPageProps = {
  params: Promise<{
    missionSlug: string;
  }>;
};

export default async function MissionPage({ params }: MissionPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const playerName = getPlayerName(user);

  const { missionSlug } = await params;
  const deck = await getMissionDeckBySlug(user.id, missionSlug);

  if (!deck) {
    redirect("/");
  }

  const canonicalSlug = toMissionSlug(deck.deckName);
  const normalizedRequestedSlug = toMissionSlug(decodeURIComponent(missionSlug || "").trim());
  if (canonicalSlug !== normalizedRequestedSlug) {
    redirect(`/missions/${encodeURIComponent(canonicalSlug)}`);
  }

  const missionCards = await getMissionCardsByDeckId(deck.deckId);

  return (
    <Shell
      header={<DashboardHeader playerName={playerName} />}
      mainClassName="items-stretch gap-0 mt-0"
    >
      <MissionBoard
        missionSlug={canonicalSlug}
        missionTitle={deck.deckName}
        cards={missionCards}
      />
    </Shell>
  );
}
