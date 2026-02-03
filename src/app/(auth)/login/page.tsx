import { Press_Start_2P, Space_Grotesk } from "next/font/google";

import { SoundToggle } from "@/components/features/auth/sound-toggle";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Login() {
  
  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden bg-[#a67552] text-slate-900`}
    >

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <header className="rounded-2xl border-2 border-black bg-black/95 px-4 py-3 text-white shadow-[6px_6px_0px_#000] sm:px-6">
          <div className="flex items-center justify-end">
            <SoundToggle labelClassName={pressStart.className} />
          </div>
        </header>

        <main className="mt-10 flex flex-1 flex-col items-center gap-8 sm:mt-14">
          <section className="auth-card w-full max-w-2xl px-6 py-8 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4">
            <div className="flex flex-col items-center gap-4">
              <span
                className={`${pressStart.className} text-lg text-amber-600 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-xl`}
              >
                FLASHGEN
              </span>
              <p
                className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.35em] text-zinc-600 sm:text-[0.65rem]`}
              >
                Insert coin to start learning...
              </p>
            </div>
          </section>

          <section className="auth-panel w-full max-w-xl px-6 py-10 sm:px-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
            <h2
              className={`${pressStart.className} text-center text-lg uppercase tracking-[0.45em] text-zinc-900 sm:text-xl`}
            >
              Player 1 Login
            </h2>

            <form className="mt-8 flex flex-col gap-6">
              <label className="auth-field flex flex-col gap-3">
                <span className="auth-field-label">Email Address</span>
                <span className="flex items-center gap-3 text-sm text-slate-500">
                  [
                  <input
                    className="auth-field-input"
                    placeholder="player1@gmail.com"
                    type="email"
                  />
                  ]
                </span>
              </label>

              <label className="auth-field flex flex-col gap-3">
                <span className="auth-field-label">
                  Secret Code (Password)
                </span>
                <span className="flex items-center gap-3 text-sm text-slate-500">
                  [
                  <input
                    className="auth-field-input"
                    placeholder="************"
                    type="password"
                  />
                  ]
                </span>
              </label>

              <button
                className={`${pressStart.className} auth-cta mx-auto mt-2 w-full max-w-[180px] hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black`}
                type="submit"
              >
                Press Start
              </button>
            </form>
          </section>

          <div className="auth-divider" />

          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-900/80">
              New challenger?
            </p>
            <button
              className="auth-secondary hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              type="button"
            >
              Create Account
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
