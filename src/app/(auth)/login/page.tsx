import { AuthDivider } from "@/components/features/auth/auth-divider";
import { AuthField } from "@/components/features/auth/auth-field";
import { AuthFooter } from "@/components/features/auth/auth-footer";
import { AuthHero } from "@/components/features/auth/auth-hero";
import { AuthPanel } from "@/components/features/auth/auth-panel";
import { AuthPrimaryButton } from "@/components/features/auth/auth-primary-button";
import { AuthShell } from "@/components/features/auth/auth-shell";

export default function Login() {
  return (
    <AuthShell>
      <AuthHero />

      <AuthPanel title="Player 1 Login">
        <form className="mt-8 flex flex-col gap-6">
          <AuthField
            label="Email Address"
            inputProps={{ placeholder: "player1@gmail.com", type: "email" }}
          />
          <AuthField
            label="Secret Code (Password)"
            inputProps={{ placeholder: "************", type: "password" }}
          />
          <AuthPrimaryButton type="submit">Press Start</AuthPrimaryButton>
        </form>
      </AuthPanel>

      <AuthDivider />

      <AuthFooter
        prompt="New challenger?"
        actionLabel="Create Account"
        actionHref="/signup"
      />
    </AuthShell>
  );
}
