import { redirect } from "next/navigation";

import { toMissionSlug } from "@/lib/mission-decks";

type MissionsIndexPageProps = {
  searchParams?: Promise<{
    active?: string;
  }>;
};

export default async function MissionsIndexPage({ searchParams }: MissionsIndexPageProps) {
  const sp = (await searchParams) ?? {};
  const activeMission = typeof sp.active === "string" ? sp.active.trim() : "";

  if (activeMission) {
    const missionSlug = toMissionSlug(activeMission);
    if (missionSlug) {
      redirect(`/missions/${encodeURIComponent(missionSlug)}`);
    }
  }

  redirect("/");
}
