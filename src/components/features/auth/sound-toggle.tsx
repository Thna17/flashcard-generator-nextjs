"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SoundToggleProps = {
  className?: string
  labelClassName?: string
  defaultOn?: boolean
}

export function SoundToggle({
  className,
  labelClassName,
  defaultOn = true,
}: SoundToggleProps) {
  const [isOn, setIsOn] = React.useState(defaultOn)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "auth-sound  border-white/20 bg-white/10 hover:bg-white/20",
        className
      )}
      aria-pressed={isOn}
      onClick={() => setIsOn((prev) => !prev)}
    >
      <span className="auth-sound-icon">
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5 6 9H3v6h3l5 4V5Zm7.1 1.9a9 9 0 0 1 0 10.2M16 8.6a5 5 0 0 1 0 6.8"
          />
        </svg>
      </span>
      <span className={cn("text-white/90", labelClassName)}>
        [ Sound: {isOn ? "On" : "Off"} ]
      </span>
    </Button>
  )
}
