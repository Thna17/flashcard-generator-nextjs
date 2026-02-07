"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { AuthDivider } from "@/components/features/auth/auth-divider";
import { AuthField } from "@/components/features/auth/auth-field";
import { AuthFooter } from "@/components/features/auth/auth-footer";
import { AuthHero } from "@/components/features/auth/auth-hero";
import { AuthPanel } from "@/components/features/auth/auth-panel";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

type StatusState = { type: "idle" | "error" | "success"; message: string };

export default function Signup() {
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const userName = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!email || !password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const supabase = createClient();
    const origin = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { userName },
        emailRedirectTo: `${origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      setStatus({ type: "success", message: "Account created. You're signed in." });
    } else {
      setStatus({
        type: "success",
        message:
          "Check your email to confirm your account. After confirmation, you will be signed in.",
      });
    }

    setIsSubmitting(false);
  };
  return (
    <Shell>
      <AuthHero />

      <AuthPanel title="Player 1 Signup">
        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={handlePasswordSignup}
        >
          <AuthField
            label="User Name"
            inputProps={{
              name: "username",
              placeholder: "player1",
              autoComplete: "username",
            }}
          />
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
            label="Secret Code (Password)"
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
          <Button type="submit" variant="cta" size="cta">Create Account</Button>
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
            <p className="text-xs text-slate-600">Creating your account…</p>
          ) : null}
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Already registered?"
        actionLabel="Back to Login"
        actionHref="/login"
      />

    </Shell>
  );
}
