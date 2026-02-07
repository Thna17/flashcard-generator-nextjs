"use client";

import { useState } from "react";

import { pressStart } from "@/components/font";
import { DeckCard, type DeckItem } from "@/components/features/common/deck-card";
import { NewGameCard } from "@/components/features/common/new-game-card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type HomeDeckSectionProps = {
  decks: DeckItem[];
  query?: string;
  activeDeck?: string;
  title?: string;
  defaultOpen?: boolean;
  actionPath?: string;
};

export function HomeDeckSection({
  decks,
  query,
  activeDeck,
  title = "DECK CONFIGURATION (METADATA)",
  defaultOpen = true,
  actionPath = "/",
}: HomeDeckSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto w-full items-center justify-start gap-3 rounded-none border-4 border-black bg-[#b07a54] px-5 py-3 text-left text-black shadow-[6px_6px_0px_#000] hover:bg-[#b07a54] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <span
              className={`text-base text-black transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </span>
            <h2
              className={`${pressStart.className} text-[0.6rem] uppercase tracking-[0.35em] text-black/80 sm:text-[0.65rem]`}
            >
              {title}
            </h2>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>

      {isOpen ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <NewGameCard />

          {decks.length === 0 ? (
            <div className="auth-card col-span-full flex flex-col items-center justify-center gap-3 rounded-none px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
              <span
                className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.35em] text-zinc-700`}
              >
                No decks found
              </span>
              <p className="text-sm text-slate-700">
                Try another search keyword.
              </p>
            </div>
          ) : null}

          {decks.map((deck) => (
            <DeckCard
              key={deck.name}
              deck={deck}
              isActive={activeDeck === deck.name}
              query={query}
              actionPath={actionPath}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
