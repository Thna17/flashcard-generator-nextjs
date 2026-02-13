import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  // Supabase auth owns auth.users. Keep matching UUID here.
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 120 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashCardDecks = pgTable("flash_card_deck", {
  deckId: bigint("deck_id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  deckName: varchar("deck_name", { length: 100 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cards = pgTable("card", {
  cardId: bigint("card_id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  deckId: bigint("deck_id", { mode: "number" })
    .notNull()
    .references(() => flashCardDecks.deckId, { onDelete: "cascade" }),
  frontContent: text("front_content").notNull(),
  backContent: text("back_content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studySessions = pgTable(
  "study_session",
  {
    sessionId: bigint("session_id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deckId: bigint("deck_id", { mode: "number" })
      .notNull()
      .references(() => flashCardDecks.deckId, { onDelete: "cascade" }),
    scorePercent: smallint("score_percent").notNull(),
    dateCompleted: timestamp("date_completed", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "study_session_score_percent_range",
      sql`${table.scorePercent} >= 0 AND ${table.scorePercent} <= 100`
    ),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  flashCardDecks: many(flashCardDecks),
  studySessions: many(studySessions),
}));

export const flashCardDecksRelations = relations(flashCardDecks, ({ one, many }) => ({
  user: one(users, {
    fields: [flashCardDecks.userId],
    references: [users.id],
  }),
  cards: many(cards),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(flashCardDecks, {
    fields: [cards.deckId],
    references: [flashCardDecks.deckId],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
  deck: one(flashCardDecks, {
    fields: [studySessions.deckId],
    references: [flashCardDecks.deckId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type FlashCardDeck = typeof flashCardDecks.$inferSelect;
export type NewFlashCardDeck = typeof flashCardDecks.$inferInsert;

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

export type StudySession = typeof studySessions.$inferSelect;
export type NewStudySession = typeof studySessions.$inferInsert;
