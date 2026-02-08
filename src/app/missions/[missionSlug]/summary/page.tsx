import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { MissionSummaryBoard } from "@/components/features/mission/mission-summary-board";
import { Shell } from "@/components/layout/shell";
import { getMissionBySlug } from "@/lib/missions";
import { createClient } from "@/lib/supabase/server";

type MissionSummaryPageProps = {
  params: Promise<{
    missionSlug: string;
  }>;
  searchParams?: Promise<{
    hits?: string;
    misses?: string;
    total?: string;
    accuracy?: string;
  }>;
};

function parseIntOrFallback(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
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

  const { missionSlug } = await params;
  const mission = getMissionBySlug(missionSlug);
  const sp = (await searchParams) ?? {};

  if (!mission) {
    redirect("/missions/reactjs-interview");
  }

  const defaultTotal = Math.max(mission.cards.length, 1);
  const totalCards = Math.max(1, parseIntOrFallback(sp.total, defaultTotal));
  const hits = Math.min(
    totalCards,
    Math.max(0, parseIntOrFallback(sp.hits, Math.round((mission.progress / 100) * totalCards))),
  );
  const misses = Math.min(
    totalCards - hits,
    Math.max(0, parseIntOrFallback(sp.misses, totalCards - hits)),
  );
  const derivedAccuracy = totalCards > 0 ? Math.round((hits / totalCards) * 100) : 0;
  const accuracy = Math.min(
    100,
    Math.max(0, parseIntOrFallback(sp.accuracy, derivedAccuracy)),
  );

  return (
    <Shell
      header={<DashboardHeader playerName="THNA" />}
      mainClassName="items-stretch gap-0 mt-0"
    >
      <MissionSummaryBoard
        missionTitle={mission.title}
        missionSlug={mission.slug}
        totalCards={totalCards}
        hits={hits}
        misses={misses}
        accuracy={accuracy}
      />
    </Shell>
  );
}
