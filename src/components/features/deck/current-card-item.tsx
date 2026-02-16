import { PenLine, Trash2 } from "lucide-react";

import { pressStart } from "@/components/font";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CurrentCardItemProps = {
  index: number;
  question: string;
  answer: string;
  cardId?: number;
  deckId?: number;
  currentSlug?: string;
  updateAction?: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function CurrentCardItem({
  index,
  question,
  answer,
  cardId,
  deckId,
  currentSlug,
  updateAction,
  deleteAction,
}: CurrentCardItemProps) {
  const canEdit = Boolean(cardId && deckId && updateAction && deleteAction);

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

        {canEdit ? (
          <div className="flex w-full flex-col gap-3 md:w-auto">
            <details className="w-full md:w-[430px]">
              <summary
                className={`${pressStart.className} cursor-pointer list-none border-2 border-black bg-white px-3 py-2 text-[0.5rem] tracking-[0.12em]`}
              >
                EDIT CARD
              </summary>
              <form action={updateAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="cardId" value={String(cardId)} />
                <input type="hidden" name="deckId" value={String(deckId)} />
                {currentSlug ? <input type="hidden" name="currentSlug" value={currentSlug} /> : null}
                <Input name="front" defaultValue={question} />
                <Input name="back" defaultValue={answer} />
                <Button
                  type="submit"
                  variant="cta"
                  size="sm"
                  className={`${pressStart.className} h-10 rounded-none px-3 text-[0.5rem] tracking-[0.1em]`}
                >
                  SAVE
                  <PenLine className="h-3.5 w-3.5" />
                </Button>
              </form>
            </details>

            <form action={deleteAction} className="w-full">
              <input type="hidden" name="cardId" value={String(cardId)} />
              <input type="hidden" name="deckId" value={String(deckId)} />
              {currentSlug ? <input type="hidden" name="currentSlug" value={currentSlug} /> : null}
              <Button
                type="submit"
                variant="cta"
                size="sm"
                className={`${pressStart.className} h-10 w-full rounded-none px-3 text-[0.5rem] tracking-[0.1em]`}
              >
                DEL
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
