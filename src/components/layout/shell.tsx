import type { ReactNode } from "react"

import { spaceGrotesk } from "@/components/font"
import { AuthHeader } from "@/components/features/auth/auth-header"
import { cn } from "@/lib/utils"

type ShellProps = {
  children: ReactNode
  header?: ReactNode
  mainClassName?: string
}

export function Shell({ children, header, mainClassName }: ShellProps) {
  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden bg-[#a67552] text-slate-900`}
    >
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16  sm:px-6 lg:px-10">
        {header ?? <AuthHeader />}

        <main
          className={cn(
            "mt-10 flex flex-1 flex-col items-center gap-8 sm:mt-14",
            mainClassName
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
