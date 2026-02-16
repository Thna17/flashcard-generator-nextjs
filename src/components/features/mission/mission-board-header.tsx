import { pressStart, spaceGrotesk } from "@/components/font";

import { Progress } from "../common/progress";

type MissionBoardHeaderProps = {
  title: string;
  currentLevel: number;
  totalLevels: number;
  missionProgress: number;
  answeredCount: number;
  totalCards: number;
};

export function MissionBoardHeader({
  title,
  currentLevel,
  totalLevels,
  missionProgress,
  answeredCount,
  totalCards,
}: MissionBoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pt-8 sm:pt-10">
      <h1 className={`${pressStart.className}`}>CURRENT MISSION: {title}</h1>
      <p className={`${spaceGrotesk.className}`}>
        PROGRESS: LEVEL {currentLevel} / {totalLevels}
      </p>
      <div>
        <Progress name={title} progress={missionProgress} />
      </div>
      <p className={`${pressStart.className} text-[0.5rem] tracking-[0.18em] text-slate-700`}>
        SESSION: {answeredCount} / {totalCards}
      </p>
    </div>
  );
}
