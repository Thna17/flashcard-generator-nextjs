import type { ReactNode } from "react"

import { spaceGrotesk } from "@/components/features/auth/auth-fonts"
import { AuthHeader } from "@/components/features/auth/auth-header"

type AuthShellProps = {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden bg-[#a67552] text-slate-900`}
    >
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <AuthHeader />

        <main className="mt-10 flex flex-1 flex-col items-center gap-8 sm:mt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
