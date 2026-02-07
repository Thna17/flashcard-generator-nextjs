"use client";

import { useState, type ReactNode } from "react";
import { pressStart } from "@/components/font";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NewDeckProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  saveLabel?: string;
};

export function NewDeck({
  title,
  children,
  defaultOpen = true,
  saveLabel,
}: NewDeckProps) {
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6 9 6 6 6-6"
                />
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
        <form className="mt-6 flex flex-col gap-8">
          <>
          {children}
          </>
         
          <div className="flex justify-end">
             {saveLabel && (<Button type="submit" variant="cta" size="cta">
              {saveLabel}
            </Button>)}
          </div>
        </form>
      ) : null}
    </div>
  );
}
