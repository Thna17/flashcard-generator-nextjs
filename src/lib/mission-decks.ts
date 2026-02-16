import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { cards, flashCardDecks } from "@/db/schema";

export type MissionDeckRecord = {
  deckId: number;
  deckName: string;
  isPublic: boolean;
};

export type MissionCardRecord = {
  id: string;
  front: string;
  back: string;
};

export function toMissionSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePositiveInt(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function getPgErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  if ("code" in error && typeof error.code === "string") return error.code;

  const cause = "cause" in error ? error.cause : undefined;
  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") {
    return cause.code;
  }

  return undefined;
}

async function getLegacyUserId(authUserId: string) {
  const legacyUserResult = await db.execute<{ user_id: number | string }>(sql`
    select user_id
    from public.users
    where id = ${authUserId}::uuid
    limit 1
  `);

  const legacyUserIdRaw = legacyUserResult[0]?.user_id;
  if (legacyUserIdRaw === undefined || legacyUserIdRaw === null) return undefined;

  const legacyUserId = Number(legacyUserIdRaw);
  if (!Number.isInteger(legacyUserId) || legacyUserId <= 0) return undefined;

  return legacyUserId;
}

export async function getMissionDecksForUser(authUserId: string): Promise<MissionDeckRecord[]> {
  try {
    return await db
      .select({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
        isPublic: flashCardDecks.isPublic,
      })
      .from(flashCardDecks)
      .where(eq(flashCardDecks.userId, authUserId));
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return [];

  const legacyDecks = await db.execute<{
    deck_id: number | string;
    deck_name: string;
    is_public: boolean;
  }>(sql`
    select deck_id, deck_name, is_public
    from public.flash_card_deck
    where user_id = ${legacyUserId}
  `);

  return legacyDecks.map((deck) => ({
    deckId: Number(deck.deck_id),
    deckName: deck.deck_name,
    isPublic: deck.is_public,
  }));
}

export async function getPublicMissionDecks(): Promise<MissionDeckRecord[]> {
  return db
    .select({
      deckId: flashCardDecks.deckId,
      deckName: flashCardDecks.deckName,
      isPublic: flashCardDecks.isPublic,
    })
    .from(flashCardDecks)
    .where(eq(flashCardDecks.isPublic, true));
}

export async function getMissionDeckBySlug(authUserId: string, missionSlug: string) {
  const decodedSlug = decodeURIComponent(missionSlug || "").trim();
  const normalizedSlug = toMissionSlug(decodedSlug);
  const maybeDeckId = parsePositiveInt(decodedSlug);

  const ownDecks = await getMissionDecksForUser(authUserId);
  const publicDecks = (await getPublicMissionDecks()).filter(
    (deck) => !ownDecks.some((ownDeck) => ownDeck.deckId === deck.deckId),
  );

  if (maybeDeckId) {
    const ownById = ownDecks.find((deck) => deck.deckId === maybeDeckId);
    if (ownById) return ownById;

    const publicById = publicDecks.find((deck) => deck.deckId === maybeDeckId);
    if (publicById) return publicById;
  }

  const ownBySlug = ownDecks.find((deck) => toMissionSlug(deck.deckName) === normalizedSlug);
  if (ownBySlug) return ownBySlug;

  const publicBySlug = publicDecks.find((deck) => toMissionSlug(deck.deckName) === normalizedSlug);
  if (publicBySlug) return publicBySlug;

  return undefined;
}

export async function getMissionCardsByDeckId(deckId: number): Promise<MissionCardRecord[]> {
  const deckCards = await db
    .select({
      cardId: cards.cardId,
      frontContent: cards.frontContent,
      backContent: cards.backContent,
    })
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(cards.cardId);

  return deckCards.map((card) => ({
    id: String(card.cardId),
    front: card.frontContent,
    back: card.backContent,
  }));
}
