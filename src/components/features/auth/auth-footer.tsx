import Link from "next/link"
import { Button } from "@/components/ui/button"

const promptClasses =
  "text-xs font-semibold uppercase tracking-[0.35em] text-slate-900/80"

type AuthFooterProps = {
  prompt: string
  actionLabel: string
  actionHref: string
}

export function AuthFooter({ prompt, actionLabel, actionHref }: AuthFooterProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className={promptClasses}>{prompt}</p>
      <Button asChild variant="outline" size="sm">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}
