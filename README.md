# Upvoted: collect feedback, ship what matters

## why

you want to know what your users actually want. upvoted gives your product a public board where users post ideas and vote on them, so you get a ranked list of requests and a roadmap that shows customers you listened.

* users suggest ideas, upvote and comment
* you move ideas through open → planned → in progress → done (or rejected)
* planned, in-progress and done ideas show up on a public roadmap
* boards live at `/b/<slug>`

it's one next.js app with server actions, prisma and postgres.

## setup

you need node 20+ and a postgres database.

```bash
git clone <your-fork-url> upvoted
cd upvoted
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

* set `DATABASE_URL` and `AUTH_SECRET` in `.env`
* prisma reads `.env`, not `.env.local`
* google sign-in is optional