# Upvoted: collect feedback, ship what matters

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![Prisma](https://img.shields.io/badge/PostgreSQL-Prisma_7-336791?logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/Vitest-26_passing-6e9f18?logo=vitest&logoColor=white)

[What it does](#what-it-does) · [The board](#the-board) · [Roadmap view](#roadmap-view) · [Stack](#stack) · [Local setup](#local-setup) · [Deploying](#deploying)

Feedback boards and public roadmaps for product teams. Your users suggest ideas and vote on them. You get a ranked list of requests and a roadmap that shows customers you listened.

## What it does

Every workspace gets a public board at `/b/<slug>`. Visitors sign in, post ideas, upvote the ones they want and talk about them in the comments.

You work from a dashboard on the other side:

- totals for posts, votes and comments
- posts broken down by status
- the top-voted ideas, so the next thing to build is obvious
- a posts table where one click changes an idea's status or deletes spam

Ideas move through **Open → Planned → In progress → Done** (or **Rejected**), and the public side updates the moment you change something.

Want to poke around first? Run it locally and hit **Try demo** on the landing page. You land in *Planhive Feedback*, a sample workspace with 20 ideas, 245 votes and 22 comments. Break whatever you like: it resets when a demo starts, when you reload, and every night.

## The board

The board is the part your users see.

- Roadmap columns sit at the top, with the feedback list underneath.
- Filter ideas by status, sort by newest or most voted.
- Voting is one click and feels instant (React 19's `useOptimistic`). If the server says no, you get a toast and the real count comes back.
- Each idea has its own page with its status, vote count and a comment thread.
- Authors stay anonymous on the board, and you can remove comments.

Under the hood a vote is a toggle backed by a unique `(postId, userId)` index, so nobody can vote twice. The button bumps the count before the server answers:

```tsx
// components/posts/vote-button.tsx
const [optimistic, setOptimistic] = useOptimistic(
  { voteCount, hasVoted },
  (state, nextHasVoted: boolean) => ({
    voteCount: state.voteCount + (nextHasVoted ? 1 : -1),
    hasVoted: nextHasVoted,
  }),
);
```

In settings you pick the board's name, description and slug, and whether it's public or private. Private boards return 404.

It works on phones too. The roadmap columns become a sideways swipe, and in the dashboard the sidebar turns into a top bar, so you can triage from your phone.

## Roadmap view

Anything marked Planned, In progress or Done shows up on the roadmap right away. There are two places to see it:

- as columns at the top of the board
- on a full page at `/b/<slug>/roadmap`

The colours stay the same everywhere: blue for Planned, amber for In progress, green for Done.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, server actions), React 19.2 |
| Language | TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, lucide-react, sonner |
| Database | PostgreSQL with Prisma 7 |
| Auth | Auth.js v5: email and password (scrypt) or Google |
| Validation | zod |
| Rate limits | Upstash, optional |
| Tests | Vitest and Playwright |
| Hosting | Vercel with a daily cron |

Reads live in `server/queries/*` and writes in `server/actions/*`. Every action does the same thing: validate, check the session, rate-limit, check access, write, revalidate.

The data model is small: `User`, `Board` (slug, visibility), `Post` (status enum), `Vote` (unique per user and post), `Category` and `Comment`, plus the Auth.js tables. The demo workspace is rebuilt from fixtures in `lib/demo/`.

```
app/
├── (auth)/           login and signup
├── (dashboard)/      dashboard overview, posts, settings
├── b/[slug]/         public board, idea pages, roadmap
└── api/              Auth.js, board visibility, demo-reset cron
server/
├── actions/          mutations + tests
└── queries/          read models
prisma/               schema, migrations, seed
```

## Local setup

You need Node.js 20+, npm and PostgreSQL (Docker is the easy way).

```bash
git clone <your-fork-url> upvoted
cd upvoted
cp .env.example .env
docker run -d --name upvoted-pg -e POSTGRES_USER=upvoted \
  -e POSTGRES_PASSWORD=upvoted -e POSTGRES_DB=upvoted -p 5432:5432 postgres:17-alpine
npm install
npx prisma migrate deploy
npm run db:seed        # loads the "Try demo" workspace
npm run dev            # http://localhost:3000
```

Heads up: Prisma and the seed script read `.env`, not `.env.local`.

<details>
<summary>Environment variables</summary>

| Variable | Required | What it's for |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL`, `AUTH_TRUST_HOST` | Yes | Public URL, and trusting the host header behind a proxy |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL used in links |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | No | Google sign-in |
| `DEMO_MODE` | No | `true` shows **Try demo** |
| `CRON_SECRET` | With demo | Protects the demo-reset cron |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Production | Rate limiting, a no-op when blank |

</details>

Tests:

```bash
npm run typecheck
npm test               # 26 tests
npm run test:e2e       # needs a test database in .env.test
```

Vitest covers the server actions (validation, rate limits, ownership checks). Playwright covers the happy path (sign in, post, vote, comment), the owner's status changes, and the "you shouldn't be here" cases: guests get sent to login, non-owners can't open someone else's settings, and private boards 404.

Other scripts worth knowing: `npm run db:reset`, `npm run db:studio` and `npm run lint`.

## Deploying

Vercel plus a managed Postgres (Neon, Supabase or Vercel Postgres) is the path of least resistance.

1. Set the env vars, with `AUTH_URL` and `NEXT_PUBLIC_APP_URL` pointing at your domain.
2. Run `npx prisma migrate deploy` against the production database.
3. Add Upstash Redis for rate limiting.
4. If `DEMO_MODE` is on, set `CRON_SECRET`. `vercel.json` already runs the reset daily at 03:00.

## What's next

- Dark mode.
- Emails when an idea you voted for changes status.
- More boards per account, and teammates who can moderate.
- Merging duplicate ideas.