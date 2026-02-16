import { redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";

import { pressStart } from "@/components/font";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { cards, flashCardDecks } from "@/db/schema";
import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { DeckPageHeader } from "@/components/features/deck/deck-page-header";
import { CurrentCardItem } from "@/components/features/deck/current-card-item";
import { StatsCard } from "@/components/features/common/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RetroDropdown } from "@/components/features/common/retro-dropdown";
import { getPlayerName } from "@/lib/user-display-name";

type CreateDeckPageProps = {
  searchParams?: Promise<{ error?: string; status?: string; deckId?: string }>;
};

type DeckRecord = {
  deckId: number;
  deckName: string;
  description: string | null;
  isPublic: boolean;
};

type CardRecord = {
  cardId: number;
  frontContent: string;
  backContent: string;
};

function parsePositiveInt(value: unknown) {
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function buildCreateDeckUrl(params: { deckId?: number; error?: string; status?: string }) {
  const searchParams = new URLSearchParams();
  if (params.deckId) searchParams.set("deckId", String(params.deckId));
  if (params.error) searchParams.set("error", params.error);
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return query ? `/decks/new?${query}` : "/decks/new";
}

function getErrorMessage(errorCode: string) {
  if (errorCode === "missing-title") return "Deck title is required.";
  if (errorCode === "title-too-long") return "Deck title must be 100 characters or fewer.";
  if (errorCode === "missing-user-map") {
    return "User mapping missing. Run supabase/sql/001_users_from_auth.sql, then sign in again.";
  }
  if (errorCode === "deck-not-found") return "Deck not found for this user.";
  if (errorCode === "missing-deck") return "Save deck metadata first, then add cards.";
  if (errorCode === "missing-front") return "Card front content is required.";
  if (errorCode === "missing-back") return "Card back content is required.";
  if (errorCode === "missing-card") return "Card not found.";
  if (errorCode === "create-failed") return "Failed to create deck. Please try again.";
  if (errorCode === "update-failed") return "Failed to update deck. Please try again.";
  if (errorCode === "add-card-failed") return "Failed to add card. Please try again.";
  if (errorCode === "update-card-failed") return "Failed to update card. Please try again.";
  if (errorCode === "delete-card-failed") return "Failed to delete card. Please try again.";
  return "";
}

function getStatusMessage(statusCode: string) {
  if (statusCode === "deck-saved") return "Deck saved.";
  if (statusCode === "card-added") return "Card added.";
  if (statusCode === "card-updated") return "Card updated.";
  if (statusCode === "card-deleted") return "Card deleted.";
  return "";
}

function isDeckMessageCode(code: string) {
  return new Set([
    "missing-title",
    "title-too-long",
    "missing-user-map",
    "deck-not-found",
    "create-failed",
    "update-failed",
  ]).has(code);
}

function isCardMessageCode(code: string) {
  return new Set([
    "missing-deck",
    "missing-front",
    "missing-back",
    "missing-card",
    "add-card-failed",
    "update-card-failed",
    "delete-card-failed",
    "deck-not-found",
  ]).has(code);
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

async function getDeckForUser(authUserId: string, deckId: number): Promise<DeckRecord | undefined> {
  try {
    const [deck] = await db
      .select({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
        description: flashCardDecks.description,
        isPublic: flashCardDecks.isPublic,
      })
      .from(flashCardDecks)
      .where(and(eq(flashCardDecks.deckId, deckId), eq(flashCardDecks.userId, authUserId)))
      .limit(1);

    return deck;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") {
      throw error;
    }
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return undefined;

  const legacyDeckResult = await db.execute<{
    deck_id: number | string;
    deck_name: string;
    description: string | null;
    is_public: boolean;
  }>(sql`
    select deck_id, deck_name, description, is_public
    from public.flash_card_deck
    where deck_id = ${deckId}
      and user_id = ${legacyUserId}
    limit 1
  `);

  const legacyDeck = legacyDeckResult[0];
  if (!legacyDeck) return undefined;

  return {
    deckId: Number(legacyDeck.deck_id),
    deckName: legacyDeck.deck_name,
    description: legacyDeck.description,
    isPublic: legacyDeck.is_public,
  };
}

async function getCardsForDeck(deckId: number): Promise<CardRecord[]> {
  return db
    .select({
      cardId: cards.cardId,
      frontContent: cards.frontContent,
      backContent: cards.backContent,
    })
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(desc(cards.cardId));
}

async function getCardForDeck(deckId: number, cardId: number): Promise<CardRecord | undefined> {
  const [card] = await db
    .select({
      cardId: cards.cardId,
      frontContent: cards.frontContent,
      backContent: cards.backContent,
    })
    .from(cards)
    .where(and(eq(cards.deckId, deckId), eq(cards.cardId, cardId)))
    .limit(1);

  return card;
}

async function createDeckWithLegacyFallback(params: {
  authUserId: string;
  title: string;
  description: string;
  visibility: "public" | "private";
}) {
  const { authUserId, title, description, visibility } = params;
  const isPublic = visibility === "public";

  try {
    const [createdDeck] = await db
      .insert(flashCardDecks)
      .values({
        userId: authUserId,
        deckName: title,
        description: description || null,
        isPublic,
      })
      .returning({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
      });

    return createdDeck;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return undefined;

  const createdLegacyDeckResult = await db.execute<{ deck_id: number | string; deck_name: string }>(sql`
    insert into public.flash_card_deck ("user_id", "deck_name", "description", "is_public")
    values (${legacyUserId}, ${title}, ${description || null}, ${isPublic})
    returning "deck_id", "deck_name"
  `);

  const createdLegacyDeck = createdLegacyDeckResult[0];
  if (!createdLegacyDeck) return undefined;

  return {
    deckId: Number(createdLegacyDeck.deck_id),
    deckName: createdLegacyDeck.deck_name,
  };
}

async function updateDeckWithLegacyFallback(params: {
  deckId: number;
  authUserId: string;
  title: string;
  description: string;
  visibility: "public" | "private";
}) {
  const { deckId, authUserId, title, description, visibility } = params;
  const isPublic = visibility === "public";

  try {
    const [updatedDeck] = await db
      .update(flashCardDecks)
      .set({
        deckName: title,
        description: description || null,
        isPublic,
      })
      .where(and(eq(flashCardDecks.deckId, deckId), eq(flashCardDecks.userId, authUserId)))
      .returning({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
      });

    return updatedDeck;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return undefined;

  const updatedLegacyDeckResult = await db.execute<{ deck_id: number | string; deck_name: string }>(sql`
    update public.flash_card_deck
    set
      deck_name = ${title},
      description = ${description || null},
      is_public = ${isPublic},
      updated_at = now()
    where deck_id = ${deckId}
      and user_id = ${legacyUserId}
    returning "deck_id", "deck_name"
  `);

  const updatedLegacyDeck = updatedLegacyDeckResult[0];
  if (!updatedLegacyDeck) return undefined;

  return {
    deckId: Number(updatedLegacyDeck.deck_id),
    deckName: updatedLegacyDeck.deck_name,
  };
}

async function saveDeck(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const deckId = parsePositiveInt(formData.get("deckId"));
  const titleValue = formData.get("title");
  const descriptionValue = formData.get("description");
  const visibilityValue = formData.get("visibility");

  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const visibility = visibilityValue === "public" ? "public" : "private";

  if (!title) redirect(buildCreateDeckUrl({ deckId, error: "missing-title" }));
  if (title.length > 100) redirect(buildCreateDeckUrl({ deckId, error: "title-too-long" }));

  if (deckId) {
    let updatedDeck: { deckId: number; deckName: string } | undefined;

    try {
      updatedDeck = await updateDeckWithLegacyFallback({
        deckId,
        authUserId: user.id,
        title,
        description,
        visibility,
      });
    } catch (error) {
      console.error("Failed to update deck:", error);
      redirect(buildCreateDeckUrl({ deckId, error: "update-failed" }));
    }

    if (!updatedDeck) redirect(buildCreateDeckUrl({ error: "deck-not-found" }));
    redirect(buildCreateDeckUrl({ deckId: updatedDeck.deckId, status: "deck-saved" }));
  }

  let createdDeck: { deckId: number; deckName: string } | undefined;
  try {
    createdDeck = await createDeckWithLegacyFallback({
      authUserId: user.id,
      title,
      description,
      visibility,
    });
  } catch (error) {
    console.error("Failed to create deck:", error);
    redirect(buildCreateDeckUrl({ error: "create-failed" }));
  }

  if (!createdDeck) redirect(buildCreateDeckUrl({ error: "missing-user-map" }));
  redirect(buildCreateDeckUrl({ deckId: createdDeck.deckId, status: "deck-saved" }));
}

async function insertCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const deckId = parsePositiveInt(formData.get("deckId"));
  const frontValue = formData.get("front");
  const backValue = formData.get("back");

  if (!deckId) redirect(buildCreateDeckUrl({ error: "missing-deck" }));

  const front = typeof frontValue === "string" ? frontValue.trim() : "";
  const back = typeof backValue === "string" ? backValue.trim() : "";

  if (!front) redirect(buildCreateDeckUrl({ deckId, error: "missing-front" }));
  if (!back) redirect(buildCreateDeckUrl({ deckId, error: "missing-back" }));

  const deck = await getDeckForUser(user.id, deckId);
  if (!deck) redirect(buildCreateDeckUrl({ error: "deck-not-found" }));

  try {
    await db.insert(cards).values({
      deckId,
      frontContent: front,
      backContent: back,
    });
  } catch (error) {
    console.error("Failed to add card:", error);
    redirect(buildCreateDeckUrl({ deckId, error: "add-card-failed" }));
  }

  redirect(buildCreateDeckUrl({ deckId, status: "card-added" }));
}

async function updateCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const deckId = parsePositiveInt(formData.get("deckId"));
  const cardId = parsePositiveInt(formData.get("cardId"));
  const frontValue = formData.get("front");
  const backValue = formData.get("back");

  if (!deckId) redirect(buildCreateDeckUrl({ error: "missing-deck" }));
  if (!cardId) redirect(buildCreateDeckUrl({ deckId, error: "missing-card" }));

  const deck = await getDeckForUser(user.id, deckId);
  if (!deck) redirect(buildCreateDeckUrl({ error: "deck-not-found" }));

  const card = await getCardForDeck(deckId, cardId);
  if (!card) redirect(buildCreateDeckUrl({ deckId, error: "missing-card" }));

  const front = typeof frontValue === "string" ? frontValue.trim() : "";
  const back = typeof backValue === "string" ? backValue.trim() : "";

  if (!front) redirect(buildCreateDeckUrl({ deckId, error: "missing-front" }));
  if (!back) redirect(buildCreateDeckUrl({ deckId, error: "missing-back" }));

  try {
    await db
      .update(cards)
      .set({
        frontContent: front,
        backContent: back,
      })
      .where(and(eq(cards.cardId, cardId), eq(cards.deckId, deckId)));
  } catch (error) {
    console.error("Failed to update card:", error);
    redirect(buildCreateDeckUrl({ deckId, error: "update-card-failed" }));
  }

  redirect(buildCreateDeckUrl({ deckId, status: "card-updated" }));
}

async function deleteCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const deckId = parsePositiveInt(formData.get("deckId"));
  const cardId = parsePositiveInt(formData.get("cardId"));

  if (!deckId) redirect(buildCreateDeckUrl({ error: "missing-deck" }));
  if (!cardId) redirect(buildCreateDeckUrl({ deckId, error: "missing-card" }));

  const deck = await getDeckForUser(user.id, deckId);
  if (!deck) redirect(buildCreateDeckUrl({ error: "deck-not-found" }));

  const card = await getCardForDeck(deckId, cardId);
  if (!card) redirect(buildCreateDeckUrl({ deckId, error: "missing-card" }));

  try {
    await db.delete(cards).where(and(eq(cards.cardId, cardId), eq(cards.deckId, deckId)));
  } catch (error) {
    console.error("Failed to delete card:", error);
    redirect(buildCreateDeckUrl({ deckId, error: "delete-card-failed" }));
  }

  redirect(buildCreateDeckUrl({ deckId, status: "card-deleted" }));
}

export default async function CreateDeckPage({ searchParams }: CreateDeckPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const playerName = getPlayerName(user);

  const sp = (await searchParams) ?? {};
  const requestedDeckId = parsePositiveInt(sp.deckId);
  const statusCode = typeof sp.status === "string" ? sp.status : "";
  const inputErrorCode = typeof sp.error === "string" ? sp.error : "";

  let activeDeck: DeckRecord | undefined;
  let activeDeckCards: CardRecord[] = [];

  if (requestedDeckId) {
    try {
      activeDeck = await getDeckForUser(user.id, requestedDeckId);
      if (activeDeck) {
        activeDeckCards = await getCardsForDeck(activeDeck.deckId);
      }
    } catch (error) {
      console.error("Failed to load deck context:", error);
    }
  }

  const resolvedErrorCode =
    !activeDeck && requestedDeckId && !inputErrorCode ? "deck-not-found" : inputErrorCode;
  const errorMessage = getErrorMessage(resolvedErrorCode);
  const statusMessage = getStatusMessage(statusCode);
  const hasDeck = Boolean(activeDeck);
  const activeDeckId = activeDeck?.deckId;
  const deckNameValue = activeDeck?.deckName ?? "";
  const deckDescriptionValue = activeDeck?.description ?? "";
  const deckVisibilityValue = activeDeck?.isPublic ? "public" : "private";

  return (
    <Shell
      header={<DashboardHeader playerName={playerName} actionPath="/decks/new" />}
      mainClassName="gap-10 items-center"
    >
      <DeckPageHeader
        title={hasDeck ? `Edit Deck: ${activeDeck?.deckName}` : "Create New Deck"}
      />

      <RetroDropdown title="DECK CONFIGURATION (METADATA)" defaultOpen={true}>
        <form action={saveDeck} className="mt-6">
          {activeDeckId ? <input type="hidden" name="deckId" value={String(activeDeckId)} /> : null}
          <div className="grid gap-6 lg:grid-cols-3">
            <StatsCard
              label="TITLE"
              name="title"
              value={deckNameValue}
              editable
              placeholder="[ REACTJS_INTERVIEW ]"
            />
            <StatsCard
              label="Description"
              name="description"
              value={deckDescriptionValue}
              editable
              fieldType="description"
              multiline
              placeholder="[ CORE CONCEPTS.... ]"
            />
            <StatsCard
              label="VISIBILITY"
              name="visibility"
              value=""
              editable
              fieldType="visibility"
              defaultValue={deckVisibilityValue}
              options={[
                { label: "PRIVATE", value: "private", icon: "lock" },
                { label: "PUBLIC", value: "public", icon: "eye" },
              ]}
            />
          </div>

          {errorMessage && isDeckMessageCode(resolvedErrorCode) ? (
            <p
              role="alert"
              className={`${pressStart.className} mt-5 text-[0.55rem] uppercase tracking-[0.18em] text-red-700`}
            >
              {errorMessage}
            </p>
          ) : null}
          {statusMessage && statusCode === "deck-saved" ? (
            <p
              className={`${pressStart.className} mt-5 text-[0.55rem] uppercase tracking-[0.18em] text-green-700`}
            >
              {statusMessage}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="cta" size="cta">
              {hasDeck ? "Update Deck" : "Save Deck"}
            </Button>
          </div>
        </form>
      </RetroDropdown>

      <RetroDropdown title="CARD EDITOR (INSERT DATA)" defaultOpen={true}>
        <form action={insertCard} className="mt-6 w-full">
          <input type="hidden" name="deckId" value={activeDeckId ? String(activeDeckId) : ""} />
          <FieldGroup className="w-full rounded-none border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
            <Field>
              <FieldLabel
                htmlFor="create-card-front"
                className={`${pressStart.className}`}
              >
                Front
              </FieldLabel>
              <Input
                id="create-card-front"
                name="front"
                placeholder="What is the virtual DOM?"
                disabled={!hasDeck}
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="create-card-back"
                className={`${pressStart.className}`}
              >
                Back
              </FieldLabel>
              <Input
                id="create-card-back"
                name="back"
                placeholder="A lightweight copy of the actual DOM."
                disabled={!hasDeck}
              />
            </Field>

            {!hasDeck ? (
              <p
                className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-amber-700`}
              >
                Save deck metadata first to start inserting cards.
              </p>
            ) : null}

            {errorMessage && isCardMessageCode(resolvedErrorCode) ? (
              <p
                role="alert"
                className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-red-700`}
              >
                {errorMessage}
              </p>
            ) : null}
            {statusMessage && ["card-added", "card-updated", "card-deleted"].includes(statusCode) ? (
              <p
                className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-green-700`}
              >
                {statusMessage}
              </p>
            ) : null}

            <div>
              <Button variant="cta" size="cta" type="submit" disabled={!hasDeck}>
                INSERT CARD
              </Button>
            </div>
          </FieldGroup>
        </form>
      </RetroDropdown>

      <RetroDropdown
        title={`CURRENT CARDS (CARD_DATA: ${activeDeckCards.length})`}
        defaultOpen={true}
      >
        <div className="mt-6 flex flex-col gap-5">
          {activeDeckCards.length === 0 ? (
            <p className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-zinc-700`}>
              {hasDeck
                ? "No cards yet. Insert your first card above."
                : "No active deck. Save metadata first."}
            </p>
          ) : null}

          {activeDeckCards.map((card, idx) => (
            <CurrentCardItem
              key={card.cardId}
              index={idx + 1}
              question={card.frontContent}
              answer={card.backContent}
              cardId={card.cardId}
              deckId={activeDeckId}
              updateAction={updateCard}
              deleteAction={deleteCard}
            />
          ))}
        </div>
      </RetroDropdown>

    </Shell>
  );
}
