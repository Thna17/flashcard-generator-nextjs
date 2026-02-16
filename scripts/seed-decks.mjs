import { existsSync, readFileSync } from "node:fs";
import postgres from "postgres";

const ENV_FILES = [".env.local", ".env"];

for (const file of ENV_FILES) {
  if (!existsSync(file)) continue;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing in .env.local or .env.");
  process.exit(1);
}

const targetEmailArg = process.argv.find((arg) => arg.startsWith("--email="));
const targetEmail = targetEmailArg ? targetEmailArg.slice("--email=".length).trim() : "";
const useSsl = process.env.DATABASE_SSL !== "disable";

const sql = postgres(databaseUrl, {
  ssl: useSsl ? "require" : undefined,
  prepare: false,
  max: 1,
});

const deckSeeds = [
  {
    deckName: "React Interview Core",
    description: "Frontend interview prep focused on React fundamentals.",
    isPublic: true,
    cards: [
      {
        front: "What is JSX?",
        back: "A syntax extension for JavaScript used to describe UI in React.",
      },
      {
        front: "Props vs State?",
        back: "Props are read-only inputs; state is mutable component-owned data.",
      },
      {
        front: "What does useEffect do?",
        back: "Runs side effects after render based on dependency changes.",
      },
    ],
  },
  {
    deckName: "System Design Private Notes",
    description: "Personal system design flashcards.",
    isPublic: false,
    cards: [
      {
        front: "Horizontal scaling vs vertical scaling?",
        back: "Horizontal adds instances; vertical adds resources to a single machine.",
      },
      {
        front: "What is eventual consistency?",
        back: "A model where replicas become consistent over time after updates propagate.",
      },
    ],
  },
  {
    deckName: "JavaScript Pitfalls",
    description: "Common JS interview traps and quick refreshers.",
    isPublic: true,
    cards: [
      {
        front: "Difference between == and ===?",
        back: "== allows type coercion; === checks value and type strictly.",
      },
      {
        front: "What is closure?",
        back: "A function retaining access to lexical scope even when executed later.",
      },
      {
        front: "What is event loop?",
        back: "A runtime loop that processes call stack and task queues asynchronously.",
      },
    ],
  },
];

try {
  const [userIdColumn] = await sql`
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'flash_card_deck'
      and column_name = 'user_id'
    limit 1
  `;

  if (!userIdColumn) {
    throw new Error("Cannot detect public.flash_card_deck.user_id column type.");
  }

  const userIdDataType = userIdColumn.data_type;
  const users = await sql`
    select id, user_id, email
    from public.users
    where email is not null
    order by created_at asc
  `;

  if (users.length === 0) {
    console.error("No users found in public.users. Create/sign-in a user first.");
    process.exit(1);
  }

  const targetUser =
    (targetEmail
      ? users.find((user) => String(user.email).toLowerCase() === targetEmail.toLowerCase())
      : undefined) ?? users[0];

  if (!targetUser) {
    console.error(`No user found for email: ${targetEmail}`);
    process.exit(1);
  }

  const ownerValue = userIdDataType === "uuid" ? targetUser.id : targetUser.user_id;
  if (!ownerValue) {
    throw new Error(
      `Cannot resolve owner identifier for user ${targetUser.email} with user_id column type ${userIdDataType}.`,
    );
  }

  let createdDecks = 0;
  let existingDecks = 0;
  let createdCards = 0;
  let existingCards = 0;

  for (const deckSeed of deckSeeds) {
    const [existingDeck] = await sql`
      select deck_id
      from public.flash_card_deck
      where user_id = ${ownerValue}
        and deck_name = ${deckSeed.deckName}
      limit 1
    `;

    let deckId = existingDeck?.deck_id;

    if (!deckId) {
      const [insertedDeck] = await sql`
        insert into public.flash_card_deck (
          user_id,
          deck_name,
          description,
          is_public
        )
        values (
          ${ownerValue},
          ${deckSeed.deckName},
          ${deckSeed.description},
          ${deckSeed.isPublic}
        )
        returning deck_id
      `;

      deckId = insertedDeck?.deck_id;
      createdDecks += 1;
    } else {
      existingDecks += 1;
    }

    if (!deckId) {
      throw new Error(`Failed to resolve deck_id for seed deck: ${deckSeed.deckName}`);
    }

    for (const cardSeed of deckSeed.cards) {
      const [existingCard] = await sql`
        select card_id
        from public.card
        where deck_id = ${deckId}
          and front_content = ${cardSeed.front}
          and back_content = ${cardSeed.back}
        limit 1
      `;

      if (existingCard) {
        existingCards += 1;
        continue;
      }

      await sql`
        insert into public.card (
          deck_id,
          front_content,
          back_content
        )
        values (
          ${deckId},
          ${cardSeed.front},
          ${cardSeed.back}
        )
      `;
      createdCards += 1;
    }
  }

  console.log("Deck seed completed.");
  console.log(`Target user: ${targetUser.email}`);
  console.log(`User id mode: ${userIdDataType}`);
  console.log(`Decks created: ${createdDecks}, existing: ${existingDecks}`);
  console.log(`Cards created: ${createdCards}, existing: ${existingCards}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Deck seed failed: ${message}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
