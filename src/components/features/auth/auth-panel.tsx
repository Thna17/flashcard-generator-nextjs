import type { ReactNode } from "react"

import { pressStart } from "@/components/font"

type AuthPanelProps = {
  title: string
  children: ReactNode
}

export function AuthPanel({ title, children }: AuthPanelProps) {
  return (
    <section className="auth-panel w-full max-w-xl px-6 py-10 sm:px-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
      <h2
        className={`${pressStart.className} text-center text-lg uppercase tracking-[0.45em] text-zinc-900 sm:text-xl`}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}
