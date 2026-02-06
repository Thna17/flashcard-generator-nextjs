"use client"

import type { FormEvent } from "react"
import { useState } from "react"

import { AuthDivider } from "@/components/features/auth/auth-divider"
import { AuthField } from "@/components/features/auth/auth-field"
import { AuthFooter } from "@/components/features/auth/auth-footer"
import { AuthHero } from "@/components/features/auth/auth-hero"
import { AuthPanel } from "@/components/features/auth/auth-panel"
import { AuthPrimaryButton } from "@/components/features/auth/auth-primary-button"
import { Shell } from "@/components/layout/shell"
import { createClient } from "@/lib/supabase/client"

type StatusState = { type: "idle" | "error" | "success"; message: string }

export default function ForgotPassword() {
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "").trim()

    if (!email) {
      setStatus({ type: "error", message: "Please enter your email." })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: "idle", message: "" })

    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to send reset email.",
      })
      setIsSubmitting(false)
      return
    }

    setStatus({
      type: "success",
      message: "Check your email for the password reset link.",
    })
    setIsSubmitting(false)
  }

  return (
    <Shell>
      <AuthHero />

      <AuthPanel title="Reset Password">
        <form className="mt-8 flex flex-col gap-6" onSubmit={handleForgotPassword}>
          <AuthField
            label="Email Address"
            inputProps={{
              name: "email",
              placeholder: "player1@gmail.com",
              type: "email",
              autoComplete: "email",
            }}
          />
          <AuthPrimaryButton type="submit">Send Reset Link</AuthPrimaryButton>
          {status.message ? (
            <p
              className={
                status.type === "error"
                  ? "text-sm font-medium text-red-600"
                  : "text-sm font-medium text-emerald-700"
              }
            >
              {status.message}
            </p>
          ) : null}
          {isSubmitting ? (
            <p className="text-xs text-slate-600">Sending reset email…</p>
          ) : null}
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Remembered your secret code?"
        actionLabel="Back to Login"
        actionHref="/login"
      />
    </Shell>
  )
}
