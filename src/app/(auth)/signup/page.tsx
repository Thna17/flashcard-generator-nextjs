import { AuthDivider } from "@/components/features/auth/auth-divider"
import { AuthField } from "@/components/features/auth/auth-field"
import { AuthFooter } from "@/components/features/auth/auth-footer"
import { AuthHero } from "@/components/features/auth/auth-hero"
import { AuthPanel } from "@/components/features/auth/auth-panel"
import { AuthPrimaryButton } from "@/components/features/auth/auth-primary-button"
import { AuthShell } from "@/components/features/auth/auth-shell"

export default function Signup() {
  return (
    <AuthShell>
      <AuthHero />

      <AuthPanel title="Player 1 Signup">
        <form className="mt-8 flex flex-col gap-6">
          <AuthField
            label="User Name"
            inputProps={{ placeholder: "player1", autoComplete: "username" }}
          />
          <AuthField
            label="Email Address"
            inputProps={{
              placeholder: "player1@gmail.com",
              type: "email",
              autoComplete: "email",
            }}
          />
          <AuthField
            label="Secret Code (Password)"
            inputProps={{
              placeholder: "************",
              type: "password",
              autoComplete: "new-password",
            }}
          />
          <AuthField
            label="Confirm Password"
            inputProps={{
              placeholder: "************",
              type: "password",
              autoComplete: "new-password",
            }}
          />
          <AuthPrimaryButton type="submit">Create Account</AuthPrimaryButton>
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="Already registered?"
        actionLabel="Back to Login"
        actionHref="/login"
      />
    </AuthShell>
  )
}
