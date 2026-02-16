"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthDivider } from "@/components/features/auth/auth-divider";
import { AuthField } from "@/components/features/auth/auth-field";
import { AuthFooter } from "@/components/features/auth/auth-footer";
import { AuthHero } from "@/components/features/auth/auth-hero";
import { AuthPanel } from "@/components/features/auth/auth-panel";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter()
  const [status, setStatus] = useState<{ type: "idle" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) return;

  setIsSubmitting(true);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({email, password});


  if (error) {
    console.error("Login error:", error);
    setStatus({ type: "error", message: error.message });
    setIsSubmitting(false);
    return;
  }
  if (data.session) {
    router.push("/");
    return;
  }

  setIsSubmitting(false);
};

  return (
    <Shell>
      <AuthHero />

      <AuthPanel title="Player 1 Login">
        <form className="mt-8 flex flex-col gap-6" onSubmit={handlePasswordLogin}>
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
              autoComplete: "current-password",
            }}
          />
          <Button type="submit" variant="cta" size="cta">PRESS START</Button>

          {status.type === "error" && (
            <p className="mt-4 text-sm text-red-600">{status.message}</p>
          )}
          {isSubmitting ? (
            <p className="mt-4 text-sm text-slate-700">Submitting...</p>
          ) : null}
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="New challenger?"
        actionLabel="Create Account"
        actionHref="/signup"
      />

      <AuthFooter
        prompt="Forgot your secret code?"
        actionLabel="Reset Password"
        actionHref="/forgot-password"
      />

    </Shell>
  );
}
