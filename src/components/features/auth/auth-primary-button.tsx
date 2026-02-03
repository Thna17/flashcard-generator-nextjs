import type { ComponentPropsWithoutRef } from "react"

import { pressStart } from "@/components/features/auth/auth-fonts"
import { cn } from "@/lib/utils"

type AuthPrimaryButtonProps = ComponentPropsWithoutRef<"button">

export function AuthPrimaryButton({ className, ...props }: AuthPrimaryButtonProps) {
  return (
    <button
      className={cn(
        `${pressStart.className} auth-cta mx-auto mt-2 w-full max-w-[180px] hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#000]  focus-visible:outline-offset-4 focus-visible:outline-black`,
        className
      )}
      {...props}
    />
  )
}
