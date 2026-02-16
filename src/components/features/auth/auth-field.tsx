import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

type AuthFieldProps = {
  label: string
  inputProps: ComponentPropsWithoutRef<"input">
}

export function AuthField({ label, inputProps }: AuthFieldProps) {
  const { className, type = "text", ...rest } = inputProps

  return (
    <label className="auth-field flex flex-col gap-3">
      <span className="auth-field-label">{label}</span>
      <span className="auth-input-shell">
        [
        <input
          className={cn("auth-field-input", className)}
          type={type}
          {...rest}
        />
        ]
      </span>
    </label>
  )
}
