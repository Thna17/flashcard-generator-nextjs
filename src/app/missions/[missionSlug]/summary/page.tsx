import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { MissionSummaryBoard } from "@/components/features/mission/mission-summary-board";
import { Shell } from "@/components/layout/shell";
import { getMissionCardsByDeckId, getMissionDeckBySlug, toMissionSlug } from "@/lib/mission-decks";
import { saveStudySessionForUser } from "@/lib/study-sessions";
import { createClient } from "@/lib/supabase/server";
import { getPlayerName } from "@/lib/user-display-name";

type MissionSummaryPageProps = {
  params: Promise<{
    missionSlug: string;
  }>;
  searchParams?: Promise<{
    hits?: string;
    misses?: string;
    total?: string;
    accuracy?: string;
    saved?: string;
  }>;
};

function parseIntOrFallback(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildSummaryUrl(
  missionSlug: string,
  params: {
    hits: number;
    misses: number;
    total: number;
    accuracy: number;
    saved?: string;
  },
) {
  const sp = new URLSearchParams({
    hits: String(params.hits),
    misses: String(params.misses),
    total: String(params.total),
    accuracy: String(params.accuracy),
  });

  if (params.saved) {
    sp.set("saved", params.saved);
  }

  return `/missions/${encodeURIComponent(missionSlug)}/summary?${sp.toString()}`;
}

export default async function MissionSummaryPage({
  params,
  searchParams,
}: MissionSummaryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const playerName = getPlayerName(user);

  const { missionSlug } = await params;
  const missionDeck = await getMissionDeckBySlug(user.id, missionSlug);
  const sp = (await searchParams) ?? {};

  if (!missionDeck) {
    redirect("/");
  }

  const canonicalSlug = toMissionSlug(missionDeck.deckName);
  const normalizedRequestedSlug = toMissionSlug(decodeURIComponent(missionSlug || "").trim());
  const missionCards = await getMissionCardsByDeckId(missionDeck.deckId);
  const defaultTotal = Math.max(missionCards.length, 1);
  const totalCards = Math.max(1, parseIntOrFallback(sp.total, defaultTotal));
  const hits = Math.min(totalCards, Math.max(0, parseIntOrFallback(sp.hits, 0)));
  const misses = Math.min(
    totalCards - hits,
    Math.max(0, parseIntOrFallback(sp.misses, totalCards - hits)),
  );
  const derivedAccuracy = totalCards > 0 ? Math.round((hits / totalCards) * 100) : 0;
  const accuracy = Math.min(
    100,
    Math.max(0, parseIntOrFallback(sp.accuracy, derivedAccuracy)),
  );
  const hasSessionPayload =
    typeof sp.hits === "string" ||
    typeof sp.misses === "string" ||
    typeof sp.total === "string" ||
    typeof sp.accuracy === "string";
  const alreadySaved = sp.saved === "1";
  const summaryUrl = buildSummaryUrl(canonicalSlug, {
    hits,
    misses,
    total: totalCards,
    accuracy,
    saved: alreadySaved ? "1" : undefined,
  });

  if (canonicalSlug !== normalizedRequestedSlug) {
    redirect(summaryUrl);
  }

  if (hasSessionPayload && !alreadySaved) {
    try {
      await saveStudySessionForUser({
        authUserId: user.id,
        deckId: missionDeck.deckId,
        scorePercent: accuracy,
      });
    } catch (error) {
      console.error("Failed to store study session score:", error);
    }

    redirect(
      buildSummaryUrl(canonicalSlug, {
        hits,
        misses,
        total: totalCards,
        accuracy,
        saved: "1",
      }),
    );
  }

  return (
    <Shell
      header={<DashboardHeader playerName={playerName} />}
      mainClassName="items-stretch gap-0 mt-0"
    >
      <MissionSummaryBoard
        missionTitle={missionDeck.deckName}
        missionSlug={canonicalSlug}
        totalCards={totalCards}
        hits={hits}
        misses={misses}
        accuracy={accuracy}
      />
    </Shell>
  );
}
