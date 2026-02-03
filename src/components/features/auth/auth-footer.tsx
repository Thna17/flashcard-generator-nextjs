import Link from "next/link"

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
      <Link
        className="auth-secondary hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        href={actionHref}
      >
        {actionLabel}
      </Link>
    </div>
  )
}
