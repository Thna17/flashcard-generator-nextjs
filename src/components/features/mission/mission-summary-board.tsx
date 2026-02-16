import Link from "next/link";

import { pressStart, spaceGrotesk } from "@/components/font";
import { Button } from "@/components/ui/button";
import { RetroDropdown } from "../common/retro-dropdown";

type MissionSummaryBoardProps = {
  missionTitle: string;
  missionSlug: string;
  totalCards: number;
  hits: number;
  misses: number;
  accuracy: number;
};

type SegmentMeterProps = {
  value: number;
};

function SegmentMeter({ value }: SegmentMeterProps) {
  const filledSegments = Math.min(10, Math.max(0, Math.round(value / 10)));

  return (
    <div className="w-full rounded-none border-2 border-black bg-[#f4f4f4] p-1">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={`segment-${index}`}
            className={`h-5 ${
              index < filledSegments ? "bg-[#f7931e]" : "bg-[#e1e1e1]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryMetaCard({
  title,
  value,
  meta,
}: {
  title: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="border-4 border-black bg-[#dedede] px-4 py-4 shadow-[8px_8px_0px_#000]">
      <p
        className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-black`}
      >
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold leading-none text-black">
        {value}
      </p>
      <p
        className={`${spaceGrotesk.className} mt-2 text-base font-semibold uppercase tracking-[0.04em] text-black`}
      >
        {meta}
      </p>
    </div>
  );
}

function getRankFromAccuracy(accuracy: number) {
  if (accuracy >= 95) return "S";
  if (accuracy >= 85) return "A";
  if (accuracy >= 75) return "B";
  if (accuracy >= 65) return "C";
  if (accuracy >= 50) return "D";
  return "F";
}

export function MissionSummaryBoard({
  missionTitle,
  missionSlug,
  totalCards,
  hits,
  misses,
  accuracy,
}: MissionSummaryBoardProps) {
  const rank = getRankFromAccuracy(accuracy);

  return (
    <section className="w-full">
      <div className="border-4 border-black bg-[#dedede] px-6 py-8 mb-6 shadow-[10px_10px_0px_#000] sm:px-8 sm:py-10">
        <p
          className={`${spaceGrotesk.className} text-xl font-semibold uppercase text-black sm:text-2xl`}
        >
          MISSION: {missionTitle}
        </p>
        <p
          className={`${spaceGrotesk.className} mt-4 text-xl font-semibold uppercase text-black sm:text-2xl`}
        >
          STATUS: COMPLETED
        </p>
        <div className="mt-8 inline-flex border-4 border-black bg-[#1c1c1c] px-4 py-3 ">
          <span
            className={`${pressStart.className} bg-[repeating-linear-gradient(90deg,#d4d4d4_0_10px,#bcbcbc_10px_12px)] bg-clip-text text-[1.2rem] leading-none tracking-[0.12em] text-transparent [text-shadow:2px_2px_0_#8a8a8a,4px_4px_0_#2f2f2f] sm:text-[1.8rem]`}
          >
            RANK {rank}
          </span>
        </div>
      </div>

      <RetroDropdown title="MISSION SUMMARY (METADATA)" defaultOpen={true}>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="border-4 border-black bg-[#dedede] px-4 py-4 shadow-[8px_8px_0px_#000]">
            <p
              className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-black`}
            >
              TOTAL SCORE
            </p>
            <div className="mt-3 flex items-center gap-3">
              <SegmentMeter value={accuracy} />
              <span
                className={`${pressStart.className} shrink-0 text-[0.7rem] uppercase tracking-[0.2em] text-black`}
              >
                {accuracy}%
              </span>
            </div>
          </div>
          <SummaryMetaCard
            title="CRITICAL HITS (CHECK)"
            value={String(hits).padStart(2, "0")}
            meta={
              hits === totalCards && totalCards > 0
                ? "[PERFECT COMBO]"
                : "[GOOD RUN]"
            }
          />
          <SummaryMetaCard
            title="MISSES (X)"
            value={String(misses).padStart(2, "0")}
            meta={misses === 0 ? "[NO RETRY NEEDED]" : "[RETRY THESE?]"}
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <Button asChild variant="cta" size="cta">
            <Link href={`/missions/${encodeURIComponent(missionSlug)}`}>
              REPLAY LEVEL
            </Link>
          </Button>
          <Button asChild variant="cta" size="cta">
            <Link href="/">RETURN TO BASE</Link>
          </Button>
        </div>
      </RetroDropdown>
    </section>
  );
}
