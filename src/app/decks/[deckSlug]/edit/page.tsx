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

type EditDeckPageProps = {
  params: Promise<{
    deckSlug: string;
  }>;
  searchParams?: Promise<{ error?: string; status?: string }>;
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

function toDeckSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePositiveInt(value: unknown) {
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function buildEditDeckUrl(
  deckSlug: string,
  params: {
    error?: string;
    status?: string;
  },
) {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("error", params.error);
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  const encodedDeckSlug = encodeURIComponent(deckSlug);
  return query ? `/decks/${encodedDeckSlug}/edit?${query}` : `/decks/${encodedDeckSlug}/edit`;
}

function getErrorMessage(errorCode: string) {
  if (errorCode === "missing-title") return "Deck title is required.";
  if (errorCode === "title-too-long") return "Deck title must be 100 characters or fewer.";
  if (errorCode === "missing-user-map") {
    return "User mapping missing. Run supabase/sql/001_users_from_auth.sql, then sign in again.";
  }
  if (errorCode === "deck-not-found") return "Deck not found for this user.";
  if (errorCode === "missing-deck") return "Deck not found for this user.";
  if (errorCode === "missing-front") return "Card front content is required.";
  if (errorCode === "missing-back") return "Card back content is required.";
  if (errorCode === "missing-card") return "Card not found.";
  if (errorCode === "update-failed") return "Failed to update deck. Please try again.";
  if (errorCode === "delete-failed") return "Failed to delete deck. Please try again.";
  if (errorCode === "add-card-failed") return "Failed to add card. Please try again.";
  if (errorCode === "update-card-failed") return "Failed to update card. Please try again.";
  if (errorCode === "delete-card-failed") return "Failed to delete card. Please try again.";
  return "";
}

function getStatusMessage(statusCode: string) {
  if (statusCode === "deck-saved") return "Deck updated.";
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
    "update-failed",
    "missing-deck",
    "delete-failed",
  ]).has(code);
}

function isCardMessageCode(code: string) {
  return new Set([
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

async function getUserDecks(authUserId: string): Promise<DeckRecord[]> {
  try {
    return await db
      .select({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
        description: flashCardDecks.description,
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
    description: string | null;
    is_public: boolean;
  }>(sql`
    select deck_id, deck_name, description, is_public
    from public.flash_card_deck
    where user_id = ${legacyUserId}
  `);

  return legacyDecks.map((deck) => ({
    deckId: Number(deck.deck_id),
    deckName: deck.deck_name,
    description: deck.description,
    isPublic: deck.is_public,
  }));
}

async function getDeckForUserBySlug(authUserId: string, deckSlug: string): Promise<DeckRecord | undefined> {
  const decks = await getUserDecks(authUserId);
  const normalizedSlug = toDeckSlug(deckSlug);
  const maybeId = parsePositiveInt(deckSlug);

  if (maybeId) {
    const byId = decks.find((deck) => deck.deckId === maybeId);
    if (byId) return byId;
  }

  return decks.find((deck) => toDeckSlug(deck.deckName) === normalizedSlug);
}

async function getDeckForUserById(authUserId: string, deckId: number): Promise<DeckRecord | undefined> {
  const decks = await getUserDecks(authUserId);
  return decks.find((deck) => deck.deckId === deckId);
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

async function deleteDeckWithLegacyFallback(params: { deckId: number; authUserId: string }) {
  const { deckId, authUserId } = params;

  try {
    const [deletedDeck] = await db
      .delete(flashCardDecks)
      .where(and(eq(flashCardDecks.deckId, deckId), eq(flashCardDecks.userId, authUserId)))
      .returning({ deckId: flashCardDecks.deckId });

    return deletedDeck;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return undefined;

  const deletedLegacyDeckResult = await db.execute<{ deck_id: number | string }>(sql`
    delete from public.flash_card_deck
    where deck_id = ${deckId}
      and user_id = ${legacyUserId}
    returning "deck_id"
  `);

  const deletedLegacyDeck = deletedLegacyDeckResult[0];
  if (!deletedLegacyDeck) return undefined;

  return {
    deckId: Number(deletedLegacyDeck.deck_id),
  };
}

async function saveDeck(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentSlugValue = formData.get("currentSlug");
  const currentSlug = typeof currentSlugValue === "string" && currentSlugValue ? currentSlugValue : "edit";
  const deckId = parsePositiveInt(formData.get("deckId"));
  const titleValue = formData.get("title");
  const descriptionValue = formData.get("description");
  const visibilityValue = formData.get("visibility");

  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const visibility = visibilityValue === "public" ? "public" : "private";

  if (!deckId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-deck" }));
  if (!title) redirect(buildEditDeckUrl(currentSlug, { error: "missing-title" }));
  if (title.length > 100) redirect(buildEditDeckUrl(currentSlug, { error: "title-too-long" }));

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
    redirect(buildEditDeckUrl(currentSlug, { error: "update-failed" }));
  }

  if (!updatedDeck) redirect(buildEditDeckUrl(currentSlug, { error: "deck-not-found" }));
  redirect(buildEditDeckUrl(toDeckSlug(updatedDeck.deckName), { status: "deck-saved" }));
}

async function insertCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentSlugValue = formData.get("currentSlug");
  const currentSlug = typeof currentSlugValue === "string" && currentSlugValue ? currentSlugValue : "edit";
  const deckId = parsePositiveInt(formData.get("deckId"));
  const frontValue = formData.get("front");
  const backValue = formData.get("back");

  if (!deckId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-deck" }));

  const front = typeof frontValue === "string" ? frontValue.trim() : "";
  const back = typeof backValue === "string" ? backValue.trim() : "";

  if (!front) redirect(buildEditDeckUrl(currentSlug, { error: "missing-front" }));
  if (!back) redirect(buildEditDeckUrl(currentSlug, { error: "missing-back" }));

  const deck = await getDeckForUserById(user.id, deckId);
  if (!deck) redirect(buildEditDeckUrl(currentSlug, { error: "deck-not-found" }));

  try {
    await db.insert(cards).values({
      deckId,
      frontContent: front,
      backContent: back,
    });
  } catch (error) {
    console.error("Failed to add card:", error);
    redirect(buildEditDeckUrl(currentSlug, { error: "add-card-failed" }));
  }

  redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { status: "card-added" }));
}

async function updateCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentSlugValue = formData.get("currentSlug");
  const currentSlug = typeof currentSlugValue === "string" && currentSlugValue ? currentSlugValue : "edit";
  const deckId = parsePositiveInt(formData.get("deckId"));
  const cardId = parsePositiveInt(formData.get("cardId"));
  const frontValue = formData.get("front");
  const backValue = formData.get("back");

  if (!deckId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-deck" }));
  if (!cardId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-card" }));

  const deck = await getDeckForUserById(user.id, deckId);
  if (!deck) redirect(buildEditDeckUrl(currentSlug, { error: "deck-not-found" }));

  const card = await getCardForDeck(deckId, cardId);
  if (!card) redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "missing-card" }));

  const front = typeof frontValue === "string" ? frontValue.trim() : "";
  const back = typeof backValue === "string" ? backValue.trim() : "";

  if (!front) redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "missing-front" }));
  if (!back) redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "missing-back" }));

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
    redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "update-card-failed" }));
  }

  redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { status: "card-updated" }));
}

async function deleteCard(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentSlugValue = formData.get("currentSlug");
  const currentSlug = typeof currentSlugValue === "string" && currentSlugValue ? currentSlugValue : "edit";
  const deckId = parsePositiveInt(formData.get("deckId"));
  const cardId = parsePositiveInt(formData.get("cardId"));

  if (!deckId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-deck" }));
  if (!cardId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-card" }));

  const deck = await getDeckForUserById(user.id, deckId);
  if (!deck) redirect(buildEditDeckUrl(currentSlug, { error: "deck-not-found" }));

  const card = await getCardForDeck(deckId, cardId);
  if (!card) redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "missing-card" }));

  try {
    await db.delete(cards).where(and(eq(cards.cardId, cardId), eq(cards.deckId, deckId)));
  } catch (error) {
    console.error("Failed to delete card:", error);
    redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { error: "delete-card-failed" }));
  }

  redirect(buildEditDeckUrl(toDeckSlug(deck.deckName), { status: "card-deleted" }));
}

async function deleteDeck(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const currentSlugValue = formData.get("currentSlug");
  const currentSlug = typeof currentSlugValue === "string" && currentSlugValue ? currentSlugValue : "edit";
  const deckId = parsePositiveInt(formData.get("deckId"));

  if (!deckId) redirect(buildEditDeckUrl(currentSlug, { error: "missing-deck" }));

  let deletedDeck: { deckId: number } | undefined;
  try {
    deletedDeck = await deleteDeckWithLegacyFallback({
      deckId,
      authUserId: user.id,
    });
  } catch (error) {
    console.error("Failed to delete deck:", error);
    redirect(buildEditDeckUrl(currentSlug, { error: "delete-failed" }));
  }

  if (!deletedDeck) redirect(buildEditDeckUrl(currentSlug, { error: "deck-not-found" }));
  redirect("/");
}

export default async function EditDeckPage({ params, searchParams }: EditDeckPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const playerName = getPlayerName(user);

  const resolvedParams = await params;
  const currentSlug = decodeURIComponent(resolvedParams.deckSlug || "").trim();
  if (!currentSlug) redirect("/decks/new");

  const deck = await getDeckForUserBySlug(user.id, currentSlug);
  if (!deck) redirect("/decks/new?error=deck-not-found");

  const deckCards = await getCardsForDeck(deck.deckId);
  const currentEditPath = `/decks/${encodeURIComponent(currentSlug)}/edit`;
  const sp = (await searchParams) ?? {};
  const errorCode = typeof sp.error === "string" ? sp.error : "";
  const statusCode = typeof sp.status === "string" ? sp.status : "";
  const errorMessage = getErrorMessage(errorCode);
  const statusMessage = getStatusMessage(statusCode);

  return (
    <Shell
      header={<DashboardHeader playerName={playerName} actionPath={currentEditPath} />}
      mainClassName="gap-10 items-center"
    >
      <DeckPageHeader title={`Edit Deck: ${deck.deckName}`} />

      <RetroDropdown title="DECK CONFIGURATION (METADATA)" defaultOpen={true}>
        <form action={saveDeck} className="mt-6">
          <input type="hidden" name="deckId" value={String(deck.deckId)} />
          <input type="hidden" name="currentSlug" value={currentSlug} />

          <div className="grid gap-6 lg:grid-cols-3">
            <StatsCard
              label="TITLE"
              name="title"
              value={deck.deckName}
              editable
              placeholder="[ REACTJS_INTERVIEW ]"
            />
            <StatsCard
              label="Description"
              name="description"
              value={deck.description ?? ""}
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
              defaultValue={deck.isPublic ? "public" : "private"}
              options={[
                { label: "PRIVATE", value: "private", icon: "lock" },
                { label: "PUBLIC", value: "public", icon: "eye" },
              ]}
            />
          </div>

          {errorMessage && isDeckMessageCode(errorCode) ? (
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
              Update Deck
            </Button>
          </div>
        </form>

        <form action={deleteDeck} className="mt-3 flex justify-end">
          <input type="hidden" name="deckId" value={String(deck.deckId)} />
          <input type="hidden" name="currentSlug" value={currentSlug} />
          <div className="flex w-full flex-wrap items-center justify-end gap-3">
            <Button
              type="submit"
              variant="destructive"
              size="default"
              className="h-11 uppercase tracking-[0.2em]"
            >
              Delete Deck
            </Button>
          </div>
        </form>
      </RetroDropdown>

      <RetroDropdown title="CARD EDITOR (INSERT DATA)" defaultOpen={true}>
        <form action={insertCard} className="mt-6 w-full">
          <input type="hidden" name="deckId" value={String(deck.deckId)} />
          <input type="hidden" name="currentSlug" value={currentSlug} />

          <FieldGroup className="w-full rounded-none border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">
            <Field>
              <FieldLabel
                htmlFor="edit-card-front"
                className={`${pressStart.className}`}
              >
                Front
              </FieldLabel>
              <Input
                id="edit-card-front"
                name="front"
                placeholder="What is the virtual DOM?"
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor="edit-card-back"
                className={`${pressStart.className}`}
              >
                Back
              </FieldLabel>
              <Input
                id="edit-card-back"
                name="back"
                placeholder="A lightweight copy of the actual DOM."
              />
            </Field>

            {errorMessage && isCardMessageCode(errorCode) ? (
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
              <Button variant="cta" size="cta" type="submit">
                INSERT CARD
              </Button>
            </div>
          </FieldGroup>
        </form>
      </RetroDropdown>

      <RetroDropdown
        title={`CURRENT CARDS (CARD_DATA: ${deckCards.length})`}
        defaultOpen={true}
      >
        <div className="mt-6 flex flex-col gap-5">
          {deckCards.length === 0 ? (
            <p className={`${pressStart.className} text-[0.55rem] uppercase tracking-[0.18em] text-zinc-700`}>
              No cards yet. Insert your first card above.
            </p>
          ) : null}

          {deckCards.map((card, idx) => (
            <CurrentCardItem
              key={card.cardId}
              index={idx + 1}
              question={card.frontContent}
              answer={card.backContent}
              cardId={card.cardId}
              deckId={deck.deckId}
              currentSlug={currentSlug}
              updateAction={updateCard}
              deleteAction={deleteCard}
            />
          ))}
        </div>
      </RetroDropdown>
    </Shell>
  );
}
