import { pressStart, spaceGrotesk } from "@/components/font";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MissionSessionCompleteProps = {
  trueCount: number;
  falseCount: number;
  totalCards: number;
  onRestart: () => void;
};

export function MissionSessionComplete({
  trueCount,
  falseCount,
  totalCards,
  onRestart,
}: MissionSessionCompleteProps) {
  return (
    <Card className="mt-6 w-full max-w-2xl rounded-none border-4 border-black bg-white px-4 py-6 shadow-[8px_8px_0px_#000] sm:py-8">
      <CardHeader className="gap-2">
        <CardTitle className={spaceGrotesk.className}>Session Complete</CardTitle>
        <p className={`${pressStart.className} text-[0.5rem] tracking-[0.18em] text-slate-700`}>
          TOTAL CARDS: {totalCards}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 border border-black p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-none border-2 border-black bg-[#fff4e6] p-3">
            <p className={`${pressStart.className} text-[0.45rem] tracking-[0.14em] text-slate-700`}>
              TRUE
            </p>
            <p className="text-xl font-semibold">{trueCount}</p>
          </div>
          <div className="rounded-none border-2 border-black bg-[#f6f6f6] p-3">
            <p className={`${pressStart.className} text-[0.45rem] tracking-[0.14em] text-slate-700`}>
              FALSE
            </p>
            <p className="text-xl font-semibold">{falseCount}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="cta" size="cta" onClick={onRestart}>
            RESTART MISSION
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
