"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MissionBoardHeader } from "./mission-board-header";
import { MissionFlashcard } from "./mission-flashcard";

type MissionAnswer = "HIT" | "MISS";

export type MissionBoardCard = {
  id: string;
  front: string;
  back: string;
};

type MissionBoardProps = {
  missionSlug: string;
  missionTitle: string;
  cards: MissionBoardCard[];
};

export function MissionBoard({ missionSlug, missionTitle, cards }: MissionBoardProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<string, MissionAnswer>>({});

  const normalizedCards = useMemo(() => cards, [cards]);

  const currentCard = normalizedCards[currentIndex] ?? null;
  const answeredCount = Object.keys(answers).length;
  const totalCards = normalizedCards.length;
  const totalLevels = Math.max(totalCards, 1);
  const currentLevel = totalCards === 0 ? 0 : Math.min(totalLevels, currentIndex + 1);
  const missionProgress = totalCards > 0 ? Math.round((answeredCount / totalCards) * 100) : 0;

  function handleReveal() {
    setIsFlipped(true);
  }

  function handleFlipBack() {
    setIsFlipped(false);
  }

  function handleAnswer(answer: MissionAnswer) {
    if (!currentCard) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentCard.id]: answer,
    };
    const nextAnsweredCount = Object.keys(nextAnswers).length;

    if (totalCards > 0 && nextAnsweredCount >= totalCards) {
      const hits = Object.values(nextAnswers).filter((item) => item === "HIT").length;
      const misses = totalCards - hits;
      const accuracy = Math.round((hits / totalCards) * 100);
      const params = new URLSearchParams({
        hits: String(hits),
        misses: String(misses),
        total: String(totalCards),
        accuracy: String(accuracy),
      });

      router.push(`/missions/${encodeURIComponent(missionSlug)}/summary?${params.toString()}`);
      return;
    }

    setAnswers(nextAnswers);

    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(totalCards - 1, 0)));
  }

  return (
    <section className="mx-4">
      <MissionBoardHeader
        title={missionTitle}
        currentLevel={currentLevel}
        totalLevels={totalLevels}
        missionProgress={missionProgress}
        answeredCount={answeredCount}
        totalCards={totalCards}
      />

      <div className="mt-10 flex justify-center">
        <MissionFlashcard
          card={currentCard}
          cardNumber={currentIndex + 1}
          totalCards={totalCards}
          isFlipped={isFlipped}
          onReveal={handleReveal}
          onFlipBack={handleFlipBack}
          onAnswer={handleAnswer}
        />
      </div>
    </section>
  );
}
