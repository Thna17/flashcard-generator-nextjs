"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getMissionBySlug } from "@/lib/missions";

import { MissionBoardHeader } from "./mission-board-header";
import { MissionFlashcard } from "./mission-flashcard";

type MissionAnswer = "TRUE" | "FALSE";

export function MissionBoard({ missionSlug }: { missionSlug: string }) {
  const router = useRouter();
  const mission = useMemo(() => getMissionBySlug(missionSlug), [missionSlug]);
  const cards = mission?.cards ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<string, MissionAnswer>>({});

  const currentCard = cards[currentIndex] ?? null;
  const answeredCount = Object.keys(answers).length;
  const totalCards = cards.length;

  function handleReveal() {
    setIsFlipped(true);
  }

  function handleFlipBack() {
    setIsFlipped(false);
  }

  function handleAnswer(answer: MissionAnswer) {
    if (!currentCard || !mission) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [currentCard.id]: answer,
    };
    const nextAnsweredCount = Object.keys(nextAnswers).length;

    if (totalCards > 0 && nextAnsweredCount >= totalCards) {
      const hits = Object.values(nextAnswers).filter((item) => item === "TRUE").length;
      const misses = totalCards - hits;
      const accuracy = Math.round((hits / totalCards) * 100);
      const params = new URLSearchParams({
        hits: String(hits),
        misses: String(misses),
        total: String(totalCards),
        accuracy: String(accuracy),
      });

      router.push(`/missions/${encodeURIComponent(mission.slug)}/summary?${params.toString()}`);
      return;
    }

    setAnswers(nextAnswers);

    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(totalCards - 1, 0)));
  }

  if (!mission) {
    return null;
  }

  return (
    <section className="mx-4">
      <MissionBoardHeader
        title={mission.title}
        currentLevel={mission.currentLevel}
        totalLevels={mission.totalLevels}
        missionProgress={mission.progress}
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
