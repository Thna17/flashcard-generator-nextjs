import { pressStart } from "@/components/font"
import { SoundToggle } from "@/components/features/auth/sound-toggle"

export function AuthHeader() {
  return (
    <header className="rounded-2xl border-2 border-black bg-black/95 px-4 py-3 text-white sm:px-6">
      <div className="flex items-center justify-end">
        <SoundToggle labelClassName={pressStart.className} />
      </div>
    </header>
  )
}
