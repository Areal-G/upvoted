# Upvoted: collect feedback, ship what matters

Feedback boards and public roadmaps for product teams. Your users suggest ideas and vote on them, and you get a ranked list of requests plus a roadmap that shows customers you listened.

## Docs

#### What it does

1. Each workspace gets a public board at `/b/<slug>`.
2. Visitors sign in, suggest ideas, upvote and comment.
3. The team moves ideas through Open, Planned, In progress, Done or Rejected.
4. Planned, in-progress and done ideas show up on the public roadmap straight away.

#### The board

1. Roadmap columns sit above the feedback list.
2. On phones the columns swipe sideways.
3. Ideas can be filtered by status.
4. Ideas can be sorted by newest or most voted.
5. Upvotes are one click and update instantly.

#### Idea pages

1. Every idea has its own page.
2. It shows the status, vote count and a comment thread.
3. Authors stay anonymous on the board.
4. The board owner can remove comments.

#### Dashboard

1. Totals for posts, votes and comments.
2. A breakdown of posts by status.
3. The top-voted ideas.
4. A posts table with votes and comments for every idea.
5. Click a status to change it, or delete spam.

#### Roadmap page

1. Lives at `/b/<slug>/roadmap`.
2. Has Planned, In progress and Done columns.

#### Settings

1. Name.
2. Description.
3. Slug.
4. Public or private visibility (private boards return 404).

#### Accounts

1. Email and password, hashed with scrypt.
2. Google sign-in through Auth.js v5.

#### Security

1. Every server action checks the session and board ownership before writing.
2. Every input is validated with zod.
3. Creating posts and voting are rate limited with Upstash.
4. The limits do nothing when Upstash isn't configured.

#### Demo mode

1. Click **Try demo** on the landing page.
2. You're signed in as a guest to *Planhive Feedback*.
3. It has 20 ideas, 245 votes and 22 comments.
4. A banner reminds you it's a demo.
5. It resets when a demo starts, on reload, and nightly by cron.

#### Stack

1. Next.js 16 and React 19.2
2. TypeScript
3. Tailwind CSS 4 and shadcn/ui
4. PostgreSQL with Prisma 7
5. Auth.js v5
6. zod
7. Upstash Ratelimit
8. Vitest and Playwright
9. Vercel

#### Requirements

1. Node.js 20+ and npm.
2. PostgreSQL (Docker is easiest).

#### Setup

```bash
git clone <your-fork-url> upvoted   # clone the repo
cd upvoted                           # go into the folder
cp .env.example .env                 # create your env file
docker run -d --name upvoted-pg \
  -e POSTGRES_USER=upvoted \
  -e POSTGRES_PASSWORD=upvoted \
  -e POSTGRES_DB=upvoted \
  -p 5432:5432 postgres:17-alpine    # start postgres in docker
npm install                          # install dependencies
npx prisma migrate deploy            # run the migrations
npm run db:seed                      # load the demo workspace
npm run dev                          # start on http://localhost:3000
```

#### Environment variables

1. `DATABASE_URL`: PostgreSQL connection string (required).
2. `AUTH_SECRET`: Auth.js secret (required).
3. `AUTH_URL`: public URL (required).
4. `AUTH_TRUST_HOST`: trust the host header behind a proxy (required).
5. `NEXT_PUBLIC_APP_URL`: public base URL used in links (required).
6. `AUTH_GOOGLE_ID`: Google sign-in (optional).
7. `AUTH_GOOGLE_SECRET`: Google sign-in (optional).
8. `DEMO_MODE`: `true` shows **Try demo** (optional).
9. `CRON_SECRET`: protects `/api/cron/reset-demo` (with demo).
10. `UPSTASH_REDIS_REST_URL`: rate limiting (production).
11. `UPSTASH_REDIS_REST_TOKEN`: rate limiting (production).

#### Tests

```bash
npm run typecheck   # check types
npm test            # run vitest
npm run test:e2e    # run playwright, needs .env.test
```

#### Deploying

1. Create a managed PostgreSQL database (Neon, Supabase or Vercel Postgres).
2. Set the environment variables on Vercel.
3. Run `npx prisma migrate deploy` against production.
4. Add Upstash Redis.
5. Set `CRON_SECRET` if `DEMO_MODE` is on.