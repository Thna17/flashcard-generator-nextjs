"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

import { AuthDivider } from "@/components/features/auth/auth-divider"
import { AuthField } from "@/components/features/auth/auth-field"
import { AuthFooter } from "@/components/features/auth/auth-footer"
import { AuthHero } from "@/components/features/auth/auth-hero"
import { AuthPanel } from "@/components/features/auth/auth-panel"
import { Shell } from "@/components/layout/shell"
import { Button } from "@/components/ui/button"

export default function VerifyOtp() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: "idle" | "error"; message: string }>({
    type: "idle",
    message: "",
  })

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") || "").trim()
    const token = String(formData.get("token") || "").trim()

    if (!email || !token) return

    setIsSubmitting(true)
    setStatus({ type: "idle", message: "" })

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (error) {
      setStatus({ type: "error", message: error.message })
      setIsSubmitting(false)
      return
    }

    router.push("/")
  }

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
          <Button type="submit" variant="cta" size="cta">Verify Code</Button>
          {status.type === "error" ? (
            <p className="text-sm font-medium text-red-600">{status.message}</p>
          ) : null}
          {isSubmitting ? (
            <p className="text-xs text-slate-600">Verifying code...</p>
          ) : null}
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
