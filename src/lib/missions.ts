export type MissionCard = {
  id: string;
  front: string;
  back: string;
};

export type Mission = {
  slug: string;
  title: string;
  currentLevel: number;
  totalLevels: number;
  progress: number;
  cards: MissionCard[];
};

const missions: Mission[] = [
  {
    slug: "reactjs-interview",
    title: "REACTJS_INTERVIEW",
    currentLevel: 5,
    totalLevels: 24,
    progress: 80,
    cards: [
      {
        id: "react-vdom",
        front: "WHAT IS THE VIRTUAL DOM?",
        back: "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React compares changes and updates only what is needed in the browser.",
      },
      {
        id: "react-state",
        front: "WHAT IS THE DIFFERENCE BETWEEN STATE AND PROPS?",
        back: "Props are read-only inputs passed from parent to child. State is internal, mutable data owned by the component.",
      },
      {
        id: "react-hooks",
        front: "WHY DO WE USE HOOKS IN REACT?",
        back: "Hooks let function components use state and lifecycle features without writing class components.",
      },
    ],
  },
  {
    slug: "history-101",
    title: "HISTORY_101",
    currentLevel: 3,
    totalLevels: 16,
    progress: 42,
    cards: [
      {
        id: "history-renaissance",
        front: "WHEN DID THE RENAISSANCE BEGIN?",
        back: "The Renaissance is generally considered to have begun in 14th-century Italy and spread through Europe over the next centuries.",
      },
    ],
  },
  {
    slug: "anatomy-bones",
    title: "ANATOMY_BONES",
    currentLevel: 2,
    totalLevels: 18,
    progress: 25,
    cards: [
      {
        id: "anatomy-femur",
        front: "WHAT IS THE LONGEST BONE IN THE HUMAN BODY?",
        back: "The femur is the longest and strongest bone in the human body.",
      },
    ],
  },
  {
    slug: "japanese-n5",
    title: "JAPANESE_N5",
    currentLevel: 8,
    totalLevels: 30,
    progress: 61,
    cards: [
      {
        id: "jp-arigatou",
        front: "WHAT DOES ありがとう (ARIGATOU) MEAN?",
        back: "It means 'thank you'.",
      },
    ],
  },
  {
    slug: "aws-solutions",
    title: "AWS_SOLUTIONS",
    currentLevel: 10,
    totalLevels: 20,
    progress: 90,
    cards: [
      {
        id: "aws-ec2",
        front: "WHAT IS AMAZON EC2 USED FOR?",
        back: "Amazon EC2 provides resizable virtual servers in the cloud for compute workloads.",
      },
    ],
  },
];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMissionBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  return (
    missions.find((mission) => mission.slug === normalizedSlug) ?? missions[0] ?? null
  );
}

export function getCurrentMissionCard(mission: Mission) {
  const fallbackCard: MissionCard = {
    id: "fallback-card",
    front: "NO CARD AVAILABLE",
    back: "No answer available yet.",
  };

  if (mission.cards.length === 0) {
    return fallbackCard;
  }

  const safeIndex = Math.min(
    Math.max(mission.currentLevel - 1, 0),
    mission.cards.length - 1,
  );

  return mission.cards[safeIndex] ?? mission.cards[0] ?? fallbackCard;
}
