import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq, not, sql } from "drizzle-orm";
import { DashboardHeader } from "@/components/features/home/dashboard-header";
import { HomeHero } from "@/components/features/home/home-hero";
import { DeckCard, type DeckItem } from "@/components/features/common/deck-card";
import type { StatsCardProps } from "@/components/features/common/stats-card";
import { Shell } from "@/components/layout/shell";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { cards, flashCardDecks, users } from "@/db/schema";
import { getLatestDeckScoresForUser } from "@/lib/study-sessions";
import { Button } from "@/components/ui/button";
import { NewGameCard } from "@/components/features/common/new-game-card";
import { pressStart } from "@/components/font";
import { RetroDropdown } from "@/components/features/common/retro-dropdown";
import { getPlayerName } from "@/lib/user-display-name";

type DbDeck = {
  deckId: number;
  deckName: string;
  isPublic: boolean;
};

type DbPublicDeck = {
  deckId: number;
  deckName: string;
  ownerLabel: string;
};

const secondaryStats: StatsCardProps[] = [
  {
    label: "BRAIN LEVEL",
    value: "LVL 85",
    meta: "SUPER USER",
    metaIcon: "bolt",
  },
];

function getPgErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  if ("code" in error && typeof error.code === "string") return error.code;

  const cause = "cause" in error ? error.cause : undefined;
  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") {
    return cause.code;
  }

  return undefined;
}

function shouldUseLegacyFallback(pgCode: string | undefined) {
  return pgCode === "22P02" || pgCode === "42883";
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

async function getUserDecks(authUserId: string): Promise<DbDeck[]> {
  try {
    return await db
      .select({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
        isPublic: flashCardDecks.isPublic,
      })
      .from(flashCardDecks)
      .where(eq(flashCardDecks.userId, authUserId))
      .orderBy(desc(flashCardDecks.deckId));
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (!shouldUseLegacyFallback(pgCode)) throw error;
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
    order by deck_id desc
  `);

  return legacyDecks.map((deck) => ({
    deckId: Number(deck.deck_id),
    deckName: deck.deck_name,
    isPublic: deck.is_public,
  }));
}

async function getTotalCardsForUser(authUserId: string) {
  try {
    const result = await db
      .select({ totalCards: sql<number>`count(${cards.cardId})` })
      .from(flashCardDecks)
      .leftJoin(cards, eq(cards.deckId, flashCardDecks.deckId))
      .where(eq(flashCardDecks.userId, authUserId));

    const value = Number(result[0]?.totalCards ?? 0);
    return Number.isFinite(value) ? value : 0;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (!shouldUseLegacyFallback(pgCode)) throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return 0;

  const result = await db.execute<{ total_cards: number | string }>(sql`
    select count(c.card_id) as total_cards
    from public.card c
    inner join public.flash_card_deck d on d.deck_id = c.deck_id
    where d.user_id = ${legacyUserId}
  `);

  const value = Number(result[0]?.total_cards ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function resolveOwnerLabel(input: {
  ownerDisplayName?: string | null;
  ownerEmail?: string | null;
  fallback?: string;
}) {
  const displayName = input.ownerDisplayName?.trim();
  if (displayName) return displayName;

  const ownerEmail = input.ownerEmail?.trim();
  if (ownerEmail) return ownerEmail;

  return input.fallback ?? "UNKNOWN";
}

async function getPublicDecksForUser(authUserId: string): Promise<DbPublicDeck[]> {
  try {
    const rows = await db
      .select({
        deckId: flashCardDecks.deckId,
        deckName: flashCardDecks.deckName,
        ownerDisplayName: users.displayName,
        ownerEmail: users.email,
      })
      .from(flashCardDecks)
      .leftJoin(users, eq(flashCardDecks.userId, users.id))
      .where(and(eq(flashCardDecks.isPublic, true), not(eq(flashCardDecks.userId, authUserId))))
      .orderBy(desc(flashCardDecks.deckId));

    return rows.map((row) => ({
      deckId: row.deckId,
      deckName: row.deckName,
      ownerLabel: resolveOwnerLabel({
        ownerDisplayName: row.ownerDisplayName,
        ownerEmail: row.ownerEmail,
      }),
    }));
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (!shouldUseLegacyFallback(pgCode)) throw error;
  }

  const legacyUserId = await getLegacyUserId(authUserId);

  const legacyPublicDecks = legacyUserId
    ? await db.execute<{
        deck_id: number | string;
        deck_name: string;
        owner_label: string;
      }>(sql`
        select
          d.deck_id,
          d.deck_name,
          coalesce(nullif(u.display_name, ''), nullif(u.email, ''), 'USER #' || d.user_id::text) as owner_label
        from public.flash_card_deck d
        left join public.users u on u.user_id = d.user_id
        where d.is_public = true
          and d.user_id <> ${legacyUserId}
        order by d.deck_id desc
      `)
    : await db.execute<{
        deck_id: number | string;
        deck_name: string;
        owner_label: string;
      }>(sql`
        select
          d.deck_id,
          d.deck_name,
          coalesce(nullif(u.display_name, ''), nullif(u.email, ''), 'USER #' || d.user_id::text) as owner_label
        from public.flash_card_deck d
        left join public.users u on u.user_id = d.user_id
        where d.is_public = true
        order by d.deck_id desc
      `);

  return legacyPublicDecks.map((deck) => ({
    deckId: Number(deck.deck_id),
    deckName: deck.deck_name,
    ownerLabel: deck.owner_label || "UNKNOWN",
  }));
}

type HomeProps = {
  searchParams?: Promise<{ q?: string; active?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const playerName = getPlayerName(user);

  const dbDecks = await getUserDecks(user.id);
  const dbPublicDecks = await getPublicDecksForUser(user.id);
  const totalCards = await getTotalCardsForUser(user.id);
  const latestDeckScores = await getLatestDeckScoresForUser(user.id);
  const ownDecks: DeckItem[] = dbDecks.map((deck) => ({
    id: deck.deckId,
    name: deck.deckName,
    progress: latestDeckScores.get(deck.deckId) ?? 0,
    visibility: deck.isPublic ? "public" : "locked",
  }));
  const publicDecks: DeckItem[] = dbPublicDecks.map((deck) => ({
    id: deck.deckId,
    name: deck.deckName,
    progress: latestDeckScores.get(deck.deckId) ?? 0,
    visibility: "public",
    ownerLabel: deck.ownerLabel,
  }));

  const stats: StatsCardProps[] = [
    {
      label: "TOTAL DECKS",
      value: ownDecks.length,
    },
    {
      label: "TOTAL CARDS",
      value: totalCards,
    },
    ...secondaryStats,
  ];

  const sp = (await searchParams) ?? {};
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const activeDeck = typeof sp.active === "string" ? sp.active : "";

  const normalizedQuery = query.toLowerCase();
  const filteredOwnDecks = normalizedQuery
    ? ownDecks.filter((deck) => deck.name.toLowerCase().includes(normalizedQuery))
    : ownDecks;
  const filteredPublicDecks = normalizedQuery
    ? publicDecks.filter(
        (deck) =>
          deck.name.toLowerCase().includes(normalizedQuery) ||
          (deck.ownerLabel ?? "").toLowerCase().includes(normalizedQuery),
      )
    : publicDecks;

  return (
    <Shell
      header={<DashboardHeader query={query} playerName={playerName} />}
      mainClassName="items-stretch gap-10"
    >
      <section className="flex w-full flex-col gap-8">
        <HomeHero
          title={`GOOD AFTERNOON, ${playerName}!`}
          tagline="Ready to beat your high score?"
          stats={stats}
          activeDeck={activeDeck}
        />

        <div className="flex justify-start">
          <Button asChild variant="cta" size="cta">
            <Link href={ownDecks.length > 0 ? `/missions/${encodeURIComponent(String(ownDecks[0].id))}` : "/decks/new"}>
              PLAY CURRENT MISSION
            </Link>
          </Button>
        </div>

      <RetroDropdown title="MY DECKS (OWNED)" defaultOpen={true} >
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <NewGameCard />

          {filteredOwnDecks.length === 0 ? (
            <div className="auth-card col-span-full flex flex-col items-center justify-center gap-3 rounded-none px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
              <span
                className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.35em] text-zinc-700`}
              >
                No decks found
              </span>
              <p className="text-sm text-slate-700">
                Create your first deck or try another search keyword.
              </p>
            </div>
          ) : null}

          {filteredOwnDecks.map((deck, idx) => (
            <DeckCard
              key={`own-${deck.id}-${idx}`}
              deck={deck}
              isActive={activeDeck === deck.name}
              canEdit={true}
              contextLabel="MY DECK"
            />
          ))}
        </div>
      </RetroDropdown>

      <RetroDropdown title="PUBLIC DECKS (COMMUNITY)" defaultOpen={true} >
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPublicDecks.length === 0 ? (
            <div className="auth-card col-span-full flex flex-col items-center justify-center gap-3 rounded-none px-6 py-10 text-center shadow-[8px_8px_0px_#000]">
              <span
                className={`${pressStart.className} text-[0.7rem] uppercase tracking-[0.35em] text-zinc-700`}
              >
                No public decks
              </span>
              <p className="text-sm text-slate-700">
                Public decks from other users will appear here.
              </p>
            </div>
          ) : null}

          {filteredPublicDecks.map((deck, idx) => (
            <DeckCard
              key={`public-${deck.id}-${idx}`}
              deck={deck}
              isActive={activeDeck === deck.name}
              canEdit={false}
              contextLabel="PUBLIC DECK"
              actionLabel="STUDY"
            />
          ))}
        </div>
      </RetroDropdown>
      </section>
    </Shell>
  );
}
