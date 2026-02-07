import { pressStart } from "@/components/font";
import { StatsCard, type StatsCardProps } from "@/components/features/common/stats-card";

type HomeHeroProps = {
  title: string;
  tagline: string;
  stats: StatsCardProps[];
  activeDeck?: string;
  showTaglineIcon?: boolean;
};

export function HomeHero({
  title,
  tagline,
  stats,
  activeDeck,
  showTaglineIcon = true,
}: HomeHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#d6d2c9] px-6 py-8 sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,rgba(0,0,0,0.18)_2px,transparent_2px),linear-gradient(45deg,rgba(0,0,0,0.12)_2px,transparent_2px),radial-gradient(circle,rgba(0,0,0,0.18)_1px,transparent_1px)] [background-size:48px_48px,64px_64px,20px_20px]" />
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-black uppercase tracking-[0.08em] text-black sm:text-4xl">
            {title}
          </h1>
          <p className="text-base font-medium text-slate-800 sm:text-lg">
            {tagline}
          </p>
          {activeDeck ? (
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="rounded-md border border-black/30 bg-white/70 px-2 py-1 text-xs uppercase tracking-[0.3em]">
                Active Deck
              </span>
              <span
                className={`${pressStart.className} text-[0.65rem] uppercase tracking-[0.25em]`}
              >
                {activeDeck}
              </span>
            </div>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <StatsCard
              key={item.label}
              label={item.label}
              value={item.value}
              meta={item.meta}
              metaIcon={item.metaIcon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
