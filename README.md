This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Drizzle ORM Setup

1. Copy `.env.example` values into `.env.local`.
2. Set `DATABASE_URL` to your Supabase PostgreSQL connection string.
3. Verify connectivity:

```bash
npm run db:check
```

4. Generate migration files from `src/db/schema.ts`:

```bash
npm run db:generate
```

5. Apply migrations:

```bash
npm run db:migrate
```

6. Open Drizzle Studio:

```bash
npm run db:studio
```

## Supabase Auth User Sync (Recommended)

Use `auth.users` as the only authentication source, and keep app user data in `public.users`.

Apply this SQL once in Supabase SQL Editor:

- `supabase/sql/001_users_from_auth.sql`

What it does:
- Auto-creates/updates `public.users` when users sign up in Supabase Auth.
- Backfills missing `users` rows for existing auth users.
- Enables RLS so users can only access their own user row.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
