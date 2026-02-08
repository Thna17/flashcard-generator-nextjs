import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { MissionBoard } from "@/components/features/mission/mission-board";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";

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

  const { missionSlug } = await params;
  

  return (
    <Shell
      header={<DashboardHeader playerName="THNA" />}
      mainClassName="items-stretch gap-0 mt-0"
    >
      <MissionBoard missionSlug={missionSlug} />
    </Shell>
  );
}
