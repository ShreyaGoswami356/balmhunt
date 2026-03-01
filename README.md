# BalmHunt MVP (Phase 1)

BalmHunt is a daily ranking platform where lip balms launch, get upvoted, and compete for the top spot.

## Stack

- Next.js (App Router)
- PostgreSQL
- Prisma ORM
- NextAuth (Credentials)
- Tailwind CSS + HeroUI

## Features in this MVP

- Daily `Today’s Drops` ranking (UTC date based)
- Role-based auth (`USER`, `BRAND`)
- User-only upvoting (one vote per product per day)
- Product comments (users + brands)
- Official brand badge on owner comments
- Leaderboard (`All Time`, `This Week`)
- Hall of Fame winners list
- Daily winner finalize script (for yesterday)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set values:

```bash
cp .env.example .env
```

Required values in `.env`:

- `DATABASE_URL` (PostgreSQL connection string)
- `NEXTAUTH_URL` (default `http://localhost:3000`)
- `NEXTAUTH_SECRET` (long random string)

3. Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

4. Seed example data:

```bash
npm run db:seed
```

5. Start dev server:

```bash
npm run dev
```

Open: `http://localhost:3000`

## Seed Accounts

All seeded users use password: `password123`

- `ava@balmhunt.dev` (USER)
- `mia@balmhunt.dev` (USER)
- `nora@balmhunt.dev` (USER)
- `brand@balmhunt.dev` (BRAND)

## Daily Winner Script

Run this to save yesterday’s winner into Hall of Fame:

```bash
npm run winner:finalize
```
