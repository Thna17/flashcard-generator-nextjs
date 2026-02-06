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

export default function ResetPassword() {
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") || "")
    const confirmPassword = String(formData.get("confirmPassword") || "")

    if (!password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill all required fields." })
      return
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: "idle", message: "" })

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus({ type: "error", message: error.message })
      setIsSubmitting(false)
      return
    }

    setStatus({
      type: "success",
      message: "Password updated. You can now log in.",
    })
    setIsSubmitting(false)
  }

  return (
    <Shell>
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
            <p className="text-xs text-slate-600">Updating password…</p>
          ) : null}
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Back to the arena?"
        actionLabel="Go to Login"
        actionHref="/login"
      />
    </Shell>
  )
}
