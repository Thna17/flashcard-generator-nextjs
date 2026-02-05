"use client"

import type { FormEvent } from "react"

import { AuthDivider } from "@/components/features/auth/auth-divider"
import { AuthField } from "@/components/features/auth/auth-field"
import { AuthFooter } from "@/components/features/auth/auth-footer"
import { AuthHero } from "@/components/features/auth/auth-hero"
import { AuthPanel } from "@/components/features/auth/auth-panel"
import { AuthPrimaryButton } from "@/components/features/auth/auth-primary-button"
import { AuthShell } from "@/components/features/auth/auth-shell"

const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const password = String(formData.get("password") || "")
  const confirmPassword = String(formData.get("confirmPassword") || "")

  if (!password || password !== confirmPassword) return

  // TODO: use createClient() and supabase.auth.updateUser({ password })
}

export default function ResetPassword() {
  return (
    <AuthShell>
      <AuthHero />

      <AuthPanel title="Set New Password">
        <form className="mt-8 flex flex-col gap-6" onSubmit={handleResetPassword}>
          <AuthField
            label="New Password"
            inputProps={{
              name: "password",
              placeholder: "************",
              type: "password",
              autoComplete: "new-password",
            }}
          />
          <AuthField
            label="Confirm Password"
            inputProps={{
              name: "confirmPassword",
              placeholder: "************",
              type: "password",
              autoComplete: "new-password",
            }}
          />
          <AuthPrimaryButton type="submit">Update Password</AuthPrimaryButton>
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Back to the arena?"
        actionLabel="Go to Login"
        actionHref="/login"
      />
    </AuthShell>
  )
}
