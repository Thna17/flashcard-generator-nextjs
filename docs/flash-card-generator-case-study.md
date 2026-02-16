# Flash Card Generator Case Study

## 1. Project Goal
Build a full-stack flashcard system with:
- Frontend: responsive dashboard, deck builder, card manager, study mode
- Backend: auth checks, ownership checks, privacy rules, study score persistence
- Database: strong one-to-many relationships (`User -> Deck -> Card`) and session tracking

This project uses AI-assisted coding, but the logic is production-style: each action is verified by auth + DB constraints.

## 2. Stack and Architecture
- Next.js App Router (Server Components + Server Actions)
- Supabase Auth (session/user identity)
- Drizzle ORM + PostgreSQL (typed queries and relations)
- Tailwind UI components

Request flow:
1. User interacts in UI form/button.
2. Server Action runs on backend.
3. Action validates input + checks ownership.
4. Drizzle writes/reads PostgreSQL.
5. Redirect returns user to a stable URL with `status`/`error`.

## 3. Database Design (Core)
Main schema is in `src/db/schema.ts`.

Important relationships:
- `users.id (uuid)` -> `flash_card_deck.user_id`
- `flash_card_deck.deck_id` -> `card.deck_id`
- `flash_card_deck.deck_id` -> `study_session.deck_id`

Why it matters:
- One user owns many decks.
- One deck owns many cards.
- Study session stores score history per deck.

## 4. Backend Patterns You Must Understand

### 4.1 Auth Guard (Every protected page/action)
Used throughout deck/mission pages.

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");
```

See:
- `src/app/decks/new/page.tsx`
- `src/app/decks/[deckSlug]/edit/page.tsx`
- `src/app/missions/[missionSlug]/page.tsx`

### 4.2 Ownership Guard (Owner-only edit/delete)
Deck update/delete always includes both `deckId` and `userId` in `where`.

```ts
.where(and(eq(flashCardDecks.deckId, deckId), eq(flashCardDecks.userId, authUserId)))
```

This prevents user A from editing/deleting user B decks.

See:
- `src/app/decks/[deckSlug]/edit/page.tsx`

### 4.3 Privacy Rule (Public vs Private)
- Private deck: only owner can access.
- Public deck: other users can study it.
- Dashboard now separates `My Decks` and `Public Decks`.

Public decks query pattern:

```ts
.where(and(eq(flashCardDecks.isPublic, true), not(eq(flashCardDecks.userId, authUserId))))
```

See:
- `src/app/page.tsx`
- `src/lib/mission-decks.ts`

### 4.4 Study Score Persistence
Summary page saves session score once, then redirects with `saved=1`.

```ts
await saveStudySessionForUser({ authUserId: user.id, deckId, scorePercent: accuracy });
```

See:
- `src/app/missions/[missionSlug]/summary/page.tsx`
- `src/lib/study-sessions.ts`

## 5. Frontend Patterns You Must Understand

### 5.1 Stable URL State
After deck create, URL keeps `deckId` (`/decks/new?deckId=...`) so form stays bound to same deck and cards can be inserted/edited without losing context.

See:
- `src/app/decks/new/page.tsx`

### 5.2 Clear UX Feedback
Server redirects with query params:
- `?status=deck-saved`
- `?status=card-added`
- `?error=missing-front`

This keeps UI deterministic and easy to debug.

### 5.3 Ownership-aware UI
- Owner deck card: `STUDY + EDIT`
- Public deck card: `STUDY` only
- Visual labels: `MY DECK` vs `PUBLIC DECK`

See:
- `src/components/features/common/deck-card.tsx`
- `src/app/page.tsx`

## 6. End-to-End Logic (High Value Flows)

### Flow A: Create Deck + Add Cards
1. User submits deck metadata.
2. Server action creates deck and redirects with `deckId`.
3. Card form uses hidden `deckId`.
4. Insert/update/delete card actions verify owner by resolving deck first.

Files:
- `src/app/decks/new/page.tsx`

### Flow B: Edit Existing Deck
1. Open `/decks/[deckSlug]/edit` (slug supports ID-based resolution).
2. Update metadata, delete deck, insert/edit/delete cards.
3. All writes are owner-checked.

Files:
- `src/app/decks/[deckSlug]/edit/page.tsx`
- `src/components/features/deck/current-card-item.tsx`

### Flow C: Study Mission + Summary
1. Mission loads cards for selected deck.
2. User marks `CHECK` / `MISS`.
3. Summary computes accuracy and stores `study_session`.
4. Dashboard reads latest score per deck for progress.

Files:
- `src/components/features/mission/mission-board.tsx`
- `src/app/missions/[missionSlug]/summary/page.tsx`
- `src/lib/study-sessions.ts`

## 7. Important Engineering Decisions
- Use `deckId` routing for mission/deck actions to avoid slug collision between users.
- Keep server-side auth checks in every mutation.
- Keep UI state from URL params (`status`, `error`, `deckId`) for predictable behavior.
- Separate owner vs public deck sections to avoid privacy confusion.

## 8. AI-Assisted Development Notes
Since this project is AI-assisted, use this safety checklist before accepting generated code:
- Does every mutation verify authenticated user?
- Does edit/delete include ownership `where` conditions?
- Does public listing exclude owner decks in public section?
- Are redirects/status/errors explicit and testable?
- Do DB relationships match SRS (one-to-many)?

## 9. Minimal Study Checklist
1. Trace one request from UI -> server action -> DB -> redirect.
2. Read ownership logic in deck edit page.
3. Read privacy logic in homepage and mission deck resolver.
4. Read study score save + dashboard progress retrieval.
5. Verify with two accounts: owner and non-owner.

## 10. Key File Map
- DB schema: `src/db/schema.ts`
- Supabase server client: `src/lib/supabase/server.ts`
- Homepage (my/public decks + stats): `src/app/page.tsx`
- New deck + card manager: `src/app/decks/new/page.tsx`
- Edit deck + owner-only CRUD: `src/app/decks/[deckSlug]/edit/page.tsx`
- Mission deck resolver (public/private access): `src/lib/mission-decks.ts`
- Study session storage/progress: `src/lib/study-sessions.ts`
- Mission runtime/summary UI:
  - `src/app/missions/[missionSlug]/page.tsx`
  - `src/app/missions/[missionSlug]/summary/page.tsx`
  - `src/components/features/mission/mission-board.tsx`

