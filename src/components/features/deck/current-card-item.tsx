import { PenLine, Trash2 } from "lucide-react";

import { pressStart } from "@/components/font";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CurrentCardItemProps = {
  index: number;
  question: string;
  answer: string;
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function CurrentCardItem({ index, question, answer }: CurrentCardItemProps) {
  return (
    <Card className="w-full rounded-none border-4 border-black bg-[#dedede] py-0 shadow-[10px_10px_0px_#000]">
      <CardContent className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:gap-5 md:px-6 md:py-6">
        <div className="flex min-w-0 flex-1 items-start gap-4 md:items-center">
          <div className="flex items-center gap-2 pt-1 text-xl font-medium text-[#171717] md:text-2xl">
            <span>{formatIndex(index)}</span>
            <span aria-hidden="true" className="h-6 w-1 bg-black" />
          </div>

          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-base font-medium leading-tight text-[#171717] md:text-lg">
              <span className="mr-2">Q:</span>
              {question}
            </p>
            <p className="truncate text-base leading-tight text-[#171717] md:text-lg">
              <span className="mr-2">A:</span>
              {answer}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:pt-1">
          <Button
            type="button"
            variant="cta"
            size="sm"
            className={`${pressStart.className} h-10 rounded-none px-3 text-[0.5rem] tracking-[0.1em]`}
          >
            EDIT
            <PenLine className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="cta"
            size="sm"
            className={`${pressStart.className} h-10 rounded-none px-3 text-[0.5rem] tracking-[0.1em]`}
          >
            DEL
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
