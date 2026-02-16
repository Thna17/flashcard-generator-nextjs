# Flash Card Generator

A full-stack flashcard platform built with **Next.js 16**, **Supabase Auth**, and **Drizzle ORM**.  
Users can create decks, manage cards, study in mission mode, and track study performance with persisted session scores.

## Table of Contents
- [Product Overview](#product-overview)
- [Feature Set](#feature-set)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Database Workflow](#database-workflow)
- [Auth Sync (Supabase to public.users)](#auth-sync-supabase-to-publicusers)
- [Privacy & Authorization Rules](#privacy--authorization-rules)
- [Command Reference](#command-reference)
- [Deploy to Vercel](#deploy-to-vercel)
- [Troubleshooting](#troubleshooting)
- [Study Reference](#study-reference)

## Product Overview
Flash Card Generator focuses on:
- Personal deck and card management
- Public/private content visibility
- Interactive study mode (`CHECK` / `MISS`)
- Persistent score summaries for progress tracking

The app uses server-side auth checks and DB ownership checks for every protected write operation.

## Feature Set
### Authentication
- Sign up, login, verify OTP, password reset
- Session-aware protected pages

### Dashboard
- Dynamic user greeting
- `TOTAL DECKS` and `TOTAL CARDS`
- Separate sections:
  - `MY DECKS (OWNED)`
  - `PUBLIC DECKS (COMMUNITY)`

### Deck Management
- Create, update, delete deck
- Privacy toggle (`private` / `public`)

### Card Management
- Add card to deck
- Edit and delete cards in place

### Study Player
- Flip front/back card
- Mark `CHECK` or `MISS`
- Session summary with persisted score

## Architecture
High-level request flow:
1. User interacts with UI (form/button).
2. Server Action or Server Component validates auth via Supabase.
3. Backend verifies ownership/privacy rules.
4. Drizzle performs typed SQL operations.
5. UI redirects with status/error query params for deterministic feedback.

## Tech Stack
- **Frontend**: Next.js App Router, React 19, Tailwind CSS
- **Backend**: Next.js Server Actions + Route Handlers
- **Auth**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Database**: PostgreSQL + Drizzle ORM
- **Tooling**: ESLint, TypeScript, Drizzle Kit

## Project Structure
```text
src/
  app/
    page.tsx                              # Dashboard (owned/public decks)
    decks/
      new/page.tsx                        # Create deck + card CRUD in same flow
      [deckSlug]/edit/page.tsx            # Owner-only deck/card management
    missions/
      page.tsx                            # missions index redirect helper
      [missionSlug]/page.tsx              # Study player
      [missionSlug]/summary/page.tsx      # Summary + score persistence
    (auth)/
      login/page.tsx
      signup/page.tsx
      verify-otp/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
  db/
    schema.ts                             # Drizzle schema + relations
  lib/
    mission-decks.ts                      # Deck resolution + public/private access
    study-sessions.ts                     # Save/read latest scores
    user-display-name.ts                  # Dynamic player name resolver
    supabase/
      server.ts
      client.ts
docs/
  flash-card-generator-case-study.md      # Technical case-study notes
scripts/
  seed-decks.mjs                          # Seed sample decks/cards
```

## Data Model
Main relations from `src/db/schema.ts`:
- `users (id uuid)` -> `flash_card_deck.user_id`
- `flash_card_deck.deck_id` -> `card.deck_id`
- `flash_card_deck.deck_id` -> `study_session.deck_id`

This enforces:
- one user has many decks
- one deck has many cards
- one deck has many study sessions

## Environment Variables
Create `.env.local`:

```bash
DATABASE_URL=postgres://...
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# optional
DATABASE_SSL=disable
```

## Local Setup
```bash
npm install
npm run dev
```

Stable development mode:
- `npm run dev` -> `next dev --webpack`

Optional Turbopack mode:
- `npm run dev:turbo` -> `next dev --turbopack`

## Database Workflow
Validate DB connection:
```bash
npm run db:check
```

Generate migration files:
```bash
npm run db:generate
```

Apply migrations:
```bash
npm run db:migrate
```

Alternative direct push:
```bash
npm run db:push
```

Open schema browser:
```bash
npm run db:studio
```

Seed demo data:
```bash
npm run db:seed:decks
```

## Auth Sync (Supabase to public.users)
Run this SQL once in Supabase SQL editor:
- `supabase/sql/001_users_from_auth.sql`

Purpose:
- Synchronize `public.users` with `auth.users`
- Backfill missing user rows
- Keep app-side user queries consistent

## Privacy & Authorization Rules
- **Private deck**
  - Visible to owner only
  - Editable/deletable by owner only
- **Public deck**
  - Visible to other users in community section
  - Study allowed for non-owners
  - Edit/delete still owner-only

## Command Reference
| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server (webpack mode) |
| `npm run dev:turbo` | Start local dev server (turbopack mode) |
| `npm run lint` | ESLint checks |
| `npx tsc --noEmit` | Type checking |
| `npm run build` | Production build |
| `npm run db:check` | Validate DB connection |
| `npm run db:seed:decks` | Seed sample decks/cards |

## Deploy to Vercel
1. Push repository to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase Auth URL configuration, add:
   - `https://<your-domain>/auth/callback`
5. Deploy.
6. Run DB migration/push if needed for target environment.

## Troubleshooting
- **Build fails fetching Google Fonts**
  - Ensure CI/deploy environment can access `fonts.googleapis.com`
  - Or migrate to local/self-hosted fonts

- **Turbopack panic in local dev**
  - Use stable mode: `npm run dev`

- **No decks/cards shown**
  - Verify DB credentials and migration state
  - Confirm `public.users` sync SQL has been applied

## Study Reference
For project learning and code walkthrough, see:
- `docs/flash-card-generator-case-study.md`
