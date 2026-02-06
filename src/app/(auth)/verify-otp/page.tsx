"use client"

import type { FormEvent } from "react"

import { AuthDivider } from "@/components/features/auth/auth-divider"
import { AuthField } from "@/components/features/auth/auth-field"
import { AuthFooter } from "@/components/features/auth/auth-footer"
import { AuthHero } from "@/components/features/auth/auth-hero"
import { AuthPanel } from "@/components/features/auth/auth-panel"
import { AuthPrimaryButton } from "@/components/features/auth/auth-primary-button"
import { Shell } from "@/components/layout/shell"

const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const email = String(formData.get("email") || "")
  const token = String(formData.get("token") || "")

  if (!email || !token) return

  // TODO: use createClient() and supabase.auth.verifyOtp({ email, token, type: "email" })
}

export default function VerifyOtp() {
  return (
    <Shell>
      <AuthHero />

      <AuthPanel title="Verify OTP">
        <form className="mt-8 flex flex-col gap-6" onSubmit={handleVerifyOtp}>
          <AuthField
            label="Email Address"
            inputProps={{
              name: "email",
              placeholder: "player1@gmail.com",
              type: "email",
              autoComplete: "email",
            }}
          />
          <AuthField
            label="OTP Code"
            inputProps={{
              name: "token",
              placeholder: "123456",
              inputMode: "numeric",
              autoComplete: "one-time-code",
            }}
          />
          <AuthPrimaryButton type="submit">Verify Code</AuthPrimaryButton>
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Need a new code?"
        actionLabel="Back to Login"
        actionHref="/login"
      />
    </Shell>
  )
}
