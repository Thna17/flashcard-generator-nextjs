import { RotateCcw } from "lucide-react";

import { pressStart, spaceGrotesk } from "@/components/font";
import { MissionCard } from "@/lib/missions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MissionFlashcardProps = {
  card: MissionCard | null;
  cardNumber: number;
  totalCards: number;
  isFlipped: boolean;
  onReveal: () => void;
  onFlipBack: () => void;
  onAnswer: (answer: "TRUE" | "FALSE") => void;
};

export function MissionFlashcard({
  card,
  cardNumber,
  totalCards,
  isFlipped,
  onReveal,
  onFlipBack,
  onAnswer,
}: MissionFlashcardProps) {
  if (!card || totalCards === 0) {
    return (
      <Card className="mt-6 w-full max-w-2xl rounded-none border-4 border-black bg-white px-4 py-6 shadow-[8px_8px_0px_#000] sm:py-8">
        <CardHeader>
          <CardTitle className={spaceGrotesk.className}>No Cards Found</CardTitle>
        </CardHeader>
        <CardContent className="border border-black p-4">
          This mission does not have cards yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl [perspective:1200px]">
      <div
        className={`relative min-h-[350px] transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="mt-6 flex h-full flex-col rounded-none border-4 border-black bg-white px-4 py-6 shadow-[8px_8px_0px_#000] sm:py-8">
            <CardHeader className="gap-2">
              <CardTitle className={spaceGrotesk.className}>Front</CardTitle>
              <p className={`${pressStart.className} text-[0.5rem] tracking-[0.2em] text-slate-600`}>
                CARD {cardNumber} / {totalCards}
              </p>
            </CardHeader>
            <CardContent className="flex-1 border border-black p-4 text-balance">
              {card.front}
            </CardContent>
            <div className="pt-4">
              <div className="flex justify-center">
                <Button variant="cta" size="cta" onClick={onReveal}>
                  REVEAL DATA
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="mt-6 flex h-full flex-col rounded-none border-4 border-black bg-white px-4 py-6 shadow-[8px_8px_0px_#000] sm:py-8">
            <CardHeader className="gap-2">
              <CardTitle className={`${spaceGrotesk.className} flex items-center justify-between gap-2`}>
                <span>Back</span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-none"
                  onClick={onFlipBack}
                  aria-label="Flip card to front"
                >
                  <RotateCcw />
                </Button>
              </CardTitle>
              <p className={`${pressStart.className} text-[0.5rem] tracking-[0.2em] text-slate-600`}>
                CARD {cardNumber} / {totalCards}
              </p>
            </CardHeader>
            <CardContent className="flex-1 border border-black p-4 text-balance">
              {card.back}
            </CardContent>
            <div className="pt-4">
              <div className="flex justify-center gap-4 sm:gap-8">
                <Button variant="cta" size="cta" onClick={() => onAnswer("TRUE")}>
                  TRUE
                </Button>
                <Button variant="cta" size="cta" onClick={() => onAnswer("FALSE")}>
                  FALSE
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
