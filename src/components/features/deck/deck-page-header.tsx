import Link from "next/link";

import { pressStart, spaceGrotesk } from "@/components/font";
import { Button } from "@/components/ui/button";

type DeckPageHeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
};

export function DeckPageHeader({
  title,
  backHref = "/",
  backLabel = "[ BACK TO ARCADE ]",
}: DeckPageHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={`${spaceGrotesk.className} h-auto w-fit px-0 text-sm text-black/80 hover:bg-transparent hover:text-black`}
      >
        <Link href={backHref}>{backLabel}</Link>
      </Button>
      <div>
        <h1
          className={`${pressStart.className} text-[0.8rem] uppercase tracking-[0.35em] text-black`}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
