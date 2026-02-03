import { pressStart } from "@/components/features/auth/auth-fonts"

type AuthHeroProps = {
  title?: string
  tagline?: string
}

export function AuthHero({
  title = "FLASHGEN",
  tagline = "Insert coin to start learning...",
}: AuthHeroProps) {
  return (
    <section className="auth-card w-full max-w-2xl px-6 py-8 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4">
      <div className="flex flex-col items-center gap-4">
        <span
          className={`${pressStart.className} text-lg text-amber-600 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-xl`}
        >
          {title}
        </span>
        <p
          className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.35em] text-zinc-600 sm:text-[0.65rem]`}
        >
          {tagline}
        </p>
      </div>
    </section>
  )
}
